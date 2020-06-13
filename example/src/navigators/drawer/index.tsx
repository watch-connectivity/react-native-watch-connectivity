import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerParamList} from './params';
import HomeScreen from '../../screens/HomeScreen';
import * as React from 'react';
import TestsScreen from '../../screens/TestsScreen';

const {
  Navigator: DrawerNavigator,
  Screen: DrawerScreen,
} = createDrawerNavigator<DrawerParamList>();

export default function Drawer() {
  return (
    <DrawerNavigator drawerType="slide" drawerPosition="right">
      <DrawerScreen name="Home" component={HomeScreen} />
      <DrawerScreen name="Tests" component={TestsScreen} />
    </DrawerNavigator>
  );
}
