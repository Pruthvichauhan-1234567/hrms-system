import React, { useState, useEffect } from 'react';
import { Search, User, Building2, Briefcase, FileText, Laptop, ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api';

export function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.globalSearch(query);
        setResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Employees':
        return <User className="w-4 h-4 text-indigo-600" />;
      case 'Departments':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'Candidates':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'Documents':
        return <FileText className="w-4 h-4 text-violet-600" />;
      case 'Assets':
        return <Laptop className="w-4 h-4 text-sky-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity" onClick={() => onClose()} />

      <div className="relative mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200/90 transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="relative flex items-center px-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, departments, candidates, assets, policies... (e.g. 'Aarav', 'Engineering', 'MacBook')"
            className="h-14 w-full border-0 bg-transparent pl-3 pr-8 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Searching directory...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.url);
                    onClose();
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-gray-50/80 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-2xs transition-colors">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-indigo-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="py-12 text-center">
              <div className="text-xs font-semibold text-gray-700">No matching records found</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Try searching with a different term</div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-gray-400">
              <span className="font-semibold text-gray-700">Quick Navigation Tips:</span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">"Priya" (Employee)</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">"Engineering" (Department)</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">"MacBook" (Asset)</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">"Handbook" (Policy)</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/60 text-[11px] text-gray-500 font-medium">
          <span>Navigate with <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-2xs font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-2xs font-mono">↓</kbd></span>
          <span>Close with <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-md shadow-2xs font-mono">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
}
