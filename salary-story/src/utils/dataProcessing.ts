import { SalaryData, ProcessedData } from '@/types/data';

export function processRawData(rawData: any[]): ProcessedData[] {
  return rawData.map((row) => {
    // Parse skills from string format
    let skills: string[] = [];
    if (row.Skills) {
      try {
        if (typeof row.Skills === 'string') {
          skills = JSON.parse(row.Skills.replace(/'/g, '"'));
        } else if (Array.isArray(row.Skills)) {
          skills = row.Skills;
        }
      } catch (e) {
        skills = [];
      }
    }

    // Debug log for education values
    console.log('Raw education values:', {
      highSchool: row['Education_High School'],
      master: row['Education_Master'],
      phd: row['Education_PhD']
    });

    // Convert string values to boolean
    const toBool = (val: any) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return Boolean(val);
    };

    // Determine education level
    const isPhD = toBool(row['Education_PhD']);
    const isMaster = toBool(row['Education_Master']);
    const isHighSchool = toBool(row['Education_High School']);

    let education: 'High School' | 'Master' | 'PhD';
    if (isPhD) {
      education = 'PhD';
    } else if (isMaster) {
      education = 'Master';
    } else if (isHighSchool) {
      education = 'High School';
    } else {
      // If no education level is true, default to High School
      education = 'High School';
    }

    // Debug log for industry values
    console.log('Raw industry values:', {
      finance: row['Industry_Finance'],
      healthcare: row['Industry_Healthcare'],
      retail: row['Industry_Retail'],
      tech: row['Industry_Tech']
    });

    // Determine industry
    const isFinance = toBool(row['Industry_Finance']);
    const isHealthcare = toBool(row['Industry_Healthcare']);
    const isRetail = toBool(row['Industry_Retail']);
    const isTech = toBool(row['Industry_Tech']);

    let industry: 'Finance' | 'Healthcare' | 'Retail' | 'Tech';
    if (isFinance) {
      industry = 'Finance';
    } else if (isHealthcare) {
      industry = 'Healthcare';
    } else if (isRetail) {
      industry = 'Retail';
    } else if (isTech) {
      industry = 'Tech';
    } else {
      // If no industry is true, default to Tech
      industry = 'Tech';
    }

    // Debug log processed values
    console.log('Processed values:', { education, industry });

    // Determine location
    const isChicago = toBool(row['Location_Chicago']);
    const isLA = toBool(row['Location_Los Angeles']);
    const isNY = toBool(row['Location_New York']);

    let location: 'Chicago' | 'Los Angeles' | 'New York' | 'San Francisco';
    if (isChicago) {
      location = 'Chicago';
    } else if (isLA) {
      location = 'Los Angeles';
    } else if (isNY) {
      location = 'New York';
    } else {
      location = 'San Francisco';
    }

    return {
      ...row,
      Skills: skills,
      education,
      industry,
      location,
      Work_Experience: Number(row.Work_Experience) || 0,
      GPA: Number(row.GPA) || 0,
      Certifications: Number(row.Certifications) || 0,
      Internships: Number(row.Internships) || 0,
      Job_Changes: Number(row.Job_Changes) || 0,
      Networking_Score: Number(row.Networking_Score) || 0,
      Salary_at_30: Number(row.Salary_at_30) || 0,
    };
  });
}

export function calculateStatistics(data: ProcessedData[]) {
  const salaries = data.map(d => d.Salary_at_30);
  
  return {
    mean: salaries.reduce((a, b) => a + b, 0) / salaries.length,
    median: salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)],
    min: Math.min(...salaries),
    max: Math.max(...salaries),
    count: salaries.length
  };
}

export function groupByEducation(data: ProcessedData[]) {
  const groups = data.reduce((acc, item) => {
    if (!acc[item.education]) acc[item.education] = [];
    acc[item.education].push(item);
    return acc;
  }, {} as Record<string, ProcessedData[]>);

  return Object.entries(groups).map(([education, items]) => ({
    education,
    count: items.length,
    avgSalary: items.reduce((sum, item) => sum + item.Salary_at_30, 0) / items.length,
    data: items
  }));
}

export function groupByIndustry(data: ProcessedData[]) {
  const groups = data.reduce((acc, item) => {
    if (!acc[item.industry]) acc[item.industry] = [];
    acc[item.industry].push(item);
    return acc;
  }, {} as Record<string, ProcessedData[]>);

  return Object.entries(groups).map(([industry, items]) => ({
    industry,
    count: items.length,
    avgSalary: items.reduce((sum, item) => sum + item.Salary_at_30, 0) / items.length,
    data: items
  }));
}

export function calculateCorrelations(data: ProcessedData[]) {
  const numericFields = [
    'Work_Experience', 'GPA', 'Certifications', 'Internships', 
    'Job_Changes', 'Networking_Score', 'Salary_at_30'
  ];

  const correlations: Record<string, Record<string, number>> = {};

  numericFields.forEach(field1 => {
    correlations[field1] = {};
    numericFields.forEach(field2 => {
      correlations[field1][field2] = pearsonCorrelation(
        data.map(d => d[field1 as keyof ProcessedData] as number),
        data.map(d => d[field2 as keyof ProcessedData] as number)
      );
    });
  });

  return correlations;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
} 