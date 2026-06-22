const form = document.querySelector("#askForm");
const questionInput = document.querySelector("#question");
const answerBox = document.querySelector("#answer");
const statusText = document.querySelector("#status");
const submitButton = document.querySelector("#submitButton");
const clearButton = document.querySelector("#clearButton");
const examples = document.querySelectorAll(".example");
const apiBaseUrl = (window.APP_CONFIG?.apiBaseUrl || "").replace(/\/$/, "");
const isGitHubPages = window.location.hostname.endsWith("github.io");

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

async function askQuestion(question) {
  if (isGitHubPages && !apiBaseUrl) {
    throw new Error(
      "网页已部署到 GitHub Pages，但线上问答后端尚未配置。请先设置仓库变量 API_BASE_URL。"
    );
  }

  const response = await fetch(`${apiBaseUrl}/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "请求失败，请检查后端服务。");
  }

  return data.answer;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();
  if (!question) {
    setAnswer("请输入一个微电子相关问题后再提交。", "error");
    questionInput.focus();
    return;
  }

  setLoading(true);
  setAnswer("正在整理课程化回答...", "empty");

  try {
    const answer = await askQuestion(question);
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
