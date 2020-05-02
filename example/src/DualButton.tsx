import ReactNative from 'react-native';
import React from 'react';

import {COLORS} from './constants';

const {Image, View, StyleSheet, TouchableOpacity, Text} = ReactNative;

type DualButtonProps = {
  disabled: boolean;
  textButtonDisabled: boolean;
  imageButtonDisabled: boolean;
  onTextButtonPress: () => void;
  onImageButtonPress: () => void;
};

const DualButton = ({
  disabled,
  textButtonDisabled,
  imageButtonDisabled,
  onImageButtonPress,
  onTextButtonPress,
}: DualButtonProps) => {
  return (
    <View style={styles.buttons}>
      <TouchableOpacity
        style={styles.button}
        disabled={disabled || textButtonDisabled}
        onPress={onTextButtonPress}>
        <Text style={styles.buttonText}>CHANGE MESSAGE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={onImageButtonPress}
        disabled={disabled || imageButtonDisabled}>
        <Image
          style={styles.cameraImageStyle}
          source={require('./camera.png')}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DualButton;

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
  },
  button: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    backgroundColor: COLORS.blue,
    padding: 10,
    height: 44,
    marginRight: 1,
  },
  cameraButton: {
    backgroundColor: COLORS.blue,
    width: 56,
    height: 44,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cameraImageStyle: {
    width: 34.68,
    height: 24.31,
  },
  buttonText: {
    color: 'rgb(50, 50, 53)',
    fontSize: 20,
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
});
