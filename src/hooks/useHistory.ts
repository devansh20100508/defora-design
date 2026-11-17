import { useCallback, useState } from 'react';

export function useHistory<T>(initialValue: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialValue);
  const [future, setFuture] = useState<T[]>([]);

  const commit = useCallback((nextValue: T | ((prev: T) => T)) => {
    const resolved = typeof nextValue === 'function' ? (nextValue as (prev: T) => T)(present) : nextValue;
    setPast((prev) => [...prev, present]);
    setFuture([]);
    setPresent(resolved);
  }, [present]);

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    const resolved = typeof updater === 'function' ? (updater as (prev: T) => T)(present) : updater;
    setPast((prev) => [...prev, present]);
    setFuture([]);
    setPresent(resolved);
  }, [present]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setFuture((prev) => [present, ...prev]);
    setPast((prev) => prev.slice(0, -1));
    setPresent(previous);
  }, [past, present]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setPast((prev) => [...prev, present]);
    setFuture((prev) => prev.slice(1));
    setPresent(next);
  }, [future, present]);

  return {
    value: present,
    setValue: update,
    commit,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
