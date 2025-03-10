import { formatTime } from './format-time';

describe('formatTime function', () => {
  test('formats seconds into MM:SS format', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(1)).toBe('0:01');
    expect(formatTime(10)).toBe('0:10');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(120)).toBe('2:00');
    expect(formatTime(659)).toBe('10:59');
    expect(formatTime(3600)).toBe('60:00');
  });

  test('handles fractions of seconds', () => {
    expect(formatTime(1.5)).toBe('0:01');
    expect(formatTime(60.9)).toBe('1:00');
    expect(formatTime(125.3)).toBe('2:05');
  });

  test('handles negative values by returning 0:00', () => {
    expect(formatTime(-1)).toBe('0:00');
    expect(formatTime(-60)).toBe('0:00');
  });
}); 