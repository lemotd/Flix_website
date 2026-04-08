# Flix 2.0 官网

🔗 **在线预览：[https://lemotd.github.io/Flix_website/](https://lemotd.github.io/Flix_website/)**

基于 Figma 设计稿实现的 Flix 2.0 产品官网，纯静态页面，无框架依赖。

## 项目结构

```
├── index.html          # 页面主体
├── feedback.html       # 反馈页面
├── style.css           # 样式（支持 light/dark 模式）
├── feedback.css        # 反馈页样式
├── smooth-corners.js   # 圆角辅助脚本
├── assets/             # 图片资源
├── fonts/              # 字体文件（woff2）
└── color/              # Figma 导出的颜色 token
    ├── light mode.tokens.json
    └── dark mode.tokens.json
```

## 颜色系统

所有颜色绑定 `color/` 目录下的 token 文件，通过 CSS 变量实现 light/dark 模式切换，跟随系统 `prefers-color-scheme` 自动切换。

## 字体

字体使用 MiSans（Regular / Medium / Demibold），以 woff2 格式加载。

## 本地预览

用任意静态服务器打开即可，例如：

```bash
npx serve .
```
