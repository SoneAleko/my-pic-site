export type QualityPreset = 'high' | 'medium' | 'low' | 'custom';

export type CompressionStatus = 'idle' | 'compressing' | 'done' | 'error';

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalPreview: string;
  status: CompressionStatus;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedWidth?: number;
  compressedHeight?: number;
  compressedPreview?: string;
  error?: string;
  quality: number;
  outputFormat: OutputFormat;
}

export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp';

export interface CompressOptions {
  quality: number;       // 0-1
  maxWidth?: number;
  maxHeight?: number;
  outputFormat: OutputFormat;
}
