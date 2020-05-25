'use strict'

/* eslint-disable no-console */

import * as express from 'express'
import * as supertest from 'supertest'
import * as multer from 'multer'
import * as aws from 'aws-sdk'
import * as crypto from 'crypto'
import * as sharp from 'sharp'

import multerSharp from '../src/main'
const config = {
  uploads: {
    aws: {
      Bucket: process.env.AWS_BUCKET,
      ACL: 'private',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      region: process.env.AWS_REGION,
    },
  },
}

aws.config.update({
  secretAccessKey: config.uploads.aws.secretAccessKey, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: config.uploads.aws.accessKeyId, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: config.uploads.aws.region, // region of your bucket
})

const s3 = new aws.S3()

const app = express()
// const wrongConfig = {
//   uploads: {
//     gcsUpload: {
//       bucket: 'multer.appspot.com', // Required : bucket name to upload
//       projectId: 'multer', // Required : Google project ID
//       keyFilename: 'test/firebase.auth.json', // Required : JSON credentials file for Google Cloud Storage
//       destination: 'public', // Optional : destination folder to store your file for Google Cloud Storage, default: ''
//       acl: 'publicRead' // Required : acl credentials file for Google Cloud Storage, publicrRead or private, default: private
//     }
//   }
// };

let lastRes = null
let lastReq = lastRes

const storage = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  // Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
  ACL: config.uploads.aws.ACL,
  resize: {
    width: 400,
    height: 400,
    options: {
      kernel: sharp.kernel.lanczos2,
    },
  },
})
const upload = multer({ storage })
const storage2 = multerSharp({
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      err = Error('Something wrong')
      Error.captureStackTrace(this, this.Key)
      cb(err, err ? undefined : raw.toString('hex'))
    })
  },
  s3,
  Bucket: config.uploads.aws.Bucket,
  resize: {
    width: 400,
    height: 400,
  },
})
const upload2 = multer({ storage: storage2 })

const storage3 = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myFile`,
  ACL: config.uploads.aws.ACL,
  // resize (sharp options) will ignore when uploading non image file type
  resize: {
    width: 400,
    height: 400,
  },
})
const upload3 = multer({ storage: storage3 })

const storage4 = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
  ACL: config.uploads.aws.ACL,
  resize: { width: 200 },
  trim: true,
  flatten: true,
  extend: { top: 10, bottom: 20, left: 10, right: 10 },
  negate: true,
  rotate: true,
  flip: true,
  flop: true,
  blur: true,
  sharpen: true,
  gamma: false,
  greyscale: true,
  normalize: true,
  linear: [1.0, 1.0],
  median: true,
  withMetadata: true,
  composite: [
    {
      input: {
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: 'rgb(255, 255, 255)',
        },
      },
      premultiplied: true,
    },
  ],
  removeAlpha: true,
  bandbool: 'and',
  tint: 'rgb(255, 255, 255)',
  toFormat: {
    type: 'jpeg',
    options: {
      progressive: true,
      quality: 90,
    },
  },
})
const upload4 = multer({ storage: storage4 })

const storage5 = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
  ACL: config.uploads.aws.ACL,
  resize: { width: 400, height: 400 },
  extract: { left: 0, top: 2, width: 50, height: 100 },
  trim: 50,
  flatten: true,
  extend: { top: 10, bottom: 20, left: 10, right: 10 },
  negate: true,
  rotate: 90,
  flip: true,
  flop: true,
  blur: true,
  sharpen: true,
  gamma: 2.5,
  grayscale: true,
  normalise: true,
  toFormat: 'jpeg',
  withMetadata: {
    orientation: 4,
  },
  convolve: {
    width: 3,
    height: 3,
    kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
  },
  threshold: 129,
  // extractChannel: 'green',
  toColorspace: 'b-w',
})
const upload5 = multer({ storage: storage5 })

const storage6 = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
  ACL: config.uploads.aws.ACL,
  resize: {
    width: 400,
    height: 400,
  },
  extract: { left: 0, top: 2, width: 400, height: 400 },
})
const upload6 = multer({ storage: storage6 })

const storage8 = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
  ACL: config.uploads.aws.ACL,
  multiple: true,
  resize: [
    // { suffix: 'xlg', width: 1200, height: 1200 },
    { suffix: 'original' },
    { suffix: 'md', width: 500, height: 500 },
    { suffix: 'sm', width: 300, height: 300 },
    { suffix: 'xs', width: 100, height: 100 },
  ],
  toFormat: 'jpeg',
})
const upload8 = multer({ storage: storage8 })

// const storage9 = multerSharp({
//   bucket: wrongConfig.uploads.gcsUpload.bucket,
//   projectId: wrongConfig.uploads.gcsUpload.projectId,
//   keyFilename: wrongConfig.uploads.gcsUpload.keyFilename,
//   sizes: [
//     // { suffix: 'xlg', width: 1200, height: 1200 },
//     // { suffix: 'lg', width: 800, height: 800 },
//     { suffix: 'md', width: 500, height: 500 },
//     { suffix: 'sm', width: 300, height: 300 },
//     { suffix: 'xs', width: 100, height: 100 }
//   ]
// });
// const upload9 = multer({ storage: storage9 });

// const storage10 = multerSharp({
//   bucket: config.uploads.gcsUpload.bucket,
//   projectId: config.uploads.gcsUpload.projectId,
//   keyFilename: config.uploads.gcsUpload.keyFilename,
//   acl: config.uploads.gcsUpload.acl,
//   sizes: [
//     // { suffix: 'xlg', width: 1200, height: 1200 },
//     // { suffix: 'lg', width: 800, height: 800 },
//     { suffix: 'md', width: 500, height: 500 },
//     { suffix: 'sm', width: 300, height: 300 },
//     { suffix: 'xs', width: 100, height: 100 }
//   ],
//   extract: { left: 0, top: 2, width: 400, height: 400 }
// });
// const upload10 = multer({ storage: storage10 });

const storage11 = multerSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  // Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myFile`,
  ACL: config.uploads.aws.ACL,
  joinChannel: {
    images: 'ss'
  },
})
const upload11 = multer({ storage: storage11 })

// express setup
app.get('/book', (req, res) => {
  res.sendStatus(200)
})

// express setup
app.post('/upload', (req, res, next) => {
  upload.single('myPic')(req, res, (err) => {
    lastReq = req
    lastRes = res
    res.sendStatus(200)
    next()
  })
})

// express setup
app.post('/uploadwitherrorkey', (req, res, next) => {
  upload2.single('myPic')(req, res, (errorFile) => {
    lastReq = req
    lastRes = res
    // console.log(errorFile.stack);
    res.status(400).json({ message: errorFile.message })

    next()
  })
})

// express setup
app.post('/uploadfile', upload3.single('myFile'), (req, res, next) => {
  lastReq = req
  lastRes = res
  res.sendStatus(200)
  next()
})

// express setup
app.post(
  '/uploadwithsharpsetting',
  upload4.single('myPic'),
  (req, res, next) => {
    lastReq = req
    lastRes = res
    res.sendStatus(200)
    next()
  }
)

// // express setup
app.post('/uploadanddelete', (req, res, next) => {
  upload5.single('myPic')(req, res, (err) => {
    if (err) {
      next(err)
    }
    storage5._removeFile(req, req.file, (err) => {
      // eslint-disable-line no-underscore-dangle
      if (err) {
        next(err)
      }
      res.sendStatus(200)
      next()
    })
  })
})

app.post('/uploadwithtransformerror', (req, res) => {
  const uploadAndError = upload6.single('myPic')
  uploadAndError(req, res, (uploadError) => {
    if (uploadError) {
      res.status(400).json({ message: 'Something went wrong when resize' })
    }
  })
})

app.post('/uploadwitherror', (req, res) => {
  aws.config.update({
    secretAccessKey: 'sllll', // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
    accessKeyId: config.uploads.aws.accessKeyId, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
    region: config.uploads.aws.region, // region of your bucket
  })
  const s3 = new aws.S3()
  const storage7 = multerSharp({
    s3,
    Bucket: config.uploads.aws.Bucket,
    Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
  })
  const upload7 = multer({ storage: storage7 })
  const uploadAndError = upload7.single('myPic')
  uploadAndError(req, res, (uploadError) => {
    if (uploadError) {
      res.status(uploadError.statusCode).json({ message: uploadError.message })
    }
  })
})

app.post(
  '/uploadfilewithdefaultkey',
  upload11.single('myFile'),
  (req, res, next) => {
    lastReq = req
    lastRes = res
    res.sendStatus(200)
    next()
  }
)

// express setup
app.post('/uploadwithmultiplesize', (req, res, next) => {
  upload8.single('myPic')(req, res, (err) => {
    lastReq = req
    lastRes = res
    if (err) {
      throw err
    }
    res.sendStatus(200)
    next()
  })
  // lastReq = req
  // lastRes = res
  // console.log('req ', req.file)

  // if (lastReq && lastReq.file) {
  //   res.sendStatus(200)
  // }
  // next()
})

// app.post('/uploadwithmultiplesizetransformerror', (req, res) => {
//   const uploadAndError = upload9.single('myPic');
//   uploadAndError(req, res, (uploadError) => {
//     if (uploadError) {
//       res.status(400).json({ message: 'Something went wrong when resize' });
//     }
//   });
// });
// app.post('/uploadwithmultiplesizegcerror', upload10.single('myPic'), (req, res) => {
//   lastReq = req;
//   lastRes = res;
// });

// Run Test
describe('S3Storage', () => {
  it('should throw an error, cause s3 is not specify', (done) => {
    expect(
      multerSharp.bind(multerSharp, {
        // s3,
        Bucket: config.uploads.aws.Bucket,
        Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
      })
    ).toThrow('You have to specify s3 for AWS S3 to work.')
    done()
  })
  it('should throw an error, cause Bucket is not specify', (done) => {
    expect(
      multerSharp.bind(multerSharp, {
        s3,
        Bucket: undefined,
        // Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myPic`,
      })
    ).toThrow('You have to specify Bucket for AWS S3 to work.')
    done()
  })
  it('should work without Key', (done) => {
    expect(
      multerSharp.bind(multerSharp, {
        s3,
        Bucket: config.uploads.aws.Bucket,
      })
    ).not.toThrow('anything')
    done()
  })
  it('should throw an error if Key is not string or function', (done) => {
    const opts = { s3, Bucket: config.uploads.aws.Bucket, Key: true }
    expect(multerSharp.bind(multerSharp, opts)).toThrow(
      `Key must be a "string" or "function" or "undefined" but got ${typeof opts.Key}`
    )
    done()
  })
})

describe('Upload test', () => {
  jest.setTimeout(15000)
  it('initial server', (done) => {
    supertest(app)
      .get('/book')
      .expect(200, done)
  })
  it('successfully uploads a file', (done) => {
    supertest(app)
      .post('/upload')
      .attach('myPic', '__tests__/nodejs-512.png')
      .end((err) => {
        const file = lastReq.file
        // console.log('filee ', file);
        expect(file).toBeDefined()
        expect(file).toHaveProperty('Location')
        expect(file).toHaveProperty('fieldname')
        expect(file).toHaveProperty('encoding')
        expect(file).toHaveProperty('mimetype')
        expect(file).toHaveProperty('originalname')
        expect(file).toHaveProperty('Key')
        done()
      })
    // .expect(200, done);
  })
  it('return a req.file with multiple sizes', (done) => {
    // jest.setTimeout(done, 1000);
    supertest(app)
      .post('/uploadwithmultiplesize')
      .attach('myPic', '__tests__/nodejs-512.png')
      .end(() => {
        const file = lastReq.file
        expect(file).toHaveProperty('original')
        expect(file).toHaveProperty('md')
        expect(file).toHaveProperty('sm')
        expect(file).toHaveProperty('xs')
        expect(file).toHaveProperty('fieldname')
        expect(file).toHaveProperty('encoding')
        expect(file).toHaveProperty('mimetype')
        expect(file).toHaveProperty('originalname')
        expect(file.xs).toHaveProperty('Key')
        expect(file.md).toHaveProperty('Key')
        expect(file.sm).toHaveProperty('Key')
        expect(file.original).toHaveProperty('Key')
        expect(file.xs).toHaveProperty('Location')
        expect(file.md).toHaveProperty('Location')
        expect(file.sm).toHaveProperty('Location')
        expect(file.original).toHaveProperty('Location')
        done()
      })
  })

  it('upload file without Key', (done) => {
    supertest(app)
      .post('/uploadfilewithdefaultkey')
      .attach('myFile', '.travis.yml')
      .end((err, res) => {
        const { file } = lastReq
        expect(file).toHaveProperty('Key')
        expect(file).toHaveProperty('fieldname')
        expect(file).toHaveProperty('encoding')
        expect(file).toHaveProperty('mimetype')
        expect(file).toHaveProperty('originalname')
        expect(file.mimetype).toMatch('text/yaml')
        expect(file.fieldname).toMatch('myFile')
        expect(file.Location).toMatch('aws')
        done()
      })
  })

  // it('returns a req.file with the Google Cloud Storage filename and path', (done) => {
  //   supertest(app)
  //     .post('/upload')
  //     .attach('myPic', 'test/nodejs-512.png')
  //     .end(() => {
  //       const file = lastReq.file;
  //       console.log(file);
  //       expect(file).toHaveProperty('path');
  //       expect(file).toHaveProperty('filename');
  //       expect(file).toHaveProperty('fieldname');
  //       expect(file).toHaveProperty('encoding');
  //       expect(file).toHaveProperty('mimetype');
  //       expect(file).toHaveProperty('originalname');
  //       expect(file.fieldname).toMatch('myPic');
  //       expect(file.path).toMatch('googleapis');
  //       done();
  //     });
  // });
  it('return a req.file with type application/javascript ', (done) => {
    supertest(app)
      .post('/uploadfile')
      .attach('myFile', 'wallaby.js')
      .end(() => {
        const file = lastReq.file
        expect(file).toHaveProperty('Key')
        expect(file).toHaveProperty('fieldname')
        expect(file).toHaveProperty('encoding')
        expect(file).toHaveProperty('mimetype')
        expect(file).toHaveProperty('originalname')
        expect(file.mimetype).toMatch('application/javascript')
        expect(file.fieldname).toMatch('myFile')
        expect(file.Location).toMatch('aws')
        done()
      })
  })
  it('return an error when creating random key', (done) => {
    supertest(app)
      .post('/uploadwitherrorkey')
      .attach('myPic', '__tests__/nodejs-512.png')
      .end((err, res) => {
        expect(res.status).toEqual(400)
        expect(res.body.message).toEqual('Something wrong')
        done()
      })
  })
  it('return a req.file with mimetype image/jpeg', (done) => {
    supertest(app)
      .post('/uploadwithsharpsetting')
      .attach('myPic', '__tests__/nodejs-512.png')
      .end(() => {
        const file = lastReq.file
        expect(file).toHaveProperty('Key')
        expect(file).toHaveProperty('fieldname')
        expect(file).toHaveProperty('encoding')
        expect(file).toHaveProperty('mimetype')
        expect(file).toHaveProperty('originalname')
        expect(file.fieldname).toMatch('myPic')
        expect(file.mimetype).toMatch('image/jpeg')
        expect(file.Location).toMatch('amazonaws')
        done()
      })
  })
  it('upload and delete after', (done) => {
    supertest(app)
      .post('/uploadanddelete')
      .attach('myPic', '__tests__/nodejs-512.png')
      .expect(200, done)
  })
  it('upload and return error, cause transform/resize error', (done) => {
    supertest(app)
      .post('/uploadwithtransformerror')
      .attach('myPic', '__tests__/nodejs-512.png')
      .end((err, res) => {
        expect(res.status).toEqual(400)
        expect(res.body.message).toEqual('Something went wrong when resize')
        done()
      })
  })
  it('upload and return error, cause wrong configuration', (done) => {
    supertest(app)
      .post('/uploadwitherror')
      .attach('myPic', '__tests__/nodejs-512.png')
      .end((err, res) => {
        expect(res.status).toEqual(403)
        expect(res.body.message).toEqual(
          'The request signature we calculated does not match the signature you provided. Check your key and signing method.'
        )
        // expect(true).toBe(true)
        done()
      })
  })
  // it('upload multisize and return error, cause transform/resize error', (done) => {
  //   supertest(app)
  //     .post('/uploadwithmultiplesizetransformerror')
  //     .attach('myPic', 'test/nodejs-512.png')
  //     .end((err, res) => {
  //       expect(res.status).toEqual(400);
  //       expect(res.body.message).toEqual('Something went wrong when resize');
  //       done();
  //     });
  // });
  // it('upload multisize and return error, cause google cloud error', (done) => {
  //   supertest(app)
  //     .post('/uploadwithmultiplesizegcerror')
  //     .attach('myPic', 'test/nodejs-512.png')
  //     .end((err, res) => {
  //       expect(res.status).toEqual(500);
  //       done();
  //     });
  // });
})
