"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const sharp = require("sharp");
const get_sharp_options_1 = require("./get-sharp-options");
const transformer_1 = require("./transformer");
const get_filename_1 = require("./get-filename");
class S3Storage {
    constructor(options) {
        if (!options.s3) {
            throw new Error('You have to specify s3 for AWS S3 to work.');
        }
        this.opts = Object.assign({}, S3Storage.defaultOptions, options);
        this.sharpOpts = get_sharp_options_1.default(options);
        if (!this.opts.Bucket) {
            throw new Error('You have to specify Bucket for AWS S3 to work.');
        }
        if (typeof this.opts.Key !== 'string') {
            if (typeof this.opts.Key !== 'function') {
                throw new TypeError(`Key must be a "string" or "function" or "undefined" but got ${typeof this
                    .opts.Key}`);
            }
        }
    }
    _handleFile(req, file, cb) {
        const { opts, sharpOpts } = this;
        const { mimetype, stream } = file;
        if (typeof opts.Key === 'function') {
            opts.Key(req, file, (fileErr, Key) => {
                if (fileErr) {
                    cb(fileErr);
                    return;
                }
                let params = {
                    Bucket: opts.Bucket,
                    ACL: opts.ACL,
                    CacheControl: opts.CacheControl,
                    ContentType: opts.ContentType,
                    Metadata: opts.Metadata,
                    StorageClass: opts.StorageClass,
                    ServerSideEncryption: opts.ServerSideEncryption,
                    SSEKMSKeyId: opts.SSEKMSKeyId,
                    Body: stream,
                    Key,
                };
                if (mimetype.includes('image')) {
                    this._uploadProcess(params, file, cb);
                }
                else {
                    this._uploadNonImage(params, file, cb);
                }
            });
        }
        else {
            const params = {
                Bucket: opts.Bucket,
                ACL: opts.ACL,
                CacheControl: opts.CacheControl,
                ContentType: opts.ContentType,
                Metadata: opts.Metadata,
                StorageClass: opts.StorageClass,
                ServerSideEncryption: opts.ServerSideEncryption,
                SSEKMSKeyId: opts.SSEKMSKeyId,
                Body: stream,
                Key: opts.Key,
            };
            if (mimetype.includes('image')) {
                this._uploadProcess(params, file, cb);
            }
            else {
                this._uploadNonImage(params, file, cb);
            }
        }
    }
    _removeFile(req, file, cb) {
        this.opts.s3.deleteObject({ Bucket: file.Bucket, Key: file.Key }, cb);
    }
    _bindSizeToPromise(size, upload) {
        return new Promise(function (resolve, reject) {
            let currentSize = { [size.suffix]: 0 };
            upload.on('httpUploadProgress', function (ev) {
                if (ev.total) {
                    currentSize[size.suffix] = ev.total;
                }
            });
            upload.promise().then(function (result) {
                resolve(Object.assign({}, result, { currentSize: size.currentSize || currentSize[size.suffix], suffix: size.suffix, ContentType: size.ContentType }));
            }, reject);
        });
    }
    _bindMetaToPromise(size, metadata) {
        return new Promise(function (resolve, reject) {
            metadata.then(function (result) {
                resolve(Object.assign({}, size, { ContentType: result.format, currentSize: result.size }));
            }, reject);
        });
    }
    _uploadProcess(params, file, cb) {
        const { opts, sharpOpts } = this;
        const { stream } = file;
        if (opts.multiple && Array.isArray(opts.resize) && opts.resize.length > 0) {
            const sizes = rxjs_1.from(opts.resize);
            const resizeImage = function (size) {
                const resizerStream = transformer_1.default(sharpOpts, size);
                if (size.suffix === 'original') {
                    size.Body = stream.pipe(sharp());
                }
                else {
                    size.Body = stream.pipe(resizerStream);
                }
                return size;
            };
            const getMeta = (size) => {
                const meta = { stream: size.Body };
                const getMetaFromSharp = meta.stream.metadata();
                const promise = this._bindMetaToPromise(size, getMetaFromSharp);
                return rxjs_1.from(promise);
            };
            const eachUpload = (size) => {
                const { Body, ContentType } = size;
                let newParams = Object.assign({}, params, { Body,
                    ContentType, Key: `${params.Key}-${size.suffix}` });
                const upload = opts.s3.upload(newParams);
                const promise = this._bindSizeToPromise(size, upload);
                return rxjs_1.from(promise);
            };
            const resizeWithSharp = operators_1.map(resizeImage);
            const getContentType = operators_1.mergeMap(getMeta);
            const uploadToAws = operators_1.mergeMap(eachUpload);
            sizes
                .pipe(resizeWithSharp, getContentType, uploadToAws, operators_1.toArray())
                .subscribe((res) => {
                const mapArrayToObject = res.reduce(this._iterator.bind(this), {});
                cb(null, mapArrayToObject);
            }, cb);
        }
        else {
            let currentSize = 0;
            const resizerStream = transformer_1.default(sharpOpts, sharpOpts.resize);
            let newParams = Object.assign({}, params, { Body: stream.pipe(resizerStream) });
            const meta = { stream: newParams.Body };
            const meta$ = rxjs_1.from(meta.stream.metadata());
            meta$
                .pipe(operators_1.map((metadata) => {
                params.ContentType = opts.ContentType || metadata.format;
                return metadata;
            }), operators_1.mergeMap((metadata) => {
                const upload = opts.s3.upload(newParams);
                upload.on('httpUploadProgress', function (ev) {
                    if (ev.total) {
                        currentSize = ev.total;
                    }
                });
                const upload$ = rxjs_1.from(new Promise((resolve, reject) => {
                    upload.promise().then((res) => {
                        resolve(Object.assign({}, res, { format: metadata.format }));
                    }, reject);
                }));
                return upload$;
            }))
                .subscribe((result) => {
                cb(null, {
                    Size: currentSize,
                    Bucket: opts.Bucket,
                    ACL: opts.ACL,
                    ContentType: opts.ContentType || result.format,
                    ContentDisposition: opts.ContentDisposition,
                    StorageClass: opts.StorageClass,
                    ServerSideEncryption: opts.ServerSideEncryption,
                    Metadata: opts.Metadata,
                    Location: result.Location,
                    ETag: result.ETag,
                    Key: result.Key,
                });
            }, cb);
        }
    }
    _iterator(acc, curr) {
        const { opts } = this;
        acc[curr.suffix] = {};
        acc[curr.suffix].Location = curr.Location;
        acc[curr.suffix].Key = curr.Key;
        acc[curr.suffix].Size = curr.currentSize;
        acc[curr.suffix].Bucket = curr.Bucket;
        acc[curr.suffix].ACL = opts.ACL;
        acc[curr.suffix].ContentType = opts.ContentType || curr.ContentType;
        acc[curr.suffix].ContentDisposition = opts.ContentDisposition;
        acc[curr.suffix].StorageClass = opts.StorageClass;
        acc[curr.suffix].ServerSideEncryption = opts.ServerSideEncryption;
        acc[curr.suffix].Metadata = opts.Metadata;
        acc[curr.suffix].ETag = curr.ETag;
        return acc;
    }
    _uploadNonImage(params, file, cb) {
        const { opts } = this;
        const { mimetype } = file;
        let currentSize = 0;
        params.ContentType = mimetype;
        const upload = opts.s3.upload(params);
        upload.on('httpUploadProgress', function (ev) {
            if (ev.total) {
                currentSize = ev.total;
            }
        });
        upload.promise().then((result) => {
            cb(null, {
                Size: currentSize,
                Bucket: opts.Bucket,
                ACL: opts.ACL,
                ContentType: opts.ContentType || mimetype,
                ContentDisposition: opts.ContentDisposition,
                StorageClass: opts.StorageClass,
                ServerSideEncryption: opts.ServerSideEncryption,
                Metadata: opts.Metadata,
                Location: result.Location,
                ETag: result.ETag,
                Key: result.Key,
            });
        }, cb);
    }
}
S3Storage.defaultOptions = {
    ACL: process.env.AWS_ACL || 'public-read',
    Bucket: process.env.AWS_BUCKET || null,
    Key: get_filename_1.default,
    multiple: false,
};
exports.S3Storage = S3Storage;
function s3Storage(options) {
    return new S3Storage(options);
}
exports.default = s3Storage;
//# sourceMappingURL=main.js.map