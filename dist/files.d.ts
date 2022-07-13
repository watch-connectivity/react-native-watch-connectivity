import { NativeFileTransfer, QueuedFile, WatchPayload } from './native-module';
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
export declare function startFileTransfer(uri: string, metadata?: WatchPayload): Promise<string>;
/**
 * @private
 */
export declare function _transformFilePayload<NFT extends NativeFileTransfer, FT extends FileTransfer>({ startTime, endTime, ...rest }: NFT): FT;
export declare function getFileTransfers(): Promise<{
    [id: string]: FileTransfer;
}>;
/**
 * @private
 */
export declare function _getMissedFile(): Promise<QueuedFile[]>;
