export interface GeneratedImage {
  angle: string;
  imageUrl: string;
  loading: boolean;
  error?: string;
}

export interface AngleOption {
  id: string;
  label: string;
  promptSuffix: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE'
}
