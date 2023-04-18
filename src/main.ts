import { from } from 'rxjs'
import { map, mergeMap, toArray } from 'rxjs/operators'
import * as sharp from 'sharp'
import { lookup } from 'mime-types'
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'
import { StorageEngine } from 'multer'
import { Request } from 'express'
import { S3 } from 'aws-sdk'
import getSharpOptions from './get-sharp-options'
import transformer from './transformer'
import defaultKey from './get-filename'
import { S3StorageOptions, SharpOptions } from './types'

export type EStream = {
  stream: NodeJS.ReadableStream & sharp.Sharp
}
export type EFile = Express.Multer.File &
  EStream &
  Partial<S3.Types.PutObjectRequest>
export type Info = Partial<
  Express.Multer.File &
    ManagedUpload.SendData &
    S3.Types.PutObjectRequest &
    sharp.OutputInfo
>
export interface S3Storage {
  opts: S3StorageOptions
  sharpOpts: SharpOptions
}
export class S3Storage implements StorageEngine {
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

  public _handleFile(req: Request, file: EFile, cb: (error?: any, info?: Info) => void) {
    const { opts, sharpOpts } = this
    const { mimetype, stream } = file
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

    if (typeof opts._resize === 'function') {
        this.opts.resize = opts._resize(req);
    }

    if (typeof opts.Key === 'function') {
      opts.Key(req, file, (fileErr, Key) => {
        if (fileErr) {
          cb(fileErr)
          return
        }
        params.Key = Key

        if (mimetype.includes('image')) {
          this._uploadProcess(params, file, cb)
        } else {
          this._uploadNonImage(params, file, cb)
        }
      })
    } else {
      if (mimetype.includes('image')) {
        this._uploadProcess(params, file, cb)
      } else {
        this._uploadNonImage(params, file, cb)
      }
    }
  }

  public _removeFile(req: Request, file: Info, cb: (error: Error) => void) {
    this.opts.s3.deleteObject({ Bucket: file.Bucket, Key: file.Key }, cb)
  }

  private _uploadProcess(
    params: S3.Types.PutObjectRequest,
    file: EFile,
    cb: (error?: any, info?: Info) => void
  ) {
    const { opts, sharpOpts } = this
    let { stream, mimetype } = file
    const {
      ACL,
      ContentDisposition,
      ContentType: optsContentType,
      StorageClass,
      ServerSideEncryption,
      Metadata,
    } = opts
    if (opts.multiple && Array.isArray(opts.resize) && opts.resize.length > 0) {
      const sizes = from(opts.resize)
      sizes
        .pipe(
          map((size) => {
            const resizerStream = transformer(sharpOpts, size)
            if (size.suffix === 'original') {
              size.Body = stream.pipe(sharp())
            } else {
              size.Body = stream.pipe(resizerStream)
            }
            return size
          }),
          mergeMap((size) => {
            const meta = { stream: size.Body }
            const getMetaFromSharp = meta.stream.toBuffer({
              resolveWithObject: true,
            })
            return from(
              getMetaFromSharp.then((result) => {
                return {
                  ...size,
                  ...result.info,
                  ContentType: result.info.format,
                  currentSize: result.info.size,
                }
              })
            )
          }),
          mergeMap((size) => {
            const { Body, ContentType } = size
            const keyDot = params.Key.split('.')
            let key = `${params.Key}-${size.suffix}`
            if (keyDot.length > 1) {
              keyDot.pop()
              key = `${keyDot.join('.')}-${size.suffix}.${params.Key.split('.')[keyDot.length]}`
            }

            let newParams = {
              ...params,
              Body,
              ContentType,
              Key: size.directory ? `${size.directory}/${key}` : key,
            }
            
            const upload = opts.s3.upload(newParams)
            let currentSize = { [size.suffix]: 0 }
            upload.on('httpUploadProgress', function(ev) {
              if (ev.total) {
                currentSize[size.suffix] = ev.total
              }
            })
            const upload$ = from(
              upload.promise().then((result) => {
                // tslint:disable-next-line
                const { Body, ...rest } = size
                return {
                  ...result,
                  ...rest,
                  currentSize: size.currentSize || currentSize[size.suffix],
                }
              })
            )
            return upload$
          }),
          toArray()
        )
        .subscribe((res) => {
          const mapArrayToObject: { [k: string]: any } = res.reduce(
            (acc, curr) => {
              // tslint:disable-next-line
              const { suffix, ContentType, size, format, channels, options, currentSize, ...rest } = curr;
              const tmpContentType = lookup(result.format) || `image/${result.format}`;
              acc[curr.suffix] = {
                ACL,
                ContentDisposition,
                StorageClass,
                ServerSideEncryption,
                Metadata,
                ...rest,
                size: currentSize,
                ContentType: tmpContentType,
              }
              mimetype = tmpContentType;
              return acc
            }, {})

          mapArrayToObject.mimetype = mimetype
          cb(null, JSON.parse(JSON.stringify(mapArrayToObject)))
        }, cb)
    } else {
      let currentSize = 0
      const resizerStream = transformer(sharpOpts, sharpOpts.resize)
      let newParams = { ...params, Body: stream.pipe(resizerStream) }
      const meta = { stream: newParams.Body }
      const meta$ = from(
        meta.stream.toBuffer({
          resolveWithObject: true,
        })
      )
      meta$
        .pipe(
          map((metadata) => {
            newParams.ContentType = opts.ContentType || metadata.info.format
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
              upload.promise().then((res) => {
                return { ...res, ...metadata.info }
              })
            )
            return upload$
          })
        )
        .subscribe((result) => {
          // tslint:disable-next-line
          const { size, format, channels, ...rest } = result
          const tmpContentType = lookup(result.format) || `image/${result.format}`;
          const endRes = {
            ACL,
            ContentDisposition,
            StorageClass,
            ServerSideEncryption,
            Metadata,
            ...rest,
            size: currentSize || size,
            ContentType: tmpContentType,
            mimetype: tmpContentType,
          }
          cb(null, JSON.parse(JSON.stringify(endRes)))
        }, cb)
    }
  }

  private _uploadNonImage(
    params: S3.Types.PutObjectRequest,
    file: EFile,
    cb: (error?: any, info?: Info) => void
  ) {
    const { opts } = this
    const { mimetype } = file
    let currentSize = 0
    params.ContentType = params.ContentType || mimetype
    const upload = opts.s3.upload(params)
    upload.on('httpUploadProgress', function(ev) {
      if (ev.total) {
        currentSize = ev.total
      }
    })
    upload.promise().then((result) => {
      const endRes = {
        size: currentSize,
        ACL: opts.ACL,
        ContentType: opts.ContentType || mimetype,
        ContentDisposition: opts.ContentDisposition,
        StorageClass: opts.StorageClass,
        ServerSideEncryption: opts.ServerSideEncryption,
        Metadata: opts.Metadata,
        ...result,
      }
      cb(null, JSON.parse(JSON.stringify(endRes)))
    }, cb)
  }
}

function s3Storage(options: S3StorageOptions) {
  return new S3Storage(options)
}

export default s3Storage
