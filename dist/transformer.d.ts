import * as sharp from 'sharp';
import { ResizeOption, SharpOptions } from './types';
export default transformer;
declare function transformer(options: SharpOptions, size: ResizeOption): sharp.SharpInstance;
