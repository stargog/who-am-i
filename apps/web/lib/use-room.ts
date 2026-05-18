"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import usePartySocket from "partysocket/react";
import type {
  ClientMessage,
  ClientRoomState,
  ServerMessage,
} from "@who-am-i/shared/types";
import { getPartyHost } from "./party";
import { getOrCreatePlayerId, setStoredPlayerName } from "./storage";

export function useRoom(roomCode: string, playerName: string) {
  const [state, setState] = useState<ClientRoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const joinedRef = useRef(false);

  useEffect(() => {
    setPlayerId(getOrCreatePlayerId());
  }, []);

  const socket = usePartySocket({
    host: getPartyHost(),
    room: roomCode.toLowerCase(),
    onOpen() {
      setConnected(true);
    },
    onClose() {
      setConnected(false);
      joinedRef.current = false;
    },
    onMessage(evt) {
      try {
        const msg = JSON.parse(evt.data as string) as ServerMessage;
        if (msg.type === "state") {
          setState(msg.state);
          setError(null);
        } else if (msg.type === "error") {
          setError(msg.message);
        }
      } catch {
        setError("ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์");
      }
    },
  });

  const send = useCallback(
    (msg: ClientMessage) => {
      socket.send(JSON.stringify(msg));
    },
    [socket]
  );

  useEffect(() => {
    if (!connected || !playerName.trim() || joinedRef.current || !playerId)
      return;
    setStoredPlayerName(playerName.trim());
    send({ type: "join", playerId, name: playerName.trim() });
    joinedRef.current = true;
  }, [connected, playerName, playerId, send]);

  const reconnectJoin = useCallback(() => {
    if (!playerName.trim() || !playerId) return;
    send({ type: "join", playerId, name: playerName.trim() });
    joinedRef.current = true;
  }, [playerName, playerId, send]);

  return {
    state,
    error,
    connected,
    playerId,
    send,
    setError,
    reconnectJoin,
    clearError: () => setError(null),
  };
}
