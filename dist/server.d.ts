import { E as EditorServerOptions } from './core-D5X_y9_m.js';
export { P as Provider, h as handleEditorRequest } from './core-D5X_y9_m.js';
import { IncomingMessage, ServerResponse } from 'node:http';

/** Wraps the web-standard handler for Express / Connect / Vite / plain Node servers. */
declare function toNodeMiddleware(options?: EditorServerOptions): (req: IncomingMessage & {
    originalUrl?: string;
}, res: ServerResponse, next?: () => void) => Promise<void>;

export { EditorServerOptions, toNodeMiddleware };
