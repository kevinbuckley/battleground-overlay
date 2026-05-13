import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { watch } from 'chokidar';
import { parseBlockEnd, parseBlockStart } from './parseBlock';
import { parseFullEntity } from './parseFullEntity';
import { parseShowEntity } from './parseShowEntity';
import { parseTagChange } from './parseTagChange';
import { parseZoneChangeList } from './parseZoneChangeList';
import type { HsEvent } from './types';

function parseSingleLine(line: string): HsEvent | null {
  return (
    parseTagChange(line) ??
    parseFullEntity(line) ??
    parseBlockStart(line) ??
    parseBlockEnd(line) ??
    parseZoneChangeList(line) ??
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

  await readNewContent();

  const watcher = watch(filePath, { persistent: true, ignoreInitial: true });
  watcher.on('change', () => void readNewContent());

  await new Promise<void>((resolve) => {
    watcher.on('ready', resolve);
    // chokidar may emit ready synchronously for already-existing files
    setTimeout(resolve, 50);
  });

  return {
    close: () => void watcher.close(),
  };
}
