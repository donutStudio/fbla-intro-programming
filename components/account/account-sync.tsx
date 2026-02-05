"use client";

import { useEffect } from "react";
import { usePetStore } from "@/lib/pet-store";
import { useAccountStore } from "@/lib/account-store";

export function AccountSync() {
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const loadSnapshot = usePetStore((state) => state.loadSnapshot);
  const getSnapshot = usePetStore((state) => state.getSnapshot);

  useEffect(() => {
    if (!currentUserId) {
      loadSnapshot(null);
      return;
    }

    const snapshot =
      useAccountStore.getState().accounts[currentUserId]?.petSnapshot ?? null;
    loadSnapshot(snapshot);
  }, [currentUserId, loadSnapshot]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = usePetStore.subscribe(() => {
      const snapshot = getSnapshot();
      useAccountStore.getState().savePetSnapshot(currentUserId, snapshot);
    });

    return unsubscribe;
  }, [currentUserId, getSnapshot]);

  return null;
}
