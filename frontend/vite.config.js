// vite.config.js
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import handlebars from 'vite-plugin-handlebars'

// create __dirname equivalent for es modules
const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
    }),
  ],
};

