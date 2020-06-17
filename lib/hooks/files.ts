import {useEffect, useState} from 'react';
import {getFileTransfers, monitorFileTransfers} from '../files';
import {FileTransferEventPayload} from '../native-module';

export function useFileTransfers() {
  const [fileTransfers, setFileTransfers] = useState<
    FileTransferEventPayload[]
  >([]);
  useEffect(() => {
    getFileTransfers().then(transfers => {
      setFileTransfers(Object.values(transfers));
    });
    return monitorFileTransfers(() => {
      getFileTransfers().then(transfers => {
        setFileTransfers(Object.values(transfers))
      });
    });
  }, []);

  return fileTransfers;
}
