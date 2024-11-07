import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlState<T>(
  key: string,
  defaultValue: T,
  serialize: (value: T) => string = String,
  deserialize: (value: string) => T = String as any
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) !== null
    ? deserialize(searchParams.get(key)!)
    : defaultValue;

  const setValue = useCallback(
    (newValue: T) => {
      setSearchParams(prev => {
        const newSearchParams = new URLSearchParams(prev);
        newSearchParams.set(key, serialize(newValue));
        return newSearchParams;
      });
    },
    [key, searchParams, setSearchParams, serialize]
  );

  return [value, setValue];
}
