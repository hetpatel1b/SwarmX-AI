module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],
  setupFiles: ["<rootDir>/src/tests/setup.ts"]
};
