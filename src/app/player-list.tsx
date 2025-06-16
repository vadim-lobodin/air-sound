"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface AudioPlayerListProps {
  files: string[];
}

const MAX_VOTES = 5;

export default function AudioPlayerList({ files }: AudioPlayerListProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [votes, setVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [userVotes, setUserVotes] = useState<number>(0);

  useEffect(() => {
    fetch("/api/vote")
      .then((res) => res.json())
      .then((data) => setVotes(data.votes || {}));
    const storedVotes = parseInt(localStorage.getItem("userVotes") || "0", 10);
    setUserVotes(Number.isNaN(storedVotes) ? 0 : storedVotes);
  }, [files]);

  const handleVote = async (file: string, voteType: "up" | "down") => {
    if (userVotes >= MAX_VOTES) return;
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, voteType }),
    });
    const data = await res.json();
    setVotes((prev) => ({ ...prev, [file]: data.votes }));
    setUserVotes((prev) => {
      const newVotes = prev + 1;
      localStorage.setItem("userVotes", String(newVotes));
      return newVotes;
    });
  };

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
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Task Complete Sound Candidates</h1>
      <div className="mb-4 text-center text-sm text-muted-foreground">
        Votes left: <span className="font-semibold">{MAX_VOTES - userVotes}</span> / {MAX_VOTES}
      </div>
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableBody>
              {files.map((file, idx) => (
                <TableRow key={file} className="hover:bg-muted transition-colors">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <Button
                          size="icon"
                          onClick={() => handlePlay(idx)}
                          disabled={playingIndex === idx}
                          variant="default"
                          className="w-10 h-10 rounded-full flex justify-center items-center"
                        >
                          {playingIndex === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <span className="truncate max-w-xs" title={file}>{file}</span>
                        <audio
                          ref={el => {
                            audioRefs.current[idx] = el;
                          }}
                          src={`/mp3/${file}`}
                          preload="auto"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="secondary" onClick={() => handleVote(file, "up")}
                          className="w-8 h-8" disabled={userVotes >= MAX_VOTES}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center select-none font-semibold">
                          {(votes[file]?.up || 0) - (votes[file]?.down || 0)}
                        </span>
                        <Button size="icon" variant="secondary" onClick={() => handleVote(file, "down")}
                          className="w-8 h-8" disabled={userVotes >= MAX_VOTES}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 