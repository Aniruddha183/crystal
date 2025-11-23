export enum AppState {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  RECORDING = 'RECORDING',
  FINISHED = 'FINISHED',
}

export enum CameraPosition {
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
}

export enum CameraShape {
  CIRCLE = 'CIRCLE',
  RECTANGLE = 'RECTANGLE',
}

export interface RecordingState {
  isRecording: boolean;
  duration: number; // in seconds
  blobUrl: string | null;
}