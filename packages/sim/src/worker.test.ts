import { describe, expect, it } from 'bun:test';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import type { Board, Minion, PlayerState } from '@overlay/shared';
import { toFirestoneBoard } from './adapter';
import type { BatchResult } from './index';
import { simulateBatch } from './simulateBatch';
import { createWorkerPool } from './worker';

function makeMinion(opts: { entityId: number; cardId: string } & Partial<Minion>): Minion {
  return {
    entityId: opts.entityId,
    cardId: opts.cardId,
    attack: opts.attack ?? 1,
    health: opts.health ?? 1,
    taunt: opts.taunt ?? false,
    divineShield: opts.divineShield ?? false,
    poisonous: opts.poisonous ?? false,
    reborn: opts.reborn ?? false,
    frozen: opts.frozen ?? false,
    golden: opts.golden ?? false,
    tribes: opts.tribes ?? [],
  };
}

function makeBoard(minions: { entityId?: number; cardId?: string } & Partial<Minion>[]): Board {
  return {
    minions: minions.map((m, i) =>
      makeMinion({ ...m, entityId: i + 1, cardId: m.cardId ?? 'TB_BaconShop_Minion_1' }),
    ),
  };
}

function makePlayerState(): PlayerState {
  return {
    entityId: 1,
    playerId: 1,
    hero: { entityId: 1, cardId: 'TB_BaconShop_HERO_KelThuzad', hp: 40, armor: 0 },
    board: { minions: [] },
    shop: { minions: [], frozen: false, rollCost: 1 },
    hand: [],
    gold: 0,
    tier: 1,
    tierUpCost: 1,
    eliminated: false,
    pendingTriple: null,
    heroPowerUsedThisTurn: false,
    entityRegistry: new Map(),
  };
}

function makeFirestoneBoard(board: Board): BgsBoardInfo {
  return toFirestoneBoard(board, makePlayerState());
}

describe('createWorkerPool', () => {
  it('processes 3 batches concurrently and matches single-threaded output', async () => {
    const pool = createWorkerPool(3);

    const playerBoard = makeFirestoneBoard(
      makeBoard([{ cardId: 'TB_BaconShop_Minion_1', attack: 3, health: 2 }]),
    );
    const oppBoard = makeFirestoneBoard(
      makeBoard([{ cardId: 'TB_BaconShop_Minion_2', attack: 2, health: 3 }]),
    );

    const n = 50;

    const promises = [
      pool.submitBatch(playerBoard, oppBoard, n, 1),
      pool.submitBatch(playerBoard, oppBoard, n, 2),
      pool.submitBatch(playerBoard, oppBoard, n, 3),
    ];

    const workerResults: BatchResult[] = await Promise.all(promises);
    expect(workerResults.length).toBe(3);

    const baseline1 = simulateBatch(playerBoard, oppBoard, n, 1);
    const baseline2 = simulateBatch(playerBoard, oppBoard, n, 2);
    const baseline3 = simulateBatch(playerBoard, oppBoard, n, 3);

    const r0 = workerResults[0]!;
    const r1 = workerResults[1]!;
    const r2 = workerResults[2]!;

    expect(r0.wins).toBe(baseline1.wins);
    expect(r0.losses).toBe(baseline1.losses);
    expect(r0.ties).toBe(baseline1.ties);

    expect(r1.wins).toBe(baseline2.wins);
    expect(r1.losses).toBe(baseline2.losses);
    expect(r1.ties).toBe(baseline2.ties);

    expect(r2.wins).toBe(baseline3.wins);
    expect(r2.losses).toBe(baseline3.losses);
    expect(r2.ties).toBe(baseline3.ties);

    pool.close();
  });

  it('returns a pool with submitBatch and close methods', () => {
    const pool = createWorkerPool(2);
    expect(typeof pool.submitBatch).toBe('function');
    expect(typeof pool.close).toBe('function');
    pool.close();
  });

  it('handles a pool of size 1', async () => {
    const pool = createWorkerPool(1);

    const playerBoard = makeFirestoneBoard(
      makeBoard([{ cardId: 'TB_BaconShop_Minion_1', attack: 1, health: 1 }]),
    );
    const oppBoard = makeFirestoneBoard(
      makeBoard([{ cardId: 'TB_BaconShop_Minion_2', attack: 1, health: 1 }]),
    );

    const workerResult = await pool.submitBatch(playerBoard, oppBoard, 10, 42);
    const singleResult = simulateBatch(playerBoard, oppBoard, 10, 42);
    expect(workerResult.wins).toBe(singleResult.wins);
    expect(workerResult.losses).toBe(singleResult.losses);
    expect(workerResult.ties).toBe(singleResult.ties);

    pool.close();
  });
});
