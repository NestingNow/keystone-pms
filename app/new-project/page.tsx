/*
keystone-pms/app/new-project/page.tsx
New Project Creation Form (auto job # + uppercase enforcement)
*/

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createProjectFolders } from '@/lib/microsoft-graph';
import type { Project } from '@/types';

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projectNumber, setProjectNumber] = useState<number | null>(null);

  type Approval = 'PENDING' | 'ACCEPTED' | 'REJECTED';
  const [form, setForm] = useState({
    customer: '',
    project_name: '',
    customer_rfq: '',
    customer_po: '',
    customer_approval: 'PENDING' as Approval,
    supply_industrial: '',
  });

  useEffect(() => {
    const getNextNumber = async () => {
      const { data } = await supabase
        .from('projects')
        .select('project_number')
        .order('project_number', { ascending: false })
        .limit(1);
      const last = data?.[0]?.project_number ?? 101349;
      setProjectNumber(last + 1);
    };
    getNextNumber();
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: field === 'customer' || field === 'project_name'
        ? value.toUpperCase()
        : value
    }));
  };

  const handleCreate = async () => {
    if (!projectNumber || !form.customer || !form.project_name) {
      alert('Customer and Project Name are required');
      return;
    }

    setLoading(true);

    const insertData = {
      project_number: projectNumber,
      customer: form.customer,
      project_name: form.project_name,
      customer_rfq: form.customer_rfq || null,
      customer_po: form.customer_po,
      customer_approval: form.customer_approval,
      supply_industrial: form.supply_industrial,
      project_complete: false,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      alert('Error creating project: ' + error.message);
    } else {
      await createProjectFolders(data.project_number, data.customer, data.project_name);
      alert(`✅ Project #${projectNumber} created!`);
      router.push(`/projects/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <h1 className="text-5xl font-bold tracking-tight">New Project</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-zinc-500 block mb-2">PROJECT # (auto)</label>
            <div className="bg-zinc-950 border border-zinc-700 rounded-2xl px-6 py-4 text-4xl font-mono font-bold text-emerald-400">
              {projectNumber ?? '—'}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-2">APPROVAL STATUS</label>
            <select
              value={form.customer_approval}
              onChange={e => setForm(prev => ({ ...prev, customer_approval: e.target.value as Approval }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-lg"
            >
              <option value="PENDING">PENDING</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-2">CUSTOMER (uppercase enforced)</label>
          <input
            value={form.customer}
            onChange={e => updateForm('customer', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-xl uppercase"
            placeholder="ACME CORP"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-2">PROJECT NAME (uppercase enforced)</label>
          <input
            value={form.project_name}
            onChange={e => updateForm('project_name', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-xl uppercase"
            placeholder="ROLLED CYLINDER REBUILD"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-zinc-500 block mb-2">CUSTOMER RFQ DATE <span className="text-emerald-400">(optional)</span></label>
            <input
              type="date"
              value={form.customer_rfq}
              onChange={e => updateForm('customer_rfq', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-2">CUSTOMER PO #</label>
            <input
              value={form.customer_po}
              onChange={e => updateForm('customer_po', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-2">SUPPLY / INDUSTRIAL</label>
          <input
            value={form.supply_industrial}
            onChange={e => updateForm('supply_industrial', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !projectNumber}
          className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-900 text-white py-5 rounded-3xl font-medium text-xl flex items-center justify-center gap-3 transition-all"
        >
          <Save className="w-6 h-6" />
          {loading ? 'Creating…' : `Create Project #${projectNumber}`}
        </button>
      </div>

      <p className="text-center text-zinc-500 mt-8 text-sm">
        After creation you will be taken to the project detail page
      </p>
    </div>
  );
}