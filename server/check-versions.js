var semver = require('semver')
var chalk = require('chalk')
var packageConfig = require('../../engines.json')
var npm = require('npm')
var exec = function (cmd) {
  return require('child_process')
    .execSync(cmd).toString().trim()
}

var versionRequirements = [
  {
    name: 'node',
    currentVersion: semver.clean(process.version),
    versionRequirement: packageConfig.engines.node
  },
  {
    name: 'npm',
    currentVersion: npm.version,
    versionRequirement: packageConfig.engines.npm
  }
]

module.exports = function () {

  var warnings = [];

  // Check needed version requirements recording warnings if so.
  console.log(chalk.yellow('Checking ' + versionRequirements.length + ' version requirement(s):'));
  for (var i = 0; i < versionRequirements.length; i++) {
    var mod = versionRequirements[i]
    var result
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(mod.name + ': ' +
        chalk.red(mod.currentVersion) + ' should be ' +
        chalk.green(mod.versionRequirement)
      )
      result = chalk.red(mod.currentVersion);
    } else {
      result = chalk.green(mod.currentVersion);
    }
    console.log('.... Checking ' + mod.name + ' to be ' + mod.versionRequirement + '... ' + result);
  }

  // If warnings are not empty log them and stop process.
  if (warnings.length) {
    console.log('')
    console.log(chalk.red('To use this application, you must update following to modules:'))
    console.log()
    for (var i = 0; i < warnings.length; i++) {
      var warning = warnings[i]
      console.log('  ' + warning)
    }
    console.log()
    process.exit(1)
  }
}
