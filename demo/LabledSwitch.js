import React from 'react'
import ReactNative  from 'react-native'

import {COLORS, ROW_MARGIN} from './constants'

const {View, StyleSheet, Switch, Text} = ReactNative,
      {Component} = React

export default class LabledSwitch extends Component {
  static defaultProps = {
    label:       '',
    on:          true,
    switchProps: {}
  };

  render () {
    return (
      <View style={styles.container}>
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
  container:   {
    marginTop:     ROW_MARGIN,
    flexDirection: 'row',
    alignSelf:     'center',
    position:      'relative',
    right:         24
  },
  switch:      {
    marginBottom: 10
  },
  switchLabel: {
    color:      'white',
    lineHeight: 23,
    marginLeft: 10,
    width:      56,
    position:   'absolute'
  }
})
