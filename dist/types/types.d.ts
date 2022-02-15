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
  WriteableMetadata,
  Kernel,
  Sharp,
  OverlayOptions,
  Color,
  FlattenOptions,
  Raw,
  SharpOptions as SharpOptionsCore
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

export declare interface Bool {
  operand: string | Buffer
  operator: string
  options?: { raw: Raw }
}

export declare interface JoinChannel {
  images: string | Buffer | ArrayLike<string | Buffer>
  options?: SharpOptionsCore
}

export declare interface Modulate {
  brightness?: number
  saturation?: number
  hue?: number
}

export declare interface Threshold {
  threshold?: number
  options?: ThresholdOptions
}

export declare interface Format {
  type: string | AvailableFormatInfo
  options?: OutputOptions | JpegOptions | PngOptions
}

export declare interface ExtendSize extends Size {
  suffix: string,
  directory?: string,
  Body?: NodeJS.ReadableStream & Sharp
}

export declare type SharpOption<T = string> = T

export declare type ResizeOption =
  | SharpOption<Size>
  | Array<SharpOption<ExtendSize>>

export declare type MaybeA<T> = T | undefined | null

export declare interface SharpOptions {
  _resize?: any
  resize?: ResizeOption
  // MARK: deprecated since sharp v0.22.0
  // crop?: SharpOption<string | number>
  // background?: SharpOption<RGBA | string>
  // embed?: boolean
  // max?: boolean
  // min?: boolean
  // withoutEnlargement?: boolean
  // ignoreAspectRatio?: boolean
  modulate?: SharpOption<Modulate>
  composite?: SharpOption<OverlayOptions[]>
  extract?: SharpOption<Region>
  trim?: SharpOption<boolean | number>
  flatten?: SharpOption<boolean | FlattenOptions>
  extend?: SharpOption<number | ExtendOptions>
  negate?: SharpOption<boolean>
  rotate?: SharpOption<boolean | number>
  flip?: SharpOption<boolean>
  flop?: SharpOption<boolean>
  blur?: SharpOption<boolean | number>
  sharpen?: SharpOption<boolean | Sharpen>
  gamma?: SharpOption<boolean | number>
  grayscale?: SharpOption<boolean>
  greyscale?: SharpOption<boolean>
  normalize?: SharpOption<boolean>
  normalise?: SharpOption<boolean>
  withMetadata?: SharpOption<boolean | WriteableMetadata>
  convolve?: SharpOption<Kernel>
  threshold?: SharpOption<number | Threshold>
  toColourspace?: SharpOption
  toColorspace?: SharpOption
  toFormat?: SharpOption<string | Format>
  linear?: SharpOption<boolean | [MaybeA<number>, MaybeA<number>]>
  median?: SharpOption<boolean | number>
  tint?: SharpOption<Color>
  removeAlpha?: SharpOption<boolean>
  bandbool?: SharpOption
  boolean?: SharpOption<Bool>
  joinChannel?: SharpOption<JoinChannel>
  extractChannel?: SharpOption<number | string>
  ensureAlpha?: SharpOption<boolean>
}

export declare interface CloudStorageOptions
  extends Partial<S3.Types.PutObjectRequest> {
  Key?: any
  multiple?: boolean
  s3: S3
}

export declare type S3StorageOptions = CloudStorageOptions & SharpOptions
