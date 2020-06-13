import {StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import {COLORS} from '../constants';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from './Icon';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DrawerParamList} from '../navigators/drawer/params';

const style = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.purple,
    flex: 1,
  },
  title: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  content: {flex: 1},
  rightButton: {
    width: 60,
    height: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  left: {
    width: 60,
    height: 42,
  },
});

export default function Layout({
  children,
  title = '',
  left,
}: {
  children: React.ReactNode;
  title?: string;
  left?: React.ReactNode;
}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <SafeAreaView style={style.container}>
      <View style={style.header}>
        <View style={style.left}>{left}</View>
        <Text style={style.title}>{title}</Text>
        <TouchableOpacity
          style={style.rightButton}
          onPress={() => {
            navigation.toggleDrawer();
          }}>
          <Icon name="drawer" color="white" height={30} width={30} />
        </TouchableOpacity>
      </View>
      <View style={style.content}>{children}</View>
    </SafeAreaView>
  );
}
