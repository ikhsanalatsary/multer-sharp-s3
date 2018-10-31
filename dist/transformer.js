"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sharp = require("sharp");
exports.default = transformer;
function transformer(options) {
    var imageStream = sharp();
    for (var _i = 0, _a = Object.entries(options); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value) {
            imageStream = resolveImageStream(key, value, imageStream);
        }
    }
    return imageStream;
}
var objectHasOwnProperty = function (source, prop) { return Object.prototype.hasOwnProperty.call(source, prop); };
var hasProp = function (value) { return typeof value === 'object' && objectHasOwnProperty(value, 'type'); };
var isObject = function (obj) { return typeof obj === 'object' && obj !== null; };
var validateFormat = function (value) {
    if (hasProp(value)) {
        return value.type;
    }
    return value;
};
var validateValue = function (value) {
    if (typeof value === 'boolean') {
        return null;
    }
    return value;
};
var resolveImageStream = function (key, value, imageStream) {
    if (key === 'resize') {
        imageStream = imageStream.resize(key.width, key.height, key.option);
    }
    else if (key === 'crop') {
        imageStream = imageStream[key](value);
    }
    else if (key === 'toFormat') {
        imageStream = imageStream.toFormat(validateFormat(value), value.options);
    }
    else {
        var valid = validateValue(value);
        imageStream = imageStream[key](valid);
    }
    return imageStream;
};
//# sourceMappingURL=transformer.js.map