import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      distDir: 'dist/',
      format: 'esm',
    },
  ],
  declaration: true,
  failOnWarn: false,
});
