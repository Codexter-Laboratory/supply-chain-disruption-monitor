import { GraphQLClient } from 'graphql-request';
import { createClient, type Client } from 'graphql-ws';

const HTTP_ENDPOINT = '/graphql';

export const graphqlHttpClient = new GraphQLClient(HTTP_ENDPOINT);

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
