import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getAlignmentData, finalizeGroup } from '../services/mockBackend';
import { AlignmentData } from '../types';
import AvailabilityHeatmap from '../components/AvailabilityHeatmap';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AlertTriangle, Lock, Copy, Check, ArrowLeft, MoreHorizontal, UserCircle } from 'lucide-react';

const Admin: React.FC = () => {
  const { user, group, updateGroup } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AlignmentData | null>(null);
  
  const [weeklyMeetingTime, setWeeklyMeetingTime] = useState('');
  // Map of userId -> Assigned Role
  const [assignedRoles, setAssignedRoles] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard'); 
      return;
    }

    if (group) {
      getAlignmentData(group.id).then(res => {
        setData(res);
        
        // Initialize assigned roles with preferences
        const initialRoles: Record<string, string> = {};
        res.users.forEach(u => {
            initialRoles[u.id] = u.questionnaire?.preferredRole || '';
        });
        setAssignedRoles(initialRoles);
        
        setLoading(false);
      });
    }
  }, [group, user, navigate]);

  const handleFinalize = async () => {
    if (!weeklyMeetingTime) {
      alert("Please specify a weekly meeting time.");
      return;
    }
    if (group) {
        await finalizeGroup(group.id, weeklyMeetingTime, assignedRoles);
        updateGroup({ isFinalized: true });
        navigate('/dashboard');
    }
  };

  const copyCode = () => {
    if (group?.code) {
      navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    setAssignedRoles(prev => ({...prev, [userId]: role}));
  };

  if (loading || !data) return <div className="p-20 text-center">Loading alignment data...</div>;

  // Analysis
  const expectations = data.users.map(u => u.questionnaire?.expectationLevel || 0).filter(e => e > 0);
  const minExp = Math.min(...expectations); // e.g. 1.0 (Best)
  const maxExp = Math.max(...expectations); // e.g. 4.0 (Pass)
  
  // Conflict detection: Gap of >= 1.3 (e.g. 1.0 vs 2.3 is ok, but 1.0 vs 2.7 is getting wide)
  const hasConflict = expectations.length > 1 && (maxExp - minExp) >= 1.4; 

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-gray-500 hover:text-brand-black transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-1">Team Sync</h1>
          <p className="text-gray-500">Assign roles, review availability, and lock in the team.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-400 mb-1">Group Code</div>
          <button 
            onClick={copyCode} 
            className="text-2xl font-mono font-bold flex items-center gap-2 hover:text-brand-green transition-colors"
          >
            {group?.code} 
            {copied ? <Check size={20} className="text-brand-green" /> : <Copy size={20} />}
          </button>
          {copied && <span className="text-xs text-brand-green font-medium animate-pulse">Copied!</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Analysis */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Heatmap */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Availability Heatmap</h3>
            <AvailabilityHeatmap heatmapData={data.heatmap} totalMembers={data.users.length} />
            <div className="mt-4">
                <Input 
                  label="Official Meeting Time" 
                  placeholder="e.g. Mondays 2pm" 
                  value={weeklyMeetingTime}
                  onChange={e => setWeeklyMeetingTime(e.target.value)}
                />
            </div>
          </div>

          {/* Member List & Role Assignment */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Member Roles & Goals</h3>
                {hasConflict && (
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-medium bg-amber-50 px-2 py-1 rounded">
                    <AlertTriangle size={14} /> Goal Mismatch Detected
                  </div>
                )}
             </div>
             
             <div className="space-y-4">
               {data.users.map(u => {
                 const q = u.questionnaire;
                 // German Grade Formatting
                 const gradeLabel = q?.expectationLevel ? q.expectationLevel.toFixed(1) : '-';
                 
                 return (
                    <div key={u.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                           <div className="flex-1">
                               <div className="font-bold text-lg flex items-center gap-2">
                                 {u.name}
                                 {q?.preferredRole && (
                                   <span className="text-xs font-normal text-gray-500 bg-white border px-2 py-0.5 rounded-full" title="Preferred Role">
                                     Prefers: {q.preferredRole}
                                   </span>
                                 )}
                               </div>
                               {/* Role Input */}
                               <div className="mt-2 flex items-center gap-2">
                                 <UserCircle size={16} className="text-gray-400" />
                                 <input 
                                   className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full sm:w-48 focus:border-brand-black focus:outline-none"
                                   placeholder="Assign Final Role..."
                                   value={assignedRoles[u.id] || ''}
                                   onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                 />
                               </div>
                           </div>
                           <div className="text-right whitespace-nowrap">
                               <div className="font-bold text-brand-green">{gradeLabel} Aim</div>
                               <div className="text-xs text-gray-400">{q?.weeklyHours}h/wk</div>
                           </div>
                        </div>
                        
                        {q && (
                            <div className="grid grid-cols-2 gap-4 mt-3 text-sm border-t pt-3">
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase">Motivation</div>
                                    <p className="text-gray-700 line-clamp-2 leading-tight">{q.courseMotivation || '-'}</p>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase">Preferences</div>
                                    <div className="text-gray-700 leading-tight">
                                        {q.meetingFrequency}, {q.projectMethodology}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Right Col: Setup Form */}
        <div className="space-y-6">
          <div className="bg-brand-black text-white rounded-2xl p-6 shadow-xl sticky top-24">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
               <Lock size={18} /> Finalize Team
             </h3>
             <p className="text-sm text-gray-400 mb-6">
               Once everyone has joined:
             </p>
             <ul className="text-sm text-gray-300 list-disc list-inside mb-6 space-y-1">
               <li>Pick a weekly meeting time</li>
               <li>Assign a final role to each member</li>
               <li>Resolve any goal conflicts</li>
             </ul>
             <p className="text-xs text-gray-500 mb-6">
                This locks the initial setup.
             </p>

             <Button variant="primary" fullWidth onClick={handleFinalize}>
               Lock & Launch
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;