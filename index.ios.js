import ReactNative from 'react-native'
import React from 'react'
import Root from './demo/Root'
import {COLORS} from './demo/constants'

const {AppRegistry, Navigator} = ReactNative
const {Component} = React

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

AppRegistry.registerComponent('buff', () => buff)
