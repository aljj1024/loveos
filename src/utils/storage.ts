const STORAGE_KEY = 'loveos_state';

export function loadState<T>(defaults: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveState<T>(state: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
