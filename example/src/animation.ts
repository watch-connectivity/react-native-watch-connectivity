import {LayoutAnimation} from 'react-native';

const LAYOUT_ANIM_PRESET = LayoutAnimation.Presets.easeInEaseOut;

export function configureAnimation() {
  LayoutAnimation.configureNext(LAYOUT_ANIM_PRESET);
}
