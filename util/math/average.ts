import { sum } from './sum.ts';

export const mean = (...inputs: Array<number>) => sum(...inputs) / inputs.length;
