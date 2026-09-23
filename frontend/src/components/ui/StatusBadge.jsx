import React from 'react';

export function StatusBadge({ status = 'Active', size = 'sm', className = '' }) {
  const getVariant = (s) => {
    const val = (s || '').toLowerCase();
    
    // Positive / Success
    if (['active', 'present', 'approved', 'disbursed', 'completed', 'paid', 'verified', 'selected', 'passed', 'on track', 'brand new', 'excellent'].includes(val)) {
      return {
        bg: 'bg-green-50 text-green-700 border-green-200/70',
        dot: 'bg-green-600',
      };
    }
    
    // Warning / Pending / Review
    if (['pending', 'late', 'probation', 'on notice', 'half day', 'screening', 'shortlisted', 'interview scheduled', 'interview', 'technical round', 'hr round', 'review phase', 'at risk', 'needs second opinion', 'good', 'fair', 'under discussion', 'self assessment pending', 'manager review pending'].includes(val)) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/70',
        dot: 'bg-amber-600',
      };
    }

    // Info / Neutral / Work mode
    if (['work from home', 'hybrid', 'on-site', 'remote', 'draft', 'calculated', 'generated', 'upcoming', 'open', 'available', 'full-time', 'part-time', 'contract', 'intern'].includes(val)) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
        dot: 'bg-indigo-600',
      };
    }

    // Danger / Negative
    if (['absent', 'rejected', 'terminated', 'resigned', 'on hold', 'expired', 'lost', 'retired', 'under maintenance', 'needs service'].includes(val)) {
      return {
        bg: 'bg-red-50 text-red-700 border-red-200/70',
        dot: 'bg-red-600',
      };
    }

    // Default neutral
    return {
      bg: 'bg-gray-50 text-gray-700 border-gray-200',
      dot: 'bg-gray-400',
    };
  };

  const { bg, dot } = getVariant(status);
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs tracking-tight ${bg} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      <span>{status}</span>
    </span>
  );
}

