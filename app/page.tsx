/* keystone-pms/app/page.tsx - OPTIMIZED */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, DollarSign, TrendingUp, CheckCircle, Eye } from 'lucide-react';
import { supabase, subscribeToTable } from '@/lib/supabase';
import type { Project } from '@/types';

type Metric = {
  openQuotes: number;
  pendingApprovals: number;
  totalQuotedYTD: number;
  totalQuotedMonth: number;
  avgPLMargin: number;
  activeProjects: number;
  completedThisMonth: number;
  topCustomers: Array<{ customer: string; revenue: number }>;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric>({
    openQuotes: 0,
    pendingApprovals: 0,
    totalQuotedYTD: 0,
    totalQuotedMonth: 0,
    avgPLMargin: 0,
    activeProjects: 0,
    completedThisMonth: 0,
    topCustomers: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchMetrics = async () => {
    try {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const { data: projects } = await supabase
        .from('projects')
        .select(`
          customer_approval, 
          total_quoted, 
          invoiced_amount, 
          material_cost, 
          labor_cost, 
          engineering_cost, 
          equipment_cost, 
          logistics_cost, 
          additional_costs, 
          project_complete, 
          customer, 
          created_at
        `);

      if (!projects?.length) {
        setLoading(false);
        return;
      }

      const openQuotes = projects.filter(p => p.customer_approval === 'PENDING').length;
      const pendingApprovals = openQuotes;
      const activeProjects = projects.filter(p => !p.project_complete).length;
      const completedThisMonth = projects.filter(p =>
        p.project_complete && (p.created_at || '') >= monthStart
      ).length;

      const totalQuotedYTD = projects.reduce((sum, p) => sum + (p.total_quoted || 0), 0);
      const totalQuotedMonth = projects
        .filter(p => (p.created_at || '') >= monthStart)
        .reduce((sum, p) => sum + (p.total_quoted || 0), 0);

      const plMargins = projects
        .filter(p => (p.invoiced_amount || 0) > 0)
        .map(p => {
          const costs = (p.material_cost || 0) + (p.labor_cost || 0) + (p.engineering_cost || 0) +
            (p.equipment_cost || 0) + (p.logistics_cost || 0) + (p.additional_costs || 0);
          return ((p.invoiced_amount || 0) - costs) / (p.invoiced_amount || 0) * 100;
        });
      const avgPLMargin = plMargins.length ? Math.round(plMargins.reduce((a, b) => a + b, 0) / plMargins.length) : 0;

      const customerMap = new Map<string, number>();
      projects.forEach(p => {
        const rev = p.invoiced_amount || 0;
        customerMap.set(p.customer || 'Unknown', (customerMap.get(p.customer || 'Unknown') || 0) + rev);
      });
      const topCustomers = Array.from(customerMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([customer, revenue]) => ({ customer, revenue }));

      setMetrics({
        openQuotes,
        pendingApprovals,
        totalQuotedYTD,
        totalQuotedMonth,
        avgPLMargin,
        activeProjects,
        completedThisMonth,
        topCustomers,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runAsync = async () => {
      // ← your existing async code here (ping, Supabase subscribe, etc.)
      // const result = await ...
      // if (isMounted) { setState... }
    };

    runAsync();

    return () => {
      isMounted = false;   // ← SYNC cleanup only (React happy)
    };
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-2xl text-white">Loading live metrics…</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">Keystone Supply Dashboard</h1>
            <p className="text-zinc-500 mt-2">
              Realtime across all 4 users • Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/new-project"
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-3xl font-medium transition-all"
            >
              <Plus className="w-6 h-6" /> New Project
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-8 py-4 rounded-3xl font-medium transition-all"
            >
              All Projects
            </Link>
          </div>
        </div>

        {/* KEY METRICS CARDS – EXACTLY AS IN BUILD SPEC */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">OPEN QUOTES</p>
                <p className="text-4xl font-mono font-bold text-amber-400">{metrics.openQuotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">PENDING APPROVALS</p>
                <p className="text-4xl font-mono font-bold text-emerald-400">{metrics.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">YTD QUOTED</p>
                <p className="text-4xl font-mono font-bold">${metrics.totalQuotedYTD.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">THIS MONTH</p>
                <p className="text-4xl font-mono font-bold">${metrics.totalQuotedMonth.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">AVG P&amp;L MARGIN</p>
                <p className="text-4xl font-mono font-bold text-emerald-400">{metrics.avgPLMargin}%</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">ACTIVE PROJECTS</p>
                <p className="text-4xl font-mono font-bold">{metrics.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm">COMPLETED THIS MONTH</p>
                <p className="text-4xl font-mono font-bold text-emerald-400">{metrics.completedThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TOP CUSTOMERS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <DollarSign className="w-5 h-5" /> TOP 5 CUSTOMERS BY REVENUE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {metrics.topCustomers.length > 0 ? (
              metrics.topCustomers.map((c, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center">
                  <p className="text-2xl font-mono font-bold text-emerald-400">${c.revenue.toLocaleString()}</p>
                  <p className="text-zinc-400 text-sm mt-2 uppercase tracking-widest truncate">{c.customer}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 col-span-full text-center py-12">No revenue data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}