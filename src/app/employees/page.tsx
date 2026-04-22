'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { Plus, MoreVertical, X, UserPlus, Send, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployeesPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dept: 'Engineering',
    role: 'employee',
    password: Math.random().toString(36).slice(-8),
  });

  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';

  useEffect(() => {
    if (!authLoading) {
      if (profile?.role === 'employee') {
        router.push('/');
        return;
      }
      fetchEmployees();
    }
  }, [authLoading, profile]);

  async function fetchEmployees() {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (!error && data) {
      setEmployees(data);
    }
    setDataLoading(false);
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orgName: profile?.organization?.name || 'Your Company',
          orgId: profile?.organization_id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        fetchEmployees(); // Refresh list
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setFormData({
            fullName: '',
            email: '',
            dept: 'Engineering',
            role: 'employee',
            password: Math.random().toString(36).slice(-8),
          });
        }, 2000);
      } else {
        alert(`Invitation Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Network Error: ${error.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-height-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      <Header title="Employees" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer text-slate-800">
            Total Team ({employees.length})
          </div>
        </div>
        
        {(isAdmin || isHR) && (
          <Link href="/employees/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            Invite Member
          </Link>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>System Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{emp.full_name}</span>
                    </div>
                  </td>
                  <td>{emp.email}</td>
                  <td>
                    <span className={`badge ${
                      emp.role === 'admin' ? 'badge-success' : 
                      emp.role === 'hr' ? 'badge-warning' : ''
                    }`} style={emp.role === 'employee' ? { backgroundColor: '#f1f5f9', color: '#64748b' } : {}}>
                      {emp.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
