import React from 'react';

type DataSourceBadgeProps = {
  dataMode: string;
};

export default function DataSourceBadge({ dataMode }: DataSourceBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  let text = dataMode;

  switch (dataMode) {
    case 'LIVE':
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'CACHED':
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'synthetic':
    case 'LIVE_WITH_SYNTHETIC_INPUTS':
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      text = 'Synthetic';
      break;
    case 'DEMO_FALLBACK':
    case 'demo-fallback':
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      text = 'Demo Fallback';
      break;
  }

  return (
    <div
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
      title={`Data source: ${dataMode}`}
    >
      {text}
    </div>
  );
}
