import React from 'react';
import {
  SwitchProps,
  ViewStyle,
  View,
  StyleSheet,
  Switch,
  Text,
} from 'react-native';

import {COLORS, ROW_MARGIN} from './constants';

type LabeledSwitchProps = {
  label: string;
  switchProps: SwitchProps;
  style?: ViewStyle;
};

export default function LabeledSwitch({
  label,
  switchProps,
  style = {},
}: LabeledSwitchProps) {
  return (
    <View style={[styles.container, style]}>
      <Switch
        trackColor={{true: COLORS.orange, false: COLORS.orange}}
        style={styles.switch}
        {...switchProps}
      />
      <Text style={styles.switchLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: ROW_MARGIN,
    flexDirection: 'row',
    alignSelf: 'center',
    position: 'relative',
  },
  switch: {
    marginBottom: 10,
  },
  switchLabel: {
    color: 'white',
    lineHeight: 23,
    width: 56,
    marginLeft: 10,
    marginTop: 4,
  },
});
