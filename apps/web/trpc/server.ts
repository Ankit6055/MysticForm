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
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
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
