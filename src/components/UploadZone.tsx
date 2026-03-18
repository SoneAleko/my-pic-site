import React, { useCallback, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesAdded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false;
        if (f.size > MAX_FILE_SIZE) return false;
        return true;
      });
      if (valid.length) onFilesAdded(valid);
    },
    [onFilesAdded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [disabled, processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-2xl p-10 md:p-16 text-center cursor-pointer
        transition-all duration-300 select-none
        ${isDragging
          ? 'border-green-500 bg-green-50 scale-[1.02] shadow-lg shadow-green-100'
          : 'border-green-300 bg-white hover:border-green-400 hover:bg-green-50/50 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* 图标 */}
      <div className={`
        mx-auto mb-5 w-20 h-20 rounded-full flex items-center justify-center
        transition-all duration-300
        ${isDragging ? 'bg-green-200 scale-110' : 'bg-green-100'}
      `}>
        {isDragging ? (
          <svg className="w-10 h-10 text-green-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-4 4m4-4l4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* 文字 */}
      <div className="space-y-2">
        {isDragging ? (
          <p className="text-xl font-bold text-green-600 animate-pulse">松开以添加图片</p>
        ) : (
          <>
            <p className="text-xl font-bold text-gray-700">
              拖放图片到这里，或{' '}
              <span className="text-green-600 underline underline-offset-2">点击选择</span>
            </p>
            <p className="text-sm text-gray-400">支持 JPG、PNG、WebP、GIF、BMP · 单张最大 50MB</p>
          </>
        )}
      </div>

      {/* 格式标签 */}
      {!isDragging && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['JPG', 'PNG', 'WebP', 'GIF', 'BMP'].map((fmt) => (
            <span key={fmt} className="badge bg-green-100 text-green-700">
              {fmt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
