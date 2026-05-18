import type { Player } from "@who-am-i/shared/types";

export type SeatPosition = {
  left: string;
  top: string;
};

/** จัดลำดับผู้เล่นให้ตัวเองอยู่ที่นั่งล่างกลางของโต๊ะ */
export function orderPlayersForTable(
  players: Player[],
  selfId: string
): Player[] {
  const n = players.length;
  if (n <= 1) return players;

  const myIdx = players.findIndex((p) => p.id === selfId);
  if (myIdx === -1) return players;

  const targetSeat = Math.floor(n / 2);
  const rotateBy = (myIdx - targetSeat + n) % n;
  return [...players.slice(rotateBy), ...players.slice(0, rotateBy)];
}

/** ตำแหน่งรอบวงรี — index 0 อยู่บน, กึ่งกลางล่างเมื่อ rotate แล้ว */
export function seatPosition(
  index: number,
  total: number,
  radiusX = 44,
  radiusY = 40
): SeatPosition {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    left: `${50 + radiusX * Math.cos(angle)}%`,
    top: `${50 + radiusY * Math.sin(angle)}%`,
  };
}
