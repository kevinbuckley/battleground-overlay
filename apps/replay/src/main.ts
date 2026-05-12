import { exportReport } from './exportReport';
import { loadFixture } from './loadFixture';
import { Scrubber } from './scrubber';
import { formatState } from './stateViewer';

export function run(path: string): string {
  const events = loadFixture(path);
  const scrubber = new Scrubber(events);
  const state = scrubber.replay();
  const stateOutput = formatState(state);
  const reportOutput = exportReport([{ state, recs: [] }]);
  return [stateOutput, reportOutput].join('\n');
}

const fixture = process.argv[2];
if (fixture) {
  console.log(run(fixture));
} else {
  console.log('TODO: replay <no fixture>');
}
