import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

// Export the event bus so other modules can use it
export default eventBus;
