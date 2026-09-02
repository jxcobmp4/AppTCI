"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionUserId } from "@/lib/repo/db";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getSessionUserId() ? "/inicio" : "/login");
  }, [router]);
  return null;
}
