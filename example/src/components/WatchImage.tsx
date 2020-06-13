import {Image, StyleSheet, View, Text, ImageProps} from 'react-native';
import React from 'react';

import {ROW_MARGIN} from '../constants';

export default function WatchImage({
  pings = 0,
  ...restOfProps
}: {pings: number} & Omit<ImageProps, 'style' | 'source'>) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../images/watch.png')}
        {...restOfProps}
      />
      <View style={styles.pings}>
        <Text style={styles.numPingsText}>{pings}</Text>
        <Text style={styles.pingsText}>PONGS</Text>
      </View>
    </View>
  );
}

const imageSize = {
  width: 146,
  height: 269,
};

const styles = StyleSheet.create({
  image: {
    ...imageSize,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pings: {
    backgroundColor: 'transparent',
  },
  numPingsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 36,
    textAlign: 'center',
    right: 1,
    width: 100,
  },
  pingsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
    width: 100,
  },
  container: {
    ...imageSize,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ROW_MARGIN,
  },
});
