utils=(components delimiter-pairs emitter math spec .)

rm -rf dist

for util in ${utils[@]}; do
	esbuild --outdir=dist/$util $util/*.ts
	esbuild --outdir=dist/$util --minify --sourcemap --entry-names="[dir]/[name].min" $util/*.ts
done
tsc
cp types.d.ts dist
