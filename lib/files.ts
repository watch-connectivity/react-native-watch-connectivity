import {
  FileTransferInfo,
  NativeFileTransfer,
  NativeModule,
  WatchPayload,
} from './native-module';

export interface FileTransfer {
  bytesTransferred: number;
  estimatedTimeRemaining: number | null;
  fractionCompleted: number;
  throughput: number | null;
  bytesTotal: number;
  uri: string;
  metadata: Record<string, unknown>;
  id: string;
  startTime: Date;
  endTime: Date | null;
  error: Error | null;
}

export function startFileTransfer(
  uri: string,
  metadata: WatchPayload = {},
): Promise<FileTransferInfo> {
  return new Promise((resolve) => {
    NativeModule.transferFile(uri, metadata, resolve);
  });
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

export function getFileTransfers(): Promise<{
  [id: string]: FileTransfer;
}> {
  const adapted: {[id: string]: FileTransfer} = {};

  return new Promise((resolve) => {
    NativeModule.getFileTransfers((transfers) => {
      Object.values(transfers).forEach((t) => {
        adapted[t.id] = _transformFilePayload(t);
      });

      resolve(adapted);
    });
  });
}
