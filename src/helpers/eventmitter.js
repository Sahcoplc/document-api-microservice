
// eslint-disable-next-line max-classes-per-file
import { EventEmitter } from "events";

class CustomEventEmitter extends EventEmitter {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
}

class EventEmitterInstance {
    // eslint-disable-next-line class-methods-use-this
    getInstance() {
        if (!EventEmitterInstance.instance) {
            EventEmitterInstance.instance = new CustomEventEmitter();
        }
        return EventEmitterInstance.instance;
    }
}

module.exports = EventEmitterInstance;
