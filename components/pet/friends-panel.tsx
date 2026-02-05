"use client";

import { useState } from "react";
import { useAccountStore } from "@/lib/account-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus } from "lucide-react";

export function FriendsPanel() {
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const currentAccount = useAccountStore((state) =>
    currentUserId ? state.accounts[currentUserId] : null
  );
  const accounts = useAccountStore((state) => state.accounts);
  const sendFriendRequest = useAccountStore((state) => state.sendFriendRequest);
  const acceptFriendRequest = useAccountStore((state) => state.acceptFriendRequest);
  const declineFriendRequest = useAccountStore((state) => state.declineFriendRequest);
  const [friendUsername, setFriendUsername] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!currentAccount) return null;

  const friends = currentAccount.friends
    .map((id) => accounts[id])
    .filter(Boolean);
  const incoming = currentAccount.incomingRequests
    .map((id) => accounts[id])
    .filter(Boolean);

  const handleSendRequest = () => {
    const result = sendFriendRequest(friendUsername);
    setStatusMessage(result.message);
    if (result.ok) {
      setFriendUsername("");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Friend's username"
              value={friendUsername}
              onChange={(event) => setFriendUsername(event.target.value)}
            />
            <Button className="sm:w-auto" onClick={handleSendRequest}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send request
            </Button>
          </div>
          {statusMessage && (
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          )}
        </CardContent>
      </Card>

      {incoming.length > 0 && (
        <Card className="border border-border/70 shadow-sm animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle>Incoming requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incoming.map((account) => (
              <div
                key={account.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {account.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {account.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptFriendRequest(account.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineFriendRequest(account.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Friend pets
            <Badge variant="secondary">{friends.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {friends.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add friends to view their pets and compare progress.
            </p>
          )}
          {friends.map((friend) => {
            const pet = friend.petSnapshot?.pet;
            return (
              <div
                key={friend.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 p-4 bg-card/70 transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {friend.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pet
                      ? `${pet.name} the ${pet.type} (${pet.evolution})`
                      : "No pet created yet"}
                  </p>
                </div>
                {pet && (
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">Mood: {pet.mood}</Badge>
                    <Badge variant="outline">Health: {pet.health}%</Badge>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
