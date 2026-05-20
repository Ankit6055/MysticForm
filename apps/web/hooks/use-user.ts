"use client";

import { trpc } from "~/trpc/client";

export function useUser() {
  const { data, isLoading } = trpc.auth.me.useQuery(undefined, { staleTime: 60_000 });
  return { user: data ?? null, isLoading };
}
