import { createStore } from '$lib/store/index.svelte.js';

export const testStore = createStore({
	name: 'test',
	state: {
		counter: 0
	}
});

type Getter<T> = Record<string, (this: { state: T }) => any>;
type Setter<T> = Record<string, (this: { state: T }, payload: any) => void>;

type Store<T, U extends Getter<T>, Y extends Setter<T>> = {
	name: string;
	state: T;
	getter: U;
	setter: Y;
};

type StoreValue<T, U extends Getter<T>, Y extends Setter<T>> = U & Y;

declare function createStores<T, U extends Getter<T>, Y extends Setter<T>>(
	store: Store<T, U, Y>
): () => StoreValue<T, U, Y>;

const useStore = createStores({
	name: 'new',
	state: {
		counter: 0
	},
	getter: {
		getCounter() {
			return this.state.counter;
		}
	},
	setter: {
		setCounter(payload: number) {
			this.state.counter = payload;
		}
	}
});

const store = useStore();

store.getCounter();
