import { useCallback, useEffect } from 'react';
import { useHistoryDispatch } from '@/contexts/HistoryContext';
import { useRecentDispatch } from '@/contexts/RecentContext';

/**
 * Shared calculator logic hook.
 *
 * Provides helpers that every calculator screen needs:
 * - saving a result to history
 * - checking whether all required fields are filled with valid numbers
 * - a no-op resetFields placeholder (callers override with their own state)
 *
 * On mount it also records the calculator as recently used.
 */
export function useCalculator(calcId: string, calcName: string) {
  const { addHistory } = useHistoryDispatch();
  const { addRecent } = useRecentDispatch();

  // Record this calculator as recently used on mount
  useEffect(() => {
    addRecent(calcId);
  }, [calcId, addRecent]);

  /**
   * Persist a calculation to history.
   *
   * @param inputs  - key/value map of the user's input fields
   * @param result  - key/value map of the computed results
   * @param label   - optional human-readable summary line
   */
  const saveToHistory = useCallback(
    (
      inputs: Record<string, any>,
      result: Record<string, any>,
      label?: string,
    ) => {
      addHistory({
        calcId,
        calcName,
        inputs,
        result,
        ...(label !== undefined && { label }),
      });
    },
    [calcId, calcName, addHistory],
  );

  /**
   * Returns `true` when every value in `fields` is a non-empty string that
   * parses to a finite number.  Useful for enabling / disabling a "Calculate"
   * button.
   */
  const canCalculate = useCallback(
    (fields: Record<string, any>): boolean => {
      return Object.values(fields).every((value) => {
        if (value === null || value === undefined) return false;
        const str = String(value).trim();
        if (str === '') return false;
        const num = Number(str);
        return Number.isFinite(num);
      });
    },
    [],
  );

  /**
   * Placeholder reset – individual calculator screens should supply their own
   * state-resetting logic. This exists so that consumers always get a
   * `resetFields` key back without having to check for `undefined`.
   */
  const resetFields = useCallback(() => {
    // No-op: override at the call-site with calculator-specific state resets.
  }, []);

  return { saveToHistory, canCalculate, resetFields };
}
