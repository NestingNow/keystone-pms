/*
keystone-pms/app/projects/page.tsx
All Projects List Page – ENHANCED WITH INSTANT GLOBAL SEARCH
*/

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
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('project_number', { ascending: false });
    if (error) {
      console.error('supabase fetchProjects error', error);
      setProjects([]);
    } else {
      console.debug('supabase fetchProjects', data?.length ?? 0);
      setProjects(data || []);
    }
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

  if (loading) return <div className="min-h-screen bg-zinc-950 p-10 text-center text-2xl text-white">Loading projects…</div>;

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">All Projects</h1>
            <p className="text-zinc-400 mt-2 text-lg">Realtime across all 4 users • {projects.length} total</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/new-project"
              className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-8 py-4 rounded-3xl font-medium transition-all"
            >
              <Plus className="w-6 h-6" /> New Project
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 bg-black hover:bg-zinc-800 text-white px-8 py-4 rounded-3xl font-medium transition-all"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-4 bg-zinc-950">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-4 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search job #, customer, project name, or PO…"
                value={search}
                onChange={e => setSearch(e.target.value.toUpperCase())}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl pl-12 pr-6 py-4 text-lg placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-zinc-500 hover:text-white px-5 py-2 text-sm font-medium"
              >
                CLEAR
              </button>
            )}
          </div>

          <table className="w-full">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">PROJECT #</th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">CUSTOMER</th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">PROJECT NAME</th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">APPROVAL</th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">COMPLETE</th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">INVOICED</th>
                <th className="px-8 py-6 text-left text-sm font-semibold text-zinc-400 uppercase tracking-widest">P&amp;L MARGIN</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-900/80 transition-all duration-200 group">
                  <td className="px-8 py-6 font-mono text-2xl font-semibold text-white">{p.project_number}</td>
                  <td className="px-8 py-6 uppercase font-medium text-white">{p.customer}</td>
                  <td className="px-8 py-6 uppercase text-white">{p.project_name}</td>
                  <td className="px-8 py-6">
                    {p.customer_approval && (
                      <span className={`px-5 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset
                        ${p.customer_approval === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-400/30' : ''}
                        ${p.customer_approval === 'REJECTED' ? 'bg-red-500/20 text-red-400 ring-red-400/30' : ''}
                        ${p.customer_approval === 'PENDING' ? 'bg-amber-500/20 text-amber-400 ring-amber-400/30' : ''}
                      `}>
                        {p.customer_approval}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-white font-medium">{p.project_complete ? '✅ YES' : 'NO'}</td>
                  <td className="px-8 py-6 text-white font-medium">
                    {p.invoiced_amount ? `$${p.invoiced_amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-8 py-6 text-white font-medium">
                    {p.pl_margin ? `${p.pl_margin}%` : '—'}
                  </td>
                  <td className="px-8 py-6">
                    <Link href={`/projects/${p.id}`} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors group-hover:translate-x-0.5">
                      <Eye className="w-5 h-5" /> View
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && projects.length > 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center text-2xl text-zinc-500">
                    No matches for “{search}” – try different keywords
                  </td>
                </tr>
              )}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center text-2xl text-zinc-500">
                    No projects yet – create one above
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}