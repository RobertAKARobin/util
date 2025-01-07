import { getSum } from './sum';

export const mean = (...inputs: Array<number>) => getSum(...inputs) / inputs.length;
