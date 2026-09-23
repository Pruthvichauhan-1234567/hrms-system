import React, { useState, useEffect } from 'react';
import { GitBranch, Users, ChevronDown, ChevronRight, Eye, Mail } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { api } from '../../services/api';

function OrgNode({ node, onViewProfile, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className={`relative z-10 w-64 p-4 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all ${
          depth === 0
            ? 'border-indigo-300 ring-2 ring-indigo-500/20 bg-indigo-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center gap-3">
          <Avatar name={node.name} src={node.avatar} size="lg" status="active" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{node.name}</h4>
            <div className="text-[11px] font-semibold text-indigo-600 truncate">{node.role}</div>
            <div className="text-[10px] text-slate-400 truncate">{node.department}</div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="font-mono text-slate-500">{node.emp_id}</span>
          <button
            onClick={() => onViewProfile(node.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 shadow-xs flex items-center justify-center text-xs transition-transform"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Children Tree */}
      {hasChildren && isExpanded && (
        <div className="relative pt-6 flex flex-col items-center">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300" />

          {/* Children nodes container */}
          <div className="relative flex items-start gap-8 pt-6">
            {/* Horizontal connector line */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 left-32 right-32 h-0.5 bg-slate-300"
              />
            )}

            {node.children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300" />
                <OrgNode node={child} onViewProfile={onViewProfile} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrgHierarchyPage({ onViewProfile }) {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const data = await api.getOrgTree();
        setTreeData(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Organization Hierarchy Chart
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Executive leadership structure, reporting lines, and direct report chains.
        </p>
      </div>

      {loading ? (
        <div className="h-96 rounded-2xl bg-white border border-slate-200/80 p-12 flex items-center justify-center">
          <div className="text-xs text-slate-400">Loading organization tree...</div>
        </div>
      ) : treeData.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">
          No hierarchy data available.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs overflow-x-auto min-h-[600px] flex justify-center">
          <div className="inline-flex py-6">
            {treeData.map((rootNode) => (
              <OrgNode key={rootNode.id} node={rootNode} onViewProfile={onViewProfile} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
