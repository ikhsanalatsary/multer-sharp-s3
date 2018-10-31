"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var S3Storage = /** @class */ (function () {
    function S3Storage(options) {
        options.Bucket = options.Bucket || process.env.AWS_BUCKET || null;
        options.ACL = options.ACL || process.env.AWS_ACL || 'public-read';
        options.s3 = options.s3;
        if (!options.Bucket) {
            throw new Error('You have to specify bucket for AWS S3 to work.');
        }
        if (!options.s3) {
            throw new Error('You have to specify bucket for AWS S3 to work.');
        }
        this.opts = options;
    }
    S3Storage.prototype._handleFile = function (req, file, cb) {
    };
    S3Storage.prototype._removeFile = function (req, file, cb) {
    };
    return S3Storage;
}());
function s3Storage(options) {
    return new S3Storage(options);
}
exports.default = s3Storage;
//# sourceMappingURL=main.js.map