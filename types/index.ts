export interface Student {
  id: string;
  name: string;
  classId?: string; // Reference to Class.id, optional for backward compatibility
  email?: string;
  createdAt: Date;
}

export interface BehaviorCategory {
  id: string;
  name: string;
  type: 'positive' | 'negative';
  points: number;
  isCustom: boolean;
  createdAt: Date;
}

export interface BehaviorEntry {
  id: string;
  studentId: string;
  behaviorId: string;
  timestamp: Date;
  notes?: string;
  teacherId: string;
}

export interface BehaviorReport {
  studentId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  totalPositive: number;
  totalNegative: number;
  entries: BehaviorEntry[];
  trends: {
    week: number;
    positiveCount: number;
    negativeCount: number;
  }[];
}

export interface Class {
  id: string;
  name: string;
  students: Student[];
  createdAt: Date;
}