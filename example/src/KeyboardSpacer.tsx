import React, {useState} from 'react';
import {ViewStyle, View} from 'react-native';
import {useKeyboardListener} from './keyboard';
import {configureAnimation} from './animation';

export const KeyboardSpacer = () => {
  const [spacerStyle, setSpacerStyle] = useState<ViewStyle>({height: 0});

  useKeyboardListener((height) => {
    configureAnimation();
    setSpacerStyle({height});
  });

  return <View style={spacerStyle} />;
};
