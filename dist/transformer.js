"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sharp = require("sharp");
exports.default = transformer;
function transformer(options, size) {
    let imageStream = sharp();
    for (const [key, value] of Object.entries(options)) {
        if (value) {
            imageStream = resolveImageStream(key, value, size, imageStream);
        }
    }
    return imageStream;
}
const objectHasOwnProperty = (source, prop) => Object.prototype.hasOwnProperty.call(source, prop);
const hasProp = (value) => typeof value === 'object' && objectHasOwnProperty(value, 'type');
const validateFormat = (value) => {
    if (hasProp(value)) {
        return value.type;
    }
    return value;
};
const validateValue = (value) => {
    if (typeof value === 'boolean') {
        return null;
    }
    return value;
};
const resolveImageStream = (key, value, size, imageStream) => {
    if (key === 'resize') {
        imageStream = imageStream.resize(size.width, size.height, size.options);
    }
    else if (key === 'crop') {
        imageStream = imageStream[key](value);
    }
    else if (key === 'toFormat') {
        imageStream = imageStream.toFormat(validateFormat(value), value.options);
    }
    else {
        const valid = validateValue(value);
        imageStream = imageStream[key](valid);
    }
    return imageStream;
};
//# sourceMappingURL=transformer.js.map