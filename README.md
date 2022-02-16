# multer-sharp-s3

[![Build Status](https://travis-ci.org/ikhsanalatsary/multer-sharp-s3.svg?branch=master)](https://travis-ci.org/ikhsanalatsary/multer-sharp-s3)
[![codecov.io](https://codecov.io/gh/ikhsanalatsary/multer-sharp-s3/coverage.svg?branch=master)](https://codecov.io/gh/ikhsanalatsary/multer-sharp?branch=master) [![Depedencies Status](https://david-dm.org/ikhsanalatsary/multer-sharp-s3.svg)](https://david-dm.org/ikhsanalatsary/multer-sharp-s3) [![devDepedencies Status](https://david-dm.org/ikhsanalatsary/multer-sharp-s3/dev-status.svg)](https://david-dm.org/ikhsanalatsary/multer-sharp-s3?type=dev)
[![npm](https://img.shields.io/npm/dm/multer-sharp-s3.svg)](http://npm.im/multer-sharp-s3)
[![Greenkeeper badge](https://badges.greenkeeper.io/ikhsanalatsary/multer-sharp-s3.svg)](https://greenkeeper.io/)

***

Multer Sharp S3 is streaming multer storage engine permit to transform / resize the image and upload to AWS S3.

This project is mostly an integration piece for existing code samples from Multer's [storage engine documentation](https://github.com/expressjs/multer/blob/master/StorageEngine.md). With add-ons include [AWS S3](https://github.com/aws/aws-sdk-js) and [sharp](https://github.com/lovell/sharp)

# Minimum Requirement:

  Node v12.13.0, npm v6+

# Installation

npm:

	npm install --save aws-sdk multer-sharp-s3

yarn:

	yarn add aws-sdk multer-sharp-s3

# Tests
Change aws configuration in your local.

```
yarn test
```

# Importing
### NodeJS

```javascript
const s3Storage = require('multer-sharp-s3');

const storage = s3Storage(options);
```

### TypeScript

```typescript
import * as s3Storage from 'multer-sharp-s3';

const storage = s3Storage(options);
```

# Usage

```javascript
const express = require('express');
const multer = require('multer');
const s3Storage = require('multer-sharp-s3');
const aws = require('aws-sdk');

aws.config.update({
  secretAccessKey: config.uploads.aws.secretAccessKey, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: config.uploads.aws.accessKeyId, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: config.uploads.aws.region, // region of your bucket
})

const s3 = new aws.S3()
const app = express();

// without resize image
const storage = s3Storage({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myImage`,
  ACL: config.uploads.aws.ACL,
})
const upload = multer({ storage: storage })

app.post('/upload', upload.single('myPic'), (req, res) => {
    console.log(req.file); // Print upload details
    res.send('Successfully uploaded!');
});

// or

// single resize without Key
const storage2 = gcsSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  ACL: config.uploads.aws.ACL,
  resize: {
    width: 400,
    height: 400
  },
  max: true
});
const upload2 = multer({ storage: storage2 });

app.post('/uploadandresize', upload2.single('myPic'), (req, res, next) => {
    console.log(req.file); // Print upload details
    res.send('Successfully uploaded!');
});

/* If you need generate image with specific size
 * simply to adding `multiple: true` property and
 * resize must be an `array` and must be include `suffix` property
 * and suffix has a special value that is 'original'
 * it will no transform image, just upload the image as is
 * example below with `Key` as callback function
 */
const storage = s3Storage({
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'))
    })
  },
  s3,
  Bucket: config.uploads.aws.Bucket,
  multiple: true,
  resize: [
    { suffix: 'xlg', width: 1200, height: 1200 },
    { suffix: 'lg', width: 800, height: 800 },
    { suffix: 'md', width: 500, height: 500 },
    { suffix: 'sm', width: 300, height: 300 },
    { suffix: 'xs', width: 100 },
    { suffix: 'original' }
  ],
});
const upload = multer({ storage });

app.post('/uploadmultiplesize', upload.single('myPic'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});

/* 
 *  If the directory property exists, 
 *  the suffix property is ignored and 
 *  inserted separated by Bucket's directory.
 */
const storage3 = s3Storage({
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'))
    })
  },
  s3,
  Bucket: config.uploads.aws.Bucket,
  multiple: true,
  resize: [
    { suffix: 'lg', directory: 'large', width: 800, height: 800 },  // insert BUCKET/large/filename
    { suffix: 'md', directory: 'medium', width: 500, height: 500 }, // insert BUCKET/medium/filename
    { suffix: 'sm', directory: 'small', width: 300, height: 300 },  // insert BUCKET/small/filename
  ],
});
const upload3 = multer({ storage3 });

app.post('/uploadmultiplesize', upload3.single('myPic'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});

// also can upload any file (non image type)
const storage = s3Storage({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myFile`,
  ACL: config.uploads.aws.ACL,
  // resize or any sharp options will ignore when uploading non image file type
  resize: {
    width: 400,
    height: 400,
  },
})
const upload = multer({ storage })

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});

```

for more example you can see [here](https://github.com/ikhsanalatsary/multer-sharp-s3/blob/master/__tests__/implementation.spec.ts)


#### Multer-Sharp-S3 options
multer sharp s3 is inherit from s3 upload property [putObjectRequest](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property).
Below are special / custom options from this package

| option | default | value | role |
| ------ | ------- | ----- | ---- |
| S3 | no | `object` | instance from AWS.S3 class. it mus be specify |
| Key | randomString | `string` or `function` | your s3 Key |
| Bucket | no | `string` | Required your bucket name on AWS S3 to upload. Environment variable - AWS_BUCKET |
| ACL | 'public-read' | `string` | Required acl credentials file for AWS S3 |
| multiple | false | `boolean` | for multiple resize to work |
| resize | no | `object` or `Array<object>` when multiple is true. **Note:** suffix must be specify when using resize as `Array` | size specification |

#### Sharp options
Please visit this **[sharp](http://sharp.pixelplumbing.com/)** for detailed overview of specific option.

multer sharp s3 embraces sharp options, as table below:

| option | default | value | role |
| ------ | ------- | ----- | ---- |
| resize | `undefined` | `object` for output image, as follow: `{ width?: 300, height?: 200, options?: {...resizeOptions} }`. doc: [sharpResizeOptions](https://sharp.pixelplumbing.com/api-resize#resize)  | size specification |
| crop | `undefined`  | | crop image |
| background | `undefined` | | set the background for the embed, flatten and extend operations. |
| embed | `undefined` | | embed on canvas |
| max | `undefined` | | set maximum output dimension  |
| min | `undefined` | | set minimum output dimension |
| withoutEnlargement | `undefined` | | do not enlarge small images |
| ignoreAspectRatio | `undefined` | | ignore aspect ration while resizing images |
| extract | `undefined` | | extract specific part of image |
| trim | `undefined` | | Trim **boring** pixels from all edges |
| flatten | `undefined` | | Merge alpha transparency channel, if any, with background. |
| extend | `undefined` | | Extends/pads the edges of the image with background. |
| negate | `undefined` | | Produces the **negative** of the image. |
| rotate | `undefined` | | Rotate the output image by either an explicit angle |
| flip | `undefined` | | Flip the image about the vertical Y axis. |
| flop | `undefined` | | Flop the image about the horizontal X axis. |
| blur | `undefined` | | Mild blur of the output image |
| sharpen | `undefined` | | Mild sharpen of the output image |
| gamma | `undefined` | | Apply a gamma correction. |
| grayscale *or* greyscale | `undefined` | | Convert to 8-bit greyscale; 256 shades of grey. |
| normalize *or* normalise | `undefined` | | Enhance output image contrast by stretching its luminance to cover the full dynamic range. |
| withMetadata | `undefined` | | Include all metadata (EXIF, XMP, IPTC) from the input image in the output image.
| convolve | `undefined` | | Convolve the image with the specified kernel.
| threshold | `undefined` | | Any pixel value greather than or equal to the threshold value will be set to 255, otherwise it will be set to 0
| toColourspace *or* toColorspace | `undefined` | | Set the output colourspace. By default output image will be web-friendly sRGB, with additional channels interpreted as alpha channels.
| toFormat | `undefined` | `'jpeg'`, `'png'`, `'magick'`, `'webp'`, `'tiff'`, `'openslide'`, `'dz'`, `'ppm'`, `'fits'`, `'gif'`, `'svg'`, `'pdf'`, `'v'`, `'raw'` or `object`. if `object` specify as follow: `{ type: 'png', options: { ...toFormatOptions } }` doc: [sharpToFormat](https://sharp.pixelplumbing.com/api-output#toformat) | type of output file to produce.|


**NOTE** Some of the contents in the above table maybe is not be updated, you can check more [here](https://github.com/ikhsanalatsary/multer-sharp-s3/blob/c40c1d2ed9ace33df51f1ff079d1fb894c521db3/src/get-sharp-options.ts#L3)
***

## Why
Because We need to transform an image using sharp and upload it to AWS S3 using multer middleware at once. Build on top with [TypeScript](https://www.typescriptlang.org/) and reactive using [RxJS](https://rxjs-dev.firebaseapp.com/) as helper library in this package.

![Mantra](http://i.imgur.com/AIimQ8C.jpg)

refer to: [intro rx](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754#modelling-the-3-suggestions-with-streams)

## License
[MIT](http://opensource.org/licenses/MIT)
Copyright (c) 2017 - forever [Abdul Fattah Ikhsan](https://twitter.com/abdfattahikhsan)

