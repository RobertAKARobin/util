#!/usr/bin/env bash

shopt -s globstar # https://stackoverflow.com/a/78041926/2053389 I hate Bash

utils=(components delimiter-pairs emitter math spec .)

rm -rf dist

esbuild --outdir=dist util/**/*.ts util/*.ts
esbuild --outdir=dist --minify --sourcemap --entry-names="[dir]/[name].min" util/**/*.ts util/*.ts
tsc
cp util/**/*.d.ts dist
