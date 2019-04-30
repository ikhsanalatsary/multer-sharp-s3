'use strict'
const { copyFileSync } = require('fs')
const { resolve } = require('path')
;(function main() {
  const rootDir = resolve(__dirname, '..')
  const srcDir = resolve(rootDir, 'src')
  const distDir = resolve(rootDir, 'dist')
  copyFileSync(
    resolve(srcDir, 'types.d.ts'),
    resolve(distDir, 'types/types.d.ts')
  )
})()
