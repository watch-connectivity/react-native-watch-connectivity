import React, {
  Image,
  Component,
  StyleSheet
} from 'react-native'

import {ROW_MARGIN} from './constants'

export default class WatchImage extends Component {
  render () {
    return (
      <Image
        style={styles.image}
        source={{uri: 'Watch'}}
        {...this.props}
      />
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width:        146,
    height:       269,
    marginBottom: ROW_MARGIN
  }
})