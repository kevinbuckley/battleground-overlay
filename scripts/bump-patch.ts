#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCards } from '../packages/card-data/src/loadCards';
import { patchDiff } from '../packages/card-data/src/patchDiff';
import { patchVersion } from '../packages/card-data/src/patchVersion';
import { setPatchVersion } from '../packages/card-data/src/setPatchVersion';
import type { Card } from '../packages/card-data/src/types';

const args = process.argv.slice(2);
const newPatch = args[0];

if (!newPatch) {
  console.error('Usage: bun scripts/bump-patch.ts <new-patch-version>');
  process.exit(1);
}

const cardDataDir = join(__dirname, '..', 'packages', 'card-data');
const oldCards = loadCards();
const oldPatch = patchVersion();

const url = `https://api.hearthstonejson.com/v1/${newPatch}/enUS/cards.collectible.json`;
console.log(`Fetching cards from: ${url}`);

let response: Response;
try {
  response = await fetch(url);
} catch (err) {
  console.error(`Failed to fetch cards from HearthstoneJSON: ${err}`);
  process.exit(1);
}

if (!response.ok) {
  console.error(`HTTP ${response.status} fetching cards for patch ${newPatch}`);
  process.exit(1);
}

const newCards: Card[] = (await response.json()) as Card[];

const diff = patchDiff(oldCards, newCards);

console.log(`\nPatch ${oldPatch} → ${newPatch} diff:`);
console.log(`  Added:    ${diff.added.length} cards`);
console.log(`  Removed:  ${diff.removed.length} cards`);
console.log(`  Stat chg: ${diff.statChanges.length} cards`);

if (diff.statChanges.length > 0) {
  console.log('\nStat changes:');
  for (const sc of diff.statChanges) {
    console.log(`  ${sc.id}: ${sc.oldStat} → ${sc.newStat}`);
  }
}

const cardsJsonPath = join(cardDataDir, 'cards.json');
writeFileSync(cardsJsonPath, JSON.stringify(newCards, null, 2), 'utf-8');
setPatchVersion(newPatch);

console.log(`\nWrote ${newPatch} to PATCH.txt and ${newCards.length} cards to cards.json`);
