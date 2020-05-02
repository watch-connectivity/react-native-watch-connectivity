import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {COLORS, ROW_MARGIN} from './constants';
import {WatchState} from '../../lib';

function MessageTimeText({
  timeTakenToReachWatch,
  timeTakenToReply,
}: {
  timeTakenToReachWatch: number;
  timeTakenToReply: number;
}) {
  return (
    <Text style={styles.component}>
      The last message took{' '}
      <Text style={styles.boldText}>{timeTakenToReachWatch + 'ms '}</Text>
      to reach the watch. It then took{' '}
      <Text style={styles.boldText}>{timeTakenToReply + 'ms '}</Text>
      for the response to arrive
    </Text>
  );
}

function FileTransferTimeText({
  fileTransferTime,
  useDataAPI,
}: {
  fileTransferTime: number;
  useDataAPI: boolean;
}) {
  if (fileTransferTime) {
    return (
      <Text style={styles.component}>
        The image took
        <Text style={styles.boldText}>{' ' + fileTransferTime + 'ms '}</Text>
        to transfer using the{' '}
        {useDataAPI ? 'message data api' : 'file transfer api'}
      </Text>
    );
  }

  return null;
}

function WatchStateText({watchState}: {watchState: WatchState}) {
  const active = watchState === WatchState.Activated;
  const style = [
    styles.boldText,
    {color: active ? COLORS.green.normal : COLORS.orange},
  ];
  return <Text style={style}>{watchState.toUpperCase()}</Text>;
}

export default function ReachabilityText({
  watchState,
  useDataAPI,
  timeTakenToReachWatch,
  reachable,
  fileTransferTime,
  timeTakenToReply,
}: {
  watchState: WatchState;
  useDataAPI: boolean;
  fileTransferTime: number | null;
  timeTakenToReply: number | null;
  reachable: boolean;
  timeTakenToReachWatch: number | null;
}) {
  const style = [
    styles.boldText,
    {color: reachable ? COLORS.green.normal : COLORS.orange},
  ];

  return (
    <View>
      <Text style={styles.component}>
        Watch session is <WatchStateText watchState={watchState} />
        &nbsp;and{' '}
        <Text style={style}>{reachable ? 'REACHABLE' : 'UNREACHABLE'}</Text>
      </Text>
      {timeTakenToReachWatch && timeTakenToReply ? (
        <MessageTimeText
          timeTakenToReachWatch={timeTakenToReachWatch}
          timeTakenToReply={timeTakenToReply}
        />
      ) : null}
      {fileTransferTime ? (
        <FileTransferTimeText
          fileTransferTime={fileTransferTime}
          useDataAPI={useDataAPI}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    marginBottom: ROW_MARGIN,
    color: 'white',
    marginLeft: ROW_MARGIN,
    marginRight: ROW_MARGIN,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
});
