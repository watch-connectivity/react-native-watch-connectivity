import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {COLORS, ROW_MARGIN} from '../constants';
import {SessionActivationState} from '../../../lib';

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

function WatchStateText({
  active,
  children,
}: {
  active: Boolean;
  children: string;
}) {
  const style = [
    styles.boldText,
    {color: active ? COLORS.green.normal : COLORS.orange},
  ];
  return <Text style={style}>{children}</Text>;
}

export default function ReachabilityText({
  installed,
  useDataAPI,
  timeTakenToReachWatch,
  reachable,
  fileTransferTime,
  timeTakenToReply,
}: {
  installed: boolean;
  useDataAPI: boolean;
  fileTransferTime: number | null;
  timeTakenToReply: number | null;
  reachable: boolean;
  timeTakenToReachWatch: number | null;
}) {
  return (
    <View>
      <Text style={styles.component}>
        Watch app is{' '}
        <WatchStateText active={installed}>
          {installed ? 'INSTALLED' : 'UNINSTALLED'}
        </WatchStateText>
        &nbsp;and{' '}
        <WatchStateText active={reachable}>
          {reachable ? 'REACHABLE' : 'UNREACHABLE'}
        </WatchStateText>
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
