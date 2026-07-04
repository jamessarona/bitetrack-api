import 'reflect-metadata';

process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

jest.setTimeout(15_000);
