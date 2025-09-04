import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, BehaviorCategory, BehaviorEntry, Class } from '@/types';

const STORAGE_KEYS = {
  STUDENTS: 'students',
  BEHAVIORS: 'behaviors',
  ENTRIES: 'behavior_entries',
  CLASSES: 'classes',
};

// Students
export const getStudents = async (): Promise<Student[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data).map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt)
    })) : [];
  } catch (error) {
    console.error('Error loading students:', error);
    return [];
  }
};

export const saveStudents = async (students: Student[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students:', error);
  }
};

// Behavior Categories
export const getBehaviorCategories = async (): Promise<BehaviorCategory[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BEHAVIORS);
    if (data) {
      return JSON.parse(data).map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt)
      }));
    }
    
    // Return default behaviors if none exist
    return getDefaultBehaviors();
  } catch (error) {
    console.error('Error loading behaviors:', error);
    return getDefaultBehaviors();
  }
};

export const saveBehaviorCategories = async (behaviors: BehaviorCategory[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BEHAVIORS, JSON.stringify(behaviors));
  } catch (error) {
    console.error('Error saving behaviors:', error);
  }
};

// Behavior Entries
export const getBehaviorEntries = async (): Promise<BehaviorEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data).map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp)
    })) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
};

export const saveBehaviorEntries = async (entries: BehaviorEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
  }
};

// Classes
export const getClasses = async (): Promise<Class[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CLASSES);
    return data ? JSON.parse(data).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      students: c.students.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
      }))
    })) : [];
  } catch (error) {
    console.error('Error loading classes:', error);
    return [];
  }
};

export const saveClasses = async (classes: Class[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (error) {
    console.error('Error saving classes:', error);
  }
};

const getDefaultBehaviors = (): BehaviorCategory[] => [
  {
    id: '1',
    name: 'Helping a Classmate',
    type: 'positive',
    points: 5,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'On-task Behavior',
    type: 'positive',
    points: 3,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Excellent Participation',
    type: 'positive',
    points: 5,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Following Directions',
    type: 'positive',
    points: 3,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Off-task Behavior',
    type: 'negative',
    points: -2,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Disruptive Talking',
    type: 'negative',
    points: -3,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '7',
    name: 'Incomplete Work',
    type: 'negative',
    points: -2,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '8',
    name: 'Not Following Directions',
    type: 'negative',
    points: -3,
    isCustom: false,
    createdAt: new Date(),
  },
];