'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        return { data: data as Project | null, error };
      } catch (err) {
        console.error(err);
        return { data: null, error: err };
      }
    };

    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await fetchProjectData();
      if (!mounted) return;
      if (error) {
        console.error(error);
        setError(error ? String((error as Record<string, unknown>).message || error) : 'Unknown error');
        setProject(null);
      } else {
        setProject(data);
      }
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [id]);

  // LIVE EXCEL FORMULAS (exact match to your V5.xlsm)
  const totalCosts = project ?
    (project.material_cost || 0) + (project.labor_cost || 0) + (project.engineering_cost || 0) +
    (project.equipment_cost || 0) + (project.logistics_cost || 0) + (project.additional_costs || 0) : 0;

  const pl = project ? (project.invoiced_amount || 0) - totalCosts : 0;
  const plMargin = project && (project.invoiced_amount || 0) > 0
    ? Math.round((pl / (project.invoiced_amount || 0)) * 100) : 0;

  const totalQuoted = project ?
    (project.materials_quoted || 0) + (project.labor_quoted || 0) + (project.engineering_quoted || 0) +
    (project.equipment_quoted || 0) + (project.logistics_quoted || 0) + (project.taxes_quoted || 0) : 0;

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);

    const { error } = await supabase
      .from('projects')
      .update({ ...project, pl_margin: plMargin, totalQuoted })
      .eq('id', id);

    if (!error) {
      setLastSaved(new Date());
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (!fetchError && data) setProject(data);
    } else {
      alert('Save failed – check console');
    }
    setSaving(false);
  };

  if (error) return <div className="min-h-screen bg-white dark:bg-black p-10 flex items-center justify-center text-2xl text-red-600 dark:text-red-400">Error: {error}</div>;
  if (loading || !project) return <div className="min-h-screen bg-white dark:bg-black p-10 flex items-center justify-center text-2xl text-black dark:text-white">Loading project…</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 sm:p-12 lg:p-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 space-y-6">
          <button
            onClick={() => router.push('/projects')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Projects
          </button>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold">Project #{project.project_number}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{project.project_name}</p>
          </div>
        </div>

        {/* Live P&L Pill */}
        <div className="mb-12 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-8 sm:p-12 border border-emerald-200 dark:border-emerald-800">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Live P&L (Real-time)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Profit & Loss</p>
                <p className={`text-5xl font-bold ${pl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${pl.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Margin</p>
                <p className={`text-5xl font-bold ${plMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {plMargin}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 sm:p-12 border border-gray-200 dark:border-gray-800 space-y-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer */}
            <div className="space-y-3">
              <label htmlFor="project_customer" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</label>
              <input
                id="project_customer"
                type="text"
                value={project.customer}
                onChange={e => setProject({ ...project, customer: e.target.value.toUpperCase() })}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>

            {/* Project Name */}
            <div className="space-y-3">
              <label htmlFor="project_name" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Project Name</label>
              <input
                id="project_name"
                type="text"
                value={project.project_name}
                onChange={e => setProject({ ...project, project_name: e.target.value.toUpperCase() })}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Invoiced Amount */}
            <div className="space-y-3">
              <label htmlFor="invoiced_amount" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Invoiced Amount</label>
              <input
                id="invoiced_amount"
                type="number"
                value={project.invoiced_amount || ''}
                onChange={e => setProject({ ...project, invoiced_amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>

            {/* Material Cost */}
            <div className="space-y-3">
              <label htmlFor="material_cost" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Material Cost</label>
              <input
                id="material_cost"
                type="number"
                value={project.material_cost || ''}
                onChange={e => setProject({ ...project, material_cost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>

            {/* Labor Cost */}
            <div className="space-y-3">
              <label htmlFor="labor_cost" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Labor Cost</label>
              <input
                id="labor_cost"
                type="number"
                value={project.labor_cost || ''}
                onChange={e => setProject({ ...project, labor_cost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">💡 Add more fields (engineering cost, equipment, logistics, etc.) as needed by editing this component.</p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving…' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
