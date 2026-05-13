import { describe, expect, it } from 'bun:test';
import { initialState } from './initialState';
import { deserializeGameState, serializeGameState } from './serialize';

function makeFullState(): ReturnType<typeof initialState> {
  const state = initialState();
  state.turn = 5;
  state.phase = 'shopping';
  state.player.gold = 8;
  state.player.tier = 5;
  state.player.tierUpCost = 4;
  state.player.hero.hp = 20;
  state.player.hero.armor = 5;
  state.player.board.minions.push(
    {
      entityId: 1,
      cardId: 'CS2_181',
      attack: 3,
      health: 2,
      taunt: false,
      divineShield: false,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: false,
      tribes: ['Pirate'],
    },
    {
      entityId: 2,
      cardId: 'UNG_912',
      attack: 5,
      health: 5,
      taunt: true,
      divineShield: true,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: true,
      tribes: ['Murloc', 'Dragon'],
    },
  );
  state.player.shop.minions.push({
    entityId: 10,
    cardId: 'BG2_001',
    attack: 2,
    health: 3,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    tribes: ['Murloc'],
  });
  state.player.hand = [100, 101];
  state.player.entityRegistry.set(1, { cardId: 'CS2_181', zone: 'PLAY', controller: 0 });
  state.player.entityRegistry.set(2, { cardId: 'UNG_912', zone: 'PLAY', controller: 0 });
  state.opponents.push({
    entityId: 3,
    playerId: 1,
    hero: { entityId: 3, cardId: 'HERO01', hp: 30, armor: 0 },
    board: { minions: [] },
    tier: 4,
    eliminated: false,
  });
  return state;
}

describe('serializeGameState', () => {
  it('produces valid JSON string', () => {
    const state = initialState();
    const json = serializeGameState(state);
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('round-trips turn, phase, board length, shop length', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.turn).toBe(state.turn);
    expect(restored.phase).toBe(state.phase);
    expect(restored.player.board.minions.length).toBe(state.player.board.minions.length);
    expect(restored.player.shop.minions.length).toBe(state.player.shop.minions.length);
  });

  it('preserves entityRegistry as Map after round-trip', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.player.entityRegistry instanceof Map).toBe(true);
    expect(restored.player.entityRegistry.size).toBe(state.player.entityRegistry.size);
  });

  it('preserves opponent count and eliminated status', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.opponents.length).toBe(state.opponents.length);
    expect(restored.opponents[0]?.eliminated).toBe(state.opponents[0]?.eliminated);
  });

  it('preserves hero hp and armor', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.player.hero.hp).toBe(state.player.hero.hp);
    expect(restored.player.hero.armor).toBe(state.player.hero.armor);
  });

  it('preserves minion attributes through round-trip', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    const minions = restored.player.board.minions;
    expect(minions.length).toBeGreaterThanOrEqual(2);
    expect(minions[1].golden).toBe(true);
    expect(minions[1].taunt).toBe(true);
    expect(minions[1].divineShield).toBe(true);
    expect(minions[1].tribes).toEqual(['Murloc', 'Dragon']);
  });

  it('preserves hand, gold, tier, tierUpCost', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.player.hand).toEqual(state.player.hand);
    expect(restored.player.gold).toBe(state.player.gold);
    expect(restored.player.tier).toBe(state.player.tier);
    expect(restored.player.tierUpCost).toBe(state.player.tierUpCost);
  });

  it('round-trips initialState() — turn, phase, gold, tier, opponents length', () => {
    const state = initialState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.turn).toBe(state.turn);
    expect(restored.phase).toBe(state.phase);
    expect(restored.player.gold).toBe(state.player.gold);
    expect(restored.player.tier).toBe(state.player.tier);
    expect(restored.opponents.length).toBe(state.opponents.length);
  });

  it('restores entityRegistry Map entries after round-trip', () => {
    const state = initialState();
    state.player.entityRegistry.set(42, {
      cardId: 'CS2_181',
      zone: 'PLAY',
      controller: 0,
    });
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    const entry = restored.player.entityRegistry.get(42);
    expect(entry).toBeDefined();
    expect(entry!.cardId).toBe('CS2_181');
    expect(entry!.zone).toBe('PLAY');
    expect(entry!.controller).toBe(0);
  });
});
