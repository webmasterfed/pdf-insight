// Only the methods the app uses, so tests can pass a simple in-memory fake.
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// Even reading window.localStorage can throw (blocked cookies, some private modes).
export function getBrowserStorage(): KeyValueStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
