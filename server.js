import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const apiUrl =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const systemPrompt = `
你是“微电子学习问答助手”，服务对象是正在学习微电子、集成电路与半导体基础课程的学生。

回答范围只包括：
1. 半导体物理基础，例如 PN 结、能带、载流子、漂移扩散、复合与产生。
2. 半导体器件，例如二极管、BJT、MOSFET、CMOS 器件、短沟道效应。
3. 集成电路基础，例如 CMOS 反相器、组合/时序逻辑、版图与工艺基础。
4. 模拟/数字电路中与微电子课程相关的概念解释、学习建议和例题分析。

回答要求：
- 使用中文，结构清晰，适合课程学习。
- 优先给出概念解释、关键公式含义、直观理解和常见误区。
- 遇到不完整问题时，先说明可能的理解，再给出通用解释，并提示用户补充上下文。
- 不编造教材页码、论文、实验数据或不存在的课程资料。
- 如果用户问题明显超出微电子学习范围，礼貌拒绝，并引导用户改问微电子相关问题。
- 不回答违法、作弊、攻击、隐私窃取等不当请求。
`.trim();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model,
    hasApiKey: Boolean(process.env.DEEPSEEK_API_KEY)
  });
});

app.post("/api/ask", async (req, res) => {
  const question =
    typeof req.body?.question === "string" ? req.body.question.trim() : "";

  if (!question) {
    return res.status(400).json({ error: "请输入一个微电子相关问题。" });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(500).json({
      error: "后端尚未配置 DEEPSEEK_API_KEY，请先根据 .env.example 创建 .env 文件。"
    });
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.3,
        max_tokens: 900
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data?.error?.message || data?.message || "模型服务返回异常。";
      return res.status(response.status).json({
        error: `DeepSeek API 调用失败：${detail}`
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return res.status(502).json({ error: "模型没有返回可展示的回答。" });
    }

    res.json({ answer });
  } catch (error) {
    res.status(502).json({
      error: `无法连接 DeepSeek API：${error.message}`
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "未找到该接口。" });
});

app.listen(port, () => {
  console.log(`Microelectronics Q&A assistant is running at http://localhost:${port}`);
});
