import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        include: ["tests/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: ["src/**/*.ts"],
            exclude: [
                ...defaultExclude,
                "**/*.test.ts",
                "**/node_modules/**",
                "src/config/**",
                "src/controllers/**",
                "src/routes/**"
            ]
        }
    }
});