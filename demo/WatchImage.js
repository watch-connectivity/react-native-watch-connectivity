import React, {
  Image,
  Component,
  StyleSheet,
  View,
  Text
} from 'react-native'

import {ROW_MARGIN} from './constants'

export default class WatchImage extends Component {
  static defaultProps = {
    pings: 0
  };

  render () {
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={{uri: 'Watch'}}
          {...this.props}
        />
        <View style={styles.pings}>
          <Text style={styles.numPingsText}>{this.props.pings}</Text>
          <Text style={styles.pingsText}>PINGS</Text>
        </View>

      </View>
    )
  }
}

const imageSize = {
  width:  146,
  height: 269,
}

const styles = StyleSheet.create({
  image:        {
    ...imageSize,
    position: 'absolute',
    top:      0,
    left:     0
  },
  pings:        {
    backgroundColor: 'transparent',
  },
  numPingsText: {
    color:      'white',
    fontWeight: 'bold',
    fontSize:   36,
    textAlign:  'center',
    right:      1,
    width:      100,
  },
  pingsText:    {
    color:      'white',
    fontWeight: 'bold',
    fontSize:   11,
    textAlign:  'center',
    width:      100,
  },
  container:    {
    ...imageSize,
    position:       'relative',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   ROW_MARGIN
  }
})