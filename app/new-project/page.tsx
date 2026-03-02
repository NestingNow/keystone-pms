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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8 sm:p-12 lg:p-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 space-y-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight">New Project</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Create a new project and set up folders in OneDrive automatically</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 p-8 sm:p-12 border border-gray-200 dark:border-gray-800 space-y-8">
          {/* Project Number */}
          <div className="rounded-2xl bg-white dark:bg-black p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Project # (auto-generated)</p>
            <p className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{projectNumber ?? '—'}</p>
          </div>

          {/* Customer & Approval */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer */}
            <div className="space-y-3">
              <label htmlFor="customer" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer *</label>
              <input
                id="customer"
                type="text"
                value={form.customer}
                onChange={e => updateForm('customer', e.target.value)}
                placeholder="ACME CORP"
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>

            {/* Approval Status */}
            <div className="space-y-3">
              <label htmlFor="customer_approval" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Approval Status</label>
              <select
                id="customer_approval"
                value={form.customer_approval}
                onChange={e => setForm(prev => ({ ...prev, customer_approval: e.target.value as Approval }))}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              >
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-3">
            <label htmlFor="project_name" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Project Name *</label>
            <input
              id="project_name"
              type="text"
              value={form.project_name}
              onChange={e => updateForm('project_name', e.target.value)}
              placeholder="ROLLED CYLINDER REBUILD"
              className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
            />
          </div>

          {/* RFQ Date & PO Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="customer_rfq" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">RFQ Date (optional)</label>
              <input
                id="customer_rfq"
                type="date"
                value={form.customer_rfq}
                onChange={e => updateForm('customer_rfq', e.target.value)}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="customer_po" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">PO Number</label>
              <input
                id="customer_po"
                type="text"
                value={form.customer_po}
                onChange={e => updateForm('customer_po', e.target.value)}
                className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Supply / Industrial */}
          <div className="space-y-3">
            <label htmlFor="supply_industrial" className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Category</label>
            <input
              id="supply_industrial"
              type="text"
              value={form.supply_industrial}
              onChange={e => updateForm('supply_industrial', e.target.value)}
              placeholder="Supply / Industrial / Other"
              className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors duration-200"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={loading || !projectNumber}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity duration-200"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating…' : `Create Project #${projectNumber}`}
          </button>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-500 mt-8 text-sm">
          After creation, you'll be taken to the project detail page. Folders will be automatically created in OneDrive.
        </p>
      </div>
    </div>
  );
}