import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  LayoutAnimation,
  Navigator
} from 'react-native'

import Root from './demo/Root'
import {COLORS} from './demo/constants'


class buff extends Component {

  constructor (props) {
    super(props)
    this.state = {
      routes: {
        root:   {
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

  receiveImage (selectedImage) {
    this.setState({selectedImage})
  }

  render () {
    return (
      <Navigator
        ref={e => this.navigator = e}
        renderScene={::this.renderScene}
        configureScene={::this.configureScene}
        initialRoute={this.state.routes.root}
        style={{backgroundColor: COLORS.purple}}
      />
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

AppRegistry.registerComponent('buff', () => buff)
