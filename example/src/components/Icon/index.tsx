import {SvgProps} from 'react-native-svg';
import React from 'react';

const icons = {
  drawer: require('./drawer-icon.svg').default,
  tick: require('./tick.svg').default,
  cross: require('./cross.svg').default,
};

export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
  color?: string;
} & SvgProps;

export default function Icon({
  name,
  height = 30,
  width = 30,
  color,
  ...restOfProps
}: IconProps) {
  const IconComponent = icons[name];

  return (
    <IconComponent
      height={height}
      width={width}
      color={color}
      {...restOfProps}
    />
  );
}
