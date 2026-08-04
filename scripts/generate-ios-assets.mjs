import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const logoPath = join(projectRoot, 'assets', 'logo.svg')
const assetRoot = join(projectRoot, 'ios', 'App', 'App', 'Assets.xcassets')
const iconPath = join(assetRoot, 'AppIcon.appiconset', 'AppIcon-512@2x.png')
const splashRoot = join(assetRoot, 'Splash.imageset')
const splashPaths = [
  join(splashRoot, 'splash-2732x2732.png'),
  join(splashRoot, 'splash-2732x2732-1.png'),
  join(splashRoot, 'splash-2732x2732-2.png'),
]

if (!existsSync(logoPath)) throw new Error('缺少 assets/logo.svg')
if (!existsSync(assetRoot)) throw new Error('未找到 iOS Assets.xcassets，请先执行 npx cap add ios')

await sharp(logoPath)
  .resize(1024, 1024, { fit: 'contain' })
  .flatten({ background: '#0C6FFF' })
  .png()
  .toFile(iconPath)

const splashLogo = await sharp(logoPath)
  .resize(520, 520, { fit: 'contain' })
  .png()
  .toBuffer()

const splash = await sharp({
  create: {
    width: 2732,
    height: 2732,
    channels: 4,
    background: '#0E0F12',
  },
})
  .composite([{ input: splashLogo, gravity: 'centre' }])
  .png()
  .toBuffer()

for (const path of splashPaths) writeFileSync(path, splash)

console.log('[ios-assets] 已生成 1024x1024 图标与 2732x2732 启动画面')
