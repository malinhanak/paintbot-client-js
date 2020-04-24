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

const getFoodOnXAxisWithRightMove = (validStep) => {
  if (validStep.includes('RIGHT')) {
    return 'RIGHT';
  } else if (validStep.includes('UP')) {
    return 'UP';
  } else if (validStep.includes('DOWN')) {
    return 'DOWN';
  }
};

const getFoodOnXAxisWithLeftMove = (validStep) => {
  if (validStep.includes('LEFT')) {
    return 'LEFT';
  } else if (validStep.includes('UP')) {
    return 'UP';
  } else if (validStep.includes('DOWN')) {
    return 'DOWN';
  }
};

const getFoodOnYAxisWithUpMove = (validStep) => {
  if (validStep.includes('UP')) {
    return 'UP';
  } else if (validStep.includes('RIGHT')) {
    return 'RIGHT';
  } else if (validStep.includes('LEFT')) {
    return 'LEFT';
  }
};

const getFoodOnYAxisWithDownMove = (validStep) => {
  if (validStep.includes('DOWN')) {
    return 'DOWN';
  } else if (validStep.includes('RIGHT')) {
    return 'RIGHT';
  } else if (validStep.includes('LEFT')) {
    return 'LEFT';
  }
};

function findPowerUp(powerUpPostion, ourPosition, validSteps, myCharacter) {
  if (myCharacter.carryingPowerUp) {
    return 'EXPLODE';
  }
  console.log('ourPosition', ourPosition);
  console.log('powerUpPostion', powerUpPostion);
  if (ourPosition.x > powerUpPostion.x) {
    return getFoodOnXAxisWithRightMove(validSteps);
  } else if (ourPosition.x > powerUpPostion.x) {
    return getFoodOnXAxisWithLeftMove(validSteps);
  } else if (ourPosition.x === powerUpPostion.x && ourPosition.y > powerUpPostion.y) {
    return getFoodOnYAxisWithUpMove(validSteps);
  } else if (ourPosition.x === powerUpPostion.x && ourPosition.y < powerUpPostion.y) {
    return getFoodOnYAxisWithDownMove(validSteps);
  }
  return randomItem(validSteps);
}

const directionActions = [Action.Down, Action.Up, Action.Left, Action.Right];

/**
 * @param {import('../src/index.js').MapUpdateEvent} mapUpdateEvent
 * @returns {Action | Promise<Action>}
 */
export function getNextAction(mapUpdateEvent) {
  const mapUtils = new MapUtility(mapUpdateEvent.map, mapUpdateEvent.receivingPlayerId);
  const myCharacter = mapUtils.getMyCharacterInfo();

  const powerUp = mapUtils.getCoordinatesContainingPowerUps();
  // const powerUpPositions = mapUtils.convertCoordinatesToPositions(powerUp);
  const myCoordinate = mapUtils.convertPositionToCoordinate(myCharacter.position);
  // console.log('my coordinate', myCharacter.position);
  // console.log('powerUp array', powerUpPositions[0]);

  const closest = powerUp.reduce(function (prev, curr) {
    return Math.abs(curr.x - myCoordinate.x) < Math.abs(prev.x - myCoordinate.x) ? curr : prev;
  });

  // console.log('closest powerup', closest);

  const validActions = directionActions.filter((action) => mapUtils.canIMoveInDirection(action));

  if (myCharacter.carryingPowerUp) {
    validActions.push(Action.Explode);
  }

  return findPowerUp(closest, myCoordinate, validActions, myCharacter);
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
