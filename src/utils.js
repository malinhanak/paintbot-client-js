/**
 * @typedef {{ type: TileType, characterId?: string }} Tile
 * @typedef {{ position: number, colliders: string[] }} CollisionInfo
 * @typedef {{ position: number, exploders: string[] }} ExplosionInfo
 * @typedef {{ id: string, name: string, position: number, colouredPositions: number[], stunnedForGameTicks: number, carryingPowerUp: boolean }} CharacterInfo
 * @typedef {{ width: number, height: number, worldTick: number, powerUpPositions: number[], obstaclePositions: number[], characterInfos: CharacterInfo[], collisionInfos: CollisionInfo[], explosionInfos: ExplosionInfo[] }} PaintbotMap
 * @typedef {{ gameTick: number, gameId: string, map: PaintbotMap, receivingPlayerId: string }} MapUpdateEvent
 *
 */

/** @enum {symbol} */
export const TileType = Object.freeze({
  Empty: Symbol('Empty'),
  PowerUp: Symbol('PowerUp'),
  Obstacle: Symbol('Obstacle'),
  Character: Symbol('Character'),
  Colour: Symbol('Colour'),
});

const emptyTile = Object.freeze({ type: TileType.Empty });
const powerUpTile = Object.freeze({ type: TileType.PowerUp });
const obstactleTile = Object.freeze({ type: TileType.Obstacle });

/**
 * @param {string} characterId
 * @returns {Tile}
 */
const createCharacterTile = (characterId) => Object.freeze({ type: TileType.Character, characterId });

/**
 * @param {string} characterId
 * @returns {Tile}
 */
const createColourTile = (characterId) => Object.freeze({ type: TileType.Colour, characterId });

/** @enum {string} */
export const Action = Object.freeze({
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT',
  Stay: 'STAY',
  Explode: 'EXPLODE',
});

const actionDeltas = Object.freeze({
  [Action.Up]: { x: 0, y: -1 },
  [Action.Down]: { x: 0, y: 1 },
  [Action.Left]: { x: -1, y: 0 },
  [Action.Right]: { x: 1, y: 0 },
  [Action.Stay]: { x: 0, y: 0 },
  [Action.Explode]: { x: 0, y: 0 },
});

/** @enum {string} */
export const GameMode = Object.freeze({
  Training: 'TRAINING',
  Tournament: 'TOURNAMENT',
});

export function noop() {
  // Nothing to see here
}

export class Coordinate {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Whether this coordinate is out of bounds
   * @param {PaintbotMap} map
   * @returns {boolean}
   */
  isOutOfBounds(map) {
    return this.x < 0 || this.y < 0 || this.x >= map.width || this.y >= map.height;
  }

  /**
   * @param {Coordinate} otherCoordinate
   * @returns {number}
   */
  manhattanDistanceTo(otherCoordinate) {
    const { x: x0, y: y0 } = this;
    const { x: x1, y: y1 } = otherCoordinate;
    return Math.abs(x1 - x0) + Math.abs(y1 - y0);
  }

  /**
   * Returns a new coordinate translated by the provided delta
   * @param {{ x: number, y: number }} delta
   * @returns {Coordinate}
   */
  translatedByDelta(delta) {
    const { x, y } = this;
    const { x: dx, y: dy } = delta;
    return new Coordinate(x + dx, y + dy);
  }

  /**
   * Returns a new coordinate translated by the provided action
   * @param {Action} action
   * @returns {Coordinate}
   */
  translatedByAction(action) {
    const actionDelta = actionDeltas[action];

    if (action === undefined) {
      throw new TypeError(`The action "${action}" is invalid`);
    }

    return this.translatedByDelta(actionDelta);
  }

  /**
   * Convert this Coordinate to an integer position in the map's coordinate system
   * @param {PaintbotMap} map
   * @returns {number}
   */
  toPosition(map) {
    if (this.isOutOfBounds(map)) {
      throw new RangeError('The coordinate must be within the bounds in order to convert to position');
    }

    return this.x + this.y * map.width;
  }
}

export class MapUtility {
  /** @type {PaintbotMap} */
  #map;
  /** @type {string} */
  #playerId;
  /** @type Map<string, CharacterInfo> */
  #characters = new Map();
  /** @private @type Map<number, Tile> */
  #tiles = new Map();

  get map() {
    return this.#map;
  }

  /**
   * @param {PaintbotMap} map
   * @param {string} playerId
   */
  constructor(map, playerId) {
    this.#map = map;
    this.#playerId = playerId;

    for (const powerUpPosition of map.powerUpPositions) {
      this.#tiles.set(powerUpPosition, powerUpTile);
    }

    for (const obstaclePosition of map.obstaclePositions) {
      this.#tiles.set(obstaclePosition, obstactleTile);
    }

    for (const characterInfo of map.characterInfos) {
      this.#characters.set(characterInfo.id, characterInfo);
      this.#tiles.set(characterInfo.position, createCharacterTile(characterInfo.id));

      const colourTile = createColourTile(characterInfo.id);
      for (const colouredPosition of characterInfo.colouredPositions) {
        this.#tiles.set(colouredPosition, colourTile);
      }
    }
  }

  /**
   * Converts a position in the flattened single array representation
   * of the Map to a Coordinate.
   * @param {number} position
   * @returns {Coordinate} Coordinate
   */
  getCoordinateAtPosition(position) {
    const mapWidth = this.#map.width;
    const x = position % mapWidth;
    const y = (position - x) / mapWidth;
    return new Coordinate(x, y);
  }

  /**
   * @returns {CharacterInfo} player's CharacterInfo
   */
  getMyCharacter() {
    return this.getCharacterById(this.#playerId);
  }

  /**
   *
   * @param {string} characterId the id of the player to look up
   * @returns {CharacterInfo}
   */
  getCharacterById(characterId) {
    const character = this.#characters.get(characterId);
    if (character === undefined) {
      throw new Error(`A character with ID "${characterId}" does not exist`);
    }
    return character;
  }

  /**
   * @param {number} position
   * @returns {Tile}
   */
  getTileAtPosition(position) {
    return this.getTileAtCoordinate(this.getCoordinateAtPosition(position));
  }

  /**
   * @param {Coordinate} coordinate
   * @returns {Tile}
   */
  getTileAtCoordinate(coordinate) {
    if (coordinate.isOutOfBounds(this.#map)) {
      return obstactleTile;
    }

    const tile = this.#tiles.get(coordinate.toPosition(this.#map));
    if (tile === undefined) {
      return emptyTile;
    }

    return tile;
  }

  /**
   * @param {number} position
   * @returns {boolean}
   */
  isPositionOutOfBounds(position) {
    return position < 0 || position >= this.#map.width * this.#map.height;
  }

  /**
   * Checks if it's possible to perform an action at the given coordinate
   * @param {Coordinate} coordinate
   * @param {Action} action
   * @returns {boolean} if action is allowed
   */
  isActionAtCoordinateAllowed(coordinate, action) {
    const newCoordinate = coordinate.translatedByAction(action);
    const tile = this.getTileAtCoordinate(newCoordinate);
    switch (tile.type) {
      case TileType.Obstacle:
      case TileType.Character:
        return false;
      default:
        return true;
    }
  }
}
