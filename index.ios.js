/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
  DeviceEventEmitter
} from 'react-native'

import * as watchBridge from './src/WatchBridge.js'
import Spinner from 'react-native-spinkit'

const LAYOUT_ANIM_PRESET  = LayoutAnimation.Presets.easeInEaseOut
const EVENT_KEYBOARD_SHOW = 'keyboardWillShow'
const EVENT_KEYBOARD_HIDE = 'keyboardWillHide'

class buff extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:   [],
      reachable:  false,
      loading:    false,
      text:       '',
      watchState: watchBridge.WatchState.Inactive
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

  sendMessage () {
    const text = this.state.text
    if (text.trim().length) {
      const timestamp = new Date().getTime()
      this.configureNextAnimation()
      this.setState({loading: true, timeTakenToReachWatch: null, timeTakenToReply: null})
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

  render () {
    const {timeTakenToReachWatch, timeTakenToReply} = this.state

    const hasResponse = timeTakenToReachWatch && timeTakenToReply

    return (
      <View style={styles.container}>
        <Image
          style={{width: 146, height: 269, marginBottom: ROW_MARGIN}}
          source={{uri: 'Watch'}}
        />
        <View>
          <Text style={styles.reachability}>
            Watch session is <Text style={styles.boldText}>{this.state.watchState.toUpperCase()}</Text> and <Text
            style={styles.boldText}>{this.state.reachable ? 'REACHABLE' : 'UNREACHABLE'}</Text>
          </Text>
          {hasResponse ? <Text style={styles.reachability}>
            The last message took <Text style={styles.boldText}>{timeTakenToReachWatch + 'ms '}</Text>
            to reach the watch. It then took <Text style={styles.boldText}>{timeTakenToReply + 'ms '}</Text>
            for the response to arrive
          </Text> : null}
        </View>

        <TextInput
          style={styles.textInput}
          ref={e => this.textField = e}
          value={this.state.text}
          onChangeText={text => this.setState({text})}
          placeholder="Message"
        >
        </TextInput>
        {!this.state.loading ? <TouchableOpacity
          style={styles.button}
          disabled={!this.state.text.trim().length}
          onPress={::this.sendMessage}
        >
          <Text style={styles.buttonText}>
            CHANGE MESSAGE
          </Text>
        </TouchableOpacity> : <Spinner type="Bounce" color={orange} size={44}/>}
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

const purple = '#34314c'
const blue   = 'rgb(133, 187, 220)'
const yellow = '#ffc952'
const orange = '#ff7473'

const WINDOW_WIDTH = Dimensions.get('window').width

const ROW_MARGIN = 30

const styles = StyleSheet.create({
  container:    {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: purple,
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
  button:       {
    borderRadius:    6,
    backgroundColor: blue,
    padding:         10,
    height:          44
  },
  buttonText:   {
    color:         'rgb(50, 50, 53)',
    fontSize:      20,
    letterSpacing: 0.5,
    fontWeight:    'bold'
  },
  reachability: {
    marginBottom: ROW_MARGIN,
    color:        'white',
    marginLeft:   ROW_MARGIN,
    marginRight:  ROW_MARGIN,
    textAlign:    'center',
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
  boldText:     {
    fontWeight: 'bold'
  }
})

AppRegistry.registerComponent('buff', () => buff)
