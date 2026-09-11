# 知识冒险岛 (ANti Study) - 完整上线与多端部署指南

本项目采用全栈前后端一体化架构（Express + SQLite + 原生 iPad H5/PWA），以下为您提供 **3 种上线方案**：

---

## 方案 1：【5分钟最快家庭局域网 iPad 直接使用】（零成本、立即可用）

如果您当前主要是在家里给小朋友在 iPad 上看，电脑和小朋友的 iPad 连着同一个家庭 Wi-Fi：

1. **获取您的电脑局域网 IP 地址**：
   - 当前检测到您的局域网 IP 为：`172.20.10.3`
2. **拿起小朋友的 iPad**：
   - 打开 iPad 自带的 **Safari 浏览器**；
   - 访问地址：
     👉 **`http://172.20.10.3:3300/index.html`**
3. **制作成 iPad 桌面 App（一键全屏）**：
   - 在 iPad Safari 底部或右上角点击 **“分享”按钮 (带箭头的方框)**；
   - 选择 **“添加到主屏幕” (Add to Home Screen)**；
   - 命名为 **“知识冒险岛”**；
   - 此时 iPad 桌面上就会出现专属 App 图标，点击直接进入全屏横屏学习工作台，无浏览器地址栏干扰！

---

## 方案 2：【云服务器公网一键部署】（随时随地访问，推荐）

购买一台阿里云、腾讯云或华为云轻量应用服务器（每月约 20~30 元），即可让小朋友在外面、爷爷奶奶家也能随时看。

### 方式 A：Docker 一键部署（最稳妥，已配置好容器）
1. 将本项目整个文件夹上传至服务器：
   ```bash
   scp -r . root@your-server-ip:/root/antistudy
   ```
2. 在服务器上启动：
   ```bash
   cd /root/antistudy
   docker compose up -d --build
   ```
3. 打开服务器防火墙的安全组端口 `3300`，即可通过 `http://your-server-ip:3300/index.html` 公网访问！

### 方式 B：PM2 进程守护后台部署
1. 在服务器上安装 Node.js 18+ 及 PM2：
   ```bash
   npm install -g pm2 ts-node typescript
   ```
2. 进入目录并启动：
   ```bash
   npm install
   pm2 start backend/server.ts --name "antistudy" --interpreter npx --interpreter-args "ts-node"
   pm2 save
   pm2 startup
   ```

---

## 方案 3：【封装为微信小程序 iPad 横屏版 / 打包为原生 iPad App】

如果后续需要正式在微信生态或者 App Store 上线：

1. **微信小程序（原生横屏模式）**：
   - 在 `app.json` 中配置 `"pageOrientation": "landscape"`（强制横屏）；
   - 前端使用的是极简 HTML5/Tailwind 结构，可以通过 **Taro** 或 **kbone** 一键编译为微信小程序；
   - 视频资源直连后台的 `/uploads` 或接入腾讯云 COS / 阿里云 OSS 对象存储。

2. **iOS / iPad 原生 App (Capacitor / Tauri 打包)**：
   - 使用 Capacitor 一键封装：
     ```bash
     npm install @capacitor/core @capacitor/cli @capacitor/ios
     npx cap init "知识冒险岛" "com.antistudy.app" --web-dir frontend
     npx cap add ios
     npx cap open ios
     ```
   - 在 Xcode 中直接编译签名，即可真机安装到小朋友的 iPad 上！
