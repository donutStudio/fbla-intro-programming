import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PetGameSnapshot } from "@/lib/pet-store";
import { usePetStore } from "@/lib/pet-store";

export type AccountPet = {
  id: string;
  name: string;
  type: string;
  createdAt: number;
  snapshot: PetGameSnapshot | null;
  ownerId: string;
  access: "owner" | "edit" | "view";
  isShared: boolean;
  sourcePetId?: string;
  sharedWith: Record<string, "view" | "edit">;
};

export type AccountRecord = {
  id: string;
  username: string;
  password: string;
  createdAt: number;
  pets: AccountPet[];
  activePetId: string | null;
  friends: string[];
  incomingRequests: string[];
  outgoingRequests: string[];
  hasCompletedOnboarding: boolean;
};

type AccountState = {
  accounts: Record<string, AccountRecord>;
  currentUserId: string | null;
  showPetManager: boolean;
  showSetup: boolean;
  showFriendsManager: boolean;
};

type AccountActions = {
  signUp: (username: string, password: string) => {
    ok: boolean;
    message: string;
  };
  login: (username: string, password: string) => {
    ok: boolean;
    message: string;
  };
  logout: () => void;
  saveActivePetSnapshot: (userId: string, snapshot: PetGameSnapshot) => void;
  addPetFromSnapshot: (snapshot: PetGameSnapshot) => void;
  renamePet: (petId: string, name: string) => { ok: boolean; message: string };
  deletePet: (petId: string) => void;
  selectPet: (petId: string) => void;
  showManager: () => void;
  showFriends: () => void;
  startPetCreation: () => void;
  completeOnboarding: () => void;
  setPetAccess: (
    petId: string,
    friendId: string,
    access: "view" | "edit" | "none"
  ) => void;
  addSharedPetLink: (
    ownerId: string,
    petId: string,
    targetUserId?: string
  ) => void;
  sendFriendRequest: (targetUsername: string) => {
    ok: boolean;
    message: string;
  };
  acceptFriendRequest: (requesterId: string) => void;
  declineFriendRequest: (requesterId: string) => void;
};

const normalizeUsername = (value: string) => value.trim().toLowerCase();
const isValidUsername = (value: string) =>
  /^[a-zA-Z0-9_]{3,16}$/.test(value.trim());
const isValidPassword = (value: string) =>
  /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(value);

const findAccountByUsername = (
  accounts: Record<string, AccountRecord>,
  username: string
) =>
  Object.values(accounts).find(
    (account) => normalizeUsername(account.username) === normalizeUsername(username)
  );

const normalizePet = (pet: AccountPet, ownerId: string): AccountPet => {
  const resolvedOwner = pet.ownerId ?? ownerId;
  const isShared = pet.isShared ?? resolvedOwner !== ownerId;

  return {
    ...pet,
    ownerId: resolvedOwner,
    access: pet.access ?? (isShared ? "view" : "owner"),
    isShared,
    sharedWith: pet.sharedWith ?? {},
  };
};

const normalizeAccount = (account: AccountRecord) => ({
  ...account,
  pets: (account.pets ?? []).map((pet) => normalizePet(pet, account.id)),
  activePetId: account.activePetId ?? null,
  hasCompletedOnboarding: account.hasCompletedOnboarding ?? false,
  friends: account.friends ?? [],
  incomingRequests: account.incomingRequests ?? [],
  outgoingRequests: account.outgoingRequests ?? [],
});

export const useAccountStore = create<AccountState & AccountActions>()(
  persist(
    (set, get) => ({
      accounts: {},
      currentUserId: null,
      showPetManager: false,
      showSetup: false,
      showFriendsManager: false,

      signUp: (username, password) => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
          return { ok: false, message: "Username is required." };
        }
        if (!isValidUsername(trimmedUsername)) {
          return {
            ok: false,
            message: "Username must be 3-16 characters and use letters, numbers, or _.",
          };
        }
        if (!isValidPassword(password)) {
          return {
            ok: false,
            message: "Password must be 6+ characters and include a letter + number.",
          };
        }

        const state = get();
        const existing = findAccountByUsername(state.accounts, trimmedUsername);
        if (existing) {
          return { ok: false, message: "That username is already taken." };
        }

        const id = `user-${Date.now()}`;
        const newAccount: AccountRecord = {
          id,
          username: trimmedUsername,
          password,
          createdAt: Date.now(),
          pets: [],
          activePetId: null,
          friends: [],
          incomingRequests: [],
          outgoingRequests: [],
          hasCompletedOnboarding: false,
        };

        set({
          accounts: {
            ...state.accounts,
            [id]: newAccount,
          },
          currentUserId: id,
          showPetManager: false,
          showSetup: true,
          showFriendsManager: false,
        });

        usePetStore.getState().loadSnapshot(null);

        return { ok: true, message: "Account created. Welcome to PetPal!" };
      },

      login: (username, password) => {
        const state = get();
        const account = findAccountByUsername(state.accounts, username);
        if (!account) {
          return { ok: false, message: "Account not found." };
        }
        const normalizedAccount = normalizeAccount(account);
        if (normalizedAccount.password !== password) {
          return { ok: false, message: "Incorrect password." };
        }

        const shouldShowSetup =
          !normalizedAccount.hasCompletedOnboarding &&
          normalizedAccount.pets.length === 0;
        const shouldShowManager = !shouldShowSetup;
        const activePet =
          normalizedAccount.pets.find(
            (pet) => pet.id === normalizedAccount.activePetId
          ) ?? null;

        set({
          accounts: {
            ...state.accounts,
            [account.id]: normalizedAccount,
          },
          currentUserId: normalizedAccount.id,
          showPetManager: shouldShowManager,
          showSetup: shouldShowSetup,
          showFriendsManager: false,
        });
        usePetStore.getState().loadSnapshot(activePet?.snapshot ?? null);

        return { ok: true, message: `Welcome back, ${normalizedAccount.username}!` };
      },

      logout: () => {
        set({
          currentUserId: null,
          showPetManager: false,
          showSetup: false,
          showFriendsManager: false,
        });
        usePetStore.getState().loadSnapshot(null);
      },

      saveActivePetSnapshot: (userId, snapshot) => {
        const state = get();
        const account = state.accounts[userId];
        if (!account) return;
        if (!account.activePetId) return;

        const activePet = account.pets.find(
          (pet) => pet.id === account.activePetId
        );
        if (!activePet) return;

        const updatePetSnapshot = (
          targetAccountId: string,
          targetPetId: string
        ) => {
          const targetAccount = get().accounts[targetAccountId];
          if (!targetAccount) return;
          const name = snapshot.pet?.name;
          const type = snapshot.pet?.type;
          const updatedPets = targetAccount.pets.map((pet) =>
            pet.id === targetPetId
              ? {
                  ...pet,
                  snapshot,
                  name: name ?? pet.name,
                  type: type ?? pet.type,
                }
              : pet
          );
          set({
            accounts: {
              ...get().accounts,
              [targetAccountId]: {
                ...targetAccount,
                pets: updatedPets,
              },
            },
          });
        };

        if (activePet.isShared && activePet.sourcePetId && activePet.ownerId) {
          updatePetSnapshot(activePet.ownerId, activePet.sourcePetId);
          Object.values(get().accounts).forEach((accountEntry) => {
            const sharedMatch = accountEntry.pets.find(
              (pet) =>
                pet.isShared &&
                pet.ownerId === activePet.ownerId &&
                pet.sourcePetId === activePet.sourcePetId
            );
            if (sharedMatch) {
              updatePetSnapshot(accountEntry.id, sharedMatch.id);
            }
          });
          return;
        }

        const pets = account.pets.map((pet) =>
          pet.id === account.activePetId ? { ...pet, snapshot } : pet
        );
        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              pets,
            },
          },
        });
      },

      addPetFromSnapshot: (snapshot) => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const account = state.accounts[userId];
        if (!account || !snapshot.pet) return;

        const petId = `pet-${Date.now()}`;
        const newPet: AccountPet = {
          id: petId,
          name: snapshot.pet.name,
          type: snapshot.pet.type,
          createdAt: Date.now(),
          snapshot,
          ownerId: account.id,
          access: "owner",
          isShared: false,
          sharedWith: {},
        };

        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              pets: [...account.pets, newPet],
              activePetId: petId,
              hasCompletedOnboarding: true,
            },
          },
          showSetup: false,
          showPetManager: false,
        });
      },

      renamePet: (petId, name) => {
        const trimmed = name.trim();
        if (!trimmed || trimmed.length < 2) {
          return { ok: false, message: "Pet name must be at least 2 characters." };
        }

        const state = get();
        const userId = state.currentUserId;
        if (!userId) return { ok: false, message: "Please log in first." };
        const account = state.accounts[userId];
        if (!account) return { ok: false, message: "Account not found." };

        const pets = account.pets.map((pet) =>
          pet.id === petId
            ? {
                ...pet,
                name: trimmed,
                snapshot: pet.snapshot?.pet
                  ? {
                      ...pet.snapshot,
                      pet: {
                        ...pet.snapshot.pet,
                        name: trimmed,
                      },
                    }
                  : pet.snapshot,
              }
            : pet
        );

        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              pets,
            },
          },
        });

        if (account.activePetId === petId && usePetStore.getState().pet) {
          usePetStore.setState((current) =>
            current.pet
              ? {
                  pet: {
                    ...current.pet,
                    name: trimmed,
                  },
                }
              : {}
          );
        }

        return { ok: true, message: "Pet renamed." };
      },

      deletePet: (petId) => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const account = state.accounts[userId];
        if (!account) return;

        const petToDelete = account.pets.find((pet) => pet.id === petId);
        const pets = account.pets.filter((pet) => pet.id !== petId);
        const nextActive =
          account.activePetId === petId ? pets[0]?.id ?? null : account.activePetId;
        const nextPet = pets.find((pet) => pet.id === nextActive) ?? null;

        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              pets,
              activePetId: nextActive,
            },
          },
          showPetManager: true,
        });

        usePetStore.getState().loadSnapshot(nextPet?.snapshot ?? null);

        if (petToDelete && !petToDelete.isShared) {
          Object.values(state.accounts).forEach((accountEntry) => {
            const updatedPets = accountEntry.pets.filter(
              (pet) =>
                !(
                  pet.isShared &&
                  pet.ownerId === petToDelete.ownerId &&
                  pet.sourcePetId === petToDelete.id
                )
            );
            if (updatedPets.length !== accountEntry.pets.length) {
              set({
                accounts: {
                  ...get().accounts,
                  [accountEntry.id]: {
                    ...accountEntry,
                    pets: updatedPets,
                  },
                },
              });
            }
          });
        }
      },

      selectPet: (petId) => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const account = state.accounts[userId];
        if (!account) return;
        const pet = account.pets.find((entry) => entry.id === petId);
        if (!pet) return;

        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              activePetId: petId,
            },
          },
          showPetManager: false,
          showSetup: false,
        });

        usePetStore.getState().loadSnapshot(pet.snapshot ?? null);
      },

      showManager: () => {
        set({ showPetManager: true, showSetup: false, showFriendsManager: false });
      },

      showFriends: () => {
        set({ showFriendsManager: true, showPetManager: false, showSetup: false });
      },

      startPetCreation: () => {
        set({ showSetup: true, showPetManager: false, showFriendsManager: false });
      },

      completeOnboarding: () => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const account = state.accounts[userId];
        if (!account) return;
        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              hasCompletedOnboarding: true,
            },
          },
          showSetup: false,
          showPetManager: true,
          showFriendsManager: false,
        });
      },

      setPetAccess: (petId, friendId, access) => {
        const state = get();
        const userId = state.currentUserId;
        if (!userId) return;
        const account = state.accounts[userId];
        if (!account) return;

        const pets = account.pets.map((pet) => {
          if (pet.id !== petId) return pet;
          if (pet.isShared) return pet;

          const sharedWith = { ...pet.sharedWith };
          if (access === "none") {
            delete sharedWith[friendId];
          } else {
            sharedWith[friendId] = access;
          }
          return { ...pet, sharedWith };
        });

        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              pets,
            },
          },
        });

        if (access === "edit") {
          get().addSharedPetLink(userId, petId, friendId);
        } else {
          const friendAccount = state.accounts[friendId];
          if (friendAccount) {
            set({
              accounts: {
                ...get().accounts,
                [friendId]: {
                  ...friendAccount,
                  pets: friendAccount.pets.filter(
                    (pet) =>
                      !(
                        pet.isShared &&
                        pet.ownerId === userId &&
                        pet.sourcePetId === petId
                      )
                  ),
                },
              },
            });
          }
        }
      },

      addSharedPetLink: (ownerId, petId, targetUserId) => {
        const state = get();
        const userId = targetUserId ?? state.currentUserId;
        if (!userId) return;
        const ownerAccount = state.accounts[ownerId];
        const currentAccount = state.accounts[userId];
        if (!ownerAccount || !currentAccount) return;

        const ownerPet = ownerAccount.pets.find((pet) => pet.id === petId);
        if (!ownerPet) return;

        const exists = currentAccount.pets.some(
          (pet) =>
            pet.isShared && pet.ownerId === ownerId && pet.sourcePetId === petId
        );
        if (exists) return;

        const sharedPet: AccountPet = {
          id: `shared-${ownerId}-${petId}`,
          name: ownerPet.name,
          type: ownerPet.type,
          createdAt: ownerPet.createdAt,
          snapshot: ownerPet.snapshot,
          ownerId,
          access: "edit",
          isShared: true,
          sourcePetId: petId,
          sharedWith: {},
        };

        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...currentAccount,
              pets: [...currentAccount.pets, sharedPet],
            },
          },
        });
      },

      sendFriendRequest: (targetUsername) => {
        const state = get();
        const currentUserId = state.currentUserId;
        if (!currentUserId) {
          return { ok: false, message: "Please log in first." };
        }

        const targetAccount = findAccountByUsername(
          state.accounts,
          targetUsername
        );
        if (!targetAccount) {
          return { ok: false, message: "User not found." };
        }
        if (targetAccount.id === currentUserId) {
          return { ok: false, message: "You cannot friend yourself." };
        }

        const currentAccount = state.accounts[currentUserId];
        if (currentAccount.friends.includes(targetAccount.id)) {
          return { ok: false, message: "You are already friends." };
        }
        if (currentAccount.outgoingRequests.includes(targetAccount.id)) {
          return { ok: false, message: "Request already sent." };
        }
        if (currentAccount.incomingRequests.includes(targetAccount.id)) {
          return { ok: false, message: "They already requested you." };
        }

        set({
          accounts: {
            ...state.accounts,
            [currentUserId]: {
              ...currentAccount,
              outgoingRequests: [
                ...currentAccount.outgoingRequests,
                targetAccount.id,
              ],
            },
            [targetAccount.id]: {
              ...targetAccount,
              incomingRequests: [
                ...targetAccount.incomingRequests,
                currentUserId,
              ],
            },
          },
        });

        return { ok: true, message: "Friend request sent." };
      },

      acceptFriendRequest: (requesterId) => {
        const state = get();
        const currentUserId = state.currentUserId;
        if (!currentUserId) return;

        const currentAccount = state.accounts[currentUserId];
        const requester = state.accounts[requesterId];
        if (!currentAccount || !requester) return;

        set({
          accounts: {
            ...state.accounts,
            [currentUserId]: {
              ...currentAccount,
              friends: [...currentAccount.friends, requesterId],
              incomingRequests: currentAccount.incomingRequests.filter(
                (id) => id !== requesterId
              ),
            },
            [requesterId]: {
              ...requester,
              friends: [...requester.friends, currentUserId],
              outgoingRequests: requester.outgoingRequests.filter(
                (id) => id !== currentUserId
              ),
            },
          },
        });
      },

      declineFriendRequest: (requesterId) => {
        const state = get();
        const currentUserId = state.currentUserId;
        if (!currentUserId) return;

        const currentAccount = state.accounts[currentUserId];
        const requester = state.accounts[requesterId];
        if (!currentAccount || !requester) return;

        set({
          accounts: {
            ...state.accounts,
            [currentUserId]: {
              ...currentAccount,
              incomingRequests: currentAccount.incomingRequests.filter(
                (id) => id !== requesterId
              ),
            },
            [requesterId]: {
              ...requester,
              outgoingRequests: requester.outgoingRequests.filter(
                (id) => id !== currentUserId
              ),
            },
          },
        });
      },
    }),
    {
      name: "petpal-accounts",
      version: 1,
      migrate: (state) => {
        const data = state as AccountState & AccountActions;
        const accounts = Object.fromEntries(
          Object.entries(data.accounts ?? {}).map(([id, account]) => [
            id,
            normalizeAccount(account as AccountRecord),
          ])
        );

        return {
          ...data,
          accounts,
          showPetManager: data.showPetManager ?? false,
          showSetup: data.showSetup ?? false,
          showFriendsManager: data.showFriendsManager ?? false,
        };
      },
    }
  )
);
