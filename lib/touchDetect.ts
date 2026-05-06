export function detectTouchDevice(): boolean {
  return 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches
}
