// @ts-ignore
import { EventEmitter } from 'events';

const _emitter: EventEmitter = new EventEmitter();
_emitter.setMaxListeners(0);

export const emitter = _emitter;
