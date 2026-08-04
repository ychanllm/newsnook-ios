import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'

const pbx = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8')
const plist = readFileSync('ios/App/App/Info.plist', 'utf8')
const launch = readFileSync('ios/App/App/Base.lproj/LaunchScreen.storyboard', 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

assert.doesNotMatch(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.getcapacitor\.App/)
assert.equal(
  (pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = com\.aizeek\.newsnook\.ios;/g) ?? []).length,
  2,
)
assert.equal((pbx.match(/MARKETING_VERSION = 1\.3\.6;/g) ?? []).length, 2)
assert.match(plist, /<string>News Nook<\/string>/)
assert.match(plist, /<key>NSPhotoLibraryUsageDescription<\/key>/)
assert.match(plist, /<key>NSPhotoLibraryAddUsageDescription<\/key>/)
assert.match(plist, /<key>NSAppTransportSecurity<\/key>/)
assert.doesNotMatch(plist, /<key>NSAllowsArbitraryLoads<\/key>/)
assert.match(pbx, /PrivacyInfo\.xcprivacy in Resources/)

const privacyJson = JSON.parse(
  execFileSync('plutil', ['-convert', 'json', '-o', '-', 'ios/App/App/PrivacyInfo.xcprivacy'], {
    encoding: 'utf8',
  }),
)
assert.deepEqual(privacyJson.NSPrivacyAccessedAPITypes, [
  {
    NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
    NSPrivacyAccessedAPITypeReasons: ['C617.1'],
  },
  {
    NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
    NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
  },
])

const plistJson = JSON.parse(
  execFileSync('plutil', ['-convert', 'json', '-o', '-', 'ios/App/App/Info.plist'], {
    encoding: 'utf8',
  }),
)
const ats = plistJson.NSAppTransportSecurity
assert.equal(ats.NSAllowsArbitraryLoads, undefined)
assert.deepEqual(
  Object.keys(ats.NSExceptionDomains).sort(),
  ['126.com', '126.net', '163.com', 'netease.com'],
)
for (const exception of Object.values(ats.NSExceptionDomains)) {
  assert.deepEqual(exception, {
    NSExceptionAllowsInsecureHTTPLoads: true,
    NSIncludesSubdomains: true,
  })
}

assert.match(launch, /red="0\.0549" green="0\.0588" blue="0\.0706"/)
assert.equal(packageJson.scripts['ios:assets'], 'node scripts/generate-ios-assets.mjs')
assert.match(packageJson.scripts['ios:sync'], /^npm run ios:assets && /)

for (const file of [
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png',
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png',
]) {
  assert.equal(existsSync(file), true, `missing iOS image: ${file}`)
  assert.ok(statSync(file).size > 10_000, `unexpectedly small iOS image: ${file}`)
}

const iconInfo = execFileSync(
  'sips',
  ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'],
  { encoding: 'utf8' },
)
assert.match(iconInfo, /pixelWidth: 1024/)
assert.match(iconInfo, /pixelHeight: 1024/)
assert.match(iconInfo, /hasAlpha: no/)

for (const file of [
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png',
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png',
]) {
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  })
  assert.match(info, /pixelWidth: 2732/)
  assert.match(info, /pixelHeight: 2732/)
}

console.log('ios-project: ok')
