# 微电子学习问答助手

这是一个面向微电子课程学习的问答助手。系统使用 DeepSeek 云端 API 作为公开可获得的大语言模型，通过 Prompt 工程限定回答范围，前端网页展示输入与回答，后端负责安全调用模型接口。

## 应用场景

本项目不是通用聊天机器人，而是面向微电子、半导体器件、CMOS 电路、集成电路基础和工艺入门课程的学习问答系统。它适合用于课程概念解释、公式含义理解、常见误区澄清和基础例题分析。

## 系统流程

1. 用户在网页输入微电子学习问题。
2. 前端将问题发送到后端 `POST /api/ask`。
3. 后端加入系统 Prompt，限制模型只回答微电子相关内容。
4. 后端调用 DeepSeek Chat API。
5. DeepSeek 返回回答。
6. 网页展示最终结果。

## 模型使用方式

- 模型来源：DeepSeek 云端 API。
- 默认模型：`deepseek-chat`。
- 使用方式：API 调用 + Prompt 工程。
- Prompt 限制：回答范围限定在半导体物理、器件、CMOS 电路、版图与工艺基础、数字/模拟电路相关课程知识。
- 安全设计：API Key 只保存在后端 `.env` 文件中，不暴露给浏览器。

## 运行方法

安装 Node.js 18 或更高版本后，在项目目录执行：

```bash
npm install
```

复制环境变量示例：

```bash
copy .env.example .env
```

编辑 `.env`，填入你的 DeepSeek API Key：

```bash
DEEPSEEK_API_KEY=你的DeepSeek API Key
DEEPSEEK_MODEL=deepseek-chat
PORT=3000
```

启动服务：

```bash
npm start
```

打开浏览器访问：

```text
http://localhost:3000
```

## 接口说明

### `POST /api/ask`

请求体：

```json
{
  "question": "MOSFET 的工作原理是什么？"
}
```

响应体：

```json
{
  "answer": "模型回答内容"
}
```

## 基本测试

代表性测试样例见 `test-cases.md`。

建议重点测试：

- 正常问题：`请解释 PN 结的内建电场。`
- 正常问题：`CMOS 反相器为什么静态功耗低？`
- 较难问题：`短沟道效应为什么会影响阈值电压？`
- 范围外问题：`帮我写一篇旅游攻略。`
- 异常情况：空输入、未配置 API Key、网络不可用。

## 局限性

- 当前版本未接入课程教材或知识库，因此回答主要依赖 DeepSeek 模型自身知识和 Prompt 约束。
- 模型可能在细节上出错，重要公式推导和考试答案仍需要结合教材、课件或教师讲解核对。
- 没有进行 LoRA/QLoRA 微调，也没有加入 RAG 检索增强。

## 项目结构

```text
.
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js
└── test-cases.md
```
