export interface ICoverLetterPersonalInfo {
  fullName?: string;
  address?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  github?: string;
}

export interface ICoverLetterEmployerInfo {
  managerName?: string;
  teamName?: string;
  companyName?: string;
  recipientName?: string;
  jobTitle?: string;
  address?: string;
}

export interface ICoverLetterBodyContent {
  intro?: string;
  body1?: string;
  body2?: string;
  body3?: string;
  conclusion?: string;
}

export interface ICoverLetterContent {
  personalInfo?: ICoverLetterPersonalInfo;
  employerInfo?: ICoverLetterEmployerInfo;
  date?: string;
  salutation?: string;
  mode?: string;
  body?: ICoverLetterBodyContent;
  manualContent?: string;
  signOff?: string;
}

export interface ICoverLetter {
  id: string;
  title: string;
  company?: string | null;
  recipient?: string | null;
  template: string;
  content: ICoverLetterContent | null;
  isDraft: boolean;
  isMagic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
