/* keystone-pms/app/page.tsx - OPTIMIZED + FIXED (snake_case columns) */
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Plus, Users, DollarSign, TrendingUp, CheckCircle, Eye, CircleCheckBig } from 'lucide-react';

type Metric = {
  openQuotes: number;
  pendingApprovals: number;
  ytdQuoted: number;
  totalPl: number;
  activeProjects: number;
  completedProjects: number;
  topCustomers: Array<{ customer: string; revenue: number }>;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric>({
    openQuotes: 0,
    pendingApprovals: 0,
    ytdQuoted: 0,
    totalPl: 0,
    activeProjects: 0,
    completedProjects: 0,
    topCustomers: [],
  });
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const fetchMetrics = async () => {
    const now = new Date();
    const ytdStart = `${now.getFullYear()}-01-01`;

    const { data: projects } = await supabase
      .from('projects')
      .select(
        'customer_approval, total_quoted, invoiced_amount, material_cost, labor_cost, engineering_cost, equipment_cost, logistics_cost, additional_costs, project_complete, customer, created_at'
      );

    if (!projects) return;

    const openQuotes = projects.filter((p) => p.customer_approval === 'PENDING').length;
    const pendingApprovals = openQuotes;

    const ytdQuoted = projects
      .filter((p) => p.created_at >= ytdStart)
      .reduce((sum, p) => sum + (p.total_quoted || 0), 0);

    const totalPl = projects.reduce((sum, p) => {
      const costs =
        (p.material_cost || 0) +
        (p.labor_cost || 0) +
        (p.engineering_cost || 0) +
        (p.equipment_cost || 0) +
        (p.logistics_cost || 0) +
        (p.additional_costs || 0);
      return sum + ((p.invoiced_amount || 0) - costs);
    }, 0);

    const activeProjects = projects.filter((p) => !p.project_complete).length;
    const completedProjects = projects.filter((p) => p.project_complete).length;

    // Top 5 customers by invoiced revenue
    const customerMap = new Map();
    projects.forEach((p) => {
      const rev = p.invoiced_amount || 0;
      if (rev > 0) {
        const current = customerMap.get(p.customer) || 0;
        customerMap.set(p.customer, current + rev);
      }
    });

    const topCustomers = Array.from(customerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([customer, revenue]) => ({ customer: customer.toUpperCase(), revenue }));

    setMetrics({
      openQuotes,
      pendingApprovals,
      ytdQuoted,
      totalPl,
      activeProjects,
      completedProjects,
      topCustomers,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-xl text-muted-foreground">Loading dashboard metrics…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 sm:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">Keystone Supply Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Realtime across all 4 users • Last updated just now
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/new-project"
              className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-6 h-6" />
              New Project
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-3 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-medium hover:bg-secondary/80 transition-colors"
            >
              View All Projects
            </Link>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-fr">
          <div className="bg-gradient-to-b from-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/30 hover:ring-4 hover:ring-primary/20 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="flex flex-col items-center text-center space-y-6 pt-8 flex-1 w-full">
              <div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">OPEN QUOTES</div>
                <div className="text-5xl sm:text-6xl font-bold mt-4">{metrics.openQuotes}</div>
              </div>
              <Eye className="w-16 h-16 p-4 rounded-2xl shadow-2xl mx-auto bg-gradient-to-br from-primary via-blue-500 to-indigo-500 text-primary-foreground drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/30 hover:ring-4 hover:ring-primary/20 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="flex flex-col items-center text-center space-y-6 pt-8 flex-1 w-full">
              <div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">PENDING APPROVALS</div>
                <div className="text-5xl sm:text-6xl font-bold mt-4">{metrics.pendingApprovals}</div>
              </div>
              <CircleCheckBig className="w-16 h-16 p-4 rounded-2xl shadow-2xl mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 text-emerald-900 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 font-bold" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/30 hover:ring-4 hover:ring-primary/20 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="flex flex-col items-center text-center space-y-6 pt-8 flex-1 w-full">
              <div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">YTD QUOTED</div>
                <div className="text-5xl sm:text-6xl font-bold mt-4">
                  ${metrics.ytdQuoted.toLocaleString()}
                </div>
              </div>
              <DollarSign className="w-16 h-16 p-4 rounded-2xl shadow-2xl mx-auto bg-gradient-to-br from-sky-400 to-blue-500 text-blue-900 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 font-bold" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/30 hover:ring-4 hover:ring-primary/20 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px] lg:col-span-1">
            <div className="flex flex-col items-center text-center space-y-6 pt-8 flex-1 w-full">
              <div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">TOTAL P&L</div>
                <div
                  className={`text-5xl sm:text-6xl font-bold mt-4 ${
                    metrics.totalPl >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  ${metrics.totalPl.toLocaleString()}
                </div>
              </div>
              <TrendingUp className="w-16 h-16 p-4 rounded-2xl shadow-2xl mx-auto bg-gradient-to-br from-violet-500 to-purple-500 text-purple-100 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
            </div>
          </div>
        </div>

        {/* Active/Completed + Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-b from-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all duration-700 relative overflow-hidden">
            <h3 className="text-xl font-semibold mb-8">Active vs Completed</h3>
            <div className="flex gap-12 items-center justify-center">
              <div className="text-center flex-1">
                <div className="text-6xl sm:text-7xl font-bold">{metrics.activeProjects}</div>
                <div className="text-muted-foreground mt-3 font-medium">ACTIVE</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-6xl sm:text-7xl font-bold text-emerald-500">
                  {metrics.completedProjects}
                </div>
                <div className="text-muted-foreground mt-3 font-medium">COMPLETED</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_70px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all duration-700 relative overflow-hidden">
            <h3 className="text-xl font-semibold mb-8">Top 5 Customers (Revenue)</h3>
            <div className="space-y-6">
              {metrics.topCustomers.length > 0 ? (
                metrics.topCustomers.map((c, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div className="font-medium uppercase">{c.customer}</div>
                    <div className="font-mono text-emerald-500">${c.revenue.toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-12 text-center">No revenue data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
