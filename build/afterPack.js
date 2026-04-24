const { execSync } = require('child_process')
const path = require('path')

exports.default = async function (context) {
  if (process.platform === 'darwin') {
    const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
    console.log(`  • afterPack: clearing xattr on ${appPath}`)
    execSync(`xattr -cr "${appPath}"`)
  }
}
