"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOut = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.auth.me) });
      router.replace("/login");
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut.mutate()}
      disabled={signOut.isPending}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
