import assert from 'node:assert/strict'
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

for (const domain of ['163.com', '126.net', '126.com', 'netease.com']) {
  const escapedDomain = domain.replaceAll('.', '\\.')
  assert.match(plist, new RegExp(`<key>${escapedDomain}<\\/key>`))
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

console.log('ios-project: ok')
