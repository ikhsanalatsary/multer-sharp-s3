import {
  ResizeOptions,
  // RGBA,
  Region,
  ExtendOptions,
  ThresholdOptions,
  AvailableFormatInfo,
  OutputOptions,
  JpegOptions,
  PngOptions,
  Metadata,
  Kernel,
  Sharp,
  OverlayOptions,
} from 'sharp'
import { S3 } from 'aws-sdk'

export declare interface Size {
  width?: number
  height?: number
  options?: ResizeOptions
}

export declare interface Sharpen {
  sigma?: number
  flat?: number
  jagged?: number
}

export declare interface Threshold {
  threshold?: number
  options?: ThresholdOptions
}

export declare interface Format {
  type: string | AvailableFormatInfo
  options?: OutputOptions | JpegOptions | PngOptions
}

export declare interface ExtendSize {
  suffix: string
  Body?: NodeJS.ReadableStream & Sharp
}

export declare type SharpOption<T = string> = T

export declare type ResizeOption =
  | SharpOption<Size>
  | Array<SharpOption<Size & ExtendSize>>

export declare interface SharpOptions {
  resize?: ResizeOption
  // MARK: deprecated since sharp v0.22.0
  // crop?: SharpOption<string | number>
  // background?: SharpOption<RGBA | string>
  // embed?: boolean
  // max?: boolean
  // min?: boolean
  // withoutEnlargement?: boolean
  // ignoreAspectRatio?: boolean
  modulate?: { brightness?: number; saturation?: number; hue?: number }
  composite?: OverlayOptions[]
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

export declare interface CloudStorageOptions
  extends Partial<S3.Types.PutObjectRequest> {
  Key?: any
  multiple?: boolean
  s3: S3
}

export declare type S3StorageOptions = CloudStorageOptions & SharpOptions
