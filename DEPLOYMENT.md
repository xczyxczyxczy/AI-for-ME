# GitHub Pages 部署

本项目现在采用纯前端方式部署到 GitHub Pages。用户在网页中自行填写
DeepSeek API Key，浏览器直接调用 DeepSeek Chat API，不再需要单独部署
Node.js 后端。

线上访问地址：

```text
https://ai-for-me.xiaocaiziyou.top/
```

## 部署流程

推送 `main` 分支后，GitHub Actions 会把 `public` 目录自动发布到 GitHub
Pages。

仓库 Pages 设置：

```text
Source：GitHub Actions
Custom domain：ai-for-me.xiaocaiziyou.top
```

域名 DNS 设置：

```text
记录类型：CNAME
主机记录：ai-for-me
记录值：xczyxczyxczy.github.io
```

DNS 检查通过后启用 **Enforce HTTPS**。

## 使用说明

1. 打开线上网页。
2. 在 `DeepSeek API Key` 输入框中填入自己的 Key。
3. 输入微电子学习问题。
4. 网页会直接请求 DeepSeek API 并渲染 Markdown 回答。

API Key 只存在于当前网页表单中，本项目不会把它提交到 Git 仓库，也不会默认保存到浏览器本地存储。

## 注意事项

纯前端直连 API 会把用户填写的 API Key 暴露给当前浏览器环境，因此只适合课程演示或个人学习使用。若要做正式产品，仍建议使用后端代理保护 API Key。
