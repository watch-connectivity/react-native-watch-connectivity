import Dimensions from 'Dimensions'

const purple = '#34314c'
const blue   = 'rgb(133, 187, 220)'
const yellow = '#ffc952'
const orange = '#ff7473'

const green = {
  lightest: '#E6FABE',
  light:    '#D3F492',
  normal:   '#C2EE6B',
  dark:     '#83B322',
  darkest:  '#A1D044'
}

export const COLORS = {
  purple, blue, yellow, orange, green
}

export const WINDOW_WIDTH = Dimensions.get('window').width

export const ROW_MARGIN = 20

export const EVENT_KEYBOARD_SHOW = 'keyboardWillShow'
export const EVENT_KEYBOARD_HIDE = 'keyboardWillHide'