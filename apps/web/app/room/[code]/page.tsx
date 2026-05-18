import { RoomGame } from "@/components/room-game";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <RoomGame roomCode={code} />;
}
