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

try {
  await listen();

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  await runTest("GET /health returns 200", async () => {
    const { response } = await requestJson(baseUrl, "GET", "/health");
    assert.equal(response.status, 200);
  });

  await runTest("GET unknown route returns 404", async () => {
    const { response } = await requestJson(baseUrl, "GET", "/does-not-exist");
    assert.equal(response.status, 404);
  });

  const invalidPosts = [
    { name: "POST /api/research validates body", path: "/api/research" },
    { name: "POST /api/factcheck validates body", path: "/api/factcheck" },
    { name: "POST /api/pipeline validates body", path: "/api/pipeline" },
    { name: "POST /api/presentation validates body", path: "/api/presentation" }
  ];

  for (const testCase of invalidPosts) {
    await runTest(testCase.name, async () => {
      const { response } = await requestJson(baseUrl, "POST", testCase.path, {});
      assert.equal(response.status, 400);
    });
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed, ${passed} passed.`);
  process.exit(1);
}

console.log(`\nAll tests passed (${passed}).`);
process.exit(0);
