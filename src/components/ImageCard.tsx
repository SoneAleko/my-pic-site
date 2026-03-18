import React, { useState } from 'react';
import type { ImageFile } from '../types';
import { formatBytes, calcRatio, getOutputFileName } from '../utils/compress';

interface ImageCardProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onDownload }) => {
  const [tab, setTab] = useState<'original' | 'compressed'>('compressed');

  const savedBytes =
    image.compressedSize != null ? image.originalSize - image.compressedSize : null;
  const ratio = image.compressedSize != null ? calcRatio(image.originalSize, image.compressedSize) : null;

  return (
    <div className="card animate-slide-up overflow-visible">
      {/* 顶部：文件名 + 移除按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={image.name}>
            {image.name}
          </span>
        </div>
        <button
          onClick={() => onRemove(image.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="移除"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 状态处理 */}
      {image.status === 'compressing' && (
        <div className="p-8 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">压缩中...</p>
        </div>
      )}

      {image.status === 'error' && (
        <div className="p-6 flex flex-col items-center gap-2 text-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-500">{image.error || '压缩失败'}</p>
        </div>
      )}

      {image.status === 'done' && image.compressedPreview && (
        <>
          {/* 预览切换 */}
          <div className="flex border-b border-gray-100">
            {(['original', 'compressed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  tab === t
                    ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'original' ? '原始图片' : '压缩后'}
              </button>
            ))}
          </div>

          {/* 图片预览 */}
          <div className="relative bg-gray-100 h-44 overflow-hidden">
            <img
              src={tab === 'original' ? image.originalPreview : image.compressedPreview}
              alt={tab}
              className="w-full h-full object-contain"
            />
            {/* 水印标签 */}
            <span className={`absolute top-2 left-2 badge text-xs ${
              tab === 'original' ? 'bg-gray-800/70 text-white' : 'bg-green-600/90 text-white'
            }`}>
              {tab === 'original' ? '原始' : '压缩后'}
            </span>
          </div>

          {/* 数据对比 */}
          <div className="px-4 py-3 space-y-2.5">
            {/* 大小对比 */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-gray-500">原始大小</span>
              </div>
              <span className="font-semibold text-gray-700">{formatBytes(image.originalSize)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500">压缩后大小</span>
              </div>
              <span className="font-semibold text-green-700">{formatBytes(image.compressedSize!)}</span>
            </div>

            {/* 节省空间进度条 */}
            {ratio && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>节省空间</span>
                  <span className="font-bold text-green-600">
                    {savedBytes != null && savedBytes > 0 ? `-${formatBytes(savedBytes)}` : '未压缩'} ({ratio})
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, parseFloat(ratio)))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* 尺寸对比 */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{image.originalWidth} × {image.originalHeight} px</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>{image.compressedWidth} × {image.compressedHeight} px</span>
            </div>

            {/* 下载按钮 */}
            <button
              onClick={() => onDownload(image.id)}
              className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载
            </button>
          </div>
        </>
      )}

      {image.status === 'idle' && (
        <div className="p-8 text-center text-sm text-gray-400">等待压缩...</div>
      )}
    </div>
  );
};
