import { GraphQLClient } from 'graphql-request';
import { createClient, type Client } from 'graphql-ws';

/**
 * graphql-request resolves the endpoint with `new URL(url)`; a path-only string is invalid in the
 * browser. Use the current origin so Vite dev proxy (`/graphql` → :3000) still applies.
 */
function graphqlHttpEndpoint(): string {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5173/graphql';
  }
  return `${window.location.origin}/graphql`;
}

export const graphqlHttpClient = new GraphQLClient(graphqlHttpEndpoint());

let wsClient: Client | null = null;

export function getGraphqlWsClient(): Client {
  if (!wsClient) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    wsClient = createClient({
      url: `${proto}//${host}/graphql`,
    });
  }
  return wsClient;
}
