import { PromptAnswers } from '../prompts/index.js';

export interface FileInjection {
  src: string;
  dest: string;
  type: 'copy' | 'render';
}

export interface FeatureConfig {
  name: string;
  condition: (answers: PromptAnswers) => boolean;
  dependencies?: string[];
  devDependencies?: string[];
  files?: (answers: PromptAnswers) => FileInjection[];
  injection?: {
    moduleName: string;
    importPath: string;
  };
  dockerServices?: Record<string, any>;
}
