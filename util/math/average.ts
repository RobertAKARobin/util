import { getSum } from './sum.ts';

export const mean = (...inputs: Array<number>) => getSum(...inputs) / inputs.length;
