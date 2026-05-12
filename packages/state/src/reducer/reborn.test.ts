import { describe, expect, it } from 'bun:test';
import type { BlockStart } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyReborn } from './reborn';

function makeRebornBlock(entityId: string, triggerKeyword: string): BlockStart {
  return {
    kind: 'BLOCK_START',
    blockType: 'TRIGGER',
    entity: entityId,
    effectCardId: '',
    effectIndex: 0,
    target: 'PLAY',
    subOption: '',
    triggerKeyword,
  };
}

describe('applyReborn', () => {
  it('returns unchanged when no entity on board', () => {
    const state = initialState();
    const block = makeRebornBlock('101', 'Reborn');
    const result = applyReborn(state, block);
    expect(result).toBe(state);
  });

  it('non-reborn deathrattle does not set reborn', () => {
    const state = initialState();
    const block = makeRebornBlock('101', 'DEATHRATTLE: Add a minion');
    const result = applyReborn(state, block);
    expect(result).toBe(state);
  });

  it('opponent reborn is ignored', () => {
    const state = initialState();
    const block = makeRebornBlock('101', 'Reborn');
    const registry = new Map(state.player.entityRegistry);
    registry.set(101, { cardId: 'TB_BaconMinion_1', zone: 'PLAY', controller: 2 });
    const stateWithOpp = {
      ...state,
      player: {
        ...state.player,
        entityRegistry: registry,
        playerId: 1,
      },
    };
    const result = applyReborn(stateWithOpp, block);
    expect(result).toBe(stateWithOpp);
  });

  it('multiple reborns tracked', () => {
    const state = initialState();
    const registry = new Map(state.player.entityRegistry);
    registry.set(201, { cardId: 'TB_BaconMinion_1', zone: 'PLAY', controller: 0 });
    registry.set(202, { cardId: 'TB_BaconMinion_2', zone: 'PLAY', controller: 0 });
    const stateWithBoard = {
      ...state,
      player: {
        ...state.player,
        entityRegistry: registry,
        board: {
          minions: [
            {
              entityId: 201,
              cardId: 'TB_BaconMinion_1',
              attack: 2,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              golden: false,
              tribes: [],
            },
            {
              entityId: 202,
              cardId: 'TB_BaconMinion_2',
              attack: 3,
              health: 1,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              golden: false,
              tribes: [],
            },
          ],
        },
      },
    };

    const block1 = makeRebornBlock('201', 'Reborn');
    const result1 = applyReborn(stateWithBoard, block1);
    const m0 = result1.player.board.minions.at(0);
    const m1 = result1.player.board.minions.at(1);
    expect(m0?.reborn).toBe(true);
    expect(m1?.reborn).toBe(false);

    const block2 = makeRebornBlock('202', 'Reborn');
    const result2 = applyReborn(result1, block2);
    const m0b = result2.player.board.minions.at(0);
    const m1b = result2.player.board.minions.at(1);
    expect(m0b?.reborn).toBe(true);
    expect(m1b?.reborn).toBe(true);
  });
});
