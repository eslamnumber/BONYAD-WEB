import { beforeEach, describe, expect, it } from 'vitest';

import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from './recent-searches';

const KEY = 'bonyad:dashboard:recent-searches';

beforeEach(() => {
  window.localStorage.clear();
});

describe('getRecentSearches', () => {
  it('returns [] when nothing is stored', () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it('returns [] for corrupt or non-array JSON, dropping non-string entries', () => {
    window.localStorage.setItem(KEY, '{ not json');
    expect(getRecentSearches()).toEqual([]);
    window.localStorage.setItem(KEY, JSON.stringify({ oops: true }));
    expect(getRecentSearches()).toEqual([]);
    window.localStorage.setItem(KEY, JSON.stringify(['ok', 3, '', 'fine']));
    expect(getRecentSearches()).toEqual(['ok', 'fine']);
  });
});

describe('addRecentSearch', () => {
  it('prepends newest-first and trims whitespace', () => {
    addRecentSearch('plumber');
    expect(addRecentSearch('  electrician  ')).toEqual(['electrician', 'plumber']);
  });

  it('de-duplicates case-insensitively, moving the term to the front', () => {
    addRecentSearch('Plumber');
    addRecentSearch('electrician');
    expect(addRecentSearch('PLUMBER')).toEqual(['PLUMBER', 'electrician']);
  });

  it('caps the list at 5 entries', () => {
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(addRecentSearch);
    expect(getRecentSearches()).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  it('ignores blank terms', () => {
    addRecentSearch('plumber');
    expect(addRecentSearch('   ')).toEqual(['plumber']);
  });
});

describe('removeRecentSearch / clearRecentSearches', () => {
  it('removes a single term case-insensitively', () => {
    addRecentSearch('plumber');
    addRecentSearch('electrician');
    expect(removeRecentSearch('PLUMBER')).toEqual(['electrician']);
  });

  it('clears the whole list', () => {
    addRecentSearch('plumber');
    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });
});
