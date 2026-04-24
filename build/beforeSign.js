const { execSync } = require('child_process')

exports.default = async function (context) {
  if (process.platform === 'darwin') {
    console.log(`  • beforeSign: clearing xattr on ${context.appOutDir}`)
    execSync(`xattr -cr "${context.appOutDir}"`)
  }
}
