import type { BlockEnd, BlockStart } from './types';

// BLOCK_START BlockType=<type> Entity=<entity> EffectCardId=<eId> EffectIndex=<i> Target=<t> SubOption=<s> [TriggerKeyword=<k>]
const BLOCK_START_RE =
  /^BLOCK_START BlockType=(\S+) Entity=(.+?) EffectCardId=(\S+) EffectIndex=(-?\d+) Target=(.+?) SubOption=(\S+)(?:\s+TriggerKeyword=(\S+))?/;

export function parseBlockStart(line: string): BlockStart | null {
  const m = BLOCK_START_RE.exec(line.trim());
  if (!m) return null;
  const [, blockType, entity, effectCardId, effectIndexStr, target, subOption, triggerKeyword] = m;
  return {
    kind: 'BLOCK_START',
    blockType: blockType ?? '',
    entity: entity ?? '',
    effectCardId: effectCardId ?? '',
    effectIndex: parseInt(effectIndexStr ?? '0', 10),
    target: target ?? '',
    subOption: subOption ?? '',
    triggerKeyword: triggerKeyword ?? '',
  };
}

export function parseBlockEnd(line: string): BlockEnd | null {
  if (line.trim() === 'BLOCK_END') {
    return { kind: 'BLOCK_END' };
  }
  return null;
}
