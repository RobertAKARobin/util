import { Component } from '../component.ts';

export class Image extends Component.custom(`img`) {}

export const image = Component.init(Image);
