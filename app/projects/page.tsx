'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Eye, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('project_number', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchProjects();
      if (!mounted) return;
    })();
    return () => { mounted = false; };
  }, []);

  const filteredProjects = projects.filter(p =>
    p.project_number.toString().includes(search) ||
    (p.customer || '').includes(search) ||
    (p.project_name || '').includes(search) ||
    (p.customer_po || '').includes(search)
  );

  if (loading) return <div className="min-h-screen bg-white dark:bg-black p-8 flex items-center justify-center text-2xl text-black dark:text-white">Loading projects…</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 sm:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 space-y-8">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold tracking-tight">Projects</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {projects.length} total projects
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/new-project"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded-full hover:opacity-90 transition-opacity duration-200"
            >
              <Plus className="w-5 h-5" /> New Project
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-900 text-black dark:text-white font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search project #, customer, name, or PO…"
              value={search}
              onChange={e => setSearch(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-6 py-4 text-lg placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-gray-300 dark:focus:border-gray-700 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 sm:px-8 py-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Job #</th>
                  <th className="px-6 sm:px-8 py-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 sm:px-8 py-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 sm:px-8 py-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 sm:px-8 py-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Invoiced</th>
                  <th className="px-6 sm:px-8 py-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Margin</th>
                  <th className="px-6 sm:px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150 group">
                    <td className="px-6 sm:px-8 py-6 font-mono font-semibold text-lg">{p.project_number}</td>
                    <td className="px-6 sm:px-8 py-6 font-medium uppercase text-sm">{p.customer}</td>
                    <td className="px-6 sm:px-8 py-6 uppercase text-sm text-gray-700 dark:text-gray-300">{p.project_name}</td>
                    <td className="px-6 sm:px-8 py-6">
                      {p.customer_approval && (
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200
                          ${p.customer_approval === 'ACCEPTED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : ''}
                          ${p.customer_approval === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                          ${p.customer_approval === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : ''}
                        `}>
                          {p.customer_approval}
                        </span>
                      )}
                    </td>
                    <td className="px-6 sm:px-8 py-6 font-medium text-sm">{p.invoiced_amount ? `$${p.invoiced_amount.toLocaleString()}` : '—'}</td>
                    <td className="px-6 sm:px-8 py-6 font-medium text-sm hidden lg:table-cell">{p.pl_margin ? `${p.pl_margin}%` : '—'}</td>
                    <td className="px-6 sm:px-8 py-6">
                      <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium text-sm">
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredProjects.length === 0 && projects.length > 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center text-lg text-gray-500 dark:text-gray-500">
                      No results for "{search}"
                    </td>
                  </tr>
                )}

                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center text-lg text-gray-500 dark:text-gray-500">
                      No projects yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
