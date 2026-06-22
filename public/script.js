const form = document.querySelector("#askForm");
const apiKeyInput = document.querySelector("#apiKey");
const questionInput = document.querySelector("#question");
const answerBox = document.querySelector("#answer");
const statusText = document.querySelector("#status");
const submitButton = document.querySelector("#submitButton");
const clearButton = document.querySelector("#clearButton");
const examples = document.querySelectorAll(".example");
const deepSeekApiUrl = "https://api.deepseek.com/chat/completions";
const deepSeekModel = "deepseek-v4-flash";
const systemPrompt = `
你是“微电子学习问答助手”，服务对象是正在学习微电子、集成电路与半导体基础课程的学生。
回答范围只包括：
1. 半导体物理基础，例如 PN 结、能带、载流子、漂移扩散、复合与产生。
2. 半导体器件，例如二极管、BJT、MOSFET、CMOS 器件、短沟道效应。
3. 集成电路基础，例如 CMOS 反相器、组合/时序逻辑、版图与工艺基础。
4. 模拟/数字电路中与微电子课程相关的概念解释、学习建议和例题分析。
回答要求：
- 使用中文，结构清晰，适合课程学习。
- 可以使用 Markdown 输出小标题、列表、公式说明和代码块，让网页更容易阅读。
- 优先给出概念解释、关键公式含义、直观理解和常见误区。
- 遇到不完整问题时，先说明可能的理解，再给出通用解释，并提示用户补充上下文。
- 不编造教材页码、论文、实验数据或不存在的课程资料。
- 如果用户问题明显超出微电子学习范围，礼貌拒绝，并引导用户改问微电子相关问题。
- 不回答违法、作弊、攻击、隐私窃取等不当请求。
`.trim();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function renderInlineMarkdown(value) {
  const codeSpans = [];
  let html = escapeHtml(value).replace(/`([^`]+)`/g, (_match, code) => {
    const token = `@@CODE_SPAN_${codeSpans.length}@@`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  html = html
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
      return `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  codeSpans.forEach((code, index) => {
    html = html.replace(`@@CODE_SPAN_${index}@@`, code);
  });

  return html;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : "";
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code${language}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length + 2;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(`<li>${renderInlineMarkdown(lines[index].replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(`<li>${renderInlineMarkdown(lines[index].replace(/^\d+\.\s+/, ""))}</li>`);
        index += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quotes = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quotes.push(renderInlineMarkdown(lines[index].replace(/^>\s?/, "")));
        index += 1;
      }
      blocks.push(`<blockquote>${quotes.join("<br>")}</blockquote>`);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index]) &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
  }

  return blocks.join("");
}

function setAnswer(text, type = "normal") {
  answerBox.classList.toggle("empty", type === "empty");
  answerBox.classList.toggle("error", type === "error");
  answerBox.classList.toggle("markdown", type === "normal");

  if (type === "normal") {
    answerBox.innerHTML = renderMarkdown(text);
  } else {
    answerBox.textContent = text;
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "生成中..." : "提交问题";
  statusText.textContent = isLoading ? "正在调用 DeepSeek API，请稍候。" : "";
}

async function askQuestion(question, apiKey) {
  let response;
  try {
    response = await fetch(deepSeekApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: deepSeekModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.3,
        max_tokens: 900,
        stream: false
      })
    });
  } catch {
    throw new Error(
      "无法连接 DeepSeek API，可能是网络异常或浏览器跨域限制。请确认网络可用后重试。"
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.error?.message || data?.message || "请求失败，请检查 API Key 或网络连接。";
    throw new Error(`DeepSeek API 调用失败：${detail}`);
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("模型没有返回可展示的回答。");
  }

  return answer;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const question = questionInput.value.trim();
  if (!apiKey) {
    setAnswer("请输入你的 DeepSeek API Key 后再提交。", "error");
    apiKeyInput.focus();
    return;
  }

  if (!question) {
    setAnswer("请输入一个微电子相关问题后再提交。", "error");
    questionInput.focus();
    return;
  }

  setLoading(true);
  setAnswer("正在整理课程化回答...", "empty");

  try {
    const answer = await askQuestion(question, apiKey);
    setAnswer(answer);
  } catch (error) {
    setAnswer(error.message, "error");
  } finally {
    setLoading(false);
  }
});

clearButton.addEventListener("click", () => {
  questionInput.value = "";
  setAnswer("学习愉快！", "empty");
  statusText.textContent = "";
  questionInput.focus();
});

examples.forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.textContent;
    questionInput.focus();
  });
});
