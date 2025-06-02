export interface SalaryData {
  Work_Experience: number;
  GPA: number;
  Certifications: number;
  Skills: string[];
  Internships: number;
  Job_Changes: number;
  Networking_Score: number;
  'Education_High School': boolean;
  'Education_Master': boolean;
  'Education_PhD': boolean;
  'Industry_Finance': boolean;
  'Industry_Healthcare': boolean;
  'Industry_Retail': boolean;
  'Industry_Tech': boolean;
  'Location_Chicago': boolean;
  'Location_Los Angeles': boolean;
  'Location_New York': boolean;
  'Location_San Francisco': boolean;
  Salary_at_30: number;
}

export interface ProcessedData extends SalaryData {
  education: 'High School' | 'Master' | 'PhD';
  industry: 'Finance' | 'Healthcare' | 'Retail' | 'Tech';
  location: 'Chicago' | 'Los Angeles' | 'New York' | 'San Francisco';
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
} 