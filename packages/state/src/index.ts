export function applyEvent<S>(state: S, _event: unknown): S {
  return state;
}

export { initialState } from './initialState';
export { reducer } from './reducer';
export { applyEntityEvent } from './entityRegistry';
export { parseSession } from './parseSession';
export type { SessionSnapshot } from './parseSession';
export type { EntityRegistry, EntityInfo } from './entityRegistry';
export { createPipeline } from './pipeline';
export type { Pipeline } from './pipeline';
export { replayFixture } from './replayFixture';
