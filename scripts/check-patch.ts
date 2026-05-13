import { patchVersion } from '../packages/card-data/src/patchVersion';

const expected = process.argv[2];

if (expected === undefined) {
  console.error('Usage: check-patch <expected-version>');
  process.exit(1);
}

const pinned = patchVersion();

if (pinned === expected) {
  console.log('OK');
  process.exit(0);
} else {
  console.error(`Patch mismatch: pinned=${pinned} installed=${expected}`);
  process.exit(1);
}
