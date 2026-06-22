# 微电子学习问答助手

这是一个面向微电子课程学习的问答助手。项目使用 DeepSeek 云端 API 作为公开可获得的大语言模型，通过 Prompt 工程限定回答范围，并用 HTML 网页展示输入、模型调用和回答结果。

## 应用场景

本项目不是通用聊天机器人，而是面向微电子、半导体器件、CMOS 电路、集成电路基础和工艺入门课程的学习问答系统。它适合用于课程概念解释、公式含义理解、常见误区澄清和基础例题分析。

## 系统流程

1. 用户在网页输入自己的 DeepSeek API Key。
2. 用户输入微电子学习问题。
3. 前端加入系统 Prompt，限制模型只回答微电子相关内容。
4. 浏览器直接调用 DeepSeek Chat API。
5. DeepSeek 返回回答。
6. 网页以 Markdown 格式渲染最终结果。

## 模型使用方式

- 模型来源：DeepSeek 云端 API。
- 默认模型：`deepseek-v4-flash`。
- 使用方式：API 调用 + Prompt 工程。
- Prompt 限制：回答范围限定在半导体物理、器件、CMOS 电路、版图与工艺基础、数字/模拟电路相关课程知识。

## 运行方式

项目是静态网页，直接部署 `public` 目录即可。GitHub Pages 访问地址：

```text
https://ai-for-me.xiaocaiziyou.top/
```

本地预览可以使用任意静态服务器，也可以继续用已有的本地服务访问：

```text
http://localhost:3000
```

## 基本测试

代表性测试样例见 `test-cases.md`。

建议重点测试：

- 正常问题：`请解释 PN 结的内建电场。`
- 正常问题：`CMOS 反相器为什么静态功耗低？`
- 较难问题：`短沟道效应为什么会影响阈值电压？`
- 范围外问题：`帮我写一篇旅游攻略。`
- 异常情况：空问题、未填写 API Key、API Key 无效、网络不可用。

## 局限性

- 纯前端直连 API 会让 API Key 暴露在当前浏览器环境中，只适合课程演示或个人学习。
- 当前版本未接入课程教材或知识库，回答主要依赖 DeepSeek 模型自身知识和 Prompt 约束。
- 模型可能在细节上出错，重要公式推导和考试答案仍需要结合教材、课件或教师讲解核对。
- 没有进行 LoRA/QLoRA 微调，也没有加入 RAG 检索增强。

## 项目结构

```text
.
├── public/
│   ├── CNAME
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── .github/workflows/pages.yml
├── README.md
├── DEPLOYMENT.md
└── test-cases.md
```
