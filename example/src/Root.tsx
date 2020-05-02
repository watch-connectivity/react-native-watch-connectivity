import {StyleSheet, View, TextInput, StatusBar} from 'react-native';
import React, {useEffect, useState} from 'react';

import Spinner from 'react-native-spinkit';

import {pickImage} from './images';
import {COLORS, ROW_MARGIN, WINDOW_WIDTH} from './constants';

import ReachabilityText from './ReachabilityText';
import WatchImage from './WatchImage';
import DualButton from './DualButton';
import LabeledSwitch from './LabeledSwitch';
import {
  useWatchMessageListener,
  useWatchStatusListener,
  sendWatchMessage,
  sendUserInfo,
  updateApplicationContext,
  sendMessageData,
  transferFile,
} from '../../lib';
import {configureAnimation} from './animation';
import {KeyboardSpacer} from './KeyboardSpacer';

type CustomMessage = {text: string; timestamp: number};
type CustomReply = {elapsed: number; timestamp: number};

export default function Root() {
  const [pings, setPings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const [timeTakenToReachWatch, setTimeTakenToReachWatch] = useState<
    number | null
  >(null);

  const [fileTransferTime, setFileTransferTime] = useState<number | null>(null);

  const [timeTakenToReply, setTimeTakenToReply] = useState<number | null>(null);

  useEffect(() => {
    // Arbitrary user info
    sendUserInfo({id: 1, name: 'Mike'});
    // Arbitrary application context
    updateApplicationContext({context: 'context'});
  }, []);

  useWatchMessageListener<CustomMessage>((err, payload, replyHandler) => {
    if (err) {
      console.error('Error receiving message', err);
    } else {
      console.log('app received message', payload);

      if (payload?.text === 'ping') {
        setPings(pings + 1);
        if (replyHandler) {
          replyHandler({text: 'pong', timestamp: Date.now()});
        } else {
          console.error('no reply handler...');
        }
      }
      configureAnimation();
    }
  });

  const {reachable, watchState} = useWatchStatusListener();

  const [fileAPI, setFileAPI] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <WatchImage pings={pings} />
      <View>
        <ReachabilityText
          watchState={watchState}
          reachable={reachable}
          fileTransferTime={fileTransferTime}
          useDataAPI={!fileAPI}
          timeTakenToReachWatch={timeTakenToReachWatch}
          timeTakenToReply={timeTakenToReply}
        />
      </View>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Message"
      />
      {loading && <Spinner type="Bounce" color={COLORS.orange} size={44} />}
      {!loading && (
        <View>
          <DualButton
            textButtonDisabled={!text.trim().length || !reachable}
            imageButtonDisabled={!reachable}
            onTextButtonPress={() => {
              if (text.trim().length) {
                const timestamp = new Date().getTime();
                configureAnimation();
                setLoading(true);

                sendWatchMessage<CustomMessage, CustomReply>(
                  {text, timestamp},
                  (err, resp) => {
                    if (!err && resp) {
                      // FIXME: If no error ,resp should not be null
                      console.log('response received', resp);
                      configureAnimation();

                      setTimeTakenToReachWatch(resp.elapsed);
                      setTimeTakenToReply(
                        new Date().getTime() - resp.timestamp,
                      );
                    } else {
                      console.error('error sending message to watch', err);
                    }

                    setLoading(false);
                  },
                );
              }
            }}
            onImageButtonPress={() => {
              pickImage('Send Image To Watch', !fileAPI)
                .then((image) => {
                  configureAnimation();
                  if (!image.didCancel) {
                    setLoading(true);
                    const startTransferTime = new Date().getTime();
                    let promise;

                    if (fileAPI && image.uri) {
                      promise = transferFile(image.uri);
                    } else if (image.data) {
                      promise = sendMessageData(image.data);
                    } else {
                      promise = Promise.reject();
                    }

                    promise
                      .then((resp) => {
                        const endTransferTime = new Date().getTime();
                        const elapsed = endTransferTime - startTransferTime;
                        console.log(
                          `successfully transferred in ${elapsed}ms`,
                          resp,
                        );
                        configureAnimation();

                        setFileTransferTime(elapsed);
                        setTimeTakenToReachWatch(null);
                        setTimeTakenToReply(null);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.warn(
                          'Error sending message data',
                          err,
                          err.stack,
                        );
                        configureAnimation();
                        setLoading(false);
                      });
                  }
                })
                .catch((err) => {
                  console.error('Error picking image', err);
                });
            }}
            disabled={!reachable}
          />
          <LabeledSwitch
            label={fileAPI ? 'File API' : 'Data API'}
            switchProps={{
              value: fileAPI,
              onValueChange: setFileAPI,
            }}
          />
        </View>
      )}
      <KeyboardSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    width: WINDOW_WIDTH,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 60,
    width: 300,
    color: 'white',
    marginBottom: ROW_MARGIN,
    borderRadius: 6,
    padding: 20,
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
