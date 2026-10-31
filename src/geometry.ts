export interface Rect { x: number; y: number; width: number; height: number }
export type Placement = 'normal' | 'left' | 'right' | 'maximized';
export function clampRect(rect: Rect, area: Rect): Rect {
  const width = Math.min(area.width, Math.max(Math.min(340, area.width), rect.width));
  const height = Math.min(area.height, Math.max(Math.min(230, area.height), rect.height));
  return { width, height, x: Math.max(area.x, Math.min(rect.x, area.x + area.width - width)), y: Math.max(area.y, Math.min(rect.y, area.y + area.height - height)) };
}
export function placementRect(mode: Placement, area: Rect): Rect {
  if (mode === 'left' || mode === 'right') {
    const half = Math.floor((area.width - 8) / 2);
    return { x: mode === 'left' ? area.x : area.x + half + 8, y: area.y, width: mode === 'left' ? half : area.width - half - 8, height: area.height };
  }
  return { ...area };
}
export function resized(rect: Rect, edge: string, dx: number, dy: number, area: Rect): Rect {
  const right = rect.x + rect.width, bottom = rect.y + rect.height;
  let { x, y, width, height } = rect;
  const minW = Math.min(340, area.width), minH = Math.min(230, area.height);
  if (edge.includes('e')) width = Math.max(minW, Math.min(rect.width + dx, area.x + area.width - x));
  if (edge.includes('s')) height = Math.max(minH, Math.min(rect.height + dy, area.y + area.height - y));
  if (edge.includes('w')) { x = Math.max(area.x, Math.min(rect.x + dx, right - minW)); width = right - x; }
  if (edge.includes('n')) { y = Math.max(area.y, Math.min(rect.y + dy, bottom - minH)); height = bottom - y; }
  return { x, y, width, height };
}
