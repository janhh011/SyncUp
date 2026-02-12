import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle2, ArrowRightCircle, ExternalLink } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { createGroup, joinGroup } from '../services/mockBackend';
import { useAuth } from '../App';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, group } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [formData, setFormData] = useState({
    name: '',
    projectName: '',
    code: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.projectName) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { token, group, user } = await createGroup(formData.projectName, formData.name);
      login(token, user, group);
      navigate('/setup');
    } catch (err) {
      setError('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { token, group, user } = await joinGroup(formData.code.toUpperCase(), formData.name);
      login(token, user, group);
      if (group.isFinalized) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      setError('Invalid code or group not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (group?.isFinalized) {
      navigate('/dashboard');
    } else {
      navigate('/setup');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
          Kick-off your Group Project.<br />
          <span className="text-gray-300">Efficiently.</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          A tool specifically designed for university group projects.<br /> 
          Sync schedules, define goals, and generate your team's ground rules.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-green" />
                <span>Free</span>
            </div>
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-green" />
                <span>No Login Required</span>
            </div>
            
        </div>
      </div>

      {user && group && (
        <div className="max-w-md mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 w-full">
          <button 
            onClick={handleContinue}
            className="w-full bg-brand-black text-white p-4 rounded-xl flex items-center justify-between shadow-lg hover:bg-gray-900 transition-all group"
          >
             <div className="text-left">
               <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Session</div>
               <div className="font-bold text-lg">Continue to {group.projectName}</div>
             </div>
             <ArrowRightCircle size={24} className="text-brand-green group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="text-center mt-2 text-xs text-gray-400">
            Or create/join a new group below (will log you out of current)
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden relative z-10 w-full">
        <div className="flex border-b border-gray-100">
          <button 
            className={`flex-1 py-4 font-semibold text-sm transition-colors ${activeTab === 'create' ? 'bg-gray-50 text-brand-black' : 'bg-white text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('create')}
          >
            Start New Group
          </button>
          <button 
            className={`flex-1 py-4 font-semibold text-sm transition-colors ${activeTab === 'join' ? 'bg-gray-50 text-brand-black' : 'bg-white text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('join')}
          >
            Join Existing
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <Input 
                label="Your Name" 
                placeholder="e.g. Max"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input 
                label="Project Name" 
                placeholder="e.g. COMP1511 Assignment 1"
                value={formData.projectName}
                onChange={e => setFormData({...formData, projectName: e.target.value})}
                required
              />
              <Button type="submit" fullWidth disabled={isLoading} className="mt-2">
                {isLoading ? 'Creating...' : 'Generate Join Code'}
                {!isLoading && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
               <Input 
                label="Your Name" 
                placeholder="e.g. Steffen"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input 
                label="Group Code" 
                placeholder="e.g. X7K9P2"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                maxLength={6}
                required
              />
              <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 mb-2">
                Tip: If you've already joined, entering the same name will log you back in.
              </div>
              <Button type="submit" variant="secondary" fullWidth disabled={isLoading} className="mt-2">
                {isLoading ? 'Joining...' : 'Join Team'}
              </Button>
            </form>
          )}
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
      
      {/* Research Backing Section */}
      <div className="mt-24 pt-10 border-t border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-brand-green uppercase tracking-widest mb-2">Based on research</h2>
          <h3 className="text-3xl font-bold">Why the "Forming" stage matters</h3>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
            <blockquote className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-8 max-w-3xl">
              "The principal work for the team during the <span className="text-brand-black font-bold bg-brand-green/20 px-1">Forming stage</span> is to create a team with clear structure, goals, direction and roles so that members begin to build trust. A good orientation/kick-off process can help to ground the members."
            </blockquote>
            
            <a 
              href="https://hr.mit.edu/learning-topics/teams/articles/stages-development" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 group hover:opacity-80 transition-opacity"
            >
              <svg 
                viewBox="0 0 321 166" 
                className="h-10 w-auto" 
                shapeRendering="crispEdges"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g strokeWidth="35" stroke="black">
                  <path d="m17.5,0v166m57-166v113m57-113v166m57-166v33m58,20v113"/>
                  <path d="m188.5,53v113" />
                  <path d="m229,16.5h92" strokeWidth="33"/>
                </g>
              </svg>
              <div className="h-10 w-px bg-gray-300"></div>
              <div className="text-left leading-tight text-sm font-semibold text-gray-600">
                Human<br/>Resources
              </div>
              <ExternalLink size={14} className="text-gray-400 group-hover:text-brand-black transition-colors" />
            </a>
          </div>
          
          {/* Decorative quote mark */}
          <div className="absolute top-0 left-4 text-[12rem] text-gray-200 font-serif leading-none -z-0 opacity-50 select-none">"</div>
        </div>
      </div>
      
      {/* Decorative */}
      <div className="absolute top-20 left-10 opacity-20 hidden lg:block animate-pulse">
        <Zap size={64} className="text-brand-green" />
      </div>
    </div>
  );
};

export default Landing;