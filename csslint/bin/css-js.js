#!/usr/bin/env node

import { cssJs } from '../css-js.js';

const [ _env, _path, source, target ] = process.argv;

cssJs(source, target);
