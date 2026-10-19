import { flatConfig } from 'eslint-config-next';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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
