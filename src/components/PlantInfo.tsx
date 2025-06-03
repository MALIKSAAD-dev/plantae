import React from 'react';
import { Leaf, Droplets, Sun, AlertCircle, Heart } from 'lucide-react';

interface PlantInfoProps {
  info: string;
  type: 'identification' | 'health';
}

export function PlantInfo({ info, type }: PlantInfoProps) {
  const Icon = type === 'identification' ? Leaf : AlertCircle;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
          <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-semibold">
          {type === 'identification' ? 'Plant Information' : 'Health Analysis'}
        </h2>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {info.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}