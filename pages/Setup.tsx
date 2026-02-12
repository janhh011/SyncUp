import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { submitQuestionnaire } from '../services/mockBackend';
import TimeGrid from '../components/TimeGrid';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Clock, Target, Hammer, BookOpen, Brain, Clock3, GraduationCap, Plus, X, LayoutTemplate } from 'lucide-react';
import { Skill } from '../types';

// German Grading System Steps
const GRADE_STEPS = [4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0];

const Setup: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  // Default to index 6 -> Grade 2.0
  const [expectationIndex, setExpectationIndex] = useState(6); 
  
  const [gradeVsLearning, setGradeVsLearning] = useState(3); // 1-5
  const [projectExperience, setProjectExperience] = useState(3); // 1-5
  const [weeklyHours, setWeeklyHours] = useState<number>(5);
  const [priorExperienceTakeaway, setPriorExperienceTakeaway] = useState('');
  const [courseMotivation, setCourseMotivation] = useState('');
  const [role, setRole] = useState('');
  const [availabilityJson, setAvailabilityJson] = useState<number[]>([]);

  // New Fields
  const [meetingFrequency, setMeetingFrequency] = useState('1x / week');
  const [projectMethodology, setProjectMethodology] = useState('Flexible');

  // Skill Builder State
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
    setNewSkillLevel('Intermediate');
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await submitQuestionnaire(user.id, {
        expectationLevel: GRADE_STEPS[expectationIndex], // Submit the actual float value
        gradeVsLearning,
        projectExperience,
        weeklyHours,
        priorExperienceTakeaway,
        courseMotivation,
        skills,
        preferredRole: role,
        meetingFrequency,
        projectMethodology,
        availabilityJson
      });
      
      updateUser({ hasSubmitted: true });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentGrade = GRADE_STEPS[expectationIndex];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Check-in</h1>
        <p className="text-gray-500">
          Answer a few quick questions to help align your team on goals and working styles.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* --- Section 1: Alignment Levers --- */}
        <section className="space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
            <Target size={20} className="text-brand-green" />
            <h2>Goals & Expectations</h2>
          </div>

          {/* Q1: Grade Expectation (German System) */}
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-4">
               1. What grade are you aiming for? (realistically) <span className="text-brand-green text-lg ml-2">{currentGrade.toFixed(1)}</span>
             </label>
             <div className="px-2">
                <input 
                  type="range" min="0" max="9" step="1"
                  value={expectationIndex}
                  onChange={(e) => setExpectationIndex(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-black"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
                   <span className={currentGrade === 4.0 ? 'text-black font-bold' : ''}>4.0 (Pass)</span>
                   <span className={currentGrade >= 2.7 && currentGrade <= 3.3 ? 'text-black font-bold' : ''}>3.0</span>
                   <span className={currentGrade >= 1.7 && currentGrade <= 2.3 ? 'text-black font-bold' : ''}>2.0</span>
                   <span className={currentGrade === 1.0 ? 'text-black font-bold' : ''}>1.0 (Very Good)</span>
                </div>
             </div>
          </div>

          {/* Q2: Grade vs Learning */}
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-4">2. What matters more to you?</label>
             <div className="px-2">
                <input 
                  type="range" min="1" max="5" step="1"
                  value={gradeVsLearning}
                  onChange={(e) => setGradeVsLearning(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-black"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
                   <span className={gradeVsLearning <= 2 ? 'text-black font-bold' : ''}>Strictly Grades</span>
                   <span className={gradeVsLearning === 3 ? 'text-black font-bold' : ''}>Balanced</span>
                   <span className={gradeVsLearning >= 4 ? 'text-black font-bold' : ''}>Strictly Learning</span>
                </div>
             </div>
          </div>

          {/* Q3: Experience Level */}
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-4">3. Experience with Uni Group Projects</label>
             <div className="px-2">
                <input 
                  type="range" min="1" max="5" step="1"
                  value={projectExperience}
                  onChange={(e) => setProjectExperience(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-black"
                />
                <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
                   <span className={projectExperience === 1 ? 'text-black font-bold' : ''}>First Time</span>
                   <span className={projectExperience === 5 ? 'text-black font-bold' : ''}>A Lot (Veteran)</span>
                </div>
             </div>
          </div>

           {/* Q4: Hours per week */}
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">4. Hours per week willing to commit</label>
             <div className="flex items-center gap-4">
               <input 
                 type="number" 
                 min="0"
                 value={weeklyHours}
                 onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                 className="w-24 px-4 py-2 border rounded-lg text-center font-bold"
               />
               <span className="text-sm text-gray-500">hours/week</span>
             </div>
          </div>
        </section>

        {/* --- Section 2: Structure & Process (New) --- */}
        <section className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
                <LayoutTemplate size={20} className="text-brand-green" />
                <h2>Process & Structure</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">5. Preferred Meeting Frequency</label>
                    <select 
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-brand-black focus:outline-none focus:border-brand-black"
                        value={meetingFrequency}
                        onChange={(e) => setMeetingFrequency(e.target.value)}
                    >
                        <option value="As needed">As needed</option>
                        <option value="1x / week">1x / week</option>
                        <option value="2x / week">2x / week</option>
                        <option value="3x / week">3x / week</option>
                        <option value="Daily Standup">Daily Standup</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">6. Preferred Project Structure</label>
                    <select 
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-brand-black focus:outline-none focus:border-brand-black"
                        value={projectMethodology}
                        onChange={(e) => setProjectMethodology(e.target.value)}
                    >
                        <option value="Flexible">Flexible / Ad-hoc</option>
                        <option value="Agile / Scrum">Agile / Scrum</option>
                        <option value="Kanban">Kanban</option>
                        <option value="Waterfall">Waterfall (Traditional)</option>
                        <option value="Divide & Conquer">Divide & Conquer</option>
                    </select>
                </div>
            </div>
        </section>


        {/* --- Section 3: Reflections --- */}
        <section className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
            <Brain size={20} className="text-brand-green" />
            <h2>Reflections</h2>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">7. Prior Group Projects (Takeaways)</label>
             <p className="text-xs text-gray-500 mb-2">Share a key takeaway or something you want to do differently this time.</p>
             <textarea 
                className="w-full p-3 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 ring-brand-black"
                rows={3}
                placeholder="e.g. I prefer setting clear deadlines early..."
                value={priorExperienceTakeaway}
                onChange={(e) => setPriorExperienceTakeaway(e.target.value)}
             />
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">8. Why did you take this course?</label>
             <textarea 
                className="w-full p-3 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 ring-brand-black"
                rows={3}
                placeholder="e.g. Required for major, interested in the topic..."
                value={courseMotivation}
                onChange={(e) => setCourseMotivation(e.target.value)}
             />
          </div>
        </section>

        {/* --- Section 4: Skills & Role --- */}
        <section className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
            <Hammer size={20} className="text-brand-green" />
            <h2>9. Skills & Role</h2>
          </div>

          <div className="space-y-4">
             <label className="block text-sm font-bold text-gray-700">Your Skills</label>
             
             {/* Skill Builder */}
             <div className="flex gap-2">
               <input 
                 className="flex-1 px-4 py-2 border rounded-lg text-sm"
                 placeholder="Skill (e.g. React, Python)"
                 value={newSkillName}
                 onChange={e => setNewSkillName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && addSkill()}
               />
               <select 
                 className="px-4 py-2 border rounded-lg text-sm bg-white"
                 value={newSkillLevel}
                 onChange={e => setNewSkillLevel(e.target.value as any)}
               >
                 <option value="Beginner">Beginner</option>
                 <option value="Intermediate">Intermediate</option>
                 <option value="Expert">Expert</option>
               </select>
               <button 
                 onClick={addSkill}
                 className="bg-brand-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
               >
                 <Plus size={18} />
               </button>
             </div>

             {/* Skill List */}
             <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                {skills.length === 0 && <span className="text-gray-400 text-sm italic">Add your top skills above...</span>}
                {skills.map((skill, idx) => (
                  <div key={idx} className="bg-white border shadow-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                     <span className="font-semibold">{skill.name}</span>
                     <span className="text-xs text-gray-500 bg-gray-100 px-1.5 rounded">{skill.level}</span>
                     <button onClick={() => removeSkill(idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Role (Optional)</label>
             <input
               className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-brand-black focus:outline-none focus:border-brand-black"
               placeholder="e.g. Project Manager, Frontend Dev, Researcher..."
               value={role}
               onChange={(e) => setRole(e.target.value)}
             />
          </div>
        </section>

        {/* --- Section 5: Availability --- */}
        <section className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
            <Clock size={20} className="text-brand-green" />
            <h2>Weekly Availability</h2>
          </div>
          <p className="text-sm text-gray-500">Drag to paint your free times (for meetings).</p>
          <div className="border rounded-xl p-4 overflow-hidden">
             <TimeGrid value={availabilityJson} onChange={setAvailabilityJson} />
          </div>
        </section>

        <div className="pt-6">
          <Button onClick={handleSubmit} fullWidth size="lg" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Check-in'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Setup;