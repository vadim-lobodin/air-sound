"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AudioPlayerListProps {
  files: string[];
}

export default function AudioPlayerList({ files }: AudioPlayerListProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handlePlay = (idx: number) => {
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== idx) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.play();
      setPlayingIndex(idx);
      audio.onended = () => setPlayingIndex(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">MP3 Audio Player</h1>
      <div className="space-y-4">
        {files.map((file, idx) => (
          <Card key={file} className="flex items-center justify-between p-4">
            <CardContent className="flex w-full items-center justify-between p-0">
              <span className="truncate mr-4 text-base font-medium flex-1" title={file}>{file}</span>
              <Button
                onClick={() => handlePlay(idx)}
                disabled={playingIndex === idx}
                variant={playingIndex === idx ? "secondary" : "default"}
                className="ml-4 min-w-[80px]"
              >
                {playingIndex === idx ? "Playing..." : "Play"}
              </Button>
              <audio
                ref={el => {
                  audioRefs.current[idx] = el;
                }}
                src={`/mp3/${file}`}
                preload="auto"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 