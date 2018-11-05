import {
  ResizeOptions,
  RGBA,
  Region,
  ExtendOptions,
  ThresholdOptions,
  AvailableFormatInfo,
  OutputOptions,
  JpegOptions,
  PngOptions,
  Metadata,
  Kernel,
  SharpInstance,
} from 'sharp'
import { S3 } from 'aws-sdk'

export interface Size {
  width?: number
  height?: number
  options?: ResizeOptions
}

export interface Sharpen {
  sigma?: number
  flat?: number
  jagged?: number
}

export interface Threshold {
  threshold?: number
  options?: ThresholdOptions
}

export interface Format {
  type: string | AvailableFormatInfo
  options?: OutputOptions | JpegOptions | PngOptions
}

export interface ExtendSize {
  suffix: string
  Body?: NodeJS.ReadableStream & SharpInstance
}

export type SharpOption<T = string> = T

export type ResizeOption =
  | SharpOption<Size>
  | Array<SharpOption<Size & ExtendSize>>

export interface SharpOptions {
  resize?: ResizeOption
  crop?: SharpOption<string | number>
  background?: SharpOption<RGBA | string>
  embed?: boolean
  max?: boolean
  min?: boolean
  withoutEnlargement?: boolean
  ignoreAspectRatio?: boolean
  extract?: SharpOption<Region>
  trim?: SharpOption<number>
  flatten?: boolean
  extend?: SharpOption<number | ExtendOptions>
  negate?: boolean
  rotate?: SharpOption<boolean | number>
  flip?: boolean
  flop?: boolean
  blur?: SharpOption<boolean | number>
  sharpen?: SharpOption<boolean | Sharpen>
  gamma?: SharpOption<boolean | number>
  grayscale?: boolean
  greyscale?: boolean
  normalize?: boolean
  normalise?: boolean
  withMetadata?: SharpOption<Metadata>
  convolve?: SharpOption<Kernel>
  threshold?: SharpOption<number | Threshold>
  toColourspace?: SharpOption
  toColorspace?: SharpOption
  toFormat?: SharpOption<string | Format>
}

export interface CloudStorageOptions
  extends Partial<S3.Types.PutObjectRequest> {
  Key?: any
  multiple?: boolean
  s3: S3
}

export type S3StorageOptions = CloudStorageOptions & SharpOptions
