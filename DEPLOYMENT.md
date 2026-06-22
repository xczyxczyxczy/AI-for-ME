# GitHub Pages 部署

推送 `main` 分支后，GitHub Actions 会把 `public` 目录自动发布到：

```text
https://ai-for-me.xiaocaiziyou.top/
```

GitHub Pages 只托管静态网页，不能运行 `server.js`，也不能安全保存
`DEEPSEEK_API_KEY`。因此线上问答功能还需要一个单独部署的 Node.js 后端。

后端部署完成后，在仓库的 **Settings > Secrets and variables > Actions >
Variables** 中创建：

```text
API_BASE_URL=https://你的后端域名
```

重新运行 `Deploy frontend to GitHub Pages` 工作流后，网页会把问题发送到：

```text
https://你的后端域名/api/ask
```

本地运行不需要设置该变量，仍使用 `http://localhost:3000/api/ask`。

## 自定义域名

在域名服务商的 DNS 控制台添加一条记录：

```text
记录类型：CNAME
主机记录：ai-for-me
记录值：xczyxczyxczy.github.io
```

然后在 GitHub 仓库的 **Settings > Pages > Custom domain** 中填写
`ai-for-me.xiaocaiziyou.top`，保存并等待 DNS 检查通过。最后启用
**Enforce HTTPS**。
