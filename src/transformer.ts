import * as sharp from 'sharp'
import { ResizeOption, SharpOptions } from './types'

export default transformer
let dynamicParamMethods = new Map([
  ['gamma', 'gamma'],
  ['linear', 'linear'],
  ['median', 'median'],
  ['rotate', 'rotate'],
])

function transformer(
  options: SharpOptions,
  size: ResizeOption
): sharp.Sharp {
  let imageStream = sharp()
  for (const [key, value] of Object.entries(options)) {
    if (value) {
      imageStream = resolveImageStream(key, value, size, imageStream)
    }
  }
  return imageStream
}

const objectHasOwnProperty = (source, prop) =>
  Object.prototype.hasOwnProperty.call(source, prop)
const hasProp = (value) =>
  typeof value === 'object' && objectHasOwnProperty(value, 'type')
const validateFormat = (value) => {
  if (hasProp(value)) {
    return value.type
  }
  return value
}
const validateValueForRelatedKey = (key, value) => {
  if (dynamicParamMethods.has(key)) {
    if (typeof value === 'boolean') {
      if (value) {
        return undefined
      }
    }
  }
  return value
}
const resolveImageStream = (key, value, size, imageStream) => {
  if (key === 'resize') {
    imageStream = imageStream.resize(size.width, size.height, size.options)
  } else if (key === 'toFormat') {
    imageStream = imageStream.toFormat(validateFormat(value), value.options)
  } else {
    const validValue = validateValueForRelatedKey(key, value)
    if (Array.isArray(validValue)) {
      imageStream = imageStream[key](...validValue)
    } else {
      imageStream = imageStream[key](validValue)
    }
  }
  return imageStream
}
