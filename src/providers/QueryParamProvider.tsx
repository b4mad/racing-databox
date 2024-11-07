import { QueryParamProvider as BaseQueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { ReactNode } from 'react';

interface QueryParamProviderProps {
  children: ReactNode;
}

export function QueryParamProvider({ children }: QueryParamProviderProps) {
  return (
    <BaseQueryParamProvider adapter={ReactRouter6Adapter}>
      {children}
    </BaseQueryParamProvider>
  );
}
