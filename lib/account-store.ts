import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PetGameSnapshot } from "@/lib/pet-store";
import { usePetStore } from "@/lib/pet-store";

export type AccountRecord = {
  id: string;
  username: string;
  password: string;
  createdAt: number;
  petSnapshot: PetGameSnapshot | null;
  friends: string[];
  incomingRequests: string[];
  outgoingRequests: string[];
};

type AccountState = {
  accounts: Record<string, AccountRecord>;
  currentUserId: string | null;
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
  savePetSnapshot: (userId: string, snapshot: PetGameSnapshot) => void;
  sendFriendRequest: (targetUsername: string) => {
    ok: boolean;
    message: string;
  };
  acceptFriendRequest: (requesterId: string) => void;
  declineFriendRequest: (requesterId: string) => void;
};

const normalizeUsername = (value: string) => value.trim().toLowerCase();

const findAccountByUsername = (
  accounts: Record<string, AccountRecord>,
  username: string
) =>
  Object.values(accounts).find(
    (account) => normalizeUsername(account.username) === normalizeUsername(username)
  );

export const useAccountStore = create<AccountState & AccountActions>()(
  persist(
    (set, get) => ({
      accounts: {},
      currentUserId: null,

      signUp: (username, password) => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
          return { ok: false, message: "Username is required." };
        }
        if (password.length < 4) {
          return { ok: false, message: "Password must be at least 4 characters." };
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
          petSnapshot: null,
          friends: [],
          incomingRequests: [],
          outgoingRequests: [],
        };

        set({
          accounts: {
            ...state.accounts,
            [id]: newAccount,
          },
          currentUserId: id,
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
        if (account.password !== password) {
          return { ok: false, message: "Incorrect password." };
        }

        set({ currentUserId: account.id });
        usePetStore.getState().loadSnapshot(account.petSnapshot);

        return { ok: true, message: `Welcome back, ${account.username}!` };
      },

      logout: () => {
        set({ currentUserId: null });
        usePetStore.getState().loadSnapshot(null);
      },

      savePetSnapshot: (userId, snapshot) => {
        const state = get();
        const account = state.accounts[userId];
        if (!account) return;
        set({
          accounts: {
            ...state.accounts,
            [userId]: {
              ...account,
              petSnapshot: snapshot,
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
    }
  )
);
