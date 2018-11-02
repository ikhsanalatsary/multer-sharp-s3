/// <reference types="node" />
import * as sharp from 'sharp';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { StorageEngine } from 'multer';
import * as express from 'express';
import { S3 } from 'aws-sdk';
import defaultKey from './get-filename';
import { Callback, S3StorageOptions, SharpOptions, ExtendSize } from './types';
export declare type ExtendResult = ExtendSize & {
    currentSize: number;
    ContentType: 'string';
};
export declare type MapResult = ManagedUpload.SendData & ExtendResult;
export declare type EndResult = ManagedUpload.SendData & sharp.Metadata;
export declare type ERequest = express.Request;
export declare type EStream = {
    stream: NodeJS.ReadableStream & sharp.SharpInstance;
};
export declare type EFile = Express.Multer.File & EStream & Partial<S3.Types.PutObjectRequest>;
export declare type Info = Partial<Express.Multer.File & ManagedUpload.SendData & Partial<S3.Types.PutObjectRequest> & {
    Size: number | void;
}>;
export declare type ECb = (error?: any, info?: Info) => void;
export interface S3Storage {
    opts: S3StorageOptions;
    sharpOpts: SharpOptions;
    _getKey: Callback;
}
export declare class S3Storage implements StorageEngine {
    protected static defaultOptions: {
        ACL: string;
        Bucket: string;
        Key: typeof defaultKey;
        multiple: boolean;
    };
    constructor(options: S3StorageOptions);
    _handleFile(req: ERequest, file: EFile, cb: ECb): void;
    _removeFile(req: ERequest, file: EFile, cb: (error: Error) => void): void;
    private _bindSizeToPromise;
    private _bindMetaToPromise;
    private _uploadProcess;
    private _iterator;
    private _uploadNonImage;
}
declare function s3Storage(options: S3StorageOptions): S3Storage;
export default s3Storage;
//# sourceMappingURL=main.d.ts.map