import React from 'react'
import ReactNative  from 'react-native'

import {COLORS, ROW_MARGIN} from './constants'
import Dimensions from 'Dimensions'

const {View, StyleSheet, Switch, Text} = ReactNative
const {Component} = React

export default class LabeledSwitch extends Component {
  static defaultProps = {
    label: '',
    on: true,
    switchProps: {},
    style: {},
  };

  render () {
    return (
      <View style={[styles.container, this.props.style]}>
        <Switch
          onTintColor={COLORS.orange}
          style={styles.switch}
          {...this.props.switchProps}
        />
        <Text
          style={styles.switchLabel}>
          {this.props.label}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: ROW_MARGIN,
    flexDirection: 'row',
    alignSelf: 'center',
    position: 'relative',
  },
  switch: {
    marginBottom: 10
  },
  switchLabel: {
    color: 'white',
    lineHeight: 23,
    width: 56,
    marginLeft: 10,
    marginTop: 4,
  }
})
