import fs from "fs";
import path from "path";
import AudioPlayerList from "./player-list";

export default function Home() {
  const mp3Dir = path.join(process.cwd(), "public", "mp3");
  let files: string[] = [];
  try {
    files = fs.readdirSync(mp3Dir).filter((file) => file.endsWith(".mp3") || file.endsWith(".wav"));
  } catch {
    // Directory may not exist
  }
  return <AudioPlayerList files={files} />;
}
