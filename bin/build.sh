utils=(components delimiter-pairs emitter math spec .)

git clean -xfd util/

esbuild --outdir=util util/**/*.ts util/*.ts
esbuild --outdir=util --minify --sourcemap --entry-names="[dir]/[name].min" util/**/*.ts util/*.ts
tsc
cp util/types.d.ts dist
