import { Plugin } from 'vite';
import { E as EditorServerOptions } from './core-D5X_y9_m.js';

/** Dev-only Vite plugin: mounts the AI + save endpoints on your dev server. */
declare function visualEditor(options?: EditorServerOptions): Plugin;

export { visualEditor as default, visualEditor };
