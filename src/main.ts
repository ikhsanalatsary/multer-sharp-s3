import { S3StorageOptions, SharpOptions } from './types'

interface S3Storage {
  opts: S3StorageOptions
  sharpOpts: SharpOptions
}
class S3Storage {
  constructor(options) {
    options.Bucket = options.Bucket || process.env.AWS_BUCKET || null
    options.ACL = options.ACL || process.env.AWS_ACL || 'public-read'
    options.s3 = options.s3

    if (!options.Bucket) {
      throw new Error('You have to specify bucket for AWS S3 to work.')
    }

    if (!options.s3) {
      throw new Error('You have to specify bucket for AWS S3 to work.')
    }

    this.opts = options
  }

  private _handleFile(req, file, cb) {}

  private _removeFile(req, file, cb) {}
}

function s3Storage(options: S3StorageOptions) {
  return new S3Storage(options)
}

export default s3Storage
