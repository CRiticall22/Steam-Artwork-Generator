/**
 * Minimal ambient typing for `gif.js` (jnordberg/gif.js), which ships no
 * bundled TypeScript types and has no reliable @types package. Covers only
 * the surface this project actually calls.
 */
declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: number | string | null;
    repeat?: number;
    dither?: boolean | string;
  }

  export interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  export default class GIF {
    constructor(options: GIFOptions);
    addFrame(
      element: HTMLCanvasElement | HTMLImageElement | CanvasRenderingContext2D,
      options?: AddFrameOptions,
    ): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (fraction: number) => void): void;
    on(event: 'abort', callback: () => void): void;
    render(): void;
    abort(): void;
  }
}

declare module 'gif.js/dist/gif.worker.js?url' {
  const url: string;
  export default url;
}
