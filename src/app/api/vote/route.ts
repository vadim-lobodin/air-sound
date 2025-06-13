import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const VOTES_FILE = path.join(process.cwd(), "votes.json");

async function readVotes() {
  try {
    return await fs.readJson(VOTES_FILE);
  } catch {
    return {};
  }
}

async function writeVotes(votes: Record<string, { up: number; down: number }>) {
  await fs.writeJson(VOTES_FILE, votes, { spaces: 2 });
}

export async function POST(req: NextRequest) {
  const { file, voteType } = await req.json();
  if (!file || !["up", "down"].includes(voteType)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const votes = await readVotes();
  if (!votes[file]) votes[file] = { up: 0, down: 0 };
  votes[file][voteType] += 1;
  await writeVotes(votes);
  return NextResponse.json({ votes: votes[file] });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  const votes = await readVotes();
  if (file) {
    return NextResponse.json({ votes: votes[file] || { up: 0, down: 0 } });
  }
  return NextResponse.json({ votes });
} 