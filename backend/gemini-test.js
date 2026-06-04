import http from "node:http";
import assert from "node:assert/strict";
import app from "./app.js";

const server = http.createServer(app);

const listen = () =>
  new Promise((resolve) => {
    server.listen(0, resolve);
  });

const requestJson = async (baseUrl, method, path, body) => {
  const options = {
    method,
    headers: {}
  };

  if (body !== undefined) {
    options.headers["content-type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { response, data };
};

let passed = 0;
let failed = 0;

const runTest = async (name, fn) => {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed += 1;
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
};

(async () => {
  try {
    await listen();

    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    await runTest("POST /api/research with valid query returns 200", async () => {
      const { response, data } = await requestJson(baseUrl, "POST", "/api/research", {
        query: "What is the capital of France?"
      });
      assert.equal(response.status, 200);
      assert.ok(data.result);
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed, ${passed} passed.`);
    process.exit(1);
  }

  console.log(`\nAll tests passed (${passed}).`);
  process.exit(0);
})();
