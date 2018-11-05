import { CharacterAction, CharacterInfo, Map } from './messages';

function id<T>(obj: T) {
  return obj;
}

function memoize<Args extends Array<unknown>, V>(fn: (...args: Args) => V, createKey: (...args: Args) => string) {
  const cache: Record<string, V> = {};
  return (...args: Args) => {
    const key = createKey(...args);
    if (key in cache) {
      return cache[key];
    }
    const value = fn(...args);
    cache[key] = value;
    return value;
  };
}

interface Point2D {
  readonly x: number;
  readonly y: number;
}

const actionDeltas: Record<CharacterAction, Point2D> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  STAY: { x: 0, y: 0 },
  EXPLODE: { x: 0, y: 0 },
};

export class Coordinate {
  static fromPosition(position: number, mapWidth: number) {
    const x = position % mapWidth;
    const y = (position - x) / mapWidth;
    return new Coordinate(x, y);
  }

  constructor(readonly x: number, readonly y: number) {}

  isOutOfBounds(mapWidth: number, mapHeight: number) {
    const { x, y } = this;
    return x < 0 || y < 0 || x >= mapWidth || y >= mapHeight;
  }

  euclidianDistanceTo({ x: x1, y: y1 }: Point2D) {
    const { x: x0, y: y0 } = this;
    return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  }

  manhattanDistanceTo({ x: x1, y: y1 }: Point2D) {
    const { x: x0, y: y0 } = this;
    return Math.abs(x1 - x0) + Math.abs(y1 - y0);
  }

  toPosition(mapWidth: number, mapHeight: number) {
    if (this.isOutOfBounds(mapWidth, mapHeight)) {
      throw new RangeError('The coordinate must be within the bounds in order to convert to position');
    }

    const { x, y } = this;
    return x + y * mapWidth;
  }

  negated() {
    const { x, y } = this;
    return new Coordinate(-x, -y);
  }

  translatedByDelta({ x: dx, y: dy }: Point2D) {
    const { x, y } = this;
    return new Coordinate(x + dx, y + dy);
  }

  translatedByAction(action: CharacterAction) {
    return this.translatedByDelta(actionDeltas[action]);
  }
}

export const enum TileType {
  Empty,
  Obstacle,
  Bomb,
  Character,
  Coloured,
}

export interface EmptyTile {
  readonly type: TileType.Empty;
}

export interface ObstactleTile {
  readonly type: TileType.Obstacle;
}

export interface BombTile {
  readonly type: TileType.Bomb;
}

export interface CharacterTile {
  readonly type: TileType.Character;
  readonly playerId: string;
}

export interface ColouredTile {
  readonly type: TileType.Coloured;
  readonly playerId: string;
}

export type Tile = EmptyTile | ObstactleTile | BombTile | CharacterTile | ColouredTile;

const emptyTile = Object.freeze<EmptyTile>({ type: TileType.Empty });
const obstactleTile = Object.freeze<ObstactleTile>({ type: TileType.Obstacle });
const bombTile = Object.freeze<BombTile>({ type: TileType.Bomb });
const createCharacterTile = memoize((playerId: string): CharacterTile => ({ type: TileType.Character, playerId }), id);
const createColouredTile = memoize((playerId: string): ColouredTile => ({ type: TileType.Coloured, playerId }), id);

export class WrappedMap {
  get width() {
    return this.map.width;
  }

  get height() {
    return this.map.height;
  }

  constructor(readonly map: Map, readonly playerId: string) {}

  getCoordinateAtPosition(position: number) {
    if (typeof position !== 'number') {
      throw new TypeError(`position must be a number`);
    }

    return Coordinate.fromPosition(position, this.width);
  }

  getCharacterInfo(playerId: string): CharacterInfo | null {
    if (typeof playerId !== 'string') {
      throw new TypeError(`playerId must be a string`);
    }

    for (const characterInfo of this.map.characterInfos) {
      if (characterInfo.playerId === playerId) {
        return characterInfo;
      }
    }

    return null;
  }

  getTileAtCoordinate(coordinate: Coordinate): Tile {
    if (!(coordinate instanceof Coordinate)) {
      throw new TypeError('coordinate must be an instance of Coordinate');
    }

    const { width, height } = this;

    if (coordinate.isOutOfBounds(width, height)) {
      return obstactleTile;
    }

    const position = coordinate.toPosition(width, height);

    return this.getTileAtPosition(position);
  }

  getTileAtPosition(position: number): Tile {
    if (typeof position !== 'number') {
      throw new TypeError(`position must be a number`);
    }

    if (position < 0 || this.width * this.height <= position) {
      return obstactleTile;
    }

    if (this.map.obstaclePositions.indexOf(position) !== -1) {
      return obstactleTile;
    }

    if (this.map.bombPositions.indexOf(position) !== -1) {
      return bombTile;
    }

    for (const characterInfo of this.map.characterInfos) {
      if (characterInfo.position === position) {
        return createCharacterTile(characterInfo.playerId);
      }

      if (characterInfo.colouredPositions.indexOf(position) !== -1) {
        return createColouredTile(characterInfo.playerId);
      }
    }

    return emptyTile;
  }
}
