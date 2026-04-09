export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Profile Builder Fields
  skills?: ISkill[];
  experience?: IExperience[];
  education?: IEducation[];
  projects?: IProject[];
  socialLinks?: any;
}

export interface ISkill {
  id?: string;
  name: string;
}

export interface IExperience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  isCurrent: boolean;
}

export interface IEducation {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string | null;
  graduationType?: string | null;
}

export interface IProject {
  id?: string;
  name: string;
  techStack?: string | null;
  description?: string | null;
}

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
}
