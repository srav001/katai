import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import sonarjs from 'eslint-plugin-sonarjs';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	{
		name: 'app/files-to-ignore',
		ignores: ['.generated/*', 'src/app.d.ts']
	},

	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	sonarjs.configs.recommended,

	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser
			}
		},

		rules: {
			'@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
			'@typescript-eslint/consistent-type-imports': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'no-constant-binary-expression': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],
			'svelte/valid-compile': 'off'
		}
	},
	{
		files: ['**/*.svelte'],

		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	}
);
