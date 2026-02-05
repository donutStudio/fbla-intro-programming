"use client";

import { useEffect } from "react";
import { usePetStore } from "@/lib/pet-store";
import { useAccountStore } from "@/lib/account-store";

export function AccountSync() {
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const loadSnapshot = usePetStore((state) => state.loadSnapshot);
  const getSnapshot = usePetStore((state) => state.getSnapshot);
  const saveActivePetSnapshot = useAccountStore(
    (state) => state.saveActivePetSnapshot
  );
  const activePetId = useAccountStore((state) =>
    currentUserId ? state.accounts[currentUserId]?.activePetId ?? null : null
  );

  useEffect(() => {
    if (!currentUserId) {
      loadSnapshot(null);
      return;
    }

    const snapshot =
      useAccountStore
        .getState()
        .accounts[currentUserId]?.pets.find((pet) => pet.id === activePetId)
        ?.snapshot ?? null;
    loadSnapshot(snapshot);
  }, [currentUserId, activePetId, loadSnapshot]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = usePetStore.subscribe(() => {
      const snapshot = getSnapshot();
      saveActivePetSnapshot(currentUserId, snapshot);
    });

    return unsubscribe;
  }, [currentUserId, getSnapshot, saveActivePetSnapshot]);

  return null;
}
