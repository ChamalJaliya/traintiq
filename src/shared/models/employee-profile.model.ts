export interface EmployeeProfile {
  _id?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    profileImage?: string;
    linkedIn?: string;
    github?: string;
  };
  skills: {
    technical: SkillEntry[];
    soft: SkillEntry[];
    languages: LanguageEntry[];
  };
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  metadata?: {
    created: Date;
    lastUpdated: Date;
    source: 'MANUAL' | 'CV_UPLOAD' | 'IMPORT';
  };
}

export interface SkillEntry {
  name: string;
  level: number; // 1-5
  yearsOfExperience: number;
  lastUsed?: Date;
  certifications?: string[];
  projects?: string[];
}

export interface LanguageEntry {
  name: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
  certifications?: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  highlights: string[];
  technologies: string[];
  responsibilities: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  grade?: string;
  achievements?: string[];
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Project {
  name: string;
  description: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  technologies: string[];
  highlights: string[];
  url?: string;
}

export interface CVAnalysis {
  profileId: string;
  analyzedDate: Date;
  parsedData: {
    confidence: number;
    extractedSkills: ExtractedSkill[];
    experienceYears: number;
    educationLevel: string;
    keyHighlights: string[];
  };
  matchingScores: {
    technicalFit: number;
    experienceFit: number;
    educationFit: number;
    overallScore: number;
  };
  recommendations: string[];
}

export interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft' | 'language';
  confidence: number;
  context: string;
  frequency: number;
}

export interface SkillMatrix {
  skillId: string;
  name: string;
  category: string;
  level: number;
  yearsOfExperience: number;
  lastUsed: Date;
  projects: string[];
  certifications: string[];
  endorsements: Endorsement[];
}

export interface Endorsement {
  endorserId: string;
  endorserName: string;
  endorserTitle: string;
  date: Date;
  comment?: string;
} 