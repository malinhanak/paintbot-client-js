import { Action, MessageType, MapUtility } from '../src/index.js';

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export const BOT_NAME = 'Scripting Doodler';

/**
 * @param {import('../src/index.js').MapUpdateEvent} mapUpdateEvent
 * @returns {Direction | Promise<Direction>}
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
