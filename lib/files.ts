import {NativeFileTransfer, NativeModule, WatchPayload} from './native-module';

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
