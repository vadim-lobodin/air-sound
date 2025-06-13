import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(req: NextRequest) {
  const { file, voteType } = await req.json();
  if (!file || !["up", "down"].includes(voteType)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const key = `votes:${file}`;
  // Increment the appropriate field atomically
  await redis.hincrby(key, voteType, 1);
  // Get the updated vote counts
  const votes = (await redis.hgetall<{ up?: number; down?: number }>(key)) || {};
  return NextResponse.json({ votes: { up: Number(votes.up || 0), down: Number(votes.down || 0) } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  if (file) {
    const key = `votes:${file}`;
    const votes = (await redis.hgetall<{ up?: number; down?: number }>(key)) || {};
    return NextResponse.json({ votes: { up: Number(votes.up || 0), down: Number(votes.down || 0) } });
  }
  // If no file specified, get all votes (scan all keys)
  const keys = await redis.keys("votes:*");
  const allVotes: Record<string, { up: number; down: number }> = {};
  for (const key of keys) {
    const fileName = key.replace(/^votes:/, "");
    const votes = (await redis.hgetall<{ up?: number; down?: number }>(key)) || {};
    allVotes[fileName] = { up: Number(votes.up || 0), down: Number(votes.down || 0) };
  }
  return NextResponse.json({ votes: allVotes });
} 