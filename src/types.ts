export type PageRoute = 
  | 'home'
  | 'raise-complaint'
  | 'track-complaint'
  | 'live-map'
  | 'analytics'
  | 'about'
  | 'contact'
  | 'citizen-dashboard'
  | 'officer-dashboard'
  | 'admin-dashboard';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu';

export interface TimelineStep {
  title: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
  actor?: string;
  note?: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: 'Road' | 'Water' | 'Electricity' | 'Garbage' | 'Health' | 'Safety' | 'Others';
  department: string;
  status: 'Submitted' | 'AI Verified' | 'Assigned' | 'Officer Accepted' | 'Inspection' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: {
    address: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  image?: string;
  resolutionPhoto?: string;
  voiceText?: string;
  description: string;
  aiSummary: string;
  detectedObjects: string[];
  confidenceScore: number;
  estimatedResolution: string;
  assignedOfficer?: {
    name: string;
    designation: string;
    department: string;
    phone: string;
    avatar: string;
  };
  userId?: string;
  submittedBy: {
    name: string;
    phone: string;
    email?: string;
    userId?: string;
    anonymous: boolean;
  };
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  duplicateDetected?: boolean;
  timeline: TimelineStep[];
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: string;
  district?: string;
  state?: string;
  address?: string;
  isLoggedIn: boolean;
}

export interface DepartmentOfficer {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  assignedCases: number;
  resolvedCases: number;
  avgResolutionDays: number;
  status: 'Active' | 'In Field' | 'Away';
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetId: string;
  details: string;
}

export interface AIAnalysisResult {
  summary: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  department: string;
  confidenceScore: number;
  estimatedDays: number;
  detectedObjects: string[];
  duplicateDetected: boolean;
  duplicateMatchId: string | null;
  suggestedAction: string;
}
