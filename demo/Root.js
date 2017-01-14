import ReactNative from 'react-native'
import React from 'react'

import Spinner from 'react-native-spinkit'

import * as watch from '../Libraries/RNWatch/RNWatch.ios'
import {pickImage} from './images'
import {listenToKeyboard} from './keyboard'
import {ROW_MARGIN, COLORS, WINDOW_WIDTH} from './constants'

import ReachabilityText from './ReachabilityText'
import WatchImage from './WatchImage'
import DualButton from './DualButton'
import LabeledSwitch from './LabeledSwitch'

const {StyleSheet, View, TextInput, LayoutAnimation} = ReactNative,
      {Component} = React

const LAYOUT_ANIM_PRESET = LayoutAnimation.Presets.easeInEaseOut

export default class Root extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:   [],
      reachable:  false,
      loading:    false,
      text:       '',
      watchState: watch.WatchState.Inactive,
      fileAPI:    true,
      pings:      0
    }
  }

  listenToKeyboard () {
    this.unsubscribeFromKeyboardEvents = listenToKeyboard(height => {
      this.configureNextAnimation()
      this.setState({spacerStyle: {height}})
    })
  }

  receiveUserInfo (err, userInfo) {
    if (!err) {
      console.log('received user info', userInfo)
      this.setState({userInfo})
    }
    else {
      console.error('error receiving user info', err)
    }
  }

  receiveApplicationContext (err, applicationContext) {
    if (!err) {
      console.log('received application context', applicationContext)
      this.setState({applicationContext})
    }
    else {
      console.error('error receiving application context', err)
    }
  }

  subscribeToWatchEvents () {
    this.subscriptions = [
      watch.subscribeToMessages(::this.receiveMessage),
      watch.subscribeToWatchState(::this.receiveWatchState),
      watch.subscribeToWatchReachability(::this.receiveWatchReachability),
      watch.subscribeToUserInfo(::this.receiveUserInfo),
      watch.subscribeToApplicationContext(::this.receiveApplicationContext),
    ]
  }

  componentDidMount () {
    this.listenToKeyboard()
    this.subscribeToWatchEvents()
    watch.sendUserInfo({id: 1, name: 'Mike'})
    watch.updateApplicationContext({context: 'context'})
  }

  configureNextAnimation () {
    LayoutAnimation.configureNext(LAYOUT_ANIM_PRESET)
  }

  _pickImage () {
    return pickImage('Send Image To Watch', !this.state.fileAPI)
  }

  pickImage () {
    const fileAPI = this.state.fileAPI
    this._pickImage().then(image => {
      this.configureNextAnimation()
      if (!image.didCancel) {
        this.setLoading();
        const startTransferTime = new Date().getTime()
        let promise

        if (fileAPI && image.uri) promise = watch.transferFile(image.uri)
        else if (image.data) promise = watch.sendMessageData(image.data)
        else promise = Promise.reject()

        promise.then(resp => {
          const endTransferTime = new Date().getTime()
          const elapsed         = endTransferTime - startTransferTime
          console.log(`successfully transferred in ${elapsed}ms`, resp)
          this.configureNextAnimation()
          this.setState({
            fileTransferTime:      elapsed,
            useDataAPI:            !fileAPI,
            timeTakenToReachWatch: null,
            timeTakenToReply:      null
          })
        }).catch(err => {
          console.warn('Error sending message data', err, err.stack)
          this.configureNextAnimation()
        }).finally(() => {
          this.setState({loading: false})
        })
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

      watch.sendMessage({text, timestamp}, (err, resp) => {
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
    const {reachable, fileAPI, text}  = this.state
    return (
      <View>
        <DualButton
          textButtonDisabled={!text.trim().length || !reachable}
          imageButtonDisabled={!reachable}
          onTextButtonPress={::this.sendMessage}
          onImageButtonPress={::this.pickImage}
          disabled={!reachable}
        />
        <LabeledSwitch
          label={this.state.fileAPI ? 'File API' : 'Data API'}
          switchProps={{
              value: fileAPI,
              onValueChange: fileAPI => this.setState({fileAPI})
            }}
        />
      </View>
    )
  }

  render () {
    return (
      <View style={styles.container}>
        <WatchImage pings={this.state.pings}/>
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
        {this.state.loading && <Spinner type="Bounce" color={COLORS.orange} size={44}/>}
        {!this.state.loading && this.renderButtons()}
        <View style={this.state.spacerStyle}/>
      </View>
    )
  }

  receiveMessage (err, message, replyHandler) {
    if (err) console.error(`Error receiving message`, err)
    else {
      console.log('app received message', message)
      if (message.message === 'ping') {
        this.setState({pings: this.state.pings + 1})
        if (replyHandler) {
          replyHandler({message: 'pong'})
        }
        else {
          console.error('no reply handler...')
        }
      }
      this.configureNextAnimation()
      this.setState({messages: [...this.state.messages, message]})
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
  container:    {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.purple,
    width:           WINDOW_WIDTH
  },
  welcome:      {
    fontSize:  20,
    textAlign: 'center',
    margin:    10,
  },
  instructions: {
    textAlign:    'center',
    color:        '#333333',
    marginBottom: 5,
  },
  textInput:    {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height:          60,
    width:           300,
    color:           'white',
    marginBottom:    ROW_MARGIN,
    borderRadius:    6,
    padding:         20,
    alignSelf:       'center'
  },
  disabled:     {
    opacity: 0.4
  },

})

