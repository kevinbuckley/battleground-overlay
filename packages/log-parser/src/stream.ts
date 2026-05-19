import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { watch } from 'chokidar';
import { parseBlockEnd, parseBlockStart } from './parseBlock';
import { parseFullEntity } from './parseFullEntity';
import { parsePlayerInfo } from './parsePlayerInfo';
import { parsePlayerName } from './parsePlayerName';
import { parseShowEntity } from './parseShowEntity';
import { parseTagChange } from './parseTagChange';
import { parseZoneChangeList } from './parseZoneChangeList';
import type { HsEvent } from './types';

// HS Power.log lines are prefixed with a log level + timestamp + caller, e.g.
//   D 15:47:09.1222540 GameState.DebugPrintPower() - TAG_CHANGE Entity=19 ...
// Strip that prefix so per-event parsers can match against the bare payload.
const HS_LOG_PREFIX_RE = /^[DIWE]\s+\d{1,2}:\d{2}:\d{2}\.\d+\s+\S+\(\)\s+-\s+/;

function stripHsLogPrefix(line: string): string {
  return line.replace(HS_LOG_PREFIX_RE, '');
}

function parseSingleLine(rawLine: string): HsEvent | null {
  const line = stripHsLogPrefix(rawLine);
  return (
    parseTagChange(line) ??
    parseFullEntity(line) ??
    parseBlockStart(line) ??
    parseBlockEnd(line) ??
    parseZoneChangeList(line) ??
    parsePlayerInfo(line) ??
    parsePlayerName(line) ??
    parseShowEntity(line) ??
    null
  );
}

export interface StreamHandle {
  close: () => void;
}

export async function streamEvents(
  filePath: string,
  onEvent: (event: HsEvent) => void,
): Promise<StreamHandle> {
  let fileOffset = 0;
  let reading = false;
  let readAgain = false;

  async function readNewContent(): Promise<void> {
    return new Promise((resolve) => {
      const stream = createReadStream(filePath, { start: fileOffset, encoding: 'utf8' });
      const rl = createInterface({ input: stream });
      let bytesRead = 0;

      rl.on('line', (line) => {
        bytesRead += Buffer.byteLength(line, 'utf8') + 1; // +1 for newline
        const event = parseSingleLine(line);
        if (event) onEvent(event);
      });

      rl.on('close', () => {
        fileOffset += bytesRead;
        resolve();
      });
    });
  }

  async function drainNewContent(): Promise<void> {
    if (reading) {
      readAgain = true;
      return;
    }

    reading = true;
    do {
      readAgain = false;
      await readNewContent();
    } while (readAgain);
    reading = false;
  }

  await drainNewContent();

  const watcher = watch(filePath, { persistent: true, ignoreInitial: true });
  watcher.on('change', () => void drainNewContent());

  await new Promise<void>((resolve) => {
    watcher.on('ready', resolve);
    // chokidar may emit ready synchronously for already-existing files
    setTimeout(resolve, 50);
  });

  return {
    close: () => void watcher.close(),
  };
}
