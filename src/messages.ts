export const enum MessageType {
  // Requests
  ClientInfo = 'se.cygni.snake.api.request.ClientInfo',
  StartGame = 'se.cygni.snake.api.request.StartGame',
  RegisterMove = 'se.cygni.snake.api.request.RegisterMove',
  RegisterPlayer = 'se.cygni.snake.api.request.RegisterPlayer',
  HeartBeatRequest = 'se.cygni.snake.api.request.HeartBeatRequest',

  // Responses
  HeartBeatResponse = 'se.cygni.snake.api.response.HeartBeatResponse',
  PlayerRegistered = 'se.cygni.snake.api.response.PlayerRegistered',

  // Exceptions
  InvalidMessage = 'se.cygni.snake.api.exception.InvalidMessage',
  InvalidPlayerName = 'se.cygni.snake.api.exception.InvalidPlayerName',
  NoActiveTournament = 'se.cygni.snake.api.exception.NoActiveTournament',

  // Events
  ArenaUpdate = 'se.cygni.snake.api.event.ArenaUpdateEvent',
  CharacterStunned = 'se.cygni.snake.api.event.CharacterStunnedEvent',
  GameAborted = 'se.cygni.snake.api.event.GameAbortedEvent',
  GameChanged = 'se.cygni.snake.api.event.GameChangedEvent',
  GameCreated = 'se.cygni.snake.api.event.GameCreatedEvent',
  GameEnded = 'se.cygni.snake.api.event.GameEndedEvent',
  GameLink = 'se.cygni.snake.api.event.GameLinkEvent',
  GameResult = 'se.cygni.snake.api.event.GameResultEvent',
  GameStarting = 'se.cygni.snake.api.event.GameStartingEvent',
  MapUpdate = 'se.cygni.snake.api.event.MapUpdateEvent',
  TournamentEnded = 'se.cygni.snake.api.event.TournamentEndedEvent',
}

export type CharacterAction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'STAY' | 'EXPLODE';
export type InvalidPlayerNameReason = 'Taken' | 'Empty' | 'InvalidCharacter';
export type StunReason =
  | 'CollisionWithWall'
  | 'CollisionWithObstacle'
  | 'CollisionWithCharacter'
  | 'CaughtByBombExplosion';

export interface GameSettings {
  maxNoofPlayers: number;
  startSnakeLength: number;
  timeInMsPerTick: number;
  obstaclesEnabled: boolean;
  foodEnabled: boolean;
  headToTailConsumes: boolean;
  tailConsumeGrows: boolean;
  addFoodLikelihood: number;
  removeFoodLikelihood: number;
  spontaneousGrowthEveryNWorldTick: number;
  trainingGame: boolean;
  pointsPerLength: number;
  pointsPerFood: number;
  pointsPerCausedDeath: number;
  pointsPerNibble: number;
  noofRoundsTailProtectedAfterNibble: number;
  startFood: number;
  startObstacles: number;
}

export interface CharacterInfo {
  playerId: string;
  name: string;
  points: number;
  position: number;
  colouredPositions: number[];
  stunnedForGameTicks: number;
}

export interface ColissionInfo {
  position: number;
  colliders: string;
}

export interface BombingInfo {
  position: number;
  bombers: string;
}

export interface Map {
  width: number;
  height: number;
  worldTick: number;
  characterInfos: CharacterInfo[];
  bombPositions: number[];
  obstaclePositions: number[];
  colissionInfos: ColissionInfo[];
  bombingInfos: BombingInfo[];
}

export interface ClientInfoMessage {
  type: MessageType.ClientInfo;
  language: string;
  languageVersion?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  clientVersion?: string;
}

export interface StartGameMessage {
  type: MessageType.StartGame;
}

export interface RegisterPlayerMessage {
  type: MessageType.RegisterPlayer;
  playerName: string;
  gameSettings?: Partial<GameSettings>;
}

export interface RegisterMoveMessage {
  type: MessageType.RegisterMove;
  gameId: string;
  gameTick: number;
  direction: CharacterAction;
}

export interface HeartBeatRequestMessage {
  type: MessageType.HeartBeatRequest;
}

export interface HeartBeatResponseMessage {
  type: MessageType.HeartBeatResponse;
}

export interface InvalidMessageMessage {
  type: MessageType.InvalidMessage;
  errorMessage: string;
  receivedMessage: string;
}

export interface InvalidPlayerNameMessage {
  type: MessageType.InvalidPlayerName;
  reasonCode: InvalidPlayerNameReason;
}

export interface NoActiveTournamentMessage {
  type: MessageType.NoActiveTournament;
}

export interface PlayerRegisteredMessage {
  type: MessageType.PlayerRegistered;
}

export interface ArenaUpdateMessage {
  type: MessageType.ArenaUpdate;
  arenaName: string;
  gameId: string;
  ranked: boolean;
  rating: Record<string, number>;
  onlinePlayers: string[];
  gameHistory: Array<{
    gameId: string;
    playerPositions: string[];
  }>;
}

export interface CharacterStunnedMessage {
  type: MessageType.CharacterStunned;
  gameId: string;
  playerId: string;
  stunReason: StunReason;
  durationInTicks: number;
  x: number;
  y: number;
  long: number;
}

export interface GameAbortedMessage {
  type: MessageType.GameAborted;
  gameId: string;
}

export interface GameChangedMessage {
  type: MessageType.GameChanged;
  gameId: string;
}

export interface GameCreatedMessage {
  type: MessageType.GameCreated;
  gameId: string;
}

export interface GameLinkMessage {
  type: MessageType.GameLink;
  gameId: string;
  url: string;
}

export interface GameEndedMessage {
  type: MessageType.GameEnded;
  playerWinnerId: string;
  playerWinnerName: string;
  gameId: string;
  gameTick: number;
  map: Map;
}

export interface GameResultMessage {
  type: MessageType.GameResult;
  gameId: string;
  gameResult: Array<{
    playerName: string;
    playerId: string;
    rank: number;
    points: number;
    alive: boolean;
  }>;
}

export interface GameStartingMessage {
  type: MessageType.GameStarting;
  gameId: string;
  noofPlayers: number;
  width: number;
  gameHeight: number;
  gameSettings: GameSettings;
}

export interface MapUpdateMessage {
  type: MessageType.MapUpdate;
  receivingPlayerId: string;
  gameId: string;
  gameTick: number;
  map: Map;
}

export interface TournamentEndedMessage {
  type: MessageType.TournamentEnded;
  tournamentId: string;
  tournamentName: string;
  playerWinnerId: string;
  gameId: string;
  gameResult: Array<{
    name: string;
    playerId: string;
    points: number;
  }>;
}

export type Message =
  // Requests
  | ClientInfoMessage
  | StartGameMessage
  | RegisterMoveMessage
  | RegisterPlayerMessage
  | HeartBeatRequestMessage
  // Responses
  | HeartBeatResponseMessage
  | PlayerRegisteredMessage
  // Exceptions
  | InvalidMessageMessage
  | InvalidPlayerNameMessage
  | NoActiveTournamentMessage
  // Events
  | ArenaUpdateMessage
  | CharacterStunnedMessage
  | GameAbortedMessage
  | GameChangedMessage
  | GameCreatedMessage
  | GameEndedMessage
  | GameLinkMessage
  | GameResultMessage
  | GameStartingMessage
  | MapUpdateMessage
  | TournamentEndedMessage;
