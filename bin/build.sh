#!/usr/bin/env bash

shopt -s globstar # https://stackoverflow.com/a/78041926/2053389 I hate Bash

rm -rf dist

esbuild --outdir=dist --format=esm --platform=node util/**/*.ts
# esbuild --outdir=dist --minify --sourcemap --entry-names="[dir]/[name].min" util/**/*.ts
# tsc
# cp util/**/*.d.ts dist
