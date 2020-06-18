import {useEffect, useState} from 'react';
import {getFileTransfers} from '../files';
import {FileTransferEventPayload} from '../native-module';
import watchEventEmitter from '../events';

export function useFileTransfers() {
  const [fileTransfers, setFileTransfers] = useState<
    FileTransferEventPayload[]
  >([]);
  useEffect(() => {
    getFileTransfers().then((transfers) => {
      setFileTransfers(Object.values(transfers));
    });

    return watchEventEmitter.addListener('file', () => {
      getFileTransfers().then((transfers) => {
        setFileTransfers(Object.values(transfers));
      });
    });
  }, []);

  return fileTransfers;
}
