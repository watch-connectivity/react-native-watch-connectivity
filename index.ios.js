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
  DeviceEventEmitter
} from 'react-native'

import * as watchBridge from './src/WatchBridge.js'

class buff extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages: []
    }
  }

  componentDidMount () {
    this.subscriptions = [
      watchBridge.subscribeToMessages(::this.receiveMessage),
      watchBridge.subscribeToWatchState(::this.receiveWatchState)
    ]
  }

  componentWillUnmount () {
    this.subscriptions.forEach(fn => fn())
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
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
})

AppRegistry.registerComponent('buff', () => buff)
