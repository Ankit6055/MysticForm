import type { ServerRouter } from "@repo/trpc/client";
import { createTRPCProxyClient, httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

function getServerApiUrl() {
  return env.API_URL ?? env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc";
}

function createServerLink(opts?: { enableStreaming?: boolean }) {
  const createLink = opts?.enableStreaming ? httpBatchStreamLink : httpLink;

  return createLink({
    url: getServerApiUrl(),
    async fetch(url, options) {
      let cookieHeader = "";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieHeader = cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; ");
      } catch {
        // Not in a request context (e.g. during static generation)
      }

      return fetch(url, {
        ...options,
        cache: "no-store",
        headers: {
          ...(options?.headers as Record<string, string>),
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      });
    },
  });
}

export const api = createTRPCProxyClient<ServerRouter>({
  links: [createServerLink()],
});

export const apiStreaming = createTRPCProxyClient<ServerRouter>({
  links: [createServerLink({ enableStreaming: true })],
});
