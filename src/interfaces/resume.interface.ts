export interface IResumePersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  profession: string;
  image: string;
}

export interface IResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  is_current: boolean;
  _id?: string;
}

export interface IResumeEducation {
  institution: string;
  degree: string;
  field: string;
  graduation_date: string;
  gpa: string;
  graduationType: 'cgpa' | 'percentage';
  _id?: string;
}

export interface IResumeProject {
  name: string;
  techStack: string;
  description: string;
  _id?: string;
}

export interface IResumeSectionVisibility {
  summary: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  skills: boolean;
}

export interface IResumeData {
  personalInfoData: IResumePersonalInfo;
  professionalSummaryData: string;
  experienceData: IResumeExperience[];
  educationData: IResumeEducation[];
  projectData: IResumeProject[];
  skillData: string[];
  template: string;
  accentColor: string;
  sectionVisibility: IResumeSectionVisibility;
}

export interface IResume {
  id: string;
  title: string;
  company?: string | null;
  template: string;
  content: IResumeData;
  isMagic: boolean;
  isDraft: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResumeVersion {
  id: string;
  company?: string | null;
  role: string;
  content: IResumeData;
  resumeId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
