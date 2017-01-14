/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
} from 'react-native';
import {COLORS} from './demo/constants'
import Root from './demo/Root'

export default class rnwatch extends Component {

  constructor (props) {
    super(props)
    this.state = {
      routes: {
        root: {
          component: Root
        }
      }
    }
  }

  renderScene (route, navigator) {
    const Component = route.component

    return (
      <Component
        navigator={navigator}
        routes={this.state.routes}
      />
    )
  }

  configureScene (route) {
    return route.config
  }

  render () {
    return (
      <Navigator
        renderScene={::this.renderScene}
        configureScene={::this.configureScene}
        initialRoute={this.state.routes.root}
        style={{backgroundColor: COLORS.purple}}
      />
    )
  }

}

AppRegistry.registerComponent('rnwatch', () => rnwatch);
