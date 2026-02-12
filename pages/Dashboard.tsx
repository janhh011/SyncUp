import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getDashboardData, updateProjectConfig } from '../services/mockBackend';
import { ProjectConfig, UserWithData, Group, Contact } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Video, Folder, Calendar, ExternalLink, Copy, Check, Plus, Trash2, Edit2, Save, Users, ArrowRight, Printer, FileText, ClipboardCopy } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { group, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<{config: ProjectConfig | undefined, users: UserWithData[], group: Group | undefined} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // Form state for editing
  const [editConfig, setEditConfig] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    if (group) {
      loadData();
    }
  }, [group]);

  const loadData = () => {
    if(group) {
      getDashboardData(group.id).then(res => {
        setData(res);
        if (res.config) setEditConfig(JSON.parse(JSON.stringify(res.config)));
      });
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedMap(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSave = async () => {
    if (editConfig) {
      await updateProjectConfig(editConfig);
      setIsEditing(false);
      loadData();
    }
  };

  const addContact = () => {
    if (!editConfig) return;
    const newContact: Contact = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        role: '',
        email: ''
    };
    setEditConfig({...editConfig, contacts: [...editConfig.contacts, newContact]});
  };

  const removeContact = (id: string) => {
    if (!editConfig) return;
    setEditConfig({...editConfig, contacts: editConfig.contacts.filter(c => c.id !== id)});
  };

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    if (!editConfig) return;
    const updated = editConfig.contacts.map(c => {
        if (c.id === id) return { ...c, [field]: value };
        return c;
    });
    setEditConfig({...editConfig, contacts: updated});
  };

  // --- Export Functions ---

  const handlePrint = () => {
    // @ts-ignore
    if (typeof html2pdf !== 'undefined') {
        const element = document.getElementById('dashboard-content');
        const opt = {
          margin: 0,
          filename: `${data?.group?.projectName || 'Project'}_SPOT.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // Add specific class to body to force print styles during capture
        document.body.classList.add('pdf-mode');
        // @ts-ignore
        html2pdf().set(opt).from(element).save().then(() => {
           document.body.classList.remove('pdf-mode');
        });
    } else {
        window.print();
    }
  };

  const handleCopyToNotion = () => {
    if (!data || !data.config || !data.group) return;
    
    const c = data.config;
    const g = data.group;
    
    // Markdown formatting specifically designed to paste well into Notion/Jira
    let md = `# 🎯 ${g.projectName} - Project Alignment SPOT\n\n`;
    md += `**Weekly Meeting:** ${c.weeklyMeetingTime || 'TBD'}\n`;
    if (c.zoomLink) md += `**Meeting Link:** ${c.zoomLink}\n`;
    if (c.driveLink) md += `**Drive Link:** ${c.driveLink}\n`;
    
    md += `\n## 👥 Team Roster\n`;
    // Table Header
    md += `| Member | Role | Skills | Commitment | Prefs | Email |\n`;
    md += `|---|---|---|---|---|---|\n`;
    // Table Body
    data.users.forEach(u => {
      const skillsStr = u.questionnaire?.skills.map(s => `${s.name} (${s.level})`).join(', ') || '-';
      const hours = u.questionnaire?.weeklyHours ? `${u.questionnaire.weeklyHours}h/wk` : '-';
      const prefs = u.questionnaire ? `${u.questionnaire.meetingFrequency}, ${u.questionnaire.projectMethodology}` : '-';
      // Mock email generation
      const email = `${u.name.toLowerCase().replace(/\s/g, '.')}@student.uni.edu`;
      md += `| ${u.name} | ${u.role || 'Member'} | ${skillsStr} | ${hours} | ${prefs} | ${email} |\n`;
    });

    if (c.contacts.length > 0) {
      md += `\n## 📞 Key Contacts\n`;
      c.contacts.forEach(contact => {
        md += `- **${contact.name}** (${contact.role}): ${contact.email}\n`;
      });
    }
    
    if (data.users.length > 0) {
       md += `\n## 🧠 Team Goals\n`;
       const avgAim = data.users.reduce((acc, u) => acc + (u.questionnaire?.expectationLevel || 0), 0) / data.users.length;
       // Map 1(4.0) to 4(1.0) for label logic
       let aimLabel = avgAim.toFixed(1);
       if (avgAim <= 1.3) aimLabel += ' (Very Good)';
       else if (avgAim <= 2.3) aimLabel += ' (Good)';
       else if (avgAim <= 3.3) aimLabel += ' (Satisfactory)';
       else aimLabel += ' (Pass)';
       
       md += `- **Average Grade Aim:** ${aimLabel}\n`;
    }

    md += `\n---\n*Generated by SyncUp*`;

    navigator.clipboard.writeText(md);
    setCopiedMap(prev => ({ ...prev, 'export-notion': true }));
    setTimeout(() => {
        setCopiedMap(prev => ({ ...prev, 'export-notion': false }));
    }, 2000);
  };

  if (!data || !data.config || !editConfig) return <div className="p-20 text-center">Loading Project Home...</div>;

  const { users, group: groupData } = data;
  const config = isEditing ? editConfig : data.config;

  return (
    <div id="dashboard-content" className="max-w-6xl mx-auto px-6 py-10">
      
      {/* Print Only Header (Visible on PDF) */}
      <div className="print-only mb-8 border-b-2 border-black pb-4">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest">SPOT</h1>
                <p className="text-sm text-gray-600">Student Project Organisation Tool</p>
            </div>
            <div className="text-right">
                <p className="font-bold">{groupData?.projectName}</p>
                <p className="text-xs text-gray-500">Generated via SyncUp</p>
            </div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{groupData?.projectName}</h1>
          <div className="flex items-center gap-2 text-gray-500 font-medium">
             <Calendar size={18} className="text-brand-green" />
             <span>Weekly Sync: <span className="text-brand-black">{config.weeklyMeetingTime || 'TBD'}</span></span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
           {/* Export Tools */}
           <div className="flex gap-2 mr-2 border-r pr-4 border-gray-200">
             <Button variant="secondary" size="sm" onClick={handlePrint} className="flex gap-2">
               <Printer size={14} /> Download PDF / SPOT
             </Button>
             <Button variant="outline" size="sm" onClick={handleCopyToNotion} className="flex gap-2">
               {copiedMap['export-notion'] ? <Check size={14} className="text-green-600" /> : <ClipboardCopy size={14} />}
               {copiedMap['export-notion'] ? 'Copied!' : 'Copy to Notion'}
             </Button>
           </div>

           <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
             {isEditing ? 'Cancel' : <><Edit2 size={14} className="mr-2"/> Edit Project Info</>}
           </Button>
           {isEditing && (
             <Button size="sm" onClick={handleSave}>
               <Save size={14} className="mr-2"/> Save Changes
             </Button>
           )}
        </div>
      </div>

      {/* Unfinalized Banner (Setup Phase) - Hide on Print */}
      {!group?.isFinalized && (
        <div className="no-print bg-brand-black text-white rounded-2xl p-6 mb-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-2 text-brand-green font-bold mb-2">
                <Users size={20} />
                <span className="uppercase tracking-wider text-sm">Team Forming</span>
             </div>
             <h3 className="text-xl font-bold mb-1">Waiting for everyone?</h3>
             <p className="text-gray-400 text-sm mb-4">
               Share the code <span className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded">{group?.code}</span> with teammates. 
               {users.length} members have joined so far.
             </p>
             <button 
                onClick={() => handleCopy(group?.code || '', 'banner-code')}
                className="text-sm font-semibold flex items-center gap-2 hover:text-brand-green transition-colors"
             >
                {copiedMap['banner-code'] ? <Check size={16} /> : <Copy size={16} />} 
                {copiedMap['banner-code'] ? 'Copied!' : 'Copy Invite Code'}
             </button>
          </div>

          {user?.isAdmin ? (
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 w-full md:w-auto min-w-[300px]">
              <h4 className="font-bold text-sm mb-2 text-gray-200">Admin Controls</h4>
              <p className="text-xs text-gray-500 mb-4">
                Once everyone has joined, review their availability and finalize the schedule.
              </p>
              <Button fullWidth onClick={() => navigate('/admin')}>
                Review Alignment & Finalize <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          ) : (
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center w-full md:w-auto">
                <p className="text-sm text-gray-400">Waiting for Admin to finalize schedule.</p>
            </div>
          )}
        </div>
      )}

      {/* Editing Mode: Generic Contacts & Links */}
      {isEditing && (
        <div className="bg-gray-50 border border-brand-green rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
           <h3 className="font-bold text-lg mb-4">Update Project Details</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input 
                label="Zoom / Teams Link" 
                value={editConfig.zoomLink} 
                onChange={e => setEditConfig({...editConfig, zoomLink: e.target.value})} 
              />
              <Input 
                label="Drive / Notion Link" 
                value={editConfig.driveLink} 
                onChange={e => setEditConfig({...editConfig, driveLink: e.target.value})} 
              />
           </div>

           <div className="space-y-3">
             <label className="block text-sm font-semibold text-gray-700">Important Contacts (Tutors, Lecturers, etc)</label>
             {editConfig.contacts.map((contact, idx) => (
               <div key={contact.id} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-white p-3 rounded border">
                  <input 
                    className="flex-1 px-3 py-2 border rounded text-sm" 
                    placeholder="Name (e.g. Dr. Smith)"
                    value={contact.name}
                    onChange={e => updateContact(contact.id, 'name', e.target.value)}
                  />
                  <input 
                    className="flex-1 px-3 py-2 border rounded text-sm" 
                    placeholder="Role (e.g. Lecturer)"
                    value={contact.role}
                    onChange={e => updateContact(contact.id, 'role', e.target.value)}
                  />
                  <input 
                    className="flex-1 px-3 py-2 border rounded text-sm" 
                    placeholder="Email"
                    value={contact.email}
                    onChange={e => updateContact(contact.id, 'email', e.target.value)}
                  />
                  <button onClick={() => removeContact(contact.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
               </div>
             ))}
             <button onClick={addContact} className="text-sm font-semibold text-brand-green flex items-center gap-1 hover:underline">
               <Plus size={16} /> Add Contact
             </button>
           </div>
        </div>
      )}

      {/* View Mode: Quick Contacts */}
      {!isEditing && config.contacts.length > 0 && (
         <div className="flex flex-wrap gap-3 mb-8">
            {config.contacts.map((c, i) => (
                <div key={i} className="bg-gray-50 border px-3 py-2 rounded-lg flex items-center gap-3 text-sm print:bg-white print:border-black">
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-gray-400 uppercase">{c.role}</span>
                        <span className="font-semibold">{c.name}</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <span className="font-mono text-gray-600">{c.email}</span>
                    <button 
                        onClick={() => handleCopy(c.email, `contact-${i}`)} 
                        className="text-gray-400 hover:text-black transition-colors no-print"
                        title="Copy Email"
                    >
                        {copiedMap[`contact-${i}`] ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            ))}
         </div>
      )}

      {/* Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 print:block print:space-y-4">
         {config.zoomLink ? (
           <a href={config.zoomLink} target="_blank" rel="noreferrer" className="group block print:no-underline">
             <div className="h-full bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors rounded-2xl p-6 flex flex-col justify-between print:bg-white print:border-black">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-blue-200 shadow-lg print:hidden">
                  <Video size={20} />
                </div>
                <div className="print:flex print:items-center print:justify-between">
                   <div>
                     <h3 className="font-bold text-lg text-blue-900 print:text-black">Meeting Room</h3>
                     <p className="text-blue-700/60 text-sm mt-1 flex items-center gap-1 group-hover:gap-2 transition-all no-print">Launch Link <ExternalLink size={12} /></p>
                   </div>
                   {/* Print link explicitly */}
                   <div className="print-only text-sm text-gray-600 mt-2">{config.zoomLink}</div>
                </div>
             </div>
           </a>
         ) : (
            <div className="h-full bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col justify-center items-center text-center text-gray-400 no-print">
                <Video size={32} className="mb-2 opacity-20" />
                <span className="text-sm">No Meeting Link Added</span>
            </div>
         )}
         
         {config.driveLink ? (
           <a href={config.driveLink} target="_blank" rel="noreferrer" className="group block print:no-underline">
             <div className="h-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors rounded-2xl p-6 flex flex-col justify-between print:bg-white print:border-black">
                <div className="w-10 h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg print:hidden">
                  <Folder size={20} />
                </div>
                <div className="print:flex print:items-center print:justify-between">
                   <div>
                     <h3 className="font-bold text-lg text-gray-900 print:text-black">Project Drive</h3>
                     <p className="text-gray-500 text-sm mt-1 flex items-center gap-1 group-hover:gap-2 transition-all no-print">Open Folder <ExternalLink size={12} /></p>
                   </div>
                   <div className="print-only text-sm text-gray-600 mt-2">{config.driveLink}</div>
                </div>
             </div>
           </a>
         ) : (
            <div className="h-full bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col justify-center items-center text-center text-gray-400 no-print">
                <Folder size={32} className="mb-2 opacity-20" />
                <span className="text-sm">No Drive Link Added</span>
            </div>
         )}

         {/* Placeholder for Task Board or secondary link - Hide on print if not used */}
         <div className="h-full bg-brand-green/10 border border-brand-green/20 rounded-2xl p-6 flex flex-col justify-between no-print">
            <div className="w-10 h-10 bg-brand-green text-brand-black rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Calendar size={20} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-green-900">Next Deadline</h3>
                <p className="text-green-800/60 text-sm mt-1">Check Course Page</p>
            </div>
         </div>
      </div>

      {/* Team Roster */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm print:border-2 print:border-black">
        <div className="bg-gray-50 px-6 py-4 border-b print:bg-gray-100 print:border-black">
          <h3 className="font-bold text-lg">Team Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-xs font-bold text-gray-400 uppercase tracking-wider print:text-black print:border-black">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Key Skills</th>
                <th className="px-6 py-4">Commitment</th>
                <th className="px-6 py-4 no-print">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 print:divide-gray-200">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-black text-white flex items-center justify-center font-bold text-xs print:border print:border-black print:text-black print:bg-white">
                        {u.name.substring(0, 1)}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-medium">{u.name}</span>
                         {/* Display float grade */}
                         {u.questionnaire?.expectationLevel && (
                             <span className="text-[10px] text-gray-400 no-print">
                                Aim: {u.questionnaire.expectationLevel.toFixed(1)}
                             </span>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 print:border-black print:bg-white">
                      {u.role || 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 print:text-black">
                    <div className="flex flex-wrap gap-1">
                      {u.questionnaire?.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="bg-gray-50 border px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
                            {skill.name} <span className="text-gray-400">({skill.level.charAt(0)})</span>
                        </span>
                      ))}
                      {!u.questionnaire?.skills.length && <span className="text-gray-300">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                     {u.questionnaire?.weeklyHours ? `${u.questionnaire.weeklyHours}h/wk` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 no-print">
                     {/* Simplified view of availability count */}
                     {u.questionnaire?.availabilityJson.length} slots
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;