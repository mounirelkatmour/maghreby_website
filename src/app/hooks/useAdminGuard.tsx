import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminGuard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      let userId = null;
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/userId=([^;]+)/);
        userId = match ? decodeURIComponent(match[1]) : null;
      }
      if (!userId) {
        router.replace("/unauthorized");
        return;
      }
      try {
        const res = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (!res.ok) {
          router.replace("/unauthorized");
          return;
        }
        const user = await res.json();
        if (user?.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch {
        router.replace("/unauthorized");
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  return { loading, isAdmin };
}
