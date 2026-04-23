'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { 
  Bell, Info, CheckCircle2, AlertCircle, 
  Trash2, Eye, Loader2, ArrowRight, 
  Zap, Calendar, Users, CreditCard
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
    }
  }, [profile?.id]);

  async function fetchNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" />;
      case 'warning': return <AlertCircle className="text-amber-500" />;
      case 'error': return <AlertCircle className="text-red-500" />;
      case 'payroll': return <CreditCard className="text-primary" />;
      case 'leave': return <Calendar className="text-purple-500" />;
      case 'recruitment': return <Users className="text-blue-500" />;
      default: return <Info className="text-slate-400" />;
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Notifications" />

      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Your Inbox</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Bell size={16} className="text-primary" /> {notifications.filter(n => !n.is_read).length} unread notifications
          </p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setNotifications(notifications.map(n => ({...n, is_read: true})))}
            className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
           >
             Mark all as read
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-start gap-6 group relative overflow-hidden ${
                notif.is_read ? 'bg-white border-slate-50 opacity-75' : 'bg-white border-primary/20 shadow-lg shadow-primary/5'
              }`}
            >
              {!notif.is_read && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                notif.is_read ? 'bg-slate-50' : 'bg-primary/5'
              }`}>
                {getIcon(notif.notif_type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className={`text-lg font-black tracking-tight ${notif.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                    {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-4">{notif.message}</p>
                
                <div className="flex items-center gap-6">
                  {notif.link && (
                    <Link href={notif.link} className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                      View Details <ArrowRight size={14} />
                    </Link>
                  )}
                  {!notif.is_read && (
                    <button onClick={() => markAsRead(notif.id)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={() => deleteNotification(notif.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Zap size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Your inbox is empty</p>
               <p className="text-slate-500 text-xs mt-2">Check back later for system updates and task assignments.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
