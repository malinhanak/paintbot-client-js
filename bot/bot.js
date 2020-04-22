import { Action, MessageType, MapUtility } from '../src/index.js';

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export const BOT_NAME = 'Scripting Doodler';

/**
 * @param {import('../src/index.js').MapUpdateEvent} mapUpdateEvent
 * @returns {Action | Promise<Action>}
 */
export function getNextAction(mapUpdateEvent) {
  const mapUtils = new MapUtility(mapUpdateEvent.map, mapUpdateEvent.receivingPlayerId);
  const validActions = [Action.Down, Action.Up, Action.Left, Action.Right].filter(action =>
    mapUtils.canIMoveInDirection(action),
  );

  if (mapUtils.getMyCharacterInfo().carryingPowerUp) {
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

// desired game settings
// can be changed to null to get default settings from server
export let settings = {
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
