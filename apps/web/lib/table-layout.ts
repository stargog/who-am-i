import type { Player } from "@who-am-i/shared/types";

export type SeatPosition = {
  left: string;
  top: string;
};

/** Order players so self sits at the bottom (mobile) / right (2p desktop) of the table */
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

const TWO_PLAYER: SeatPosition[] = [
  { left: "18%", top: "50%" },
  { left: "82%", top: "50%" },
];

const THREE_PLAYER: SeatPosition[] = [
  { left: "50%", top: "12%" },
  { left: "14%", top: "72%" },
  { left: "86%", top: "72%" },
];

/** Seat positions around the table — tuned per player count */
export function seatPosition(index: number, total: number): SeatPosition {
  if (total === 2) {
    return TWO_PLAYER[index] ?? TWO_PLAYER[0];
  }
  if (total === 3) {
    return THREE_PLAYER[index] ?? THREE_PLAYER[0];
  }

  const radiusX = total <= 4 ? 44 : total <= 6 ? 46 : 48;
  const radiusY = total <= 4 ? 40 : total <= 6 ? 42 : 44;
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    left: `${50 + radiusX * Math.cos(angle)}%`,
    top: `${50 + radiusY * Math.sin(angle)}%`,
  };
}
