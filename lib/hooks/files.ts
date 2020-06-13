import {useEffect, useState} from 'react';
import {getFileTransfers, subscribeToFileTransfers} from '../files';
import {FileTransferProgressPayload} from '../native-module';

export function useFileTransfers() {
  const [fileTransfers, setFileTransfers] = useState<{
    [id: string]: FileTransferProgressPayload;
  }>({});
  useEffect(() => {
    getFileTransfers().then(setFileTransfers);
    return subscribeToFileTransfers(() => {
      getFileTransfers().then(setFileTransfers);
    });
  }, []);

  return fileTransfers;
}
