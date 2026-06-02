import { useRef, useState, useEffect, useCallback } from 'react';
import { meditationService } from '../features/meditation/meditationService';
import { useMeditationStore } from '../stores/meditationStore';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
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
}

export function useWebRTC({ sessionId, myUid, enabled }: UseWebRTCOptions): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const facingMode = useRef<'user'|'environment'>('user');
  const { setCameraPermission, participants } = useMeditationStore();

  const createPeerConnection = useCallback((remoteUid: string): RTCPeerConnection => {
    const existing = peerConnections.current.get(remoteUid);
    if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local stream tracks if available, or ensure they're added when stream becomes available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => {
        if (!pc.getSenders().some(s => s.track === t)) {
          pc.addTrack(t, localStreamRef.current!);
        }
      });
    }

    const remoteStream = new MediaStream();
    pc.ontrack = event => {
      event.streams[0]?.getTracks().forEach(track => {
        if (track.kind === 'audio') { track.enabled = false; }
        else if (!remoteStream.getTracks().some(t => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
      setRemoteStreams(prev => new Map(prev).set(remoteUid, remoteStream));
    };
    pc.onicecandidate = event => {
      if (event.candidate)
        meditationService.sendSignal(sessionId, { from: myUid, to: remoteUid, type: 'ice_candidate', data: JSON.stringify(event.candidate) }).catch(() => {});
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setRemoteStreams(prev => { const n = new Map(prev); n.delete(remoteUid); return n; });
        peerConnections.current.delete(remoteUid);
      }
    };
    peerConnections.current.set(remoteUid, pc);
    return pc;
  }, [sessionId, myUid]);

  const handleSignal = useCallback(async (signal: any) => {
    const { from, type, data } = signal;
    try {
      if (type === 'offer') {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await meditationService.sendSignal(sessionId, { from: myUid, to: from, type: 'answer', data: JSON.stringify(answer) });
      } else if (type === 'answer') {
        const pc = peerConnections.current.get(from);
        if (pc && pc.signalingState === 'have-local-offer') await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
      } else if (type === 'ice_candidate') {
        const pc = peerConnections.current.get(from);
        if (pc && pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(data)));
      }
    } catch (err) { console.warn('[WebRTC]', err); }
  }, [createPeerConnection, sessionId, myUid]);

  const initiateConnectionTo = useCallback(async (remoteUid: string) => {
    if (myUid <= remoteUid || peerConnections.current.has(remoteUid)) return;
    try {
      const pc = createPeerConnection(remoteUid);
      const offer = await pc.createOffer({ offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      await meditationService.sendSignal(sessionId, { from: myUid, to: remoteUid, type: 'offer', data: JSON.stringify(offer) });
    } catch (err) { console.warn('[WebRTC] offer error:', err); }
  }, [createPeerConnection, sessionId, myUid]);

  useEffect(() => {
    if (!enabled) return;
    participants.filter(p => p.uid !== myUid && p.isPresent).slice(0, MAX_REMOTE).forEach(p => initiateConnectionTo(p.uid));
  }, [participants, enabled, myUid, initiateConnectionTo]);

  useEffect(() => {
    if (!enabled || !sessionId) return;
    return meditationService.subscribeToSignals(sessionId, myUid, handleSignal);
  }, [enabled, sessionId, myUid, handleSignal]);

  const startCamera = useCallback(async () => {
    setCameraPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode.current },
        audio: false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraPermission('granted');

      // Add or replace video tracks in all peer connections
      peerConnections.current.forEach(pc => {
        stream.getTracks().forEach(track => {
          const videoSenders = pc.getSenders().filter(s => s.track?.kind === 'video' || (s.track === null && track.kind === 'video'));
          if (videoSenders.length === 0) {
            // No existing video sender, add new track
            pc.addTrack(track, stream);
          } else {
            // Replace existing video sender track
            videoSenders.forEach(sender => {
              sender.replaceTrack(track).catch(err => console.warn('[WebRTC] replaceTrack failed:', err));
            });
          }
        });
      });
    } catch (err) {
      console.error('[WebRTC] startCamera failed:', err);
      setCameraPermission('denied');
    }
  }, [setCameraPermission]);

  const stopCamera = useCallback(() => {
    if (!localStreamRef.current) return;

    // Remove video tracks from all peer connections
    peerConnections.current.forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track?.kind === 'video') {
          pc.removeTrack(sender);
        }
      });
    });

    // Stop and clear local stream
    localStreamRef.current.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const switchCamera = useCallback(async () => {
    facingMode.current = facingMode.current === 'user' ? 'environment' : 'user';
    // Stop old stream and tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      // Remove old tracks from peer connections
      peerConnections.current.forEach(pc => {
        pc.getSenders().forEach(sender => {
          if (sender.track?.kind === 'video') {
            pc.removeTrack(sender);
          }
        });
      });
    }
    // Get new stream with different camera
    await startCamera();
  }, [startCamera]);

  // Inject an already-acquired stream (from pre-join lobby) without calling getUserMedia again
  const adoptStream = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
    setCameraPermission('granted');
    // Add or replace tracks in any existing peer connections
    peerConnections.current.forEach(pc => {
      stream.getTracks().forEach(track => {
        const existingSenders = pc.getSenders().filter(s => s.track?.kind === track.kind);
        if (existingSenders.length === 0) {
          pc.addTrack(track, stream);
        } else {
          existingSenders.forEach(sender => {
            sender.replaceTrack(track).catch(err => console.warn('[WebRTC] replaceTrack failed:', err));
          });
        }
      });
    });
  }, [setCameraPermission]);

  const cleanup = useCallback(() => {
    stopCamera();
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setRemoteStreams(new Map());
  }, [stopCamera]);

  return { localStream, remoteStreams, startCamera, stopCamera, switchCamera, adoptStream, cleanup };
}
