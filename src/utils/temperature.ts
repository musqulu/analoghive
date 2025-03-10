/**
 * Converts temperature from Celsius to Fahrenheit
 * @param celsius Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * Converts temperature from Fahrenheit to Celsius
 * @param fahrenheit Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

/**
 * Formats temperature with the appropriate unit symbol
 * @param temperature The temperature value
 * @param unit The temperature unit ('celsius' or 'fahrenheit')
 * @param decimals Number of decimal places to round to (default: no rounding)
 * @returns Formatted temperature string with unit
 */
export const formatTemperature = (
  temperature: number, 
  unit: 'celsius' | 'fahrenheit',
  decimals?: number
): string => {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  
  if (decimals !== undefined) {
    return `${temperature.toFixed(decimals)}${symbol}`;
  }
  
  return `${temperature}${symbol}`;
}; 