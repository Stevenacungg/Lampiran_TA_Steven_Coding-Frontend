export { formatTime }

/**
 * Format time to HH:MM:SS from timestamp (miliseconds)
*/
function formatTime(diff) {
  return `${Math.floor(diff/1000 / 3600).toString().padStart(2, '0')}:${Math.floor((diff/1000 % 3600) / 60).toString().padStart(2, '0')}:${Math.floor((diff/1000 % 3600) % 60).toString().padStart(2, '0')}`
}