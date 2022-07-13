import sortBy from 'lodash.sortby';
import {
  FileQueue,
  NativeFileTransfer,
  NativeModule,
  QueuedFile,
  WatchPayload,
} from './native-module';

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
  metadata: WatchPayload = {},
): Promise<string> {
  return NativeModule.transferFile(uri, metadata);
}

/**
 * @private
 */
export function _transformFilePayload<
  NFT extends NativeFileTransfer,
  FT extends FileTransfer
>({startTime, endTime, ...rest}: NFT): FT {
  return ({
    startTime: new Date(startTime),
    endTime: endTime ? new Date(endTime) : null,
    ...rest,
  } as unknown) as FT;
}

export async function getFileTransfers(): Promise<{
  [id: string]: FileTransfer;
}> {
  const adapted: {[id: string]: FileTransfer} = {};
  const transfers = await NativeModule.getFileTransfers();

  Object.values(transfers).forEach((t) => {
    adapted[t.id] = _transformFilePayload(t);
  });

  return adapted;
}

function processFileQueue(queue: FileQueue) {
  const fileArr: QueuedFile[] = sortBy(
    Object.entries(queue).map(([id, file]) => ({
      id,
      url: file.url,
      metadata: file.metadata,
      timestamp: parseInt(id, 10),
    })),
    (u) => u.timestamp,
  );
  return fileArr;
}

/**
 * @private
 */
export async function _getMissedFile(): Promise<QueuedFile[]> {
  const fileCache = await NativeModule.getQueuedFiles();
  const items = processFileQueue(fileCache);

  return items;
}
