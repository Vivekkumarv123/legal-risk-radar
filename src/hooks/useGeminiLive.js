import { useEffect, useRef, useState } from 'react';
import { syncTranscript, syncTimelineEvent } from '@/lib/firebase';
import { authenticatedFetch } from '@/utils/auth.utils';

/**
 * Custom hook to manage the Gemini Live WebSocket connection and Audio playout.
 * Directly connects browser client to Google Gemini Live API using an ephemeral token.
 */
export function useGeminiLive({ sessionId, accessToken, onStateChange }) {
  const [roomState, setRoomState] = useState('idle'); // idle | listening | thinking | speaking
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [missingInfo, setMissingInfo] = useState([]);
  const [confidenceData, setConfidenceData] = useState(null);

  const socketRef = useRef(null);
  const setupCompleteRef = useRef(false);
  const hasSentGreetingRef = useRef(false);
  const greetingTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const activeSourcesRef = useRef([]);
  const nextStartTimeRef = useRef(0);

  // Store options in ref to avoid re-triggering effect hooks
  const configRef = useRef({ sessionId, accessToken });
  useEffect(() => {
    configRef.current = { sessionId, accessToken };
  }, [sessionId, accessToken]);

  const roomStateRef = useRef('idle');
  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  // Sync state changes to parent listener
  useEffect(() => {
    if (onStateChange) onStateChange(roomState);
  }, [roomState, onStateChange]);

  /**
   * Connect to the token provider and establish the direct WebSocket to Google
   */
  async function connect() {
    try {
      // Safe HMR cleanup: aggressively close any old socket from previous module state
      if (typeof window !== 'undefined' && window.__geminiLiveSocket) {
        try {
          console.log('[WSS Live] Closing HMR leaked WebSocket connection...');
          window.__geminiLiveSocket.close();
        } catch (e) {}
        window.__geminiLiveSocket = null;
      }

      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        console.warn('[WSS Live] connect() aborted: socket already open or connecting');
        return;
      }

      setRoomState('thinking');
      setConnectionError(null);
      console.log('[WSS Live] connect() called, requesting ephemeral token for session', configRef.current.sessionId);
      
      // 1. Fetch short-lived token and context from the Next.js API
      const tokenRes = await authenticatedFetch('/api/auth/live-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: configRef.current.sessionId })
      });
      
      if (!tokenRes.ok) {
        throw new Error('Failed to fetch Gemini Live access credentials');
      }

      const { data } = await tokenRes.json();
      const { token, liveModel, systemInstructions } = data;

      // 2. Open stateful WebSocket directly to Gemini Live Endpoint
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      if (typeof window !== 'undefined') {
        window.__geminiLiveSocket = socket;
      }

      socket.onopen = () => {
        console.log('[WSS Live] socket opened');
        setIsConnected(true);
        setRoomState('idle');
        syncTimelineEvent(configRef.current.sessionId, 'Live Connection Established');

        // Send Setup payload and wait for setupComplete before sending the first greeting.
        const setupPayload = {
          setup: {
            model: liveModel || 'models/gemini-3.1-flash-live-preview',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Zephyr'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: systemInstructions }]
            }
          }
        };
        socket.send(JSON.stringify(setupPayload));
        console.log('[WSS Live] setup payload sent', setupPayload);

        // Wait for setupComplete before sending the greeting and streaming audio.
        greetingTimerRef.current = window.setTimeout(() => {
          if (!hasSentGreetingRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
            console.warn('[WSS Live] setupComplete not received in time; sending fallback greeting.');
            startRecording();
            sendGreeting();
          }
        }, 2500);
      };

      socket.onmessage = async (event) => {
        try {
          let textData = '';
          if (event.data instanceof Blob) {
            textData = await event.data.text();
          } else {
            textData = event.data;
          }
          const response = JSON.parse(textData);

          if (response.setupComplete) {
            setupCompleteRef.current = true;
            console.log('[WSS Live] setupComplete received from Gemini Live');
          }

          if (response.setupComplete && !hasSentGreetingRef.current) {
            startRecording();
            sendGreeting();
          }

          handleServerMessage(response);
        } catch (parseErr) {
          console.error('[WSS Live Message Parse Error]:', parseErr, event.data);
        }
      };

      socket.onclose = (event) => {
        console.warn('[WSS Live] socket closed', event.code, event.reason);
        const errMsg = event.reason || `Connection terminated (WebSocket Status: ${event.code})`;
        if (event.code !== 1000 && event.code !== 1005) {
          setConnectionError(errMsg);
        }
        cleanupConnection();
      };

      socket.onerror = (err) => {
        console.error('[WSS Live] socket error', err);
        const errMsg = 'Local WebSocket connection failed. Verify model parameter support, endpoint domain, or API key.';
        setConnectionError(errMsg);
        cleanupConnection();
      };

    } catch (error) {
      console.error('Error connecting to Gemini Live API:', error);
      setConnectionError(error.message);
      setRoomState('idle');
      setIsConnected(false);
    }
  }

  /**
   * Close socket and clean up audio resources
   */
  function disconnect() {
    cleanupConnection();
    syncTimelineEvent(configRef.current.sessionId, 'Session Paused');
  }

  function cleanupConnection() {
    setIsConnected(false);
    setRoomState('idle');
    
    if (greetingTimerRef.current) {
      window.clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = null;
    }

    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      if (typeof window !== 'undefined' && window.__geminiLiveSocket === socketRef.current) {
        window.__geminiLiveSocket = null;
      }
      socketRef.current = null;
    }
    
    stopRecording();
    stopAIPlayback();
  }

  function sendGreeting() {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    hasSentGreetingRef.current = true;
    if (greetingTimerRef.current) {
      window.clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = null;
    }

    const greetPayload = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [
              {
                text: "Please introduce yourself as Aura, the user's Staff AI Legal Consultant. Greet them warmly and ask how you can help analyze their contracts or agreements today."
              }
            ]
          }
        ],
        turnComplete: true
      }
    };

    console.log('[WSS Live] Sending automated greeting prompt...', greetPayload);
    socketRef.current.send(JSON.stringify(greetPayload));
  }

  /**
   * Starts capturing and downsampling mic input to 16kHz PCM
   */
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // Shared audio processor function to downsample and stream to WebSocket
      const processAudioBuffer = (inputData) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        // Downsample from native rate to 16kHz
        const downsampled = downsampleBuffer(inputData, audioCtx.sampleRate, 16000);
        
        // Convert to 16-bit PCM (little-endian)
        const pcmArrayBuffer = new ArrayBuffer(downsampled.length * 2);
        const view = new DataView(pcmArrayBuffer);
        floatTo16BitPCM(view, 0, downsampled);

        // Convert to Base64
        const base64Audio = arrayBufferToBase64(pcmArrayBuffer);

        // Volume check (RMS)
        const volume = getRMSVolume(inputData);
        const currentRoomState = roomStateRef.current;
        const voiceThreshold = currentRoomState === 'speaking' ? 0.15 : 0.03;
        if (volume > voiceThreshold) {
          setRoomState(prev => {
            if (prev === 'speaking' || prev === 'idle') {
              if (prev === 'speaking') {
                triggerBargeIn();
              }
              return 'listening';
            }
            return prev;
          });
        }

        // Send audio chunk to Gemini Live WSS
        const audioChunk = {
          realtimeInput: {
            audio: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Audio
            }
          }
        };
        socketRef.current.send(JSON.stringify(audioChunk));
      };

      // 1. Try modern, non-deprecated AudioWorkletNode
      if (audioCtx.audioWorklet) {
        try {
          const workletCode = `
            class AudioProcessor extends AudioWorkletProcessor {
              process(inputs, outputs, parameters) {
                const input = inputs[0];
                if (input && input[0]) {
                  this.port.postMessage(input[0]);
                }
                return true;
              }
            }
            registerProcessor('audio-processor', AudioProcessor);
          `;
          const blob = new Blob([workletCode], { type: 'application/javascript' });
          const workletUrl = URL.createObjectURL(blob);
          await audioCtx.audioWorklet.addModule(workletUrl);
          
          const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
          audioWorkletNodeRef.current = workletNode;
          
          workletNode.port.onmessage = (event) => {
            processAudioBuffer(event.data);
          };

          source.connect(workletNode);
          workletNode.connect(audioCtx.destination);
          console.log('[WSS Live] Successfully initialized AudioWorkletNode');
          return;
        } catch (workletError) {
          console.warn('[WSS Live] AudioWorkletNode initialization failed. Falling back to ScriptProcessorNode:', workletError);
        }
      }

      // 2. Fallback: ScriptProcessorNode
      const bufferSize = 2048;
      const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = scriptNode;

      scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        processAudioBuffer(inputData);
      };

      source.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);
      console.log('[WSS Live] Initialized fallback ScriptProcessorNode');

    } catch (err) {
      console.error('Error starting microphone capture:', err);
    }
  }

  function stopRecording() {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.onmessage = null;
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
  }

  /**
   * Processes downstream messages from Gemini Live API
   */
  async function handleServerMessage(response) {
    // 1. Check for AI content stream
    if (response.serverContent?.modelTurn?.parts) {
      setRoomState('speaking');
      
      const parts = response.serverContent.modelTurn.parts;
      for (const part of parts) {
        // Handle audio data
        if (part.inlineData && (part.inlineData.mimeType?.startsWith('audio/') || part.inlineData.mimeType?.includes('rate='))) {
          const base64Data = part.inlineData.data;
          const pcm16Data = base64ToArrayBuffer(base64Data);
          playAIpcmChunk(pcm16Data);
        }
      }
    }

    // 2. Handle turn complete
    if (response.serverContent?.turnComplete) {
      setRoomState('idle');
    }
  }

  /**
   * Interrupts the speaking AI locally and notifies Gemini Live
   */
  function triggerBargeIn() {
    stopAIPlayback();
    
    // Notify Gemini Live about the client interruption
    if (socketRef.current && socketRef.current.readyState !== WebSocket.OPEN) {
      const interruptPayload = {
        clientContent: {
          turns: [],
          turnComplete: false
        }
      };
      socketRef.current.send(JSON.stringify(interruptPayload));
    }
    
    syncTimelineEvent(configRef.current.sessionId, 'User Interrupted AI (Barge-In)');
  }

  /**
   * Plays a 24kHz PCM chunk in browser AudioContext source nodes
   */
  function playAIpcmChunk(arrayBuffer) {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    // Convert PCM 16-bit to Float32
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Create an audio buffer at 24000Hz (Gemini Live output rate)
    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    const currentTime = audioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    // Track active source nodes to cancel them during barge-in
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(src => src !== source);
    };
  }

  function stopAIPlayback() {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  }

  function sendTextMessage(text) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WSS Live] Cannot send text message: socket not open');
      return;
    }

    const textPayload = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [
              {
                text: text
              }
            ]
          }
        ],
        turnComplete: true
      }
    };

    console.log('[WSS Live] Sending client text content...', textPayload);
    socketRef.current.send(JSON.stringify(textPayload));
  }

  // clean up on unmount
  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, []);

  return {
    isConnected,
    connectionError,
    roomState,
    missingInfo,
    confidenceData,
    connect,
    disconnect,
    sendTextMessage,
  };
}

// --------------------------------------------------------
// Audio Utility functions for Downsampling & PCM conversion
// --------------------------------------------------------

function downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
  if (inputSampleRate === outputSampleRate) return buffer;
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function getRMSVolume(analyserBuffer) {
  let sum = 0;
  for (let i = 0; i < analyserBuffer.length; i++) {
    sum += analyserBuffer[i] * analyserBuffer[i];
  }
  return Math.sqrt(sum / analyserBuffer.length);
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
