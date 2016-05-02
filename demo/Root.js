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

import * as watchBridge from '../src/WatchBridge.js'
import Spinner from 'react-native-spinkit'
import {COLORS} from './constants'
import {pickImage} from './images'

const LAYOUT_ANIM_PRESET  = LayoutAnimation.Presets.easeInEaseOut
const EVENT_KEYBOARD_SHOW = 'keyboardWillShow'
const EVENT_KEYBOARD_HIDE = 'keyboardWillHide'

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
    pickImage('Send Image To Watch').then(image => {
      const fileURI = image.uri
      console.log(`transferring ${fileURI} to the watch`)
      this.configureNextAnimation()
      this.setState({loading: true})
      const startTransferTime = new Date().getTime()
      watchBridge.transferFile(fileURI).then(resp => {
        const endTransferTime = new Date().getTime()
        const elapsed         = endTransferTime - startTransferTime
        console.log(`successfully transferred file in ${elapsed}ms`, resp)
        this.configureNextAnimation()
        this.setState({loading: false, fileTransferTime: elapsed})
      }).catch(err => {
        console.error('Error transferring file', err)
      })
    }).catch(err => {
      console.error(`Error picking image`, err)
    })
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

  renderButtons () {
    if (this.state.loading) {
      return <Spinner type="Bounce" color={COLORS.orange} size={44}/>
    }
    else {
      return (
        <View>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.button}
              disabled={!this.state.text.trim().length}
              onPress={::this.sendMessage}
            >
              <Text style={styles.buttonText}>
                CHANGE MESSAGE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={::this.pickImage}
            >
              <Image
                style={styles.cameraImageStyle}
                source={{uri: 'Camera'}}
              />
            </TouchableOpacity>

          </View>
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
    const {timeTakenToReachWatch, timeTakenToReply} = this.state

    const hasResponse = timeTakenToReachWatch && timeTakenToReply

    const fileTransferTime = this.state.fileTransferTime
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
          {fileTransferTime ? <Text style={styles.reachability}>
            The last image took <Text style={styles.boldText}>{fileTransferTime + 'ms'}</Text>
            to transfer using the file transfer API
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


const WINDOW_WIDTH = Dimensions.get('window').width

const ROW_MARGIN = 20

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
  buttons:          {
    flexDirection: 'row',
  },
  button:           {
    borderTopLeftRadius:    6,
    borderBottomLeftRadius: 6,
    backgroundColor:        COLORS.blue,
    padding:                10,
    height:                 44,
    marginRight:            1,
  },
  cameraButton:     {
    backgroundColor:         COLORS.blue,
    width:                   56,
    height:                  44,
    borderTopRightRadius:    6,
    borderBottomRightRadius: 6,
    alignItems:              'center',
    justifyContent:          'center',
    alignSelf:               'center'

  },
  cameraImageStyle: {
    width:  34.68,
    height: 24.31,
  },
  buttonText:       {
    color:         'rgb(50, 50, 53)',
    fontSize:      20,
    letterSpacing: 0.5,
    fontWeight:    'bold'
  },
  reachability:     {
    marginBottom: ROW_MARGIN,
    color:        'white',
    marginLeft:   ROW_MARGIN,
    marginRight:  ROW_MARGIN,
    textAlign:    'center',
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
  boldText:         {
    fontWeight: 'bold'
  },
  switch:           {
    marginTop:     ROW_MARGIN,
    flexDirection: 'row',
    alignSelf:     'center',
    position:      'relative',
    right:         24
  },
  switchLabel:      {
    color:      'white',
    lineHeight: 23,
    marginLeft: 10,
    width:      56,
    position:   'absolute'
  }
})

