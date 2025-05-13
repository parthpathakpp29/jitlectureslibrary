import { useMemo } from 'react';

/**
 * A hook that filters an array of objects based on a search term.
 * 
 * @param items - The array of items to filter
 * @param searchTerm - The search term to filter by
 * @param keys - The object keys to search within
 * @returns The filtered array of items
 */
export function useSearchFilter<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return items.filter(item => {
      return keys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      });
    });
  }, [items, searchTerm, keys]);
}
