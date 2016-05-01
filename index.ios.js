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
  DeviceEventEmitter
} from 'react-native'

import * as watchBridge from './src/WatchBridge.js'

class buff extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:   [],
      reachable:  false,
      watchState: watchBridge.WatchState.Inactive
    }
  }

  componentDidMount () {
    this.subscriptions = [
      watchBridge.subscribeToMessages(::this.receiveMessage),
      watchBridge.subscribeToWatchState(::this.receiveWatchState),
      watchBridge.subscribeToWatchReachability(::this.receiveWatchReachability)
    ]
  }

  sendMessage () {
    const timestamp = Math.floor(new Date().getTime() / 1000)
    const text      = this.state.text
    watchBridge.sendMessage({text, timestamp})
  }

  receiveWatchReachability (err, reachable) {
    if (!err) {
      console.log('received watch reachability', reachable)
      this.setState({reachable})
    }
    else {
      console.error('error receiving watch reachability', err)
    }
  }

  componentWillUnmount () {
    this.subscriptions.forEach(fn => fn())
  }

  render () {
    return (
      <View style={styles.container}>
        <Image
          style={{width: 146, height: 269, marginBottom: ROW_MARGIN}}
          source={{uri: 'Watch'}}
        />
        <Text style={styles.reachability}>
          Watch session is <Text style={styles.boldText}>{this.state.watchState.toUpperCase()}</Text> and <Text
          style={styles.boldText}>{this.state.reachable ? 'REACHABLE' : 'UNREACHABLE'}</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          ref={e => this.textField = e}
          value={this.state.text}
          onChangeText={text => this.setState({text})}
          placeholder="Message"
        >

        </TextInput>
        <TouchableOpacity
          style={styles.button}
          onPress={::this.sendMessage}
        >
          <Text style={styles.buttonText}>
            CHANGE MESSAGE
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  receiveMessage (err, payload, replyHandler) {
    if (err) console.error(`Error receiving message`, err)
    else {
      console.log('app received message', payload)
      this.setState({messages: [...messages, payload]})
    }
  }

  receiveWatchState (err, watchState) {
    if (err) console.error(`Error receiving watch state`, err)
    else {
      console.log('received watch state', watchState)
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
  },
  buttonText:   {
    color:         'rgb(50, 50, 53)',
    fontSize:      20,
    letterSpacing: 0.5,
    fontWeight:    'bold'
  },
  reachability: {
    marginBottom: ROW_MARGIN,
    color:        'white'
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
