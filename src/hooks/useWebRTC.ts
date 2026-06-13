import { useRef, useState, useEffect, useCallback } from 'react';
import { meditationService } from '../features/meditation/meditationService';
import { useMeditationStore } from '../stores/meditationStore';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  // Free TURN relay for symmetric NAT / carrier-grade NAT (mobile networks)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  // Additional reliable TURN servers for better mobile coverage
  {
    urls: 'turn:openrelay.metered.ca:80?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

const MAX_REMOTE = 5;

interface UseWebRTCOptions { sessionId: string; myUid: string; enabled: boolean; }
interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  adoptStream: (stream: MediaStream) => void;
  cleanup: () => void;
  disconnectedPeers: Set<string>;
}

export function useWebRTC({ sessionId, myUid, enabled }: UseWebRTCOptions): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [disconnectedPeers, setDisconnectedPeers] = useState<Set<string>>(new Set());

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Track video senders per peer so replaceTrack works after camera off/on
  const videoSenders = useRef<Map<string, RTCRtpSender>>(new Map());
  // ICE candidate queue — holds candidates that arrive before remoteDescription is set.
  // Critical for mobile (iOS/Android 4G) where candidates arrive out of order.
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  // Per-peer negotiation state for the "perfect negotiation" pattern — lets BOTH
  // peers offer (e.g. when either turns their camera on) without breaking on glare.
  const peerMeta = useRef<Map<string, { makingOffer: boolean; polite: boolean }>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const facingMode = useRef<'user' | 'environment'>('user');
  const { setCameraPermission, participants } = useMeditationStore();

  // ── Helpers ───────────────────────────────────────────────────────────────
  // The lower-UID peer is "polite": on an offer collision it yields (rolls back),
  // while the impolite peer ignores the colliding offer. Deterministic + symmetric.
  const isPolite = useCallback((remoteUid: string) => myUid < remoteUid, [myUid]);

  // ── Create (or reuse) a peer connection ──────────────────────────────────
  const createPeerConnection = useCallback((remoteUid: string): RTCPeerConnection => {
    const existing = peerConnections.current.get(remoteUid);
    if (existing &&
        existing.connectionState !== 'closed' &&
        existing.connectionState !== 'failed') return existing;

    existing?.close();
    peerConnections.current.delete(remoteUid);
    videoSenders.current.delete(remoteUid);
    pendingCandidates.current.delete(remoteUid);

    peerMeta.current.set(remoteUid, { makingOffer: false, polite: isPolite(remoteUid) });

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 });

    // Add local video track if camera is already on, otherwise add a recvonly
    // transceiver so a connection is still negotiated and we can RECEIVE video
    // from peers even while our own camera is off.
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      const sender = pc.addTrack(videoTrack, localStreamRef.current!);
      videoSenders.current.set(remoteUid, sender);
    } else {
      pc.addTransceiver('video', { direction: 'recvonly' });
    }

    // ── Remote track: use event.track directly (NOT event.streams[0]) ──────
    // event.streams can be empty on Safari/iOS — event.track is always set.
    // Only update remote stream state when a VIDEO track arrives; audio is
    // discarded (silent room). This prevents mounting a blank <video> element
    // before actual video data flows.
    const remoteStream = new MediaStream();
    pc.ontrack = (event: RTCTrackEvent) => {
      const track = event.track;

      if (track.kind === 'audio') {
        track.enabled = false; // silent room — discard audio
        return;                 // do NOT update remoteStreams for audio-only events
      }

      // Video track received
      if (!remoteStream.getTracks().some(t => t.id === track.id)) {
        remoteStream.addTrack(track);
      }
      setRemoteStreams(prev => new Map(prev).set(remoteUid, remoteStream));

      // When the remote user turns camera back ON, the track fires 'unmute'.
      // Force a state update so VideoTile re-renders and calls video.play().
      track.onunmute = () => {
        setRemoteStreams(prev => new Map(prev).set(remoteUid, remoteStream));
      };
      // NOTE: Do NOT use track.onended to remove from state here —
      // replaceTrack(null) causes 'mute' not 'ended', and peer disconnect
      // is already handled by onconnectionstatechange.
    };

    // ── ICE candidates ───────────────────────────────────────────────────
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        meditationService.sendSignal(sessionId, {
          from: myUid, to: remoteUid,
          type: 'ice_candidate',
          data: JSON.stringify(event.candidate),
        }).catch(() => {});
      }
    };

    // ── Renegotiation (fires when addTrack is called on an established PC) ─
    // Perfect negotiation: EITHER peer may offer (e.g. when its camera turns on).
    // Glare is resolved in handleSignal via the polite/impolite rule.
    pc.onnegotiationneeded = async () => {
      const meta = peerMeta.current.get(remoteUid);
      if (!meta) return;
      try {
        meta.makingOffer = true;
        await pc.setLocalDescription(); // implicit createOffer
        await meditationService.sendSignal(sessionId, {
          from: myUid, to: remoteUid, type: 'offer', data: JSON.stringify(pc.localDescription),
        });
      } catch (err) {
        console.warn('[WebRTC] onnegotiationneeded failed:', err);
      } finally {
        meta.makingOffer = false;
      }
    };

    // ── Connection state ─────────────────────────────────────────────────
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${remoteUid.slice(0, 6)}: ${pc.connectionState}`);
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setDisconnectedPeers(prev => new Set(prev).add(remoteUid));
      } else if (pc.connectionState === 'connected') {
        setDisconnectedPeers(prev => { const n = new Set(prev); n.delete(remoteUid); return n; });
      }

      if (pc.connectionState === 'failed') {
        // ICE restart — only the impolite (higher-UID) peer re-initiates to avoid glare
        if (!isPolite(remoteUid)) {
          pc.restartIce(); // onnegotiationneeded fires → perfect-negotiation offer
        }
      }
      if (pc.connectionState === 'closed') {
        setRemoteStreams(prev => { const n = new Map(prev); n.delete(remoteUid); return n; });
        peerConnections.current.delete(remoteUid);
        videoSenders.current.delete(remoteUid);
        pendingCandidates.current.delete(remoteUid);
        peerMeta.current.delete(remoteUid);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE ${remoteUid.slice(0, 6)}: ${pc.iceConnectionState}`);
    };

    peerConnections.current.set(remoteUid, pc);
    return pc;
  }, [sessionId, myUid, isPolite]);

  // ── Helper to flush buffered ICE candidates ──────────────────────────────
  const flushPendingCandidates = useCallback(async (remoteUid: string, pc: RTCPeerConnection) => {
    const queued = pendingCandidates.current.get(remoteUid) ?? [];
    if (queued.length === 0) return;
    console.log(`[WebRTC] Flushing ${queued.length} queued ICE candidates for ${remoteUid.slice(0,6)}`);
    for (const candidate of queued) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    }
    pendingCandidates.current.set(remoteUid, []);
  }, []);

  // ── Handle incoming signals (perfect negotiation) ────────────────────────
  const handleSignal = useCallback(async (signal: any) => {
    const { from, type, data } = signal;
    try {
      if (type === 'offer' || type === 'answer') {
        const pc = createPeerConnection(from);
        const meta = peerMeta.current.get(from)!;
        const description = JSON.parse(data) as RTCSessionDescriptionInit;

        if (description.type === 'offer') {
          // Glare: an offer arrived while we're also offering / not stable.
          const offerCollision = meta.makingOffer || pc.signalingState !== 'stable';
          // Impolite peer ignores the colliding offer; polite peer yields (rolls back).
          if (!meta.polite && offerCollision) {
            console.log(`[WebRTC] ignoring colliding offer from ${from.slice(0,6)} (impolite)`);
            return;
          }
          // setRemoteDescription implicitly rolls back our local offer if polite + collision
          await pc.setRemoteDescription(new RTCSessionDescription(description));
          await flushPendingCandidates(from, pc);
          await pc.setLocalDescription(); // implicit createAnswer
          await meditationService.sendSignal(sessionId, {
            from: myUid, to: from, type: 'answer', data: JSON.stringify(pc.localDescription),
          });
        } else {
          // answer — apply only if we're expecting one
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(description));
            await flushPendingCandidates(from, pc);
          }
        }
      } else if (type === 'ice_candidate') {
        const pc = peerConnections.current.get(from);
        if (!pc) return;
        const candidate: RTCIceCandidateInit = JSON.parse(data);
        if (pc.remoteDescription && pc.remoteDescription.type) {
          // Remote description already set — add immediately
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        } else {
          // Remote description not set yet — queue the candidate
          const queue = pendingCandidates.current.get(from) ?? [];
          queue.push(candidate);
          pendingCandidates.current.set(from, queue);
        }
      }
    } catch (err) { console.warn('[WebRTC] signal error:', err); }
  }, [createPeerConnection, flushPendingCandidates, sessionId, myUid]);

  // ── Ensure a connection exists to a peer ─────────────────────────────────
  // Both peers call this; createPeerConnection + addTrack/transceiver fires
  // onnegotiationneeded, and glare is resolved by the polite/impolite rule.
  const initiateConnectionTo = useCallback((remoteUid: string) => {
    const existing = peerConnections.current.get(remoteUid);
    if (existing &&
        existing.connectionState !== 'failed' &&
        existing.connectionState !== 'closed') return;
    createPeerConnection(remoteUid);
  }, [createPeerConnection]);

  // ── Connect to participants when list changes ────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    participants
      .filter(p => p.uid !== myUid && p.isPresent)
      .slice(0, MAX_REMOTE)
      .forEach(p => initiateConnectionTo(p.uid));
  }, [participants, enabled, myUid, initiateConnectionTo]);

  // ── Subscribe to incoming signals ────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !sessionId) return;
    return meditationService.subscribeToSignals(sessionId, myUid, handleSignal);
  }, [enabled, sessionId, myUid, handleSignal]);

  // ── Attach a live video track to a peer connection ───────────────────────
  // Reuses the existing sender (camera toggled off→on) or the recvonly
  // transceiver created at join time (so we upgrade the existing video m-line
  // to sendrecv instead of creating a duplicate). Triggers onnegotiationneeded.
  const attachVideoTrack = useCallback((pc: RTCPeerConnection, remoteUid: string, track: MediaStreamTrack, stream: MediaStream) => {
    const existingSender = videoSenders.current.get(remoteUid);
    if (existingSender) {
      existingSender.replaceTrack(track).catch(err => console.warn('[WebRTC] replaceTrack:', err));
      return;
    }
    // Reuse the recvonly video transceiver added when the camera was off
    const recvOnly = pc.getTransceivers().find(
      t => !t.sender.track && (t.direction === 'recvonly' || t.receiver.track?.kind === 'video')
    );
    if (recvOnly) {
      try { recvOnly.direction = 'sendrecv'; } catch { /* read-only in some states */ }
      recvOnly.sender.replaceTrack(track).catch(err => console.warn('[WebRTC] replaceTrack:', err));
      videoSenders.current.set(remoteUid, recvOnly.sender);
    } else {
      const sender = pc.addTrack(track, stream);
      videoSenders.current.set(remoteUid, sender);
    }
  }, []);

  // ── Start camera ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode.current, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraPermission('granted');

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      // Replace or add video in every peer connection
      peerConnections.current.forEach((pc, remoteUid) => attachVideoTrack(pc, remoteUid, videoTrack, stream));
    } catch (err) {
      console.error('[WebRTC] startCamera failed:', err);
      setCameraPermission('denied');
    }
  }, [setCameraPermission, attachVideoTrack]);

  // ── Stop camera ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    // Null out video track via tracked senders (keeps sender alive for replaceTrack on restart)
    videoSenders.current.forEach(sender => sender.replaceTrack(null).catch(() => {}));
    localStreamRef.current.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  // ── Switch front/rear camera ─────────────────────────────────────────────
  const switchCamera = useCallback(async () => {
    facingMode.current = facingMode.current === 'user' ? 'environment' : 'user';
    if (localStreamRef.current) {
      videoSenders.current.forEach(sender => sender.replaceTrack(null).catch(() => {}));
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    await startCamera();
  }, [startCamera]);

  // ── Adopt stream from pre-join lobby ─────────────────────────────────────
  const adoptStream = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
    setCameraPermission('granted');
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    peerConnections.current.forEach((pc, remoteUid) => attachVideoTrack(pc, remoteUid, videoTrack, stream));
  }, [setCameraPermission, attachVideoTrack]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    videoSenders.current.clear();
    pendingCandidates.current.clear();
    peerMeta.current.clear();
    setRemoteStreams(new Map());
    setDisconnectedPeers(new Set());
  }, []);

  return {
    localStream, remoteStreams, disconnectedPeers,
    startCamera, stopCamera, switchCamera, adoptStream, cleanup
  };
}
