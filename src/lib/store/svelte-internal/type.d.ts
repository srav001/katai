declare module 'svelte/internal/client' {
	// Derived returns signal actually, but we just create a fake type to shut TS
	export function derived<T>(derivation: () => T): () => T;
	export function get<T extends () => infer U>(derived: () => U): U;
}
