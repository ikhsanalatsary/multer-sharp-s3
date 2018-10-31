import { SharpOptions } from './types'

function getSharpOptions(options: SharpOptions) {
  return {
    resize: options.resize,
    background: options.background,
    crop: options.crop,
    embed: options.embed,
    max: options.max,
    min: options.min,
    toFormat: options.toFormat,
    extract: options.extract,
    trim: options.trim,
    flatten: options.flatten,
    extend: options.extend,
    negate: options.negate,
    rotate: options.rotate,
    flip: options.flip,
    flop: options.flop,
    blur: options.blur,
    sharpen: options.sharpen,
    gamma: options.gamma,
    grayscale: options.grayscale,
    greyscale: options.greyscale,
    normalize: options.normalize,
    normalise: options.normalise,
    convolve: options.convolve,
    threshold: options.threshold,
    toColourspace: options.toColourspace,
    toColorspace: options.toColorspace,
    ignoreAspectRatio: options.ignoreAspectRatio,
    withMetadata: options.withMetadata,
    withoutEnlargement: options.withoutEnlargement,
  }
}

export default getSharpOptions
