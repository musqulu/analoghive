import { celsiusToFahrenheit, fahrenheitToCelsius, formatTemperature } from './temperature';

describe('Temperature utility functions', () => {
  describe('celsiusToFahrenheit', () => {
    test('converts celsius to fahrenheit correctly', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(20)).toBe(68);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(celsiusToFahrenheit(-40)).toBe(-40); // Interesting case where C and F are the same
    });

    test('handles decimal values', () => {
      expect(celsiusToFahrenheit(37.5)).toBeCloseTo(99.5);
      expect(celsiusToFahrenheit(20.5)).toBeCloseTo(68.9);
    });
  });

  describe('fahrenheitToCelsius', () => {
    test('converts fahrenheit to celsius correctly', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
      expect(fahrenheitToCelsius(68)).toBeCloseTo(20);
      expect(fahrenheitToCelsius(212)).toBe(100);
      expect(fahrenheitToCelsius(-40)).toBe(-40); // Interesting case where C and F are the same
    });

    test('handles decimal values', () => {
      expect(fahrenheitToCelsius(99.5)).toBeCloseTo(37.5);
      expect(fahrenheitToCelsius(68.9)).toBeCloseTo(20.5);
    });
  });

  describe('formatTemperature', () => {
    test('formats temperature with correct unit', () => {
      expect(formatTemperature(20, 'celsius')).toBe('20°C');
      expect(formatTemperature(68, 'fahrenheit')).toBe('68°F');
    });

    test('handles decimal values', () => {
      expect(formatTemperature(20.5, 'celsius')).toBe('20.5°C');
      expect(formatTemperature(68.9, 'fahrenheit')).toBe('68.9°F');
    });

    test('rounds to specified decimal places', () => {
      expect(formatTemperature(20.12345, 'celsius', 1)).toBe('20.1°C');
      expect(formatTemperature(68.98765, 'fahrenheit', 2)).toBe('68.99°F');
    });
  });
}); 