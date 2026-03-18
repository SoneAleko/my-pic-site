import type { CompressOptions, OutputFormat } from '../types';

/**
 * 使用 Canvas API 压缩图片
 */
export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const { maxWidth, maxHeight } = options;

      // 按最大尺寸缩放
      if (maxWidth && width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取 Canvas 上下文'));
        return;
      }

      // 白色背景（防止 PNG 透明背景转 JPEG 时变黑）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // 决定输出格式
      let mimeType = getMimeType(file.type, options.outputFormat);
      const quality = mimeType === 'image/png' ? undefined : options.quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('图片压缩失败'));
            return;
          }
          resolve({ blob, width, height });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

function getMimeType(originalType: string, outputFormat: OutputFormat): string {
  if (outputFormat === 'original') {
    // PNG 保持 PNG，其他默认 JPEG
    if (originalType === 'image/png') return 'image/png';
    if (originalType === 'image/webp') return 'image/webp';
    return 'image/jpeg';
  }
  const map: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return map[outputFormat] ?? 'image/jpeg';
}

/** 获取图片原始尺寸 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取图片尺寸'));
    };
    img.src = url;
  });
}

/** 格式化字节数 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** 计算压缩率 */
export function calcRatio(original: number, compressed: number): string {
  if (original === 0) return '0%';
  const ratio = ((original - compressed) / original) * 100;
  return `${ratio.toFixed(1)}%`;
}

/** 生成唯一 ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** 根据扩展名获取格式 */
export function getOutputFileName(
  originalName: string,
  outputFormat: OutputFormat,
  originalMime: string
): string {
  const dot = originalName.lastIndexOf('.');
  const base = dot > -1 ? originalName.slice(0, dot) : originalName;

  if (outputFormat === 'original') {
    return originalName;
  }
  const extMap: Record<string, string> = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
  };
  return `${base}_compressed.${extMap[outputFormat] ?? 'jpg'}`;
}
