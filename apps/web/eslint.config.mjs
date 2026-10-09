import { flatConfig } from 'eslint-config-next';

export default flatConfig([
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
  ...flatConfig(),
  {
    rules: {
      '@next/next/no-unused-vars': 'error',
    },
  },
]);
