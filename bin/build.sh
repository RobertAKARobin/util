rm -rf dist
esbuild --outdir=dist *.ts
tsc
cp types.d.ts dist
