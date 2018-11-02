import { from, Observable } from 'rxjs'
import { map, mergeMap, toArray } from 'rxjs/operators'
import * as sharp from 'sharp'
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'
import { StorageEngine } from 'multer'
import * as express from 'express'
import { S3 } from 'aws-sdk'
import getSharpOptions from './get-sharp-options'
import transformer from './transformer'
import defaultKey from './get-filename'
import { Callback, S3StorageOptions, SharpOptions, ExtendSize } from './types'

type ExtendResult = ExtendSize & { currentSize: number, ContentType: 'string' }
type MapResult = ManagedUpload.SendData & ExtendResult
type EndResult = ManagedUpload.SendData & sharp.Metadata
type ERequest = express.Request
type EStream = {
   stream: NodeJS.ReadableStream & sharp.SharpInstance
}
type EFile = Express.Multer.File & EStream & Partial<S3.Types.PutObjectRequest>
type Info = Partial<
  Express.Multer.File &
    ManagedUpload.SendData &
    Partial<S3.Types.PutObjectRequest> & { Size: number | void }
>
type ECb = (error?: any, info?: Info) => void
interface S3Storage {
  opts: S3StorageOptions
  sharpOpts: SharpOptions
  _getKey: Callback
}
class S3Storage implements StorageEngine {
  protected static defaultOptions = {
    ACL: process.env.AWS_ACL || 'public-read',
    Bucket: process.env.AWS_BUCKET || null,
    Key: defaultKey,
    multiple: false,
  }

  constructor(options: S3StorageOptions) {
    if (!options.s3) {
      throw new Error('You have to specify s3 for AWS S3 to work.')
    }

    this.opts = { ...S3Storage.defaultOptions, ...options }
    this.sharpOpts = getSharpOptions(options)

    if (!this.opts.Bucket) {
      throw new Error('You have to specify Bucket for AWS S3 to work.')
    }

    if (typeof this.opts.Key !== 'string') {
      if (typeof this.opts.Key !== 'function') {
        throw new TypeError(
          `Key must be a "string" or "function" or "undefined" but got ${typeof this
            .opts.Key}`
        )
      }
    }
  }

  public _handleFile(req: ERequest, file: EFile, cb: ECb) {
    const { opts, sharpOpts } = this
    const { mimetype, stream } = file
    if (typeof opts.Key === 'function') {
      opts.Key(req, file, (fileErr, Key) => {
        if (fileErr) {
          cb(fileErr)
          return
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
        }

        if (mimetype.includes('image')) {
          this._uploadProcess(params, file, cb)
        } else {
          this._uploadNonImage(params, file, cb)
        }
      })
    } else {
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
      }

      if (mimetype.includes('image')) {
        this._uploadProcess(params, file, cb)
      } else {
        this._uploadNonImage(params, file, cb)
      }
    }
  }

  public _removeFile(req: ERequest, file: EFile, cb: (error: Error) => void) {
    this.opts.s3.deleteObject({ Bucket: file.Bucket, Key: file.Key }, cb)
  }

  private _bindSizeToPromise(size: ExtendResult, upload: ManagedUpload) {
    return new Promise(function(resolve, reject) {
      let currentSize = { [size.suffix]: 0 }
      upload.on('httpUploadProgress', function(ev) {
        if (ev.total) {
          currentSize[size.suffix] = ev.total
        }
      })
      upload.promise().then(function(result) {
        resolve({
          ...result,
          currentSize: size.currentSize || currentSize[size.suffix],
          suffix: size.suffix,
          ContentType: size.ContentType,
        })
      }, reject)
    })
  }

  private _bindMetaToPromise(size, metadata) {
    return new Promise(function(resolve, reject) {
      metadata.then(function(result) {
        resolve({
          ...size,
          ContentType: result.format,
          currentSize: result.size,
        })
      }, reject)
    })
  }

  private _uploadProcess(
    params: S3.Types.PutObjectRequest,
    file: EFile,
    cb: ECb
  ) {
    const { opts, sharpOpts } = this
    const { stream } = file
    if (opts.multiple && Array.isArray(opts.resize) && opts.resize.length > 0) {
      const sizes = from(opts.resize)
      const resizeImage = function(size) {
        const resizerStream = transformer(sharpOpts, size)
        if (size.suffix === 'original') {
          size.Body = stream.pipe(sharp())
        } else {
          size.Body = stream.pipe(resizerStream)
        }
        return size
      }
      const getMeta = (size) => {
        const meta = { stream: size.Body }
        const getMetaFromSharp = meta.stream.metadata()
        const promise = this._bindMetaToPromise(size, getMetaFromSharp)
        return from(promise)
      }
      const eachUpload = (size) => {
        const { Body, ContentType } = size
        let newParams = {
          ...params,
          Body,
          ContentType,
          Key: `${params.Key}-${size.suffix}`,
        }
        const upload = opts.s3.upload(newParams)
        const promise = this._bindSizeToPromise(size, upload)
        return from(promise)
      }
      const resizeWithSharp = map(resizeImage)
      const getContentType = mergeMap(getMeta)
      const uploadToAws = mergeMap(eachUpload)
      sizes
        .pipe(
          resizeWithSharp,
          getContentType,
          uploadToAws,
          toArray()
        )
        .subscribe((res) => {
          const mapArrayToObject = res.reduce(this._iterator.bind(this), {})

          cb(null, mapArrayToObject)
        }, cb)
    } else {
      let currentSize = 0
      const resizerStream = transformer(sharpOpts, sharpOpts.resize)
      let newParams = { ...params, Body: stream.pipe(resizerStream) }
      const meta = { stream: newParams.Body }
      const meta$ = from(meta.stream.metadata())
      meta$
        .pipe(
          map((metadata) => {
            params.ContentType = opts.ContentType || metadata.format
            return metadata
          }),
          mergeMap((metadata) => {
            const upload = opts.s3.upload(newParams)
            upload.on('httpUploadProgress', function(ev) {
              if (ev.total) {
                currentSize = ev.total
              }
            })
            const upload$ = from(
              new Promise((resolve, reject) => {
                upload.promise().then((res) => {
                  resolve({ ...res, format: metadata.format })
                }, reject)
              })
            )
            return upload$
          })
        )
        .subscribe((result: EndResult) => {
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
          })
        }, cb)
    }
  }

  private _iterator(acc, curr: MapResult) {
    const { opts } = this
    acc[curr.suffix] = {}
    acc[curr.suffix].Location = curr.Location
    acc[curr.suffix].Key = curr.Key
    acc[curr.suffix].Size = curr.currentSize
    acc[curr.suffix].Bucket = curr.Bucket
    acc[curr.suffix].ACL = opts.ACL
    acc[curr.suffix].ContentType = opts.ContentType || curr.ContentType
    acc[curr.suffix].ContentDisposition = opts.ContentDisposition
    acc[curr.suffix].StorageClass = opts.StorageClass
    acc[curr.suffix].ServerSideEncryption = opts.ServerSideEncryption
    acc[curr.suffix].Metadata = opts.Metadata
    acc[curr.suffix].ETag = curr.ETag
    return acc
  }

  private _uploadNonImage(
    params: S3.Types.PutObjectRequest,
    file: EFile,
    cb: ECb
  ) {
    const { opts } = this
    const { mimetype } = file
    let currentSize = 0
    params.ContentType = mimetype
    const upload = opts.s3.upload(params)
    upload.on('httpUploadProgress', function(ev) {
      if (ev.total) {
        currentSize = ev.total
      }
    })
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
      })
    }, cb)
  }
}

function s3Storage(options: S3StorageOptions) {
  return new S3Storage(options)
}

export default s3Storage
