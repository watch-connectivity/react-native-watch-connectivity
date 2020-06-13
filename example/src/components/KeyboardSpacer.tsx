import React, {useState} from 'react';
import {ViewStyle, View} from 'react-native';
import {useKeyboardListener} from '../lib/keyboard';
import {configureAnimation} from '../lib/animation';

export const KeyboardSpacer = () => {
  const [spacerStyle, setSpacerStyle] = useState<ViewStyle>({height: 0});

  useKeyboardListener(height => {
    configureAnimation();
    setSpacerStyle({height});
  });

  return <View style={spacerStyle} />;
};
