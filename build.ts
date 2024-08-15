// @ts-nocheck
import { Glob } from 'bun';
import path from 'node:path';

const glob = new Glob('**/*.ts');

const paths = [];

for await (const file of glob.scan('ike/src/runtime/ts')) {
  if (
    file.includes('index.ts')
    // (file.includes('polyfill.ts') && !file.includes('test'))
  ) {
    paths.push(path.join(process.cwd(), 'ike/src/runtime/ts', file));
  }
}

const result = await Bun.build({
  entrypoints: paths,
  bundle: true,
  clean: true,
  external: ['@std/*'],
  bundle: true,
  minfiy: true,
  define: {
    // for web-steams-polyfill
    DEBUG: 'false',
  },
  target: 'bun',
  format: 'esm',
});

for (const res of result.outputs) {
  const name = res.path.replace('ike/src/runtime/ts', '');

  Bun.write(path.join('ike/src/runtime/js', name), res);
}
