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
  const localStreamRef = useRef<MediaStream | null>(null);
  const facingMode = useRef<'user' | 'environment'>('user');
  const { setCameraPermission, participants } = useMeditationStore();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isOfferingPeer = useCallback((remoteUid: string) => myUid > remoteUid, [myUid]);

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

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 });

    // Add local video track if camera is already on
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const sender = pc.addTrack(videoTrack, localStreamRef.current);
        videoSenders.current.set(remoteUid, sender);
      }
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
    pc.onnegotiationneeded = async () => {
      if (!isOfferingPeer(remoteUid)) return; // only the higher-uid side re-offers
      if (pc.signalingState !== 'stable') return;
      try {
        const offer = await pc.createOffer();
        if (pc.signalingState !== 'stable') return; // guard race condition
        await pc.setLocalDescription(offer);
        await meditationService.sendSignal(sessionId, {
          from: myUid, to: remoteUid, type: 'offer', data: JSON.stringify(offer),
        });
      } catch (err) { console.warn('[WebRTC] onnegotiationneeded failed:', err); }
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
        // ICE restart — only the offerer re-initiates
        if (isOfferingPeer(remoteUid)) {
          pc.restartIce();
          pc.createOffer({ iceRestart: true })
            .then(offer => { pc.setLocalDescription(offer); return offer; })
            .then(offer => meditationService.sendSignal(sessionId, {
              from: myUid, to: remoteUid, type: 'offer', data: JSON.stringify(offer),
            }))
            .catch(err => console.warn('[WebRTC] ICE restart failed:', err));
        }
      }
      if (pc.connectionState === 'closed') {
        setRemoteStreams(prev => { const n = new Map(prev); n.delete(remoteUid); return n; });
        peerConnections.current.delete(remoteUid);
        videoSenders.current.delete(remoteUid);
        pendingCandidates.current.delete(remoteUid);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE ${remoteUid.slice(0, 6)}: ${pc.iceConnectionState}`);
    };

    peerConnections.current.set(remoteUid, pc);
    return pc;
  }, [sessionId, myUid, isOfferingPeer]);

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

  // ── Handle incoming signals ──────────────────────────────────────────────
  const handleSignal = useCallback(async (signal: any) => {
    const { from, type, data } = signal;
    try {
      if (type === 'offer') {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
        // Flush any ICE candidates that arrived before this offer
        await flushPendingCandidates(from, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await meditationService.sendSignal(sessionId, {
          from: myUid, to: from, type: 'answer', data: JSON.stringify(answer),
        });
      } else if (type === 'answer') {
        const pc = peerConnections.current.get(from);
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
          // Flush any ICE candidates that arrived before this answer
          await flushPendingCandidates(from, pc);
        }
      } else if (type === 'ice_candidate') {
        const pc = peerConnections.current.get(from);
        if (!pc) return;
        const candidate: RTCIceCandidateInit = JSON.parse(data);
        if (pc.remoteDescription && pc.remoteDescription.type) {
          // Remote description already set — add immediately
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Remote description not set yet — queue the candidate
          const queue = pendingCandidates.current.get(from) ?? [];
          queue.push(candidate);
          pendingCandidates.current.set(from, queue);
          console.log(`[WebRTC] Queued ICE candidate for ${from.slice(0,6)} (total: ${queue.length})`);
        }
      }
    } catch (err) { console.warn('[WebRTC] signal error:', err); }
  }, [createPeerConnection, flushPendingCandidates, sessionId, myUid]);

  // ── Initiate connection to a peer ────────────────────────────────────────
  const initiateConnectionTo = useCallback(async (remoteUid: string) => {
    if (!isOfferingPeer(remoteUid)) return;
    const existing = peerConnections.current.get(remoteUid);
    if (existing &&
        existing.connectionState !== 'failed' &&
        existing.connectionState !== 'closed') return;
    try {
      const pc = createPeerConnection(remoteUid);
      // Do NOT pass offerToReceiveVideo/Audio options — addTrack already
      // creates the correct transceivers; extra options can create duplicate ones
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await meditationService.sendSignal(sessionId, {
        from: myUid, to: remoteUid, type: 'offer', data: JSON.stringify(offer),
      });
    } catch (err) { console.warn('[WebRTC] offer error:', err); }
  }, [createPeerConnection, sessionId, myUid, isOfferingPeer]);

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
      peerConnections.current.forEach((pc, remoteUid) => {
        const existingSender = videoSenders.current.get(remoteUid);
        if (existingSender) {
          // Camera was toggled off/on — replace null track with the new live track
          existingSender.replaceTrack(videoTrack)
            .catch(err => console.warn('[WebRTC] replaceTrack:', err));
        } else {
          // First time adding video — addTrack triggers onnegotiationneeded automatically
          const sender = pc.addTrack(videoTrack, stream);
          videoSenders.current.set(remoteUid, sender);
        }
      });
    } catch (err) {
      console.error('[WebRTC] startCamera failed:', err);
      setCameraPermission('denied');
    }
  }, [setCameraPermission]);

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
    peerConnections.current.forEach((pc, remoteUid) => {
      const existingSender = videoSenders.current.get(remoteUid);
      if (existingSender) {
        existingSender.replaceTrack(videoTrack).catch(() => {});
      } else {
        const sender = pc.addTrack(videoTrack, stream);
        videoSenders.current.set(remoteUid, sender);
      }
    });
  }, [setCameraPermission]);

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
    setRemoteStreams(new Map());
    setDisconnectedPeers(new Set());
  }, []);

  return {
    localStream, remoteStreams, disconnectedPeers,
    startCamera, stopCamera, switchCamera, adoptStream, cleanup
  };
}
