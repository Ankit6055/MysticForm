"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOut = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
    onError: (err) => toast.error(err.message ?? "Failed to sign out"),
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut.mutate({})}
      disabled={signOut.isPending}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
