import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "mjs"],
  clearMocks: true,
  verbose: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 15000,
  
  // Permitir transformação do @faker-js
  transformIgnorePatterns: [
    "node_modules/(?!@faker-js)",
  ],
  
  // Configuração do ts-jest
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
    // Adicionar suporte para arquivos .mjs e .js do faker
    "^.+\\.(mjs|js)$": ["ts-jest", {
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
      },
    }],
  },
};

export default config;