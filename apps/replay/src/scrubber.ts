import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { reducer } from '@overlay/state';
import { initialState } from '@overlay/state';

export class Scrubber {
  private readonly events: HsEvent[];
  private _currentIndex: number;

  constructor(events: HsEvent[]) {
    this.events = events;
    this._currentIndex = 0;
  }

  get length(): number {
    return this.events.length;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  getState(): GameState {
    let state = initialState();
    for (let i = 0; i < this._currentIndex; i++) {
      const event = this.events[i];
      if (event === undefined) throw new Error(`missing event at index ${i}`);
      state = reducer(state, event);
    }
    return state;
  }

  seek(n: number): GameState {
    if (n < 0 || n > this.events.length) {
      throw new Error(`seek(${n}) out of bounds [0, ${this.events.length}]`);
    }
    let state = initialState();
    for (let i = 0; i < n; i++) {
      const event = this.events[i];
      if (event === undefined) throw new Error(`missing event at index ${i}`);
      state = reducer(state, event);
    }
    this._currentIndex = n;
    return state;
  }

  replay(): GameState {
    return this.seek(this.events.length);
  }

  jump(n: number): GameState {
    return this.seek(n);
  }
}
