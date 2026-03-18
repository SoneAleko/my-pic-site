import React from 'react';
import type { QualityPreset, OutputFormat } from '../types';

const PRESETS: { label: string; value: QualityPreset; quality: number; color: string }[] = [
  { label: '高质量', value: 'high', quality: 85, color: 'green' },
  { label: '中等', value: 'medium', quality: 65, color: 'yellow' },
  { label: '低质量', value: 'low', quality: 35, color: 'red' },
  { label: '自定义', value: 'custom', quality: 75, color: 'blue' },
];

interface SettingsPanelProps {
  preset: QualityPreset;
  quality: number;
  outputFormat: OutputFormat;
  onPresetChange: (preset: QualityPreset, quality: number) => void;
  onQualityChange: (q: number) => void;
  onFormatChange: (f: OutputFormat) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  preset,
  quality,
  outputFormat,
  onPresetChange,
  onQualityChange,
  onFormatChange,
}) => {
  return (
    <div className="card p-5 space-y-5">
      <h3 className="font-bold text-gray-700 flex items-center gap-2 text-base">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        压缩设置
      </h3>

      {/* 质量预设 */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">压缩质量</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPresetChange(p.value, p.quality)}
              className={`
                py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                ${preset === p.value
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                }
              `}
            >
              {p.label}
              {p.value !== 'custom' && (
                <span className="ml-1 text-xs opacity-60">{p.quality}%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义质量滑块 */}
      {preset === 'custom' && (
        <div className="animate-slide-up">
          <label className="text-sm font-medium text-gray-600 mb-2 flex justify-between">
            <span>自定义质量</span>
            <span className="text-green-600 font-bold">{quality}%</span>
          </label>
          <div className="relative">
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => onQualityChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-green-600
                         [&::-webkit-slider-thumb]:shadow-md
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110"
              style={{
                background: `linear-gradient(to right, #16a34a ${quality}%, #e5e7eb ${quality}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>低质量 (1%)</span>
              <span>高质量 (100%)</span>
            </div>
          </div>
        </div>
      )}

      {/* 输出格式 */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">输出格式</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: 'original', label: '原格式' },
            { value: 'jpeg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => onFormatChange(f.value as OutputFormat)}
              className={`
                py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                ${outputFormat === f.value
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
