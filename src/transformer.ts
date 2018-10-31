import * as sharp from 'sharp'
import { SharpOptions } from './types'

export default transformer

function transformer(options: SharpOptions): sharp.SharpInstance {
  let imageStream = sharp()
  for (const [key, value] of Object.entries(options)) {
    if (value) {
      imageStream = resolveImageStream(key, value, imageStream)
    }
  }
  return imageStream
}

const objectHasOwnProperty = (source, prop) =>
  Object.prototype.hasOwnProperty.call(source, prop)
const hasProp = (value) =>
  typeof value === 'object' && objectHasOwnProperty(value, 'type')
const isObject = (obj) => typeof obj === 'object' && obj !== null
const validateFormat = (value) => {
  if (hasProp(value)) {
    return value.type
  }
  return value
}
const validateValue = (value) => {
  if (typeof value === 'boolean') {
    return null
  }
  return value
}
const resolveImageStream = (key, value, imageStream) => {
  if (key === 'resize') {
    imageStream = imageStream.resize(key.width, key.height, key.option)
  } else if (key === 'crop') {
    imageStream = imageStream[key](value)
  } else if (key === 'toFormat') {
    imageStream = imageStream.toFormat(validateFormat(value), value.options)
  } else {
    const valid = validateValue(value)
    imageStream = imageStream[key](valid)
  }
  return imageStream
}
