import type {
  FileQueue,
  NativeFileTransfer,
  QueuedFile,
  WatchPayload,
} from './native-module';
import { NativeModule } from './native-module';

export interface FileTransfer {
  bytesTotal: number;
  bytesTransferred: number;
  endTime: Date | null;
  error: Error | null;
  estimatedTimeRemaining: number | null;
  fractionCompleted: number;
  id: string;
  metadata: Record<string, unknown>;
  startTime: Date;
  throughput: number | null;
  uri: string;
}

export function startFileTransfer(
  uri: string,
  metadata: WatchPayload = {}
): Promise<string> {
  return NativeModule.transferFile(uri, metadata as unknown as Object);
}

/**
 * @private
 */
export function _transformFilePayload<
  NFT extends NativeFileTransfer,
  FT extends FileTransfer
>({ startTime, endTime, ...rest }: NFT): FT {
  return {
    startTime: new Date(startTime),
    endTime: endTime ? new Date(endTime) : null,
    ...rest,
  } as unknown as FT;
}

export async function getFileTransfers(): Promise<{
  [id: string]: FileTransfer;
}> {
  const adapted: { [id: string]: FileTransfer } = {};
  const transfers = (await NativeModule.getFileTransfers()) as unknown as {
    [id: string]: NativeFileTransfer;
  };

  Object.values(transfers).forEach((t) => {
    adapted[t.id] = _transformFilePayload(t);
  });

  return adapted;
}

function processFileQueue(queue: FileQueue) {
  return Object.entries(queue)
    .map(([id, file]) => ({
      id,
      url: file.url,
      metadata: file.metadata,
      timestamp: parseInt(id, 10),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * @private
 */
export async function _getMissedFile(): Promise<QueuedFile[]> {
  const fileCache =
    (await NativeModule.getQueuedFiles()) as unknown as FileQueue;
  return processFileQueue(fileCache);
}
