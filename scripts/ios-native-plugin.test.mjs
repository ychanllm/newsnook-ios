import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const plugin = readFileSync('ios/App/App/DeviceMediaControlsPlugin.swift', 'utf8')
const controller = readFileSync('ios/App/App/MainViewController.swift', 'utf8')
const storyboard = readFileSync('ios/App/App/Base.lproj/Main.storyboard', 'utf8')
const pbx = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8')

assert.match(plugin, /public let jsName = "DeviceMediaControls"/)
for (const method of [
  'getBrightness',
  'setBrightness',
  'clearBrightness',
  'getVolume',
  'setVolume',
]) {
  assert.match(plugin, new RegExp(`CAPPluginMethod\\(name: "${method}"`))
  assert.match(plugin, new RegExp(`@objc func ${method}\\(`))
}
assert.match(plugin, /UIApplication\.didEnterBackgroundNotification/)
assert.match(plugin, /MPVolumeView/)
assert.match(controller, /registerPluginInstance\(DeviceMediaControlsPlugin\(\)\)/)
assert.match(storyboard, /customClass="MainViewController"/)
assert.match(pbx, /DeviceMediaControlsPlugin\.swift in Sources/)
assert.match(pbx, /MainViewController\.swift in Sources/)
assert.doesNotMatch(plugin + controller + storyboard, /MlKitTranslation/)

console.log('ios-native-plugin: ok')
