export type ClassValue = string | number | false | null | undefined | ClassValue[];

export const cn = (...inputs: readonly ClassValue[]): string => {
  const result: string[] = [];
  for (const input of inputs) {
    if (!input && input !== 0) continue;
    if (typeof input === 'string' || typeof input === 'number') {
      result.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) result.push(nested);
    }
  }
  return result.join(' ');
};
