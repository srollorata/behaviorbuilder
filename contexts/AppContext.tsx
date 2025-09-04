import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student, BehaviorCategory, BehaviorEntry, Class } from '@/types';
import {
  getStudents,
  saveStudents,
  getBehaviorCategories,
  saveBehaviorCategories,
  getBehaviorEntries,
  saveBehaviorEntries,
  getClasses,
  saveClasses,
} from '@/utils/storage';

interface AppContextType {
  students: Student[];
  behaviors: BehaviorCategory[];
  entries: BehaviorEntry[];
  classes: Class[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  addStudents: (students: Omit<Student, 'id' | 'createdAt'>[]) => void;
  addBehavior: (behavior: Omit<BehaviorCategory, 'id' | 'createdAt'>) => void;
  updateBehavior: (behaviorId: string, updates: Partial<Omit<BehaviorCategory, 'id' | 'createdAt'>>) => void;
  logBehavior: (entry: Omit<BehaviorEntry, 'id' | 'timestamp'>) => void;
  addClass: (class_: Omit<Class, 'id' | 'createdAt'>) => void;
  deleteStudent: (studentId: string) => void;
  deleteBehavior: (behaviorId: string) => void;
  deleteClass: (classId: string) => void;
  getClassName: (student: Student) => string;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorCategory[]>([]);
  const [entries, setEntries] = useState<BehaviorEntry[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedStudents, loadedBehaviors, loadedEntries, loadedClasses] = await Promise.all([
        getStudents(),
        getBehaviorCategories(),
        getBehaviorEntries(),
        getClasses(),
      ]);

      setStudents(loadedStudents);
      setBehaviors(loadedBehaviors);
      setEntries(loadedEntries);
      setClasses(loadedClasses);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await saveStudents(updatedStudents);
  };

  const addStudents = async (studentsData: Omit<Student, 'id' | 'createdAt'>[]) => {
    const newStudents = studentsData.map(data => ({
      ...data,
      id: generateId(),
      createdAt: new Date(),
    }));
    
    const updatedStudents = [...students, ...newStudents];
    setStudents(updatedStudents);
    await saveStudents(updatedStudents);
  };

  const addBehavior = async (behaviorData: Omit<BehaviorCategory, 'id' | 'createdAt'>) => {
    const newBehavior: BehaviorCategory = {
      ...behaviorData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    const updatedBehaviors = [...behaviors, newBehavior];
    setBehaviors(updatedBehaviors);
    await saveBehaviorCategories(updatedBehaviors);
  };

  const updateBehavior = async (behaviorId: string, updates: Partial<Omit<BehaviorCategory, 'id' | 'createdAt'>>) => {
    const updatedBehaviors = behaviors.map(behavior => 
      behavior.id === behaviorId 
        ? { ...behavior, ...updates }
        : behavior
    );
    setBehaviors(updatedBehaviors);
    await saveBehaviorCategories(updatedBehaviors);
  };

  const logBehavior = async (entryData: Omit<BehaviorEntry, 'id' | 'timestamp'>) => {
    const newEntry: BehaviorEntry = {
      ...entryData,
      id: generateId(),
      timestamp: new Date(),
    };
    
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await saveBehaviorEntries(updatedEntries);
  };

  const addClass = async (classData: Omit<Class, 'id' | 'createdAt'>) => {
    const newClass: Class = {
      ...classData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    await saveClasses(updatedClasses);
  };

  const deleteStudent = async (studentId: string) => {
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    await saveStudents(updatedStudents);
    
    // Also remove entries for this student
    const updatedEntries = entries.filter(e => e.studentId !== studentId);
    setEntries(updatedEntries);
    await saveBehaviorEntries(updatedEntries);
  };

  const deleteBehavior = async (behaviorId: string) => {
    // Check if behavior has existing entries
    const behaviorEntries = entries.filter(e => e.behaviorId === behaviorId);
    
    if (behaviorEntries.length > 0) {
      // Remove all entries associated with this behavior
      const updatedEntries = entries.filter(e => e.behaviorId !== behaviorId);
      setEntries(updatedEntries);
      await saveBehaviorEntries(updatedEntries);
    }
    
    const updatedBehaviors = behaviors.filter(b => b.id !== behaviorId);
    setBehaviors(updatedBehaviors);
    await saveBehaviorCategories(updatedBehaviors);
  };

  const deleteClass = async (classId: string) => {
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    await saveClasses(updatedClasses);
  };

  const getClassName = (student: Student): string => {
    if (!student.classId) return 'No Class';
    const class_ = classes.find(c => c.id === student.classId);
    return class_?.name || 'Unknown Class';
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  return (
    <AppContext.Provider
      value={{
        students,
        behaviors,
        entries,
        classes,
        addStudent,
        addStudents,
        addBehavior,
        updateBehavior,
        logBehavior,
        addClass,
        deleteStudent,
        deleteBehavior,
        deleteClass,
        getClassName,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};