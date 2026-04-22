import Header from "@/components/Header";
import { Star, TrendingUp, Award, Target } from 'lucide-react';

const performanceData = [
  { id: 1, name: 'John Doe', rating: 4.8, review: 'Excellent performance, consistently exceeds expectations.', goals: '8/10' },
  { id: 2, name: 'Sarah Smith', rating: 4.5, review: 'Great design work and team collaboration.', goals: '9/10' },
  { id: 3, name: 'Emma Wilson', rating: 4.2, review: 'Strong analytical skills, very reliable.', goals: '7/10' },
];

export default function PerformancePage() {
  return (
    <div className="animate-fade-in">
      <Header title="Performance" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Star className="text-primary" size={24} />
          </div>
          <h3 className="text-2xl font-bold">4.6</h3>
          <p className="text-slate-400 text-sm">Avg Company Rating</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Target className="text-accent" size={24} />
          </div>
          <h3 className="text-2xl font-bold">85%</h3>
          <p className="text-slate-400 text-sm">Goals Completed</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Award className="text-warning" size={24} />
          </div>
          <h3 className="text-2xl font-bold">12</h3>
          <p className="text-slate-400 text-sm">Top Performers</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {performanceData.map((perf) => (
          <div key={perf.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl font-bold">
                  {perf.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{perf.name}</h4>
                  <div className="flex items-center gap-1 text-warning mt-1">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-bold">{perf.rating} / 5.0</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2 max-w-md">{perf.review}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Goals Completion</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(parseInt(perf.goals) / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{perf.goals}</span>
                </div>
                <button className="btn btn-outline py-1.5 px-3 mt-4 text-xs">
                  Review Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
