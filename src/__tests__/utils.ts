import { Coordinate } from '../utils';

describe('Coordinate', () => {
  it('creates a coordinate object from x and y', () => {
    const x = 1;
    const y = 2;

    const coordinate = new Coordinate(x, y);

    expect(coordinate).toEqual({ x, y });
  });

  it('negates the coordinate', () => {
    const x = 1;
    const y = 2;

    const coordinate = new Coordinate(x, y);
    const negatedCoordinate = coordinate.negated();

    expect(negatedCoordinate).not.toEqual(coordinate);
    expect(negatedCoordinate).toEqual({ x: -x, y: -y });
  });

  it('translates the coordinate by delta', () => {
    const x = 1;
    const y = 2;

    const coordinate = new Coordinate(x, -y);

    // @ts-ignore
    expect(() => coordinate.translatedByDelta(undefined)).toThrow();

    const translatedCoordinate = coordinate.translatedByDelta({ x, y });

    expect(translatedCoordinate).not.toEqual(coordinate);
    expect(translatedCoordinate).toEqual({ x: 2 * x, y: 0 });
  });

  it('translates the coordinate by direction', () => {
    const coordinate = new Coordinate(0, 0);

    // @ts-ignore
    expect(() => coordinate.translatedByAction(undefined)).toThrow();

    expect(coordinate.translatedByAction('UP')).toEqual(new Coordinate(0, -1));
    expect(coordinate.translatedByAction('DOWN')).toEqual(new Coordinate(0, 1));
    expect(coordinate.translatedByAction('LEFT')).toEqual(new Coordinate(-1, 0));
    expect(coordinate.translatedByAction('RIGHT')).toEqual(new Coordinate(1, 0));
    expect(coordinate.translatedByAction('STAY')).toEqual(new Coordinate(0, 0));
    expect(coordinate.translatedByAction('EXPLODE')).toEqual(new Coordinate(0, 0));
  });

  it('computes the euclidian distance', () => {
    const coordinateA = new Coordinate(0, 0);
    const coordinateB = new Coordinate(3, 4);

    expect(coordinateA.euclidianDistanceTo(coordinateB)).toBe(5);
  });

  it('computes the manhattan distance', () => {
    const coordinateA = new Coordinate(0, 0);
    const coordinateB = new Coordinate(3, 4);

    expect(coordinateA.manhattanDistanceTo(coordinateB)).toBe(7);
  });

  it('determines if it is out of bounds', () => {
    const mapWidth = 4;
    const mapHeight = 3;

    expect(new Coordinate(0, -1).isOutOfBounds(mapWidth, mapHeight)).toBe(true);
    expect(new Coordinate(0, 0).isOutOfBounds(mapWidth, mapHeight)).toBe(false);
    expect(new Coordinate(0, 1).isOutOfBounds(mapWidth, mapHeight)).toBe(false);

    expect(new Coordinate(-1, 0).isOutOfBounds(mapWidth, mapHeight)).toBe(true);
    expect(new Coordinate(0, 0).isOutOfBounds(mapWidth, mapHeight)).toBe(false);
    expect(new Coordinate(1, 0).isOutOfBounds(mapWidth, mapHeight)).toBe(false);

    expect(new Coordinate(mapWidth - 1, mapHeight - 1).isOutOfBounds(mapWidth, mapHeight)).toBe(false);
    expect(new Coordinate(mapWidth - 1, mapHeight + 0).isOutOfBounds(mapWidth, mapHeight)).toBe(true);
    expect(new Coordinate(mapWidth - 1, mapHeight + 1).isOutOfBounds(mapWidth, mapHeight)).toBe(true);

    expect(new Coordinate(mapWidth - 1, mapHeight - 1).isOutOfBounds(mapWidth, mapHeight)).toBe(false);
    expect(new Coordinate(mapWidth + 0, mapHeight - 1).isOutOfBounds(mapWidth, mapHeight)).toBe(true);
    expect(new Coordinate(mapWidth + 1, mapHeight - 1).isOutOfBounds(mapWidth, mapHeight)).toBe(true);
  });

  it('converts to a map position', () => {
    const mapWidth = 3;
    const mapHeight = 4;

    // It throws if it's out of bounds
    expect(() => new Coordinate(0, -1).toPosition(mapWidth, mapHeight)).toThrow(RangeError);
    expect(() => new Coordinate(0, mapHeight).toPosition(mapWidth, mapHeight)).toThrow(RangeError);
    expect(() => new Coordinate(-1, 0).toPosition(mapWidth, mapHeight)).toThrow(RangeError);
    expect(() => new Coordinate(mapWidth, 0).toPosition(mapWidth, mapHeight)).toThrow(RangeError);

    expect(new Coordinate(0, 0).toPosition(mapWidth, mapHeight)).toBe(0);
    expect(new Coordinate(mapWidth - 1, 0).toPosition(mapWidth, mapHeight)).toBe(mapWidth - 1);
    expect(new Coordinate(0, 1).toPosition(mapWidth, mapHeight)).toBe(mapWidth);
    expect(new Coordinate(0, mapHeight - 1).toPosition(mapWidth, mapHeight)).toBe((mapHeight - 1) * mapWidth);
    expect(new Coordinate(mapWidth - 1, mapHeight - 1).toPosition(mapWidth, mapHeight)).toBe(
      mapWidth - 1 + (mapHeight - 1) * mapWidth,
    );
  });

  it('creates a coordinate object from a map position', () => {
    const mapWidth = 3;
    const mapHeight = 4;

    expect(Coordinate.fromPosition(0, mapWidth)).toEqual(new Coordinate(0, 0));
    expect(Coordinate.fromPosition(mapWidth - 1, mapWidth)).toEqual(new Coordinate(mapWidth - 1, 0));
    expect(Coordinate.fromPosition(mapWidth, mapWidth)).toEqual(new Coordinate(0, 1));
    expect(Coordinate.fromPosition((mapHeight - 1) * mapWidth, mapWidth)).toEqual(new Coordinate(0, mapHeight - 1));
    expect(Coordinate.fromPosition(mapWidth - 1 + (mapHeight - 1) * mapWidth, mapWidth)).toEqual(
      new Coordinate(mapWidth - 1, mapHeight - 1),
    );
  });
});
