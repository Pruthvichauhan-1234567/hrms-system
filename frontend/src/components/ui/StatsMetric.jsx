import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatsMetric({
  title,
  value,
  subtitle,
  change,
  trend = 'up',
  icon: Icon,
  badge = null,
  accentColor = 'indigo',
  className = '',
}) {
  const accentStyles = {
    indigo: 'bg-indigo-50/80 text-indigo-600 border-indigo-100',
    emerald: 'bg-green-50/80 text-green-600 border-green-100',
    amber: 'bg-amber-50/80 text-amber-600 border-amber-100',
    rose: 'bg-red-50/80 text-red-600 border-red-100',
    violet: 'bg-purple-50/80 text-purple-600 border-purple-100',
    sky: 'bg-sky-50/80 text-sky-600 border-sky-100',
  };

  return (
    <div
      className={`relative p-5 rounded-2xl bg-white/95 backdrop-blur-xs border border-gray-200/80 shadow-xs hover:shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${
              accentStyles[accentColor] || accentStyles.indigo
            } transition-transform`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-1.5 font-medium">
          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold text-xs ${
                trend === 'up'
                  ? 'text-green-700 bg-green-50 px-1.5 py-0.5 rounded'
                  : trend === 'down'
                  ? 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded'
                  : 'text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {change}
            </span>
          )}
          {subtitle && <span className="text-gray-500 text-[11px]">{subtitle}</span>}
        </div>

        {badge && (
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200/70">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title = 'No items available',
  description = 'Get started by creating a new entry.',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs rounded-2xl border border-dashed border-gray-200">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

