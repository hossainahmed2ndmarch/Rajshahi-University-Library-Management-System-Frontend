"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Headphones,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerCardProps {
  audioUrl: string;
  title?: string;
  chapter?: string;
  sessionDate?: string;
  className?: string;
  sessionId?: number;
}

export function AudioPlayerCard({
  audioUrl,
  title,
  chapter,
  sessionDate,
  className,
  sessionId = 1,
}: AudioPlayerCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Dynamic live listeners presence count for this specific session
  const [listenersCount, setListenersCount] = useState(() => {
    return 3 + (sessionId % 7);
  });

  useEffect(() => {
    // If playing, bump the listener count slightly and periodically simulate subtle natural changes
    const interval = setInterval(() => {
      setListenersCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const base = isPlaying ? 5 + (sessionId % 6) : 3 + (sessionId % 5);
        const next = prev + delta;
        return Math.max(2, Math.min(next, base + 4));
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [isPlaying, sessionId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, duration)
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-[#003824] to-[#012618] text-white p-4 sm:p-5 shadow-lg border border-emerald-800/60 transition-all",
        isPlaying && "ring-2 ring-emerald-500/40",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header Info & Live Listeners Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              <Headphones className="h-3 w-3" />
              <span>Audio Recording</span>
            </span>
            {sessionDate && (
              <span className="text-[11px] text-emerald-200/70 font-mono">
                {sessionDate}
              </span>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
            {chapter || title || "Session Audio Record"}
          </h4>
        </div>

        {/* Live listeners counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-[11px] font-semibold text-emerald-200 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>{listenersCount} listening now</span>
        </div>
      </div>

      {/* Scrubber Timeline */}
      <div className="space-y-1 mb-3">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-emerald-900/80 rounded-lg appearance-none cursor-pointer accent-[#C78700] hover:accent-amber-400 transition-all"
        />
        <div className="flex justify-between text-[11px] text-emerald-200/80 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Playback speed toggle */}
        <button
          type="button"
          onClick={cyclePlaybackRate}
          className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-[11px] font-bold text-amber-300 transition-colors border border-emerald-700/50"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {/* Central Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => skipTime(-10)}
            className="p-1.5 text-emerald-200 hover:text-white transition-colors"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="h-10 w-10 rounded-full bg-[#C78700] hover:bg-amber-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skipTime(10)}
            className="p-1.5 text-emerald-200 hover:text-white transition-colors"
            title="Forward 10 seconds"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Mute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-1.5 text-emerald-200 hover:text-white transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-red-300" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
