"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sharp = require("sharp");
exports.default = transformer;
let dynamicParamMethods = new Map([
    ['gamma', 'gamma'],
    ['median', 'median'],
    ['rotate', 'rotate'],
    ['trim', 'trim'],
]);
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
const validateValueForRelatedKey = (key, value) => {
    if (dynamicParamMethods.has(key)) {
        if (typeof value === 'boolean') {
            if (value) {
                return undefined;
            }
        }
    }
    return value;
};
const resolveImageStream = (key, value, size, imageStream) => {
    if (key === 'resize') {
        if (!Array.isArray(size)) {
            imageStream = imageStream.resize(size.width, size.height, size.options);
        }
    }
    else if (key === 'toFormat') {
        imageStream = imageStream.toFormat(validateFormat(value), value.options);
    }
    else if (key === 'linear') {
        if (typeof value === 'boolean') {
            imageStream = imageStream.linear();
        }
        else {
            imageStream = imageStream.linear(...value);
        }
    }
    else if (key === 'joinChannel') {
        imageStream = imageStream.joinChannel(value.images, value.options);
    }
    else {
        const validValue = validateValueForRelatedKey(key, value);
        imageStream = imageStream[key](validValue);
    }
    return imageStream;
};
//# sourceMappingURL=transformer.js.map