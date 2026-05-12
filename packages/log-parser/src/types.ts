export interface TagChange {
  kind: 'TAG_CHANGE';
  entity: string;
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

export type HsEvent = TagChange | FullEntity | ShowEntity | BlockStart | BlockEnd | ZoneChangeList;
