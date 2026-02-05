"use client";

import { useState } from "react";
import { useAccountStore } from "@/lib/account-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PawPrint, Sparkles } from "lucide-react";

export function AuthScreen() {
  const signUp = useAccountStore((state) => state.signUp);
  const login = useAccountStore((state) => state.login);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

  const handleLogin = () => {
    setLoginError(null);
    const result = login(loginUsername, loginPassword);
    setAuthMessage(result.message);
    if (!result.ok) {
      setLoginError(result.message);
    }
  };

  const handleSignup = () => {
    setSignupError(null);
    if (!usernameRegex.test(signupUsername.trim())) {
      setSignupError(
        "Username must be 3-16 characters and use letters, numbers, or _."
      );
      return;
    }
    if (!passwordRegex.test(signupPassword)) {
      setSignupError(
        "Password must be 6+ characters and include a letter + number."
      );
      return;
    }
    const result = signUp(signupUsername, signupPassword);
    setAuthMessage(result.message);
    if (!result.ok) {
      setSignupError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">PetPal</h1>
          <p className="text-muted-foreground">
            Sign in to save your pet, track progress, and connect with friends.
          </p>
        </div>

        <Card className="shadow-lg border border-border/70 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              PetPal Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    placeholder="Your username"
                    value={loginUsername}
                    onChange={(event) => setLoginUsername(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleLogin}
                  disabled={!loginUsername.trim() || !loginPassword}
                >
                  Log in
                </Button>
                {loginError && (
                  <p className="text-xs text-destructive">{loginError}</p>
                )}
              </TabsContent>

              <TabsContent value="signup" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    placeholder="Choose a username"
                    value={signupUsername}
                    onChange={(event) => setSignupUsername(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSignup}
                  disabled={
                    !usernameRegex.test(signupUsername.trim()) ||
                    !passwordRegex.test(signupPassword)
                  }
                >
                  Create account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Username: 3-16 chars (letters, numbers, underscores). Password: 6+
                  chars with a letter and number.
                </p>
                {signupError && (
                  <p className="text-xs text-destructive">{signupError}</p>
                )}
              </TabsContent>
            </Tabs>

            {authMessage && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                {authMessage}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
