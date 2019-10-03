import ReactNative from 'react-native'
import React from 'react'

import {ROW_MARGIN, COLORS} from './constants'
import {WatchState} from 'react-native-watch-connectivity'

const {StyleSheet, Text, View} = ReactNative,
      {Component} = React

export default class Reachability extends Component {
  renderReachabilityText () {
    const reachable        = this.props.reachable
    const style            = [styles.boldText, {color: reachable ? COLORS.green.normal : COLORS.orange}]
    const reachabilityText = (
      <Text style={style}>
        {reachable ? 'REACHABLE' : 'UNREACHABLE'}
      </Text>
    )
    return reachabilityText
  }

  renderMessageTimeText () {
    const {timeTakenToReachWatch, timeTakenToReply} = this.props
    if (timeTakenToReachWatch && timeTakenToReply) {
      return (
        <Text style={styles.component}>
          The last message took <Text style={styles.boldText}>{timeTakenToReachWatch + 'ms '}</Text>
          to reach the watch. It then took <Text style={styles.boldText}>{timeTakenToReply + 'ms '}</Text>
          for the response to arrive
        </Text>
      )
    }
    return null
  }

  renderFileTransferTimeText () {
    const {fileTransferTime, useDataAPI} = this.props

    if (fileTransferTime) {
      return (
        <Text style={styles.component}>
          The image took
          <Text style={styles.boldText}>{' ' + fileTransferTime + 'ms '}</Text>
          to transfer using the {useDataAPI ? 'message data api' : 'file transfer api'}
        </Text>
      )
    }

    return null
  }

  renderWatchState () {
    const watchState = this.props.watchState
    const active     = watchState === WatchState.Activated
    const style      = [styles.boldText, {color: active ? COLORS.green.normal : COLORS.orange}]
    return (
      <Text style={style}>
        {watchState.toUpperCase()}
      </Text>
    )
  }

  render () {
    return (
      <View>
        <Text style={styles.component}>
          Watch session is {this.renderWatchState()}
          &nbsp;and {this.renderReachabilityText()}
        </Text>
        {this.renderMessageTimeText()}
        {this.renderFileTransferTimeText()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  component: {
    marginBottom: ROW_MARGIN,
    color:        'white',
    marginLeft:   ROW_MARGIN,
    marginRight:  ROW_MARGIN,
    textAlign:    'center',
  },
  boldText:  {
    fontWeight: 'bold'
  },
})
