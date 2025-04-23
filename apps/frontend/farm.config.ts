import { defineConfig } from '@farmfe/core';
import tailwind from '@farmfe/js-plugin-tailwindcss';

export default defineConfig({
  plugins: ['@farmfe/plugin-react', tailwind()],
});
