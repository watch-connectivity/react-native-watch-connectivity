import {StatusBar, StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';

import Spinner from 'react-native-spinkit';

import {pickImage} from '../lib/images';
import {COLORS, ROW_MARGIN} from '../constants';

import ReachabilityText from '../components/ReachabilityText';
import WatchImage from '../components/WatchImage';
import DualButton from '../components/DualButton';
import LabeledSwitch from '../components/LabeledSwitch';

import {configureAnimation} from '../lib/animation';
import {KeyboardSpacer} from '../components/KeyboardSpacer';
import {usePingPongEffect} from '../lib/hooks/use-ping-pong-effect';
import Layout from '../components/Layout';
import {
  useReachability,
  useSessionActivationState,
  sendMessageData,
  sendMessage,
  startFileTransfer,
} from 'react-native-watch-connectivity';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [timeTakenToReachWatch, setTimeTakenToReachWatch] = useState<
    number | null
  >(null);
  const [fileTransferTime, setFileTransferTime] = useState<number | null>(null);
  const [timeTakenToReply, setTimeTakenToReply] = useState<number | null>(null);
  const [useFileAPI, setUseFileAPI] = useState(true);

  const watchState = useSessionActivationState();
  const reachable = useReachability();

  const pongs = usePingPongEffect();

  return (
    <Layout>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <WatchImage pings={pongs} />
        <View>
          <ReachabilityText
            watchState={watchState}
            reachable={reachable}
            fileTransferTime={fileTransferTime}
            useDataAPI={!useFileAPI}
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

                  sendMessage<{elapsed: number; timestamp: number}>(
                    {text, timestamp},
                    (resp) => {
                      // FIXME: If no error ,resp should not be null
                      console.log('response received', resp);
                      configureAnimation();

                      setTimeTakenToReachWatch(resp.elapsed || 0);
                      setTimeTakenToReply(
                        new Date().getTime() - resp.timestamp,
                      );

                      setLoading(false);
                    },
                    (err) => {
                      console.log('Send message error', err);
                    },
                  );
                }
              }}
              onImageButtonPress={() => {
                pickImage('Send Image To Watch', !useFileAPI)
                  .then((image) => {
                    configureAnimation();
                    if (!image.didCancel) {
                      setLoading(true);
                      const startTransferTime = new Date().getTime();
                      let promise: Promise<unknown>;

                      if (useFileAPI && image.uri) {
                        console.log(image.uri);
                        promise = startFileTransfer(image.uri);
                      } else if (image.data) {
                        promise = sendMessageData(image.data);
                      } else {
                        promise = Promise.reject();
                      }

                      promise
                        .then((resp: any) => {
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
              label={useFileAPI ? 'File API' : 'Data API'}
              switchProps={{
                value: useFileAPI,
                onValueChange: setUseFileAPI,
              }}
            />
          </View>
        )}
        <KeyboardSpacer />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
