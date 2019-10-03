import ReactNative from 'react-native'
import React from 'react'

import {COLORS} from './constants'

const {Image, View, StyleSheet, TouchableOpacity, Text} = ReactNative
const {Component} = React

export default class DualButton extends Component {
  static defaultProps = {
    disabled:            false,
    textButtonDisabled:  false,
    imageButtonDisabled: false,
    onTextButtonPress:   function () {},
    onImageButtonPress:  function () {}
  };

  render () {
    const {disabled, textButtonDisabled, imageButtonDisabled, onImageButtonPress, onTextButtonPress} = this.props
    const disabledStyle = disabled ? {} : styles.disabled

    return (
      <View style={[styles.buttons, disabledStyle]}>
        <TouchableOpacity
          style={styles.button}
          disabled={disabled || textButtonDisabled}
          onPress={onTextButtonPress}
        >
          <Text style={styles.buttonText}>
            CHANGE MESSAGE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onImageButtonPress}
          disabled={disabled || imageButtonDisabled}
        >
          <Image
            style={styles.cameraImageStyle}
            source={{uri: 'Camera'}}
          />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
})