# Paintbot client in JavaScript

This is a Paintbot Client written in JavaScript (ECMAScript 2020)

For more information about what Paintbot is, see: https://paintbot.cygni.se/

For running your own server see [Paintbot Server Repository](https://github.com/cygni/paintbot)

## Requirements

- Yarn or NPM
- Paintbot Server (local or remote, there's one running by Cygni so no worries ;) )

## Installation

A. Clone the repository: `git clone git@github.com:cygni/paintbot-client-js.git`.

B. Open: `<repo>/`

C. Execute: `yarn` or `npm install`

## Usage

`yarn start` or `npm start` to run a training game

## Implementation

You only need to implement one function in order to have your own bot up and running. see [Example Bot](bot/bot.js)

```javascript
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function getNextMove(mapUpdateEvent) {
  const mapUtils = new MapUtility(mapUpdateEvent.map, mapUpdateEvent.receivingPlayerId);
  const validActions = [Action.Down, Action.Up, Action.Left, Action.Right].filter((action) =>
    mapUtils.canIMoveInDirection(action),
  );

  if (mapUtils.getMyCharacterInfo().carryingPowerUp) {
    validActions.push(Action.Explode);
  }

  return randomItem(validActions);
}
```

For every `mapUpdateEvent` received your are expected to reply with a CharacterAction (UP, DOWN, LEFT, RIGHT, STAY or EXPLODE).

### Help

There's a utility class with nifty methods to help you out. Take a look at `MapUtility` and what it offers
