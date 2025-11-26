"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export function UserInfo() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
        <div className="flex flex-col gap-1">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-3 w-32 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
        <User className="text-primary size-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name || "Usuário"}</span>
        <span className="text-muted-foreground text-xs">{user.email}</span>
      </div>
    </div>
  );
}

