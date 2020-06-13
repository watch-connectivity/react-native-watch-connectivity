import {useEffect, useState} from 'react';
import {getFileTransfers, subscribeToFileTransfers} from '../files';
import {FileTransferEventPayload} from '../native-module';

export function useFileTransfers() {
  const [fileTransfers, setFileTransfers] = useState<{
    [id: string]: FileTransferEventPayload;
  }>({});
  useEffect(() => {
    getFileTransfers().then(setFileTransfers);
    return subscribeToFileTransfers(() => {
      getFileTransfers().then(setFileTransfers);
    });
  }, []);

  return fileTransfers;
}
