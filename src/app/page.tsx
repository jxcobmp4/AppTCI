"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session/SessionProvider";

export default function Root() {
  const router = useRouter();
  const { session, ready } = useSession();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? "/inicio" : "/login");
  }, [ready, session, router]);

  return null;
}
