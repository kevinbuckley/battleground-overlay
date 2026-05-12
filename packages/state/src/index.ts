export function applyEvent<S>(state: S, _event: unknown): S {
  return state;
}

export { initialState } from './initialState';
export { reducer } from './reducer';
export { applyEntityEvent, EntityRegistry, EntityInfo } from './entityRegistry';
