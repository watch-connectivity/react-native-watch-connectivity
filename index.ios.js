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
  DeviceEventEmitter
} from 'react-native'

import * as watchBridge from './src/WatchBridge.js'

class buff extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages:   [],
      reachable:  false,
      watchState: watchBridge.WatchState.WCSessionActivationStateInactive
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
        <Text style={styles.reachability}>Watch Session State: {this.state.watchState}</Text>
        <Text style={styles.reachability}>
          {this.state.reachable ? 'Watch is reachable' : 'Watch is not reachable'}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={::this.sendMessage}
        >
          <Text style={styles.buttonText}>
            Send Message
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

const styles = StyleSheet.create({
  container:    {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: '#F5FCFF',
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
    borderStyle:     'solid',
    borderRadius:    6,
    borderColor:     'black',
    backgroundColor: 'blue',
    padding:         10
  },
  buttonText:   {
    color:    'white',
    fontSize: 20,
  },
  reachability: {
    marginBottom: 10
  }
})

AppRegistry.registerComponent('buff', () => buff)
