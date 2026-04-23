'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Filter, Loader2, TrendingUp, ChevronDown } from 'lucide-react';

type ViewMode = 'daily' | 'weekly' | 'monthly';

interface DayData {
  label: string;
  fullDate: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  isToday?: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  data: DayData;
}

interface Props {
  organizationId: string;
  totalEmployees: number;
}

export default function AttendanceTrends({ organizationId, totalEmployees }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [deptOpen, setDeptOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  // Close dept dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setDeptOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch departments
  useEffect(() => {
    if (!organizationId) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('department')
        .eq('organization_id', organizationId)
        .not('department', 'is', null);
      if (data) {
        const unique = [...new Set(data.map(d => d.department).filter(Boolean))] as string[];
        setDepartments(unique.sort());
      }
    })();
  }, [organizationId]);

  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setMounted(false);
    try {
      const now = new Date();
      const today = now.toLocaleDateString('en-CA');
      let startDate: string;
      let labels: { label: string; date: string }[] = [];

      if (viewMode === 'daily') {
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          labels.push({
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            date: d.toLocaleDateString('en-CA'),
          });
        }
        startDate = labels[0].date;
      } else if (viewMode === 'weekly') {
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        labels = weekDays.map((label, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          return { label, date: d.toLocaleDateString('en-CA') };
        });
        startDate = labels[0].date;
      } else {
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push({
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            date: d.toLocaleDateString('en-CA'),
          });
        }
        startDate = labels[0].date;
      }

      const { data: records } = await supabase
        .from('attendance')
        .select('date, status, user_id, profile:profiles(department)')
        .eq('organization_id', organizationId)
        .gte('date', startDate)
        .lte('date', today)
        .order('date', { ascending: true });

      const allRecords = records || [];
      const filtered = selectedDept === 'all'
        ? allRecords
        : allRecords.filter((r: any) => (r.profile as any)?.department === selectedDept);

      if (viewMode === 'monthly') {
        const result: DayData[] = labels.map((l, idx) => {
          const monthStart = l.date;
          const nextMonth = idx < labels.length - 1 ? labels[idx + 1].date : '9999-12-31';
          const monthRecords = filtered.filter(r => r.date >= monthStart && r.date < nextMonth);
          return {
            label: l.label,
            fullDate: l.date,
            present: monthRecords.filter(r => r.status === 'present').length,
            late: monthRecords.filter(r => r.status === 'late').length,
            absent: monthRecords.filter(r => r.status === 'absent').length,
            total: monthRecords.length,
            isToday: l.date.substring(0, 7) === today.substring(0, 7),
          };
        });
        setChartData(result);
      } else {
        const result: DayData[] = labels.map(l => {
          const dayRecords = filtered.filter(r => r.date === l.date);
          return {
            label: l.label,
            fullDate: l.date,
            present: dayRecords.filter(r => r.status === 'present').length,
            late: dayRecords.filter(r => r.status === 'late').length,
            absent: dayRecords.filter(r => r.status === 'absent').length,
            total: dayRecords.length,
            isToday: l.date === today,
          };
        });
        setChartData(result);
      }
    } catch (err) {
      console.error('AttendanceTrends fetch error:', err);
    } finally {
      setLoading(false);
      // Trigger mount animation after a brief delay
      setTimeout(() => setMounted(true), 50);
    }
  }, [organizationId, viewMode, selectedDept]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxVal = Math.max(...chartData.map(d => d.total), 1);
  const totalPresent = chartData.reduce((s, d) => s + d.present, 0);
  const totalLate = chartData.reduce((s, d) => s + d.late, 0);
  const totalAbsent = chartData.reduce((s, d) => s + d.absent, 0);
  const totalRecords = totalPresent + totalLate + totalAbsent;
  const presentRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 0;

  // Chart height in pixels
  const CHART_H = 220;

  const handleBarHover = (e: React.MouseEvent, d: DayData, idx: number) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, data: d });
    setSelectedBar(idx);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h4 className="text-xl font-black text-slate-900 tracking-tight mb-1">Attendance Trends</h4>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {viewMode === 'daily' ? 'Last 14 days' : viewMode === 'weekly' ? 'Current week' : 'Last 6 months'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Department filter */}
          <div className="relative" ref={deptRef}>
            <button
              onClick={() => setDeptOpen(!deptOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <Filter size={14} />
              {selectedDept === 'all' ? 'All Depts' : selectedDept}
              <ChevronDown size={14} className={`transition-transform duration-200 ${deptOpen ? 'rotate-180' : ''}`} />
            </button>
            {deptOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 min-w-[180px]" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <button
                  onClick={() => { setSelectedDept('all'); setDeptOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${selectedDept === 'all' ? 'text-primary bg-primary/5' : 'text-slate-600'}`}
                >
                  All Departments
                </button>
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => { setSelectedDept(dept); setDeptOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${selectedDept === dept ? 'text-primary bg-primary/5' : 'text-slate-600'}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* View mode toggle */}
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); setSelectedBar(null); }}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                  viewMode === mode
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex gap-6 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</span>
          <span className="text-xs font-black text-slate-900">{totalPresent}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late</span>
          <span className="text-xs font-black text-slate-900">{totalLate}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
          <span className="text-xs font-black text-slate-900">{totalAbsent}</span>
        </div>
        {totalRecords > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs font-black text-emerald-600">{presentRate}% attendance rate</span>
          </div>
        )}
      </div>

      {/* Chart area */}
      <div
        ref={chartRef}
        className="relative"
        style={{ height: CHART_H + 40 }}
        onMouseLeave={() => { setTooltip(null); setSelectedBar(null); }}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : (
          <>
            {/* Y-axis scale + grid lines */}
            <div className="absolute left-0 top-0 w-8" style={{ height: CHART_H }}>
              <span className="absolute top-0 right-2 text-[9px] font-bold text-slate-300 tabular-nums">{maxVal}</span>
              <span className="absolute right-2 text-[9px] font-bold text-slate-300 tabular-nums" style={{ top: '50%', transform: 'translateY(-50%)' }}>{Math.round(maxVal / 2)}</span>
              <span className="absolute bottom-0 right-2 text-[9px] font-bold text-slate-300 tabular-nums">0</span>
            </div>
            {/* Grid */}
            <div className="absolute left-10 right-0 top-0 pointer-events-none" style={{ height: CHART_H }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-slate-100" />
              <div className="absolute left-0 right-0 h-px bg-slate-100" style={{ top: '50%' }} />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
            </div>

            {/* Bars container */}
            <div className="absolute left-10 right-0 top-0 flex items-end" style={{ height: CHART_H, gap: viewMode === 'daily' ? '4px' : '12px' }}>
              {chartData.map((d, i) => {
                const barH = d.total > 0 ? Math.max((d.total / maxVal) * CHART_H, 8) : 0;
                const presentH = d.total > 0 ? (d.present / d.total) * barH : 0;
                const lateH = d.total > 0 ? (d.late / d.total) * barH : 0;
                const absentH = d.total > 0 ? (d.absent / d.total) * barH : 0;
                const isHovered = selectedBar === i;
                const hasData = d.total > 0;

                return (
                  <div
                    key={d.fullDate}
                    className="flex-1 flex flex-col items-center cursor-pointer group"
                    style={{ height: CHART_H + 30 }}
                    onMouseMove={(e) => handleBarHover(e, d, i)}
                    onClick={() => setSelectedBar(selectedBar === i ? null : i)}
                  >
                    {/* Bar column */}
                    <div className="w-full flex-1 relative flex items-end justify-center">
                      {/* Hover highlight column */}
                      <div className={`absolute inset-0 rounded-xl transition-colors duration-150 ${isHovered ? 'bg-primary/[0.03]' : ''}`} />

                      {hasData ? (
                        <div
                          className="relative flex flex-col-reverse overflow-hidden transition-all duration-200"
                          style={{
                            height: mounted ? barH : 0,
                            width: viewMode === 'daily' ? '100%' : '70%',
                            borderRadius: '10px',
                            transitionDelay: `${i * 60}ms`,
                            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transitionDuration: '600ms',
                            transform: isHovered ? 'scaleX(1.08)' : 'scaleX(1)',
                            filter: isHovered ? 'brightness(1.05)' : 'brightness(1)',
                          }}
                        >
                          {/* Present segment */}
                          {presentH > 0 && (
                            <div
                              className="w-full bg-emerald-500 transition-all duration-300"
                              style={{ height: presentH, minHeight: 2 }}
                            />
                          )}
                          {/* Late segment */}
                          {lateH > 0 && (
                            <div
                              className="w-full bg-amber-400 transition-all duration-300"
                              style={{ height: lateH, minHeight: 2 }}
                            />
                          )}
                          {/* Absent segment */}
                          {absentH > 0 && (
                            <div
                              className="w-full bg-red-400 transition-all duration-300"
                              style={{ height: absentH, minHeight: 2 }}
                            />
                          )}

                          {/* Count label inside bar */}
                          {barH > 20 && (
                            <span className="absolute top-1 left-0 right-0 text-center text-[9px] font-black text-white/90 tabular-nums drop-shadow-sm">
                              {d.total}
                            </span>
                          )}
                        </div>
                      ) : (
                        /* Empty state — dotted placeholder */
                        <div
                          className="border-2 border-dashed border-slate-200 rounded-xl transition-all duration-200"
                          style={{
                            height: mounted ? 8 : 0,
                            width: viewMode === 'daily' ? '100%' : '70%',
                            transitionDelay: `${i * 60}ms`,
                          }}
                        />
                      )}
                    </div>

                    {/* Day label */}
                    <span className={`mt-2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                      d.isToday ? 'text-primary' : isHovered ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {d.label}
                    </span>
                    {d.isToday && (
                      <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute z-50 pointer-events-none"
                style={{
                  left: Math.min(Math.max(tooltip.x - 85, 10), (chartRef.current?.offsetWidth || 400) - 190),
                  top: Math.max(tooltip.y - 160, -10),
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-2xl min-w-[170px] border border-slate-700">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    {tooltip.data.fullDate}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] font-bold text-slate-300">Present</span>
                      </div>
                      <span className="text-sm font-black tabular-nums">{tooltip.data.present}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-[11px] font-bold text-slate-300">Late</span>
                      </div>
                      <span className="text-sm font-black tabular-nums">{tooltip.data.late}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="text-[11px] font-bold text-slate-300">Absent</span>
                      </div>
                      <span className="text-sm font-black tabular-nums">{tooltip.data.absent}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Total</span>
                      <span className="text-sm font-black tabular-nums">{tooltip.data.total}</span>
                    </div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected bar detail panel */}
      {selectedBar !== null && chartData[selectedBar] && chartData[selectedBar].total > 0 && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
              {chartData[selectedBar].label} — {chartData[selectedBar].fullDate}
            </p>
            <button onClick={() => setSelectedBar(null)} className="text-slate-400 hover:text-slate-600 text-xs font-black">✕</button>
          </div>
          <div className="flex gap-6 mt-3">
            <div className="flex-1 text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-black text-emerald-600">{chartData[selectedBar].present}</p>
              <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mt-1">Present</p>
            </div>
            <div className="flex-1 text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-black text-amber-600">{chartData[selectedBar].late}</p>
              <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mt-1">Late</p>
            </div>
            <div className="flex-1 text-center p-3 bg-red-50 rounded-xl">
              <p className="text-2xl font-black text-red-500">{chartData[selectedBar].absent}</p>
              <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest mt-1">Absent</p>
            </div>
          </div>
          {/* Mini breakdown bar */}
          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden flex">
            {chartData[selectedBar].total > 0 && (
              <>
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(chartData[selectedBar].present / chartData[selectedBar].total) * 100}%` }} />
                <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(chartData[selectedBar].late / chartData[selectedBar].total) * 100}%` }} />
                <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${(chartData[selectedBar].absent / chartData[selectedBar].total) * 100}%` }} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
