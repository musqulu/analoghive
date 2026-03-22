export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9
}

export function formatTemperature(
  temperature: number,
  unit: "celsius" | "fahrenheit",
  decimals?: number
): string {
  const symbol = unit === "celsius" ? "°C" : "°F"
  if (decimals !== undefined) {
    return `${temperature.toFixed(decimals)}${symbol}`
  }
  return `${temperature}${symbol}`
}

export function displayTemp(tempCelsius: number, unit: string): string {
  if (unit === "fahrenheit") {
    return `${celsiusToFahrenheit(tempCelsius).toFixed(1)}°F`
  }
  return `${tempCelsius}°C`
}
