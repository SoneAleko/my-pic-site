import React from 'react';
import type { ImageFile } from '../types';
import { formatBytes } from '../utils/compress';

interface StatsBarProps {
  images: ImageFile[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ images }) => {
  const done = images.filter((i) => i.status === 'done');
  const totalOriginal = done.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = done.reduce((s, i) => s + (i.compressedSize ?? 0), 0);
  const totalSaved = totalOriginal - totalCompressed;
  const avgRatio = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : '0.0';

  if (images.length === 0) return null;

  return (
    <div className="card px-5 py-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem
          label="已处理"
          value={`${done.length} / ${images.length}`}
          icon="✅"
          color="text-green-600"
        />
        <StatItem
          label="原始总大小"
          value={formatBytes(totalOriginal)}
          icon="📁"
          color="text-gray-600"
        />
        <StatItem
          label="压缩后总大小"
          value={formatBytes(totalCompressed)}
          icon="📦"
          color="text-green-600"
        />
        <StatItem
          label="平均压缩率"
          value={`${avgRatio}%`}
          icon="📉"
          color="text-green-700"
        />
      </div>
    </div>
  );
};

const StatItem: React.FC<{
  label: string;
  value: string;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="text-center">
    <div className="text-xl mb-1">{icon}</div>
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);
