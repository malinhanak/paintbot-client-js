import { strict as assert } from 'assert';
import { Action, Coordinate } from '../src/utils.js';

describe('Direction', () => {
  it('has the correct directions', () => {
    assert.equal(Action.Up, 'UP');
    assert.equal(Action.Down, 'DOWN');
    assert.equal(Action.Left, 'LEFT');
    assert.equal(Action.Right, 'RIGHT');
  });
});

describe('Coordinate', () => {
  it('creates a coordinate object from x and y', () => {
    const x = 1;
    const y = 2;

    const coordinate = new Coordinate(x, y);

    assert.equal(coordinate.x, x);
    assert.equal(coordinate.y, y);
  });

  it('translates the coordinate by delta', () => {
    const x = 1;
    const y = 2;

    const coordinate = new Coordinate(x, -y);

    // @ts-ignore
    assert.throws(() => coordinate.translatedByDelta(undefined));

    const translatedCoordinate = coordinate.translatedByDelta({ x, y });

    assert.notEqual(translatedCoordinate, coordinate);
    assert.equal(translatedCoordinate.x, 2 * x);
    assert.equal(translatedCoordinate.y, 0);
  });

  it('translates the coordinate by direction', () => {
    const coordinate = new Coordinate(0, 0);

    // @ts-ignore
    assert.throws(() => coordinate.translateByAction(undefined));

    assert.deepEqual(coordinate.translatedByAction(Action.Up), new Coordinate(0, -1));
    assert.deepEqual(coordinate.translatedByAction(Action.Down), new Coordinate(0, 1));
    assert.deepEqual(coordinate.translatedByAction(Action.Left), new Coordinate(-1, 0));
    assert.deepEqual(coordinate.translatedByAction(Action.Right), new Coordinate(1, 0));
  });

  it('computes the manhattan distance', () => {
    const coordinateA = new Coordinate(0, 0);
    const coordinateB = new Coordinate(3, 4);

    assert.equal(coordinateA.manhattanDistanceTo(coordinateB), 7);
  });
});
