const form = document.querySelector("#askForm");
const questionInput = document.querySelector("#question");
const answerBox = document.querySelector("#answer");
const statusText = document.querySelector("#status");
const submitButton = document.querySelector("#submitButton");
const clearButton = document.querySelector("#clearButton");
const examples = document.querySelectorAll(".example");

function setAnswer(text, type = "normal") {
  answerBox.textContent = text;
  answerBox.classList.toggle("empty", type === "empty");
  answerBox.classList.toggle("error", type === "error");
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "生成中..." : "提交问题";
  statusText.textContent = isLoading ? "正在调用 DeepSeek API，请稍候。" : "";
}

async function askQuestion(question) {
  const response = await fetch("/api/ask", {
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
  setAnswer("这里会显示 DeepSeek 根据微电子限定 Prompt 返回的回答。", "empty");
  statusText.textContent = "";
  questionInput.focus();
});

examples.forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.textContent;
    questionInput.focus();
  });
});
