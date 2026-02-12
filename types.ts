
export interface Group {
  id: string;
  code: string;
  projectName: string;
  isFinalized: boolean;
}

export interface User {
  id: string;
  groupId: string;
  name: string;
  role?: string;
  isAdmin: boolean;
  hasSubmitted?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  group: Group;
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Questionnaire {
  id?: string;
  userId: string;
  // 1. Goals (1.0 - 4.0 mapped internally to 4-1 scale for calculation or just display)
  // Let's keep 1=Low Ambition (4.0), 4=High Ambition (1.0) for conflict logic compatibility
  expectationLevel: number; 
  realisticExpectation: number; // New field for realistic grade
  // 2. Grade vs Learning (1-5)
  gradeVsLearning: number;
  // 3. Uni Experience (1-5)
  projectExperience: number;
  // 4. Hours per week
  weeklyHours: number;
  // 5. Takeaway
  priorExperienceTakeaway: string;
  // 6. Skills (Structured) & Role
  skills: Skill[];
  preferredRole?: string;
  // 7. Motivation
  courseMotivation: string;
  // 8. Meeting Preference
  meetingFrequency: string;
  // 9. Methodology Preference
  projectMethodology: string;
  
  availabilityJson: number[]; 
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface ProjectConfig {
  groupId: string;
  contacts: Contact[];
  zoomLink: string;
  driveLink: string;
  taskBoardLink: string;
  weeklyMeetingTime: string;
}

export interface UserWithData extends User {
  questionnaire?: Questionnaire;
}

export interface AlignmentData {
  users: UserWithData[];
  heatmap: number[]; // Array of 168 integers representing overlap count per slot
}

// Helper types for the frontend
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
