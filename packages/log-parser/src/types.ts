export interface TagChange {
  kind: 'TAG_CHANGE';
  // Normalised to the bare numeric entity id string when extractable, so
  // downstream reducers can do plain parseInt(event.entity). The original
  // descriptor (when HS emitted one) is preserved in `entityRaw`.
  entity: string;
  entityRaw: string;
  tag: string;
  value: string;
}

export interface FullEntity {
  kind: 'FULL_ENTITY';
  id: number;
  cardId: string;
  name?: string;
}

export interface ShowEntity {
  kind: 'SHOW_ENTITY';
  entity: string;
  cardId: string;
}

export interface BlockStart {
  kind: 'BLOCK_START';
  blockType: string;
  entity: string;
  effectCardId: string;
  effectIndex: number;
  target: string;
  subOption: string;
  triggerKeyword: string;
}

export interface BlockEnd {
  kind: 'BLOCK_END';
}

export interface ZoneChangeList {
  kind: 'ZONE_CHANGE_LIST';
  id: number;
}

export interface PlayerInfo {
  kind: 'PLAYER_INFO';
  entityId: number;
  playerId: number;
  // `true` when GameAccountId has a non-zero `hi` component (the local human
  // account). Remote/AI opponents report hi=0 lo=0.
  isLocal: boolean;
}

export interface PlayerName {
  kind: 'PLAYER_NAME';
  playerId: number;
  name: string;
}

export type HsEvent =
  | TagChange
  | FullEntity
  | ShowEntity
  | BlockStart
  | BlockEnd
  | ZoneChangeList
  | PlayerInfo
  | PlayerName;
