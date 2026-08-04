# NewsNook iOS 编译说明

## 环境

- macOS
- Node.js 22 或更高版本
- Xcode 26 或更高版本（Capacitor 8 当前官方要求）
- Apple ID；真机安装需要在 Xcode 中选择自己的开发团队

## 安装与同步

在项目根目录执行：

```bash
npm ci --registry=https://registry.npmjs.org
npm run ios:sync
```

`ios:sync` 会重新生成 iOS 图标和启动画面、构建 React 页面，并将 Web 产物与 Capacitor 插件同步到 iOS 工程。

仓库根目录的 `capacitor.config.ts` 保留 Android 已发布包使用的 `com.aizeek.newsnook`；现有 iOS target 的 Bundle Identifier 单独固定为 `com.aizeek.newsnook.ios`。不要删除 `ios/` 后直接重新执行 `cap add ios`，否则需要重新设置 iOS Bundle Identifier 和本文列出的原生配置。

## 打开 Xcode

执行：

```bash
npm run ios:open
```

也可以直接打开 `ios/App/App.xcodeproj`。本项目使用 Swift Package Manager，不需要执行 `pod install`。

## 模拟器运行

1. 在 Xcode 顶部 Scheme 中选择 `App`。
2. 选择任一 iOS 15 或更高版本的 iPhone Simulator。
3. 按 `Command + R`。

命令行无签名编译：

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

## 真机签名

1. 在 Xcode 左侧选择 `App` 工程，再选择 `App` target。
2. 打开 `Signing & Capabilities`。
3. 勾选 `Automatically manage signing`。
4. 在 `Team` 中选择自己的 Apple Developer Team。
5. 保持 Bundle Identifier 为 `com.aizeek.newsnook.ios`；如果该标识在你的团队中不可用，改成你自己的唯一标识。
6. 连接 iPhone，选择设备后按 `Command + R`。

## 首版功能边界

- 支持 Google、Azure、DeepL、DeepLX 云翻译。
- 不包含 ML Kit 离线翻译与语言模型下载。
- 新闻源、偏好、历史、稍后读和缓存仍保存在本机。
- Apple Developer 证书、发布描述文件和 App Store Connect 记录不保存在仓库。

## App Store 隐私配置

工程已包含 `PrivacyInfo.xcprivacy`，声明 Filesystem 文件时间戳与 Preferences UserDefaults 所需的 Required Reason API。准备提交 App Store Connect 时，仍需按实际发布版本在后台核对并填写 App Privacy 数据收集问卷；若后续新增原生插件，也要重新检查插件要求的隐私清单条目。

## 真机检查清单

- 冷启动时系统启动页和 React 启动画面之间无白屏。
- 首页能刷新信源，文章正文、图片和视频能够打开。
- 云翻译配置能保存，HTTPS 翻译请求能够完成。
- 图片保存首次请求相册权限；拒绝权限不会导致页面退出。
- 图片分享能够调起系统分享面板。
- 全屏视频左侧竖滑调整亮度，退出全屏或切到后台后恢复原亮度。
- 全屏视频右侧竖滑调整系统媒体音量。
- 深浅色状态栏、安全区和横竖屏布局正常。

## iOS 媒体音量说明

iOS 没有公开的直接设置系统媒体音量 API。本项目通过公开的 `MPVolumeView` 控件尝试调整系统媒体音量；如果当前系统版本或音频路由没有提供可调滑块，应用会自动退回为调整当前视频元素音量，不会导致播放器退出。系统媒体音量效果需在实际支持版本的 iPhone 上确认，不能仅以模拟器结果作为结论。
