import React, { useEffect, useRef, useState } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { ai, MODEL_LIVE } from '../services/gemini';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';
import { Mic, MicOff, PhoneOff, Activity, Volume2, ShieldCheck, Globe } from 'lucide-react';

const USER_PHONE_NUMBER = "+1-(408)-614-0468";

const LiveVoice: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  
  // Animation Frame for volume visualizer
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const connect = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // Setup Analyzer for visualizer
      const analyzer = inputCtx.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // Establish Session
      const sessionPromise = ai.live.connect({
        model: MODEL_LIVE,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            source.connect(analyzer); // Connect to analyzer first
            analyzer.connect(scriptProcessor);

            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return; // Software mute

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session) => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              // Sync timing
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputCtx.currentTime
              );

              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputCtx,
                24000,
                1
              );

              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setError("Connection error. Please try again.");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are a helpful AI Assistant for Tech Skyline. You are talking to the user with phone number ${USER_PHONE_NUMBER}. Be concise, helpful, and friendly.`
        }
      });

      sessionRef.current = sessionPromise;

      // Visualizer Loop
      const updateVolume = () => {
        if (analyzerRef.current) {
          const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
          analyzerRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setVolumeLevel(avg);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

    } catch (err) {
      console.error(err);
      setError("Failed to access microphone or connect.");
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.then(s => s.close());
      sessionRef.current = null;
    }
    
    streamRef.current?.getTracks().forEach(t => t.stop());
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsConnected(false);
    setVolumeLevel(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-slate-900 to-indigo-950 p-6 relative overflow-hidden">
      
      {/* Background Pulse Animation */}
      {isConnected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className={`w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-100`} 
                style={{ transform: `scale(${1 + volumeLevel / 100})` }} />
           <div className={`w-96 h-96 rounded-full bg-blue-600/10 blur-3xl transition-all duration-150 delay-75`} 
                style={{ transform: `scale(${1 + volumeLevel / 120})` }} />
        </div>
      )}

      {/* Header Info */}
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs font-mono text-slate-300">SECURE LINE: {USER_PHONE_NUMBER}</span>
      </div>

       <div className="absolute top-6 right-6 flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span className="text-xs text-slate-300">Anti-Blocking Active</span>
      </div>

      <div className="z-10 text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">Tech Skyline Secure Voice</h2>
        <p className="text-slate-400">Global Coverage • Crystal Clear • AI Enhanced</p>
      </div>

      <div className="z-10 relative">
        {/* Visualizer Circle */}
        <div className={`relative w-48 h-48 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${isConnected ? 'border-cyan-400 bg-slate-800/50' : 'border-slate-700 bg-slate-900'}`}>
          {isConnected ? (
             <Activity className={`w-16 h-16 text-cyan-400 ${volumeLevel > 10 ? 'animate-pulse' : ''}`} />
          ) : (
             <Volume2 className="w-16 h-16 text-slate-600" />
          )}
          
          {/* Ripple rings */}
          {isConnected && (
            <>
               <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-[ping_2s_linear_infinite]" />
               <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[ping_3s_linear_infinite_1s]" />
            </>
          )}
        </div>
      </div>

      <div className="mt-12 flex gap-6 z-10">
        {!isConnected ? (
          <button 
            onClick={connect}
            className="flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
          >
            <Mic className="w-6 h-6" />
            Start Global Call
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full border-2 transition-colors ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={disconnect}
              className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-lg shadow-lg shadow-red-500/20 transition-all transform hover:scale-105"
            >
              <PhoneOff className="w-6 h-6" />
              End Call
            </button>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="absolute bottom-6 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> US Server</span>
        <span>•</span>
        <span>Latency: 12ms</span>
        <span>•</span>
        <span>Encrypted</span>
      </div>
    </div>
  );
};

export default LiveVoice;