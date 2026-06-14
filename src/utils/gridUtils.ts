import type { Position } from '../types';

export function generateGrid(width: number, height: number): Position[] {
  const grid: Position[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid.push({ x, y });
    }
  }
  return grid;
}

export function getDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

export function getNeighbors(
  pos: Position,
  width: number,
  height: number,
): Position[] {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const neighbors: Position[] = [];
  for (const dir of directions) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

export function getHexNeighbors(
  pos: Position,
  width: number,
  height: number,
): Position[] {
  const isEvenRow = pos.y % 2 === 0;

  const directions = isEvenRow
    ? [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 1 },
      ]
    : [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];

  const neighbors: Position[] = [];
  for (const dir of directions) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

export function bfsReachable(
  start: Position,
  maxSteps: number,
  obstacles: Position[],
  width: number,
  height: number,
): Position[] {
  const obstacleSet = new Set(obstacles.map((p) => `${p.x},${p.y}`));
  obstacleSet.delete(`${start.x},${start.y}`);

  const queue: { pos: Position; steps: number }[] = [{ pos: start, steps: 0 }];
  const visited = new Set<string>();
  const result: Position[] = [];

  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.steps > 0) {
      result.push(current.pos);
    }

    if (current.steps >= maxSteps) {
      continue;
    }

    const neighbors = getNeighbors(current.pos, width, height);
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key) && !obstacleSet.has(key)) {
        visited.add(key);
        queue.push({ pos: neighbor, steps: current.steps + 1 });
      }
    }
  }

  return result;
}

export function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function parseKey(key: string): Position {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}
