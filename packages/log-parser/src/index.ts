export function parseLine(_line: string): null {
  return null;
}

export { parseBlockEnd, parseBlockStart } from './parseBlock';
export { parseFullEntity } from './parseFullEntity';
export { parseTagChange } from './parseTagChange';

export type {
  HsEvent,
  TagChange,
  FullEntity,
  ShowEntity,
  BlockStart,
  BlockEnd,
  ZoneChangeList,
} from './types';
