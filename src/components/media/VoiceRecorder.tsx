import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Check } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, extension: string) => void;
  maxDuration?: number;
  label?: string;
}

type RecorderState = "idle" | "recording" | "preview";

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 30,
  label = "Record a voice note",
}) => {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const extensionRef = useRef<string>("webm");

  useEffect(() => {
    if (typeof MediaRecorder === "undefined") {
      setUnsupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const getMimeType = (): { mimeType: string; extension: string } => {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return { mimeType: "audio/webm;codecs=opus", extension: "webm" };
    }
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return { mimeType: "audio/mp4", extension: "mp4" };
    }
    if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
      return { mimeType: "audio/ogg;codecs=opus", extension: "ogg" };
    }
    return { mimeType: "", extension: "webm" };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { mimeType, extension } = getMimeType();
      extensionRef.current = extension;
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("preview");
      };

      recorder.start(100);
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setPermissionDenied(true);
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setIsPlaying(false);
    setState("idle");
  };

  const handleUse = () => {
    if (blobRef.current) {
      onRecordingComplete(blobRef.current, extensionRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (unsupported) return null;

  if (permissionDenied) {
    return (
      <div className="w-full rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4 flex flex-col items-center gap-2 text-center">
        <Mic className="w-6 h-6 text-muted-foreground" />
        <p className="font-body text-sm text-muted-foreground">
          Mic permission denied. Enable it in your browser settings to record voice notes.
        </p>
        <button
          onClick={() => setPermissionDenied(false)}
          className="text-xs text-primary underline font-body"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <button
        onClick={startRecording}
        className="w-full h-[56px] border-2 border-dashed border-primary/50 rounded-[20px] bg-background-tint flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
      >
        <Mic className="w-5 h-5 text-primary" />
        <span className="font-body text-base text-primary">{label}</span>
      </button>
    );
  }

  if (state === "recording") {
    return (
      <div className="w-full rounded-[20px] border-2 border-error/40 bg-error/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-error animate-pulse" />
          <span className="font-body text-sm text-foreground">Recording...</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-display font-bold text-sm tabular-nums ${
              elapsed >= maxDuration - 5 ? "text-error" : "text-foreground"
            }`}
          >
            {formatTime(elapsed)} / {formatTime(maxDuration)}
          </span>
          <button
            onClick={stopRecording}
            className="w-10 h-10 rounded-full bg-error flex items-center justify-center"
          >
            <Square className="w-4 h-4 text-white fill-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[20px] border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Play className="w-4 h-4 text-primary-foreground" />
            )}
          </button>
          <span className="font-body text-sm text-foreground">
            {formatTime(elapsed)} recorded
          </span>
        </div>
        <button
          onClick={handleReRecord}
          className="flex items-center gap-1.5 text-sm font-body text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4" /> Re-record
        </button>
      </div>
      <button
        onClick={handleUse}
        className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" /> Use this recording
      </button>
    </div>
  );
};

export default VoiceRecorder;
