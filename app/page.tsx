/* keystone-pms/app/page.tsx - OPTIMIZED + FIXED (snake_case columns) */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, DollarSign, TrendingUp, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchMetrics = async () => {
    try {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const { data: projects, error: queryError } = await supabase
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

      if (queryError) throw queryError;
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
      setError(null);
    } catch (err: unknown) {
      console.error('Dashboard fetch error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to load metrics');
      } else {
        setError(String(err) || 'Failed to load metrics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false); // safety net – screen never freezes
    }, 8000);

    fetchMetrics();

    // Realtime – live for all 4 users (Mac + Windows)
    const channel = supabase
      .channel('live-metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        fetchMetrics
      )
      .subscribe();

    return () => {
      mounted = false;
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-2xl text-black dark:text-white">Loading live metrics…</div>;
  if (error) return <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-2xl text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 sm:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Real-time metrics • Last updated {lastUpdated.toLocaleTimeString()}
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
              href="/projects"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-900 text-black dark:text-white font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Metric Pills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Open Quotes */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Open Quotes</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-5xl font-bold text-amber-600 dark:text-amber-400">{metrics.openQuotes}</p>
                <Eye className="w-6 h-6 text-amber-400 opacity-40" />
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pending Approvals</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.pendingApprovals}</p>
                <CheckCircle className="w-6 h-6 text-emerald-400 opacity-40" />
              </div>
            </div>
          </div>

          {/* YTD Quoted */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">YTD Quoted</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-4xl font-bold">${metrics.totalQuotedYTD.toLocaleString()}</p>
                <DollarSign className="w-6 h-6 text-gray-400 opacity-40" />
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">This Month</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-4xl font-bold">${metrics.totalQuotedMonth.toLocaleString()}</p>
                <TrendingUp className="w-6 h-6 text-gray-400 opacity-40" />
              </div>
            </div>
          </div>

          {/* Avg P&L Margin */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-8 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 lg:col-span-1 md:col-span-2">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Avg P&L Margin</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.avgPLMargin}%</p>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Active Projects</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-5xl font-bold">{metrics.activeProjects}</p>
                <Users className="w-6 h-6 text-gray-400 opacity-40" />
              </div>
            </div>
          </div>

          {/* Completed This Month */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <div className="flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Completed Month</p>
              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.completedThisMonth}</p>
                <CheckCircle className="w-6 h-6 text-emerald-400 opacity-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers Section */}
        {metrics.topCustomers.length > 0 && (
          <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 sm:p-12 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-8">Top Customers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {metrics.topCustomers.map((c, i) => (
                <div key={i} className="rounded-2xl bg-white dark:bg-black p-6 border border-gray-200 dark:border-gray-800 text-center hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${c.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium uppercase tracking-wider truncate">{c.customer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}