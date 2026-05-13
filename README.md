# Deep Learning Knowledge Guide

基于 Ian Goodfellow 等《Deep Learning》的中文知识导览网站。

这个站点是一个无构建步骤的静态学习产品，适合直接部署到 GitHub Pages。

## 内容

- 原书三大部分与 20 章章节导航
- 原书对照、阅读建议、精读/略读标记
- 公式速查与 MathJax 渲染
- 深色模式、搜索、阅读检查清单
- 线性代数、贝叶斯、梯度下降、神经网络、CNN、RNN 等交互式可视化模块

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
