/**
 * Formats a time in seconds to a MM:SS string format
 * @param seconds The time in seconds
 * @returns Formatted time string in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}; 