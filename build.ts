// @ts-nocheck
import { Glob } from 'bun';
import path from 'node:path';

const glob = new Glob('**/*.ts');

const paths = [];

for await (const file of glob.scan('ike/src/runtime/ts')) {
  if (file.includes('index.ts')) {
    paths.push(path.join(process.cwd(), 'ike/src/runtime/ts', file));
  }
}

const res = await Bun.build({
  entrypoints: paths,
  bundle: true,
  outdir: 'ike/src/runtime/js',
  clean: true,
  external: ['@std/*'],
  bundle: true,
});

console.log(res);
