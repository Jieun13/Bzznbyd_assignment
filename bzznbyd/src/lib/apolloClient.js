import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { useMemo } from 'react';

let apolloClient = null;

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: '/api/graphql',
    }),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState = null) {
  const client = apolloClient ?? createApolloClient();

  if (initialState) {
    client.cache.restore(initialState);
  }

  // SSR: 항상 새 인스턴스 반환 (서버 간 캐시 공유 방지)
  if (typeof window === 'undefined') return client;

  // CSR: 싱글턴 유지
  if (!apolloClient) apolloClient = client;
  return apolloClient;
}

export function useApollo(initialState) {
  return useMemo(() => initializeApollo(initialState), [initialState]);
}
