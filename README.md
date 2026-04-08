# Flix 2.0 官网

🔗 **在线预览：[https://lemotd.github.io/Flix_website/](https://lemotd.github.io/Flix_website/)**

基于 Figma 设计稿实现的 Flix 2.0 产品官网，纯静态页面，无框架依赖。

## 项目结构

```
├── index.html          # 页面主体
├── style.css           # 样式（支持 light/dark 模式）
├── smooth-corners.js   # 圆角辅助脚本
├── build-fonts.sh      # 字体子集化脚本
├── assets/             # 图片资源
├── fonts/              # 字体文件（woff2 子集）
│   └── src/            # 字体源文件（不提交，见下方说明）
└── color/              # Figma 导出的颜色 token
    ├── light mode.tokens.json
    └── dark mode.tokens.json
```

## 颜色系统

所有颜色绑定 `color/` 目录下的 token 文件，通过 CSS 变量实现 light/dark 模式切换，跟随系统 `prefers-color-scheme` 自动切换。

## 字体管理

字体使用 MiSans，经过子集化处理，仅包含网页中实际用到的字符（约 300 个），从原始 19MB 压缩至约 100KB。

### 更新字体子集

修改网页文案后，如果新增了字符，需要重新生成字体子集：

1. 将 MiSans 原始字体文件放入 `fonts/src/` 目录：
   - `MiSans-Regular.otf`
   - `MiSans-Medium.otf`
   - `MiSans-Demibold.otf`

2. 安装依赖（仅首次）：
   ```bash
   pip3 install fonttools brotli
   ```

3. 运行脚本：
   ```bash
   ./build-fonts.sh
   ```

> `fonts/src/` 已加入 `.gitignore`，原始字体不会提交到仓库。

## 本地预览

用任意静态服务器打开即可，例如：

```bash
npx serve .
```
