import typescriptPlugin from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  plugins: [
    typescriptPlugin({
      useTsconfigDeclarationDir: true,
    }),
  ],
  output: [
    { file: 'dist/paintbot-client.js', format: 'cjs', sourcemap: true },
    { file: 'dist/paintbot-client.mjs', format: 'esm', sourcemap: true },
  ],
};
