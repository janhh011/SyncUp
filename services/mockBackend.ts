import { Group, User, Questionnaire, ProjectConfig, UserWithData, AlignmentData, AuthResponse } from '../types';

// In-memory storage simulated with LocalStorage for persistence across reloads
const STORAGE_KEY = 'syncup_db_v1';

interface DB {
  groups: Group[];
  users: User[];
  questionnaires: Questionnaire[];
  projectConfigs: ProjectConfig[];
}

const getDB = (): DB => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return { groups: [], users: [], questionnaires: [], projectConfigs: [] };
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Utils
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// JWT Simulation
const generateToken = (user: User, group: Group): string => {
  const payload = {
    sub: user.id,
    groupId: group.id,
    name: user.name,
    isAdmin: user.isAdmin,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  // Fake JWT format: Header.Payload.Signature
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.fake_signature`;
};

const verifyFakeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
};

// Auth & Group Management

export const validateToken = async (token: string): Promise<{ user: User, group: Group } | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const payload = verifyFakeToken(token);
  if (!payload) return null;

  const db = getDB();
  const user = db.users.find(u => u.id === payload.sub);
  const group = db.groups.find(g => g.id === payload.groupId);

  if (!user || !group) return null;

  return { user, group };
};

export const createGroup = async (projectName: string, adminName: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const db = getDB();
  
  const group: Group = {
    id: generateId(),
    code: generateCode(),
    projectName,
    isFinalized: false,
  };
  
  const user: User = {
    id: generateId(),
    groupId: group.id,
    name: adminName,
    isAdmin: true,
  };
  
  db.groups.push(group);
  db.users.push(user);
  saveDB(db);
  
  const token = generateToken(user, group);
  return { token, user, group };
};

export const joinGroup = async (code: string, name: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const db = getDB();
  
  const group = db.groups.find(g => g.code === code);
  if (!group) throw new Error("Group not found");
  
  // Check if user with this name already exists in this group (Simulate "Login" for existing users)
  let user = db.users.find(u => u.groupId === group.id && u.name.toLowerCase() === name.toLowerCase());
  
  if (!user) {
    // Signup new user
    user = {
      id: generateId(),
      groupId: group.id,
      name,
      isAdmin: false,
    };
    db.users.push(user);
    saveDB(db);
  }
  
  const token = generateToken(user, group);
  return { token, user, group };
};

export const submitQuestionnaire = async (userId: string, data: Omit<Questionnaire, 'id' | 'userId'>) => {
  const db = getDB();
  // Remove existing if any
  db.questionnaires = db.questionnaires.filter(q => q.userId !== userId);
  
  const entry: Questionnaire = {
    id: generateId(),
    userId,
    ...data
  };
  
  db.questionnaires.push(entry);
  
  // Update user status
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex >= 0) {
    db.users[userIndex].hasSubmitted = true;
    // We do NOT set the final role here anymore, just the preference in questionnaire
  }
  
  saveDB(db);
  return entry;
};

export const getGroupStatus = async (groupId: string) => {
  const db = getDB();
  const users = db.users.filter(u => u.groupId === groupId);
  const questionnaires = db.questionnaires.filter(q => users.some(u => u.id === q.userId));
  
  return {
    totalMembers: users.length,
    submittedCount: questionnaires.length,
    users
  };
};

export const getAlignmentData = async (groupId: string): Promise<AlignmentData> => {
  const db = getDB();
  const users = db.users.filter(u => u.groupId === groupId);
  
  const usersWithData: UserWithData[] = users.map(u => ({
    ...u,
    questionnaire: db.questionnaires.find(q => q.userId === u.id)
  }));
  
  // Calculate Heatmap (168 slots)
  const heatmap = new Array(168).fill(0);
  usersWithData.forEach(u => {
    if (u.questionnaire?.availabilityJson) {
      u.questionnaire.availabilityJson.forEach(slot => {
        if (slot >= 0 && slot < 168) {
          heatmap[slot]++;
        }
      });
    }
  });
  
  return { users: usersWithData, heatmap };
};

export const finalizeGroup = async (groupId: string, weeklyMeetingTime: string, assignedRoles: Record<string, string>) => {
  const db = getDB();
  const groupIndex = db.groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) throw new Error("Group not found");
  
  // Update Group
  db.groups[groupIndex].isFinalized = true;

  // Update User Roles
  db.users = db.users.map(user => {
    if (user.groupId === groupId && assignedRoles[user.id]) {
      return { ...user, role: assignedRoles[user.id] };
    }
    return user;
  });
  
  // Initialize Config if not exists
  let config = db.projectConfigs.find(c => c.groupId === groupId);
  if (!config) {
    config = {
        groupId,
        contacts: [],
        zoomLink: '',
        driveLink: '',
        taskBoardLink: '',
        weeklyMeetingTime
    };
    db.projectConfigs.push(config);
  } else {
    config.weeklyMeetingTime = weeklyMeetingTime;
  }
  
  saveDB(db);
  return true;
};

export const updateProjectConfig = async (config: ProjectConfig) => {
    const db = getDB();
    const idx = db.projectConfigs.findIndex(c => c.groupId === config.groupId);
    if (idx >= 0) {
        db.projectConfigs[idx] = config;
    } else {
        db.projectConfigs.push(config);
    }
    saveDB(db);
    return config;
};

export const getDashboardData = async (groupId: string) => {
  const db = getDB();
  const group = db.groups.find(g => g.id === groupId);
  let config = db.projectConfigs.find(c => c.groupId === groupId);
  
  // Provide default empty config if missing
  if (!config && group) {
      config = {
          groupId: group.id,
          contacts: [],
          zoomLink: '',
          driveLink: '',
          taskBoardLink: '',
          weeklyMeetingTime: 'TBD'
      }
  }

  const users = db.users.filter(u => u.groupId === groupId);
  const usersWithData = users.map(u => ({
    ...u,
    questionnaire: db.questionnaires.find(q => q.userId === u.id)
  }));

  return { group, config, users: usersWithData };
};