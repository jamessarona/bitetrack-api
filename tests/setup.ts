// Global Jest setup. Runs before each test file.
// Keep environment deterministic for tests.
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

jest.setTimeout(15_000);
