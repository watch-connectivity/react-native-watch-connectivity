import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  LayoutAnimation,
  DeviceEventEmitter,
  Switch
} from 'react-native'

import ReachabilityText from './ReachabilityText'

import * as watchBridge from '../src/WatchBridge.js'
import Spinner from 'react-native-spinkit'
import {pickImage} from './images'

import WatchImage from './WatchImage'
import DualButton from './DualButton'

const LAYOUT_ANIM_PRESET = LayoutAnimation.Presets.easeInEaseOut

import {ROW_MARGIN, COLORS, EVENT_KEYBOARD_SHOW, EVENT_KEYBOARD_HIDE, WINDOW_WIDTH} from './constants'


export default class Root extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:   [],
      reachable:  false,
      loading:    false,
      text:       '',
      watchState: watchBridge.WatchState.Inactive,
      fileAPI:    true
    }
  }

  keyboardWillHide () {
    this.configureNextAnimation()
    this.setState({spacerStyle: {height: 0}})
  }

  keyboardWillShow (e) {
    const keyboardHeight = e.endCoordinates.height
    this.configureNextAnimation()
    this.setState({spacerStyle: {height: keyboardHeight}})
  }

  listenToKeyboard () {
    const subscriptions                = [
      DeviceEventEmitter.addListener(EVENT_KEYBOARD_SHOW, ::this.keyboardWillShow),
      DeviceEventEmitter.addListener(EVENT_KEYBOARD_HIDE, ::this.keyboardWillHide)
    ]
    this.unsubscribeFromKeyboardEvents = () => subscriptions.forEach(fn => fn())
  }

  subscribeToWatchEvents () {
    this.subscriptions = [
      watchBridge.subscribeToMessages(::this.receiveMessage),
      watchBridge.subscribeToWatchState(::this.receiveWatchState),
      watchBridge.subscribeToWatchReachability(::this.receiveWatchReachability)
    ]
  }

  componentDidMount () {
    this.listenToKeyboard()
    this.subscribeToWatchEvents()
  }

  configureNextAnimation () {
    LayoutAnimation.configureNext(LAYOUT_ANIM_PRESET)
  }

  pickImage () {
    const useDataAPI = !this.state.fileAPI
    // MessageData API is not intended for large images and so we need to restrict the size
    const MAX_SIZE   = 300
    const xtra       = useDataAPI ? {maxWidth: MAX_SIZE, maxHeight: MAX_SIZE} : {}
    pickImage('Send Image To Watch', useDataAPI, xtra).then(image => {
      this.configureNextAnimation()
      console.log('picked image', image)
      if (!image.didCancel) {
        this.setLoading();
        const startTransferTime = new Date().getTime()

        const onFulfilled = resp => {
          const endTransferTime = new Date().getTime()
          const elapsed         = endTransferTime - startTransferTime
          console.log(`successfully transferred in ${elapsed}ms`, resp)
          this.configureNextAnimation()
          this.setState({
            fileTransferTime:      elapsed,
            useDataAPI:            useDataAPI,
            timeTakenToReachWatch: null,
            timeTakenToReply:      null
          })
        }

        const onRejected = err => {
          console.warn('Error sending message data', err, err.stack)
          this.configureNextAnimation()
        }

        const onSettled = () => this.setState({loading: false})

        if (useDataAPI) {
          if (image.data)
            watchBridge
              .sendMessageData(image.data)
              .then(onFulfilled)
              .catch(onRejected)
              .finally(onSettled)
        }
        else {
          const fileURI = image.uri
          if (fileURI) {
            console.log(`transferring ${fileURI} to the watch`)
            watchBridge
              .transferFile(fileURI)
              .then(onFulfilled)
              .catch(onRejected)
              .finally(onSettled)
          }
        }
      }
    }).catch(err => {
      console.error(`Error picking image`, err)
    })
  }

  setLoading () {
    this.setState({
      loading:               true,
      timeTakenToReachWatch: null,
      timeTakenToReply:      null,
      fileTransferTime:      null
    })
  }

  sendMessage () {
    const text = this.state.text
    if (text.trim().length) {
      const timestamp = new Date().getTime()
      this.configureNextAnimation()
      this.setLoading()

      watchBridge.sendMessage({text, timestamp}, (err, resp) => {
        if (!err) {
          console.log('response received', resp)
          const timeTakenToReachWatch = resp.elapsed
          const timeTakenToReply      = new Date().getTime() - parseInt(resp.timestamp)
          this.configureNextAnimation()
          this.setState({timeTakenToReachWatch, timeTakenToReply, loading: false})
        }
        else {
          console.error('error sending message to watch', err)
        }
      })
    }
  }

  receiveWatchReachability (err, reachable) {
    if (!err) {
      console.log('received watch reachability', reachable)
      this.configureNextAnimation()
      this.setState({reachable})
    }
    else {
      console.error('error receiving watch reachability', err)
    }
  }

  unsubscribeFromWatchEvents () {
    this.subscriptions.forEach(fn => fn())
  }

  componentWillUnmount () {
    this.unsubscribeFromWatchEvents()
    this.unsubscribeFromKeyboardEvents()
  }

  renderButtons () {
    if (this.state.loading) {
      return <Spinner type="Bounce" color={COLORS.orange} size={44}/>
    }
    else {
      const reachable = this.state.reachable

      const disabledStyle = reachable ? {} : styles.disabled
      const noText        = !this.state.text.trim().length
      return (
        <View>
          <DualButton
            textButtonDisabled={noText || !reachable}
            imageButtonDisabled={!reachable}
            onTextButtonPress={::this.sendMessage}
            onImageButtonPress={::this.pickImage}
            disabled={!reachable}
          />
          <View style={styles.switch}>
            <Switch
              onTintColor={COLORS.orange}
              style={{marginBottom: 10}}
              value={this.state.fileAPI}
              onValueChange={fileAPI => this.setState({fileAPI})}
            />
            <Text
              style={styles.switchLabel}>
              {this.state.fileAPI ? 'File API' : 'Data API'}
            </Text>
          </View>
        </View>
      )
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <WatchImage/>
        <View>
          <ReachabilityText
            watchState={this.state.watchState}
            reachable={this.state.reachable}
            fileTransferTime={this.state.fileTransferTime}
            useDataAPI={this.state.useDataAPI}
            timeTakenToReachWatch={this.state.timeTakenToReachWatch}
            timeTakenToReply={this.state.timeTakenToReply}
          />
        </View>
        <TextInput
          style={styles.textInput}
          ref={e => this.textField = e}
          value={this.state.text}
          onChangeText={text => this.setState({text})}
          placeholder="Message"
        >
        </TextInput>
        {this.renderButtons()}
        <View style={this.state.spacerStyle}/>
      </View>
    )
  }


  receiveMessage (err, payload, replyHandler) {
    if (err) console.error(`Error receiving message`, err)
    else {
      console.log('app received message', payload)
      this.configureNextAnimation()
      this.setState({messages: [...messages, payload]})
    }
  }

  receiveWatchState (err, watchState) {
    if (err) console.error(`Error receiving watch state`, err)
    else {
      console.log('received watch state', watchState)
      this.configureNextAnimation()
      this.setState({watchState})
    }
  }
}


const styles = StyleSheet.create({
  container:        {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.purple,
    width:           WINDOW_WIDTH
  },
  welcome:          {
    fontSize:  20,
    textAlign: 'center',
    margin:    10,
  },
  instructions:     {
    textAlign:    'center',
    color:        '#333333',
    marginBottom: 5,
  },
  textInput:        {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height:          60,
    width:           300,
    color:           'white',
    marginBottom:    ROW_MARGIN,
    borderRadius:    6,
    padding:         20,
    alignSelf:       'center'
  },
  switch:           {
    marginTop:     ROW_MARGIN,
    flexDirection: 'row',
    alignSelf:     'center',
    position:      'relative',
    right:         24
  },
  disabled:         {
    opacity: 0.4
  },
  switchLabel:      {
    color:      'white',
    lineHeight: 23,
    marginLeft: 10,
    width:      56,
    position:   'absolute'
  }
})

