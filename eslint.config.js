import globals from "globals";

const sharedRules = {
    eqeqeq: ["error", "always"],
    "no-redeclare": "error",
    "no-unreachable": "error",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
    "no-var": "error",
    "prefer-const": "error"
};

export default [
    {
        ignores: ["assets/**", "node_modules/**"]
    },
    {
        files: ["script.js", "portfolio-data.js", "js/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser
        },
        rules: sharedRules
    },
    {
        files: ["sw.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: globals.serviceworker
        },
        rules: sharedRules
    },
    {
        files: ["tests/**/*.mjs", "*.config.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.node
        },
        rules: sharedRules
    }
];
