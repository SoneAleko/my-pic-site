import { useState, useCallback } from 'react';
import { UploadZone } from './components/UploadZone';
import { SettingsPanel } from './components/SettingsPanel';
import { ImageCard } from './components/ImageCard';
import { StatsBar } from './components/StatsBar';
import type { ImageFile, QualityPreset, OutputFormat } from './types';
import {
  compressImage,
  getImageDimensions,
  generateId,
  getOutputFileName,
} from './utils/compress';

const QUALITY_MAP: Record<QualityPreset, number> = {
  high: 85,
  medium: 65,
  low: 35,
  custom: 75,
};

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [preset, setPreset] = useState<QualityPreset>('medium');
  const [customQuality, setCustomQuality] = useState(75);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const currentQuality = preset === 'custom' ? customQuality : QUALITY_MAP[preset];

  const handleFilesAdded = useCallback(async (files: File[]) => {
    const newImages: ImageFile[] = await Promise.all(
      files.map(async (file) => {
        const preview = URL.createObjectURL(file);
        let width = 0, height = 0;
        try {
          const dims = await getImageDimensions(file);
          width = dims.width;
          height = dims.height;
        } catch (_) {}
        return {
          id: generateId(),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalPreview: preview,
          status: 'idle' as const,
          quality: currentQuality,
          outputFormat,
        };
      })
    );
    setImages((prev) => [...prev, ...newImages]);
  }, [currentQuality, outputFormat]);

  const compressSingle = useCallback(async (img: ImageFile): Promise<ImageFile> => {
    try {
      const quality = img.quality / 100;
      const { blob, width, height } = await compressImage(img.file, {
        quality,
        outputFormat: img.outputFormat,
      });
      const compressedPreview = URL.createObjectURL(blob);
      return {
        ...img,
        status: 'done',
        compressedBlob: blob,
        compressedSize: blob.size,
        compressedWidth: width,
        compressedHeight: height,
        compressedPreview,
      };
    } catch (e: any) {
      return { ...img, status: 'error', error: e?.message ?? '压缩失败' };
    }
  }, []);

  const handleCompressAll = useCallback(async () => {
    const targets = images.filter((i) => i.status === 'idle' || i.status === 'error');
    if (targets.length === 0) return;

    setIsProcessingAll(true);

    // 将所有目标设为 compressing
    setImages((prev) =>
      prev.map((img) =>
        targets.some((t) => t.id === img.id)
          ? { ...img, status: 'compressing', quality: currentQuality, outputFormat }
          : img
      )
    );

    // 并发压缩（限制并发量）
    const CONCURRENCY = 3;
    const chunks = [];
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      chunks.push(targets.slice(i, i + CONCURRENCY));
    }

    for (const chunk of chunks) {
      const results = await Promise.all(
        chunk.map((img) => compressSingle({ ...img, quality: currentQuality, outputFormat }))
      );
      setImages((prev) =>
        prev.map((img) => {
          const result = results.find((r) => r.id === img.id);
          return result ?? img;
        })
      );
    }

    setIsProcessingAll(false);
  }, [images, currentQuality, outputFormat, compressSingle]);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.originalPreview) URL.revokeObjectURL(img.originalPreview);
      if (img?.compressedPreview) URL.revokeObjectURL(img.compressedPreview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleDownload = useCallback((id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img?.compressedBlob) return;
    const url = URL.createObjectURL(img.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getOutputFileName(img.name, img.outputFormat, img.file.type);
    a.click();
    URL.revokeObjectURL(url);
  }, [images]);

  const handleDownloadAll = useCallback(() => {
    const doneImages = images.filter((i) => i.status === 'done' && i.compressedBlob);
    doneImages.forEach((img, index) => {
      setTimeout(() => handleDownload(img.id), index * 200);
    });
  }, [images, handleDownload]);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => {
      if (img.originalPreview) URL.revokeObjectURL(img.originalPreview);
      if (img.compressedPreview) URL.revokeObjectURL(img.compressedPreview);
    });
    setImages([]);
  }, [images]);

  const pendingCount = images.filter((i) => i.status === 'idle' || i.status === 'error').length;
  const doneCount = images.filter((i) => i.status === 'done').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">图片压缩工具</h1>
              <p className="text-xs text-gray-400 hidden sm:block">快速压缩图片，保留画质</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="flex items-center gap-2">
              {doneCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">全部下载</span>
                  <span className="badge bg-green-100 text-green-700">{doneCount}</span>
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="清空全部"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 上传区 */}
        <UploadZone onFilesAdded={handleFilesAdded} disabled={isProcessingAll} />

        {images.length > 0 && (
          <>
            {/* 统计栏 */}
            <StatsBar images={images} />

            {/* 设置 + 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SettingsPanel
                  preset={preset}
                  quality={customQuality}
                  outputFormat={outputFormat}
                  onPresetChange={(p, q) => {
                    setPreset(p);
                    if (p !== 'custom') setCustomQuality(q);
                  }}
                  onQualityChange={setCustomQuality}
                  onFormatChange={setOutputFormat}
                />
              </div>

              {pendingCount > 0 && (
                <div className="sm:w-48 flex flex-col justify-center">
                  <button
                    onClick={handleCompressAll}
                    disabled={isProcessingAll}
                    className="btn-primary flex items-center justify-center gap-2 w-full py-4 text-base"
                  >
                    {isProcessingAll ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        压缩中...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        开始压缩
                        <span className="badge bg-white/20 text-white">{pendingCount}</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {pendingCount} 张待压缩
                  </p>
                </div>
              )}
            </div>

            {/* 图片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  onRemove={handleRemove}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </>
        )}

        {/* 空状态提示 */}
        {images.length === 0 && (
          <div className="text-center py-10 space-y-3 animate-fade-in">
            <p className="text-gray-400 text-sm">支持批量上传 · 拖拽即可开始</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-300">
              <span>🔒 纯本地处理，不上传服务器</span>
              <span>⚡ 极速压缩</span>
              <span>📱 支持手机使用</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-300">
        <p>图片压缩工具 · 所有处理在浏览器本地完成，安全无忧</p>
      </footer>
    </div>
  );
}

export default App;
