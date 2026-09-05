"use client";

import * as React from "react";
import { VoiceEngine } from "@/voice/client/engine";
import { GeminiLiveClientSession } from "@/voice/realtime/client/session";
import { VoiceState, VoiceMode } from "@/voice/types";
import { LiveVoiceState } from "@/voice/realtime/types";
import { JarvisState } from "@/ai/types";

export function useVoice(
  onTranscriptSubmitted: (text: string) => void,
  onJarvisStateChange: (state: JarvisState) => void
) {
  const engineRef = React.useRef<VoiceEngine | null>(null);
  const liveSessionRef = React.useRef<GeminiLiveClientSession | null>(null);
  const [activeEngineName, setActiveEngineName] = React.useState<"gemini-live" | "browser-fallback">("gemini-live");

  const activeEngineNameRef = React.useRef(activeEngineName);
  activeEngineNameRef.current = activeEngineName;

  const onTranscriptSubmittedRef = React.useRef(onTranscriptSubmitted);
  onTranscriptSubmittedRef.current = onTranscriptSubmitted;

  const onJarvisStateChangeRef = React.useRef(onJarvisStateChange);
  onJarvisStateChangeRef.current = onJarvisStateChange;

  const [liveTranscript, setLiveTranscript] = React.useState("");
  const [voiceState, setVoiceState] = React.useState<VoiceState>({
    mode: "text",
    connectionState: "disconnected",
    permissionState: "prompt",
    isListening: false,
    isSpeaking: false,
    audioLevel: 0,
    error: null,
  });

  React.useEffect(() => {
    // 1. Initialize Gemini Live session layer
    const liveSession = new GeminiLiveClientSession();
    liveSessionRef.current = liveSession;

    liveSession.init({
      onStateChange: (liveState: LiveVoiceState) => {
        if (liveState === "jarvis_speaking") {
          onJarvisStateChangeRef.current("speaking");
          setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
        } else if (liveState === "thinking") {
          onJarvisStateChangeRef.current("thinking");
        } else if (liveState === "connected" || liveState === "idle") {
          onJarvisStateChangeRef.current("idle");
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        }
      },
      onTranscript: (event) => {
        // Feed transcript into chat pipeline
        if (event.speaker === "user" && event.text.trim()) {
          onTranscriptSubmittedRef.current(event.text.trim());
        }
      },
      onAudioChunk: () => {},
      onInterrupted: () => {
        onJarvisStateChangeRef.current("listening");
        setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
      },
      onError: (err) => {
        // Fall back gracefully to browser-native if Live session encounters issue
        setActiveEngineName("browser-fallback");
        setVoiceState((prev) => ({ ...prev, error: err.message }));
      },
    });

    // 2. Initialize Microphone capture and fallback recognition engine
    const engine = new VoiceEngine();
    engineRef.current = engine;

    engine.init({
      onStateChange: (state) => {
        setVoiceState(state);

        if (state.isSpeaking) {
          onJarvisStateChangeRef.current("speaking");
        } else if (state.isListening) {
          onJarvisStateChangeRef.current("listening");
        }
      },
      onTranscript: (spokenText, isFinal) => {
        setLiveTranscript(spokenText);

        if (isFinal && spokenText.trim().length > 0) {
          // Barge-in check: if user speaks while JARVIS is speaking, interrupt immediately
          if (liveSessionRef.current?.state === "jarvis_speaking" || engineRef.current?.getState().isSpeaking) {
            liveSessionRef.current?.interrupt();
            engineRef.current?.stopSpeaking();
          }

          // Directly submit user's spoken transcript to the cognitive conversation pipeline
          onTranscriptSubmittedRef.current(spokenText.trim());
          setTimeout(() => setLiveTranscript(""), 400);
        }
      },
      onError: (errMsg) => {
        setVoiceState((prev) => ({ ...prev, error: errMsg }));
      },
    });

    return () => {
      liveSession.cleanup();
      engine.cleanup();
    };
  }, []);

  const toggleMode = React.useCallback(() => {
    const newMode: VoiceMode = voiceState.mode === "text" ? "voice" : "text";
    engineRef.current?.setMode(newMode);
    if (newMode === "voice") {
      liveSessionRef.current?.connect().catch(() => {
        setActiveEngineName("browser-fallback");
      });
    } else {
      liveSessionRef.current?.disconnect();
    }
  }, [voiceState.mode]);

  const startListening = React.useCallback(async () => {
    // Realtime Barge-in: immediately stop active playback when user starts listening
    liveSessionRef.current?.interrupt();
    await engineRef.current?.startListening();
  }, []);

  const stopListening = React.useCallback(() => {
    engineRef.current?.stopListening();
  }, []);

  const speak = React.useCallback((text: string, onEnd?: () => void) => {
    engineRef.current?.speak(text, { onEnd });
  }, []);

  const stopSpeaking = React.useCallback(() => {
    liveSessionRef.current?.interrupt();
    engineRef.current?.stopSpeaking();
  }, []);

  return {
    voiceState,
    liveTranscript,
    activeEngineName,
    toggleMode,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
