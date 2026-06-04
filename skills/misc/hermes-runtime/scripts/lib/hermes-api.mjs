export function makeHeaders(apiKey) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return headers;
}

export async function healthCheck(baseUrl, apiKey) {
  const res = await fetch(`${baseUrl}/health`, { headers: makeHeaders(apiKey) });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return await res.json();
}

export async function chat(baseUrl, messages, options = {}) {
  const { apiKey, system, stream = false } = options;

  const body = {
    model: "hermes-agent",
    messages: [],
    stream,
  };

  if (system) {
    body.messages.push({ role: "system", content: system });
  }

  if (typeof messages === "string") {
    body.messages.push({ role: "user", content: messages });
  } else {
    body.messages.push(...messages);
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat failed (${res.status}): ${text}`);
  }

  if (!stream) {
    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      model: data.model,
      usage: data.usage,
      finishReason: data.choices?.[0]?.finish_reason,
    };
  }

  return res;
}

export async function streamChat(baseUrl, messages, options = {}) {
  const res = await chat(baseUrl, messages, { ...options, stream: true });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              yield { type: "delta", content: delta };
            }
          } catch {}
        }
      }
    },
    getFullContent() {
      return fullContent;
    },
  };
}

export async function createRun(baseUrl, input, options = {}) {
  const { apiKey, instructions, sessionId, previousResponseId } = options;

  const body = { input };
  if (instructions) body.instructions = instructions;
  if (sessionId) body.session_id = sessionId;
  if (previousResponseId) body.previous_response_id = previousResponseId;

  const res = await fetch(`${baseUrl}/v1/runs`, {
    method: "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create run failed (${res.status}): ${text}`);
  }

  return await res.json();
}

export async function* streamRunEvents(baseUrl, runId, options = {}) {
  const { apiKey } = options;

  const res = await fetch(`${baseUrl}/v1/runs/${runId}/events`, {
    headers: makeHeaders(apiKey),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stream events failed (${res.status}): ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let currentEvent = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("event: ")) {
        currentEvent = trimmed.slice(7);
      } else if (trimmed.startsWith("data: ")) {
        const data = trimmed.slice(6);
        try {
          const parsed = JSON.parse(data);
          yield { event: currentEvent || parsed.event, ...parsed };
        } catch {}
        currentEvent = null;
      }
    }
  }
}

export async function listJobs(baseUrl, options = {}) {
  const { apiKey } = options;
  const res = await fetch(`${baseUrl}/api/jobs`, { headers: makeHeaders(apiKey) });
  if (!res.ok) throw new Error(`List jobs failed: ${res.status}`);
  return await res.json();
}

export async function createJob(baseUrl, job, options = {}) {
  const { apiKey } = options;
  const res = await fetch(`${baseUrl}/api/jobs`, {
    method: "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error(`Create job failed: ${res.status}`);
  return await res.json();
}

export async function deleteJob(baseUrl, jobId, options = {}) {
  const { apiKey } = options;
  const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
    method: "DELETE",
    headers: makeHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Delete job failed: ${res.status}`);
  return await res.json();
}
