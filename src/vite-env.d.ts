/// <reference types="vite/client" />

declare module 'virtual:content-index' {
  import type { Page } from './lib/content';

  const pages: Page[];
  export default pages;
}

declare module 'virtual:build-info' {
  export interface BuildInfo {
    commitCount: string;
    commitHash: string;
    commitDate: string;
    gameVersion: string;
    nmlVersion: string;
  }

  const buildInfo: BuildInfo;
  export default buildInfo;
}
