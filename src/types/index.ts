import type { Lang } from '../lib/i18n';

export type Language = Lang;

export interface MethodItem {
  id: string;
  name: string;
  className: string;
  returnType: string;
  parameters: string;
  summary: {
    it: string;
    en: string;
  };
  naturalKeywords: string[]; // e.g. ["kill unit", "eliminate actor", "damage", "death"]
  codeSnippet: string;
  category: 'actor' | 'city' | 'kingdom' | 'ui' | 'item' | 'trait' | 'world';
}

export interface IconItem {
  id: string;
  name: string;
  category: 'traits' | 'items' | 'powers' | 'ui' | 'resources' | 'buildings';
  tags: string[];
  svgIcon?: string;
  spriteName: string;
  description: {
    it: string;
    en: string;
  };
}
