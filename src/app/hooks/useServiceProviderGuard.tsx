import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useServiceProviderGuard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isServiceProvider, setIsServiceProvider] = useState(false);

  useEffect(() => {
    async function checkServiceProvider() {
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
        if (user?.role === "SERVICE_PROVIDER") {
          setIsServiceProvider(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch {
        router.replace("/unauthorized");
      } finally {
        setLoading(false);
      }
    }
    checkServiceProvider();
  }, [router]);

  return { loading, isServiceProvider };
}
