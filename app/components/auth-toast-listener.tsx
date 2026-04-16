'use client'

import { useEffect } from "react";
import toast from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const shownToastKeys = new Set<string>();

export function AuthToastListener() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authToast = searchParams.get("authToast");

  useEffect(() => {
    if (authToast !== "login" && authToast !== "logout") return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("authToast");

    const cleanedQuery = params.toString();
    const cleanedPath = cleanedQuery ? `${pathname}?${cleanedQuery}` : pathname;
    const toastKey = `${pathname}:${authToast}`;

    if (!shownToastKeys.has(toastKey)) {
      shownToastKeys.add(toastKey);
      const isLogoutToast = authToast === "logout";

      toast.success(isLogoutToast ? "Logged out successfully." : "Logged in successfully.", {
        position: "top-center",
        ...(isLogoutToast
          ? {
              style: {
                background: "#dc2626",
                color: "#ffffff",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#dc2626",
              },
            }
          : {}),
      });
    }

    router.replace(cleanedPath, { scroll: false });
  }, [authToast, pathname, router, searchParams]);

  return null;
}
