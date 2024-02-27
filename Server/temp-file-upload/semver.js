#!/usr/bin/env node
// Standalone semver comparison program.
// Exits successfully and prints matching version(s) if
// any supplied version is valid and passes all tests.

const argv = process.argv.slice(2)

let versions = []

const range = []

let inc = null

const version = require('../package.json').version

let loose = false

let includePrerelease = false

let coerce = false

let rtl = false

let identifier

const semver = require('../')

let reverse = false

const options = {}

const main = () => {
  if (!argv.length) return help()
  while (argv.length) {
    let a = argv.shift()
    const indexOfEqualSign = a.indexOf('=')
    if (indexOfEqualSign !== -1) {
      a = a.slice(0, indexOfEqualSign)
      argv.unshift(a.slice(indexOfEqualSign + 1))
    }
    switch (a) {
      case '-rv': case '-rev': case '--rev': case '--reverse':
        reverse = true
        break
      case '-l': case '--loose':
        loose = true
        break
      case '-p': case '--include-prerelease':
        includePrerelease = true
        break
      case '-v': case '--version':
        versions.push(argv.shift())
        break
      case '-i': case '--inc': case '--increment':
        switch (argv[0]) {
          case 'major': case 'minor': case 'patch': case 'prerelease':
          case 'premajor': case 'preminor': case 'prepatch':
            inc = argv.shift()
            break
          default:
            inc = 'patch'
            break
        }
        break
      case '--preid':
        identifier = argv.shift()
        break
      case '-r': case '--range':
        range.push(argv.shift())
        break
      case '-c': case '--coerce':
        coerce = true
        break
      case '--rtl':
        rtl = true
        break
      case '--ltr':
        rtl = false
        break
      case '-h': case '--help': case '-?':
        return help()
      default:
        versions.push(a)
        break
    }
  }

  const options = { loose: loose, includePrerelease: includePrerelease, rtl: rtl }

  versions = versions.map((v) => {
    return coerce ? (semver.coerce(v, options) || { version: v }).version : v
  }).filter((v) => {
    return semver.valid(v)
  })
  if (!versions.length) return fail()
  if (inc && (versions.length !== 1 || range.length)) { return failInc() }

  for (let i = 0, l = range.length; i < l; i++) {
    versions = versions.filter((v) => {
      return semver.satisfies(v, range[i], options)
    })
    if (!versions.length) return fail()
  }
  return success(versions)
}


const failInc = () => {
  console.error('--inc can only be used on a single version with no range')
  fail()
}

const fail = () => process.exit(1)

const success = () => {
  const compare = reverse ? 'rcompare' : 'compare'
  versions.sort((a, b) => {
    return semver[compare](a, b, options)
  }).map((v) => {
    return semver.clean(v, options)
  }).map((v) => {
    return inc ? semver.inc(v, inc, options, identifier) : v
  }).forEach((v, i, _) => { console.log(v) })
}

const help = () => console.log(
`SemVer ${version}

A JavaScript implementation of the https://semver.org/ specification
Copyright Isaac Z. Schlueter

Usage: semver [options] <version> [<version> [...]]
Prints valid versions sorted by SemVer precedence

Options:
-r --range <range>
        Print versions that match the specified range.

-i --increment [<level>]
        Increment a version by the specified level.  Level can
        be one of: major, minor, patch, premajor, preminor,
        prepatch, or prerelease.  Default level is 'patch'.
        Only one version may be specified.

--preid <identifier>
        Identifier to be used to prefix premajor, preminor,
        prepatch or prerelease version increments.

-l --loose
        Interpret versions and ranges loosely

-p --include-prerelease
        Always include prerelease versions in range matching

-c --coerce
        Coerce a string into SemVer if possible
        (does not imply --loose)

--rtl
        Coerce version strings right to left

--ltr
        Coerce version strings left to right (default)

Program exits successfully if any valid version satisfies
all supplied ranges, and prints all satisfying versions.

If no satisfying versions are found, then exits failure.

Versions are printed in ascending order, so supplying
multiple versions to the utility will just sort them.`)

main()
ndefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier)
        this.inc('pre', identifier)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier)
        }
        this.inc('pre', identifier)
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0]
            }
          } else {
            this.prerelease = [identifier, 0]
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format()
    this.raw = this.version
    return this
  }
}

module.exports = SemVer
