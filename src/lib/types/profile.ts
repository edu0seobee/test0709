export interface ProjectRecord {
  id: string;
  projectName: string;
  client: string;
  contractAmount?: string;
  contractPeriod: string;
  description?: string;
}

export interface EngineerRecord {
  id: string;
  name: string;
  position?: string;
  careerSummary: string;
}
