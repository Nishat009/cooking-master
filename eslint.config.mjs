import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // These effects synchronize API/browser storage with the component state.
    files: ['src/hooks/**/*.ts'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'test-results/**', 'tests/**', 'next-env.d.ts']),
]);
