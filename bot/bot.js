import { Action, MessageType, MapUtility } from '../src/index.js';

export const BOT_NAME = 'Scripting Doodler';

/**
 * @template T
 * @param {readonly T[]} items
 * @returns {T}
 */
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

const directionActions = [Action.Down, Action.Up, Action.Left, Action.Right];

/**
 * @param {import('../src/index.js').MapUpdateEvent} mapUpdateEvent
 * @returns {Action | Promise<Action>}
 */
export function getNextAction(mapUpdateEvent) {
  const mapUtils = new MapUtility(mapUpdateEvent.map, mapUpdateEvent.receivingPlayerId);
  const myCharacter = mapUtils.getMyCharacterInfo();

  const validActions = directionActions.filter((action) => mapUtils.canIMoveInDirection(action));

  if (myCharacter.carryingPowerUp) {
    validActions.push(Action.Explode);
  }

  return randomItem(validActions);
}

// This handler is optional
export function onMessage(message) {
  switch (message.type) {
    case MessageType.GameStarting:
      // Reset bot state here
      break;
  }
}

// Set to null to user server default settings
export const GAME_SETTINGS = {
  maxNoofPlayers: 5,
  timeInMsPerTick: 250,
  obstaclesEnabled: true,
  powerUpsEnabled: true,
  addPowerUpLikelihood: 38,
  removePowerUpLikelihood: 5,
  trainingGame: true,
  pointsPerTileOwned: 1,
  pointsPerCausedStun: 5,
  noOfTicksInvulnerableAfterStun: 3,
  noOfTicksStunned: 10,
  startObstacles: 40,
  startPowerUps: 41,
  gameDurationInSeconds: 60,
  explosionRange: 4,
  pointsPerTick: false,
};
