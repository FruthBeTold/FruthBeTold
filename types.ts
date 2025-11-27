
export interface User {
  id: string;
  name: string;
  photo: string; // Base64
  email: string; // From Auth
  phone: string; // From Auth
  // Future Contact Info (User Input)
  futureEmail?: string;
  futurePhone?: string;
  
  hostComment: string;
  votesReceived: number;
  hasVotedForId: string | null;
  // Map of Hunt Item ID -> Boolean (found/not found) or String (answer)
  huntProgress: Record<string, boolean | string>; 
  timestamp: number;
  language: 'en' | 'es';
  
  // Quiz Stats
  quizScore: number;
  quizTotalAttempted: number;
}

export type HuntType = 'VILLAGE' | 'HOUSE';

export interface HuntItem {
  id: string;
  text: string;
  textEs?: string; // Spanish Translation
  type: 'CHECKBOX' | 'TEXT';
  huntType: HuntType;
  category?: string;
  categoryEs?: string; // Spanish Translation
}

export interface PollOption {
  id: string;
  text: string;
  textEs?: string; // Spanish Translation
}

export interface Poll {
  id: string;
  question: string;
  questionEs?: string; // Spanish Translation
  type: 'MULTIPLE_CHOICE' | 'FILL_IN';
  options?: PollOption[];
  // Map of User ID -> Answer string
  answers: Record<string, string>;
  isActive: boolean;
}

export interface Photo {
  id: string;
  url: string; // Base64
  uploaderId: string;
  caption?: string;
  timestamp: number;
}

export interface GameSignup {
  id: string;
  label: string; // Team Name or User Name
  captainId: string; // User ID who created this signup
  wins: number; // Streak count
  players: string[]; // List of User IDs linked to this team
}

export interface GameResult {
  id: string;
  winnerLabel: string;
  loserLabel: string;
  timestamp: number;
}

export interface Game {
  id: string;
  title: string;
  titleEs?: string; // Spanish Translation
  type: 'TEAM' | 'INDIVIDUAL'; 
  signups: GameSignup[];
  results: GameResult[];
  scores?: Record<string, number>; // Live score tracking
}

export type ViewState = 
  | 'WELCOME'
  | 'HOME'
  | 'HUNT_VILLAGE'
  | 'HUNT_HOUSE'
  | 'GAMES'
  | 'VOTING'
  | 'PHOTOS'
  | 'PROFILE'
  | 'ADMIN';
