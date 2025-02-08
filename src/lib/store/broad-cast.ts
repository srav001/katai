type Listener<T> = (message: T) => void;

/**
 * A utility to sync state across tabs using the Broadcast Channel API.
 *
 * This utility helps in initializing state within a state management library
 * and synchronizing it across different tabs. It also prevents duplicate
 * broadcasts to avoid infinite loops.
 *
 * @template T The type of the state being synchronized.
 */
class BroadcastState<T> {
	private channel: BroadcastChannel;
	private lastBroadcast: { [key: string]: string } = {}; // Store last broadcasted message id per tab
	private listeners: Listener<T>[] = [];
	private tabId: string;

	/**
	 * Constructor for the BroadcastState class.
	 *
	 * @param {string} channelName The name of the broadcast channel.
	 */
	constructor(private channelName: string) {
		this.channel = new BroadcastChannel(channelName);
		this.tabId = this.generateId();
		this.setupListener();
	}

	private generateId(): string {
		return crypto.randomUUID();
	}

	/**
	 * Sets up the message listener for the broadcast channel.
	 *
	 * This listener filters out duplicate messages and calls all registered
	 * listeners with the new state.
	 */
	private setupListener(): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.channel.onmessage = (event: MessageEvent<any>) => {
			if (typeof event.data !== 'object' || event.data === null) {
				return; // Ignore non-object messages
			}

			const { state, id, tabId } = event.data as {
				state: T;
				id: string;
				tabId: string;
			};

			if (tabId === this.tabId) {
				return; // Ignore messages from the same tab
			}

			if (this.lastBroadcast[this.channelName] === id) {
				return; // Ignore duplicate messages
			}

			this.listeners.forEach((listener) => listener(state));
		};
	}

	/**
	 * Subscribes to state updates.
	 *
	 * @param {Listener<T>} listener The listener function to call when the state
	 *   is updated.
	 * @returns {() => void} A function to unsubscribe the listener.
	 */
	subscribe(listener: Listener<T>): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	/**
	 * Broadcasts the new state to all other tabs.
	 *
	 * @param {T} state The new state to broadcast.
	 */
	broadcast(state: T): void {
		const id = this.generateId();
		this.lastBroadcast[this.channelName] = id;

		this.channel.postMessage({ state, id, tabId: this.tabId });
	}

	/**
	 * Closes the broadcast channel.
	 *
	 * This should be called when the utility is no longer needed to free up
	 * resources.
	 */
	close(): void {
		this.channel.close();
		this.listeners = [];
	}
}

export default BroadcastState;

// USAGE EXAMPLE

// Define your state type
interface MyState {
	count: number;
	message: string;
}

// Initialize the state
let myState: MyState = {
	count: 0,
	message: 'Hello'
};

// Initialize the BroadcastState with a unique channel name
const broadcastState = new BroadcastState<MyState>('my-app-state');

// Subscribe to state updates
const unsubscribe = broadcastState.subscribe((newState) => {
	myState = newState;
	console.log('State updated:', myState);
	// Update your state management library here (e.g., Redux, Zustand)
});

// Function to update and broadcast the state
function updateState(newState: Partial<MyState>) {
	myState = { ...myState, ...newState };
	broadcastState.broadcast(myState);
}

// Example usage:
updateState({ count: myState.count + 1 });
updateState({ message: 'World' });

// When you no longer need the broadcast state:
// unsubscribe();
// broadcastState.close();
