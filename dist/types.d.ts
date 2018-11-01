import { ResizeOptions, RGBA, Region, ExtendOptions, ThresholdOptions, AvailableFormatInfo, OutputOptions, JpegOptions, PngOptions, Metadata, Kernel } from 'sharp';
import { S3 } from 'aws-sdk';
export interface Size {
    width?: number;
    height?: number;
    options?: ResizeOptions;
}
export interface Sharpen {
    sigma?: number;
    flat?: number;
    jagged?: number;
}
export interface Threshold {
    threshold?: number;
    options?: ThresholdOptions;
}
export interface Format {
    type: string | AvailableFormatInfo;
    options?: OutputOptions | JpegOptions | PngOptions;
}
export interface ExtendSize {
    suffix?: string;
}
declare type SharpOption<T = string> = void | T;
export declare type ResizeOption = SharpOption<Size & ExtendSize> | Array<SharpOption<Size & ExtendSize>>;
export interface SharpOptions {
    resize?: ResizeOption;
    crop?: SharpOption<string | number>;
    background?: SharpOption<RGBA | string>;
    embed?: boolean;
    max?: boolean;
    min?: boolean;
    withoutEnlargement?: boolean;
    ignoreAspectRatio?: boolean;
    extract?: SharpOption<Region>;
    trim?: SharpOption<number>;
    flatten?: boolean;
    extend?: SharpOption<number | ExtendOptions>;
    negate?: boolean;
    rotate?: boolean;
    flip?: boolean;
    flop?: boolean;
    blur?: SharpOption<number>;
    sharpen?: SharpOption<Sharpen>;
    gamma?: SharpOption<number>;
    grayscale?: boolean;
    greyscale?: boolean;
    normalize?: boolean;
    normalise?: boolean;
    withMetadata?: SharpOption<Metadata>;
    convolve?: SharpOption<Kernel>;
    threshold?: SharpOption<number | Threshold>;
    toColourspace?: SharpOption;
    toColorspace?: SharpOption;
    toFormat?: SharpOption<string | Format>;
    gzip?: boolean;
}
export interface CloudStorageOptions extends Partial<S3.Types.PutObjectRequest> {
    Key?: string;
    multiple?: boolean;
    s3: S3;
}
export declare type S3StorageOptions = CloudStorageOptions & SharpOptions;
export {};
