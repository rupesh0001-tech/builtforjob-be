export interface IATSSuggestion {
  title: string;
  description: string;
  impact: number;
}

export interface IATSSuggestionsResult {
  improvements: IATSSuggestion[];
  missingKeywords: string[];
  missingSkills: string[];
}

export interface IATSScoreResult {
  score: number;
  details: string;
}

export interface IATSReport {
  id: string;
  userId: string;
  resumeName: string;
  resumeUrl: string | null;
  resumeText: string | null;
  jobDescription: string;
  score: number;
  details: string;
  resumeWordCount: number;
  jdWordCount: number;
  suggestions: IATSSuggestionsResult | null;
  createdAt: Date;
  updatedAt: Date;
}
