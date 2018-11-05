import {
  CharacterAction,
  ClientInfoMessage,
  GameResultMessage,
  GameSettings,
  GameStartingMessage,
  HeartBeatRequestMessage,
  Message,
  MessageType,
  RegisterMoveMessage,
  RegisterPlayerMessage,
  StartGameMessage,
} from './messages';
import { WrappedMap } from './utils';

export interface Player {
  readonly name: string;
  getNextAction(map: WrappedMap): CharacterAction;
  onGameStart?(message: GameStartingMessage): void;
  onGameEnd?(message: GameResultMessage): void;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ClientInfo = Partial<Omit<ClientInfoMessage, 'type'>>;

function createHeartbeatRequestMessage(): HeartBeatRequestMessage {
  return { type: MessageType.HeartBeatRequest };
}

function createClientInfoMessage(clientInfo: ClientInfo = {}): ClientInfoMessage {
  return { type: MessageType.ClientInfo, language: 'JavaScript', ...clientInfo };
}

function createRegisterPlayerMessage(playerName: string, gameSettings?: Partial<GameSettings>): RegisterPlayerMessage {
  return { type: MessageType.RegisterPlayer, playerName, gameSettings };
}

function createStartGameMessage(): StartGameMessage {
  return { type: MessageType.StartGame };
}

function createRegisterMoveMessage(action: CharacterAction, gameId: string, gameTick: number): RegisterMoveMessage {
  return { type: MessageType.RegisterMove, direction: action, gameId, gameTick };
}

export interface ClientOptions {
  host?: string;
  port?: number;
  protocol?: string;
  verbose?: boolean;
  clientInfo?: ClientInfo;
  gameSettings?: Partial<GameSettings>;
  WebSocket?: typeof WebSocket;
}

export type Client = ReturnType<typeof createClient>;

export function createClient(player: Player, options: ClientOptions = {}) {
  const {
    host = 'snake.cygni.se',
    port = 80,
    protocol = 'ws',
    verbose = false,
    clientInfo,
    gameSettings,
    WebSocket: WebSocketImpl = WebSocket,
  } = options;
  const ws = new WebSocketImpl(`${protocol}://${host}:${port}`);

  function sendMessage(message: Message) {
    ws.send(JSON.stringify(message));
  }

  function disconnect() {
    ws.close();
  }

  function handleOpen({  }: WebSocketEventMap['open']) {
    console.info('WebSocket is connected');
    sendMessage(createClientInfoMessage(clientInfo));
    sendMessage(createRegisterPlayerMessage(player.name, gameSettings));
    sendMessage(createHeartbeatRequestMessage());
  }

  function handleMessage({ data }: WebSocketEventMap['message']) {
    const message = JSON.parse(data) as Message;

    if (verbose) {
      console.log(`Message received`, message);
    }

    switch (message.type) {
      case MessageType.HeartBeatResponse:
        setTimeout(sendMessage, 10_000, createHeartbeatRequestMessage());
        break;

      case MessageType.InvalidPlayerName:
        const { reasonCode } = message;
        console.error(`Player name "${player.name}" is invalid: ${reasonCode}`);
        disconnect();
        break;

      case MessageType.PlayerRegistered:
        // Always try to start the game. It will be ignored unless in training mode.
        console.info(`Player name "${player.name}" was successfully registered`);
        sendMessage(createStartGameMessage());
        break;

      case MessageType.GameStarting:
        const { gameSettings: actualGameSettings } = message;
        console.info(`Game is starting`, actualGameSettings);
        if (player.onGameStart !== undefined) {
          player.onGameStart(message);
        }
        break;

      case MessageType.GameLink:
        const { url } = message;
        console.info(`Watch game: ${url}`);
        break;

      case MessageType.MapUpdate:
        const { map, receivingPlayerId, gameId, gameTick } = message;
        const wrappedMap = new WrappedMap(map, receivingPlayerId);
        const action = player.getNextAction(wrappedMap);
        sendMessage(createRegisterMoveMessage(action, gameId, gameTick));
        break;

      case MessageType.GameResult:
        const { gameResult } = message;
        console.info(
          [
            'Game results are in:',
            ...gameResult.map(
              ({ rank, playerName, points, alive }) =>
                `  ${rank}: ${playerName} (${points} points ${alive ? '☠️' : ''})`,
            ),
          ].join('\n'),
        );
        if (player.onGameEnd !== undefined) {
          player.onGameEnd(message);
        }
        break;

      case MessageType.GameEnded:
        console.info(`Game ended.`);
        break;

      default:
        break;
    }
  }

  function handleError({  }: WebSocketEventMap['error']) {
    console.info(`WebSocket is closing`);
  }

  function handleClose({ code, reason, wasClean }: WebSocketEventMap['close']) {
    console[wasClean ? 'info' : 'error'](`WebSocket closed with code: ${code} and reason: "${reason}"`);
    ws.removeEventListener('open', handleOpen);
    ws.removeEventListener('close', handleClose);
    ws.removeEventListener('error', handleError);
    ws.removeEventListener('message', handleMessage);
  }

  ws.addEventListener('open', handleOpen);
  ws.addEventListener('close', handleClose);
  ws.addEventListener('error', handleError);
  ws.addEventListener('message', handleMessage);

  return {
    disconnect,
  };
}
