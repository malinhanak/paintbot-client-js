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
  const myCharacter = mapUtils.getMyCharacter();
  const myCoordinate = mapUtils.getCoordinateAtPosition(myCharacter.position);

  const validActions = directionActions.filter((action) => mapUtils.isActionAtCoordinateAllowed(myCoordinate, action));

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
