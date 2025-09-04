import { Student } from '@/types';

// Return shape aligned with addStudents: omit id/createdAt; those are generated in context
export const parseCSV = (csvContent: string, classes: { id: string; name: string }[]): Omit<Student, 'id' | 'createdAt'>[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const nameIndex = headers.findIndex(h => h.includes('name'));
  const emailIndex = headers.findIndex(h => h.includes('email'));
  const classIndex = headers.findIndex(h => h.includes('class'));
  
  if (nameIndex === -1) {
    throw new Error('CSV must contain a "name" column');
  }

  const students: Omit<Student, 'id' | 'createdAt'>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values[nameIndex]) {
      let classId: string | undefined;
      
      if (classIndex >= 0 && values[classIndex]) {
        // Try to find matching class by name
        const matchingClass = classes.find(c => 
          c.name.toLowerCase() === values[classIndex].toLowerCase()
        );
        classId = matchingClass?.id;
      }
      
      students.push({
        name: values[nameIndex],
        email: emailIndex >= 0 ? values[emailIndex] : undefined,
        classId: classId,
      });
    }
  }
  
  return students;
};

export const generateCSVTemplate = (): string => {
  return 'name,email,class\nJohn Doe,john@example.com,Math 101\nJane Smith,jane@example.com,Math 101\n';
};