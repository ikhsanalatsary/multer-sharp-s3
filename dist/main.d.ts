import { StorageEngine } from 'multer';
import { S3StorageOptions, SharpOptions } from './types';
interface S3Storage {
    opts: S3StorageOptions;
    sharpOpts: SharpOptions;
    _getKey: (req: any, file: any, cb: any) => void;
}
declare class S3Storage implements StorageEngine {
    constructor(options: S3StorageOptions);
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
    private _bindSizeToPromise;
    private _bindMetaToPromise;
    private _uploadProcess;
}
declare function s3Storage(options: S3StorageOptions): S3Storage;
export default s3Storage;
