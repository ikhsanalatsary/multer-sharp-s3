/// <reference types="node" />
import * as sharp from 'sharp';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { StorageEngine } from 'multer';
import { Request } from 'express';
import { S3 } from 'aws-sdk';
import defaultKey from './get-filename';
import { S3StorageOptions, SharpOptions } from './types';
export declare type EStream = {
    stream: NodeJS.ReadableStream & sharp.Sharp;
};
export declare type EFile = Express.Multer.File & EStream & Partial<S3.Types.PutObjectRequest>;
export declare type Info = Partial<Express.Multer.File & ManagedUpload.SendData & S3.Types.PutObjectRequest & sharp.OutputInfo>;
export interface S3Storage {
    opts: S3StorageOptions;
    sharpOpts: SharpOptions;
}
export declare class S3Storage implements StorageEngine {
    protected static defaultOptions: {
        ACL: string;
        Bucket: string;
        Key: typeof defaultKey;
        multiple: boolean;
    };
    constructor(options: S3StorageOptions);
    _handleFile(req: Request, file: EFile, cb: (error?: any, info?: Info) => void): void;
    _removeFile(req: Request, file: Info, cb: (error: Error) => void): void;
    private _uploadProcess;
    private _uploadNonImage;
}
declare function s3Storage(options: S3StorageOptions): S3Storage;
export default s3Storage;
//# sourceMappingURL=main.d.ts.map