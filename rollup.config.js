import { readFileSync } from 'fs'
import externalGlobals from 'rollup-plugin-external-globals'
import deckyPlugin from '@decky/rollup'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

export default deckyPlugin({
  output: {
    assetFileNames: '[name]-[hash][extname]'
  },
  plugins: [
    externalGlobals({
      '@decky/pkg': JSON.stringify(pkg)
    })
  ]
})
