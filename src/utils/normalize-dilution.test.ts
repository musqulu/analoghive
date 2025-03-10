import { normalizeDilutionDisplay } from './normalize-dilution';

describe('normalizeDilutionDisplay function', () => {
  test('converts colon format to plus format', () => {
    expect(normalizeDilutionDisplay('1:50')).toBe('1+50');
    expect(normalizeDilutionDisplay('1:100')).toBe('1+100');
    expect(normalizeDilutionDisplay('1:9')).toBe('1+9');
  });

  test('leaves plus format unchanged', () => {
    expect(normalizeDilutionDisplay('1+50')).toBe('1+50');
    expect(normalizeDilutionDisplay('1+25')).toBe('1+25');
  });

  test('handles stock dilution unchanged', () => {
    expect(normalizeDilutionDisplay('stock')).toBe('stock');
  });

  test('handles undefined or empty input', () => {
    expect(normalizeDilutionDisplay('')).toBe('');
    expect(normalizeDilutionDisplay(undefined)).toBe(undefined);
  });

  test('handles complex inputs with multiple colons', () => {
    expect(normalizeDilutionDisplay('1:1:9')).toBe('1:1+9');
    expect(normalizeDilutionDisplay('HC-110:B:1:31')).toBe('HC-110:B:1+31');
  });
}); 