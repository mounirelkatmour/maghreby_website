"use client";

import { UserProvider, useUser } from "@auth0/nextjs-auth0/client";
import { ReactNode, useEffect, useRef } from "react";

function SyncUser() {
  const { user, isLoading } = useUser();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!user || hasSyncedRef.current) return;

      try {
        hasSyncedRef.current = true;

        const res = await fetch("http://localhost:8080/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sub: user.sub,
            email: user.email,
            name: user.name,
            picture: user.picture,
          }),
        });

        const result = await res.json();
        console.log("✅ User synced:", result);
        //set userId in cookies or session
        document.cookie = `userId=${result.id}; path=/; max-age=604800`; // 1 week
        console.log("✅ User ID set in cookies:", result.id);
      } catch (error) {
        console.error("❌ Failed to sync user:", error);
      }
    };

    if (!isLoading && user) {
      syncUser();
    }
  }, [user, isLoading]);

  return null;
}

export default function Auth0Provider({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <SyncUser />
      {children}
    </UserProvider>
  );
}
