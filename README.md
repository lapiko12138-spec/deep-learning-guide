# Deep Learning Knowledge Guide

基于 Ian Goodfellow 等《Deep Learning》的中文知识导览网站。

这个站点是一个无构建步骤的静态学习产品，适合直接部署到 GitHub Pages。

## 内容

- 原书三大部分与 20 章章节导航
- 原书对照、阅读建议、精读/略读标记
- 公式速查与 MathJax 渲染
- 深色模式、搜索、阅读检查清单
- 本地学习记忆：章节笔记、复习队列、公式收藏、导出/导入
- 线性代数、贝叶斯、梯度下降、神经网络、CNN、RNN 等交互式可视化模块

## 记忆储存

当前版本使用浏览器 `localStorage` 保存学习记忆，适合 GitHub Pages 这类静态托管：

- 同一浏览器会长期保留笔记、复习队列、收藏和检查清单
- 可以在“学习记忆库”导出 JSON 备份，也可以导入到另一台设备
- 若需要账号登录和跨设备自动同步，应再接入 Supabase、Firebase 或自建 API + 数据库

## 本地运行

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/index.html
```

## 部署

仓库根目录就是 GitHub Pages 的发布目录。Pages source 设置为：

- Branch: `main`
- Folder: `/`
