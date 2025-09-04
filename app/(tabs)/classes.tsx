import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/contexts/AppContext';
import { Class } from '@/types';
import { Plus, Users, Trash2, Edit3, ArrowLeft } from 'lucide-react-native';

export default function ClassesScreen() {
  const { classes, students, addClass, deleteClass, getClassName } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    const classStudents = students.filter(s => selectedStudents.includes(s.id));
    
    addClass({
      name: newClassName.trim(),
      students: classStudents,
    });

    setNewClassName('');
    setSelectedStudents([]);
    setShowAddForm(false);
    Alert.alert('Success', 'Class created successfully');
  };

  const handleDeleteClass = (class_: Class) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${class_.name}"? This will not delete the students, only the class grouping.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteClass(class_.id),
        },
      ]
    );
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const resetForm = () => {
    setNewClassName('');
    setSelectedStudents([]);
    setShowAddForm(false);
    setEditingClass(null);
  };

  if (showAddForm) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetForm}
          >
            <ArrowLeft size={24} color="#2563EB" />
            <Text style={styles.backText}>Classes</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create New Class</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Class Information</Text>
            
            <TextInput
              style={styles.input}
              value={newClassName}
              onChangeText={setNewClassName}
              placeholder="Class name (e.g., 'Math 101', 'Science 7A')"
            />

            <Text style={styles.sectionTitle}>Select Students</Text>
            <Text style={styles.sectionSubtitle}>
              Choose students to include in this class ({selectedStudents.length} selected)
            </Text>

            {students.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No students available</Text>
                <Text style={styles.emptySubtext}>Add students first to create classes</Text>
              </View>
            ) : (
              <View style={styles.studentsList}>
                {students.map(student => (
                  <TouchableOpacity
                    key={student.id}
                    style={[
                      styles.studentItem,
                      selectedStudents.includes(student.id) && styles.selectedStudentItem
                    ]}
                    onPress={() => toggleStudentSelection(student.id)}
                  >
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentClass}>{getClassName(student)}</Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      selectedStudents.includes(student.id) && styles.checkedBox
                    ]}>
                      {selectedStudents.includes(student.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, selectedStudents.length === 0 && styles.disabledButton]}
                onPress={handleAddClass}
                disabled={selectedStudents.length === 0}
              >
                <Text style={styles.saveButtonText}>Create Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Class Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Classes Created</Text>
            <Text style={styles.emptyText}>
              Create classes to organize your students and track behavior by class
            </Text>
          </View>
        ) : (
          <View style={styles.classesList}>
            {classes.map(class_ => (
              <View key={class_.id} style={styles.classItem}>
                <View style={styles.classContent}>
                  <Text style={styles.className}>{class_.name}</Text>
                  <View style={styles.classMeta}>
                    <Text style={styles.studentCount}>
                      {class_.students.length} student{class_.students.length !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.createdDate}>
                      Created {class_.createdAt.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.studentsPreview}>
                    {class_.students.slice(0, 3).map(student => (
                      <Text key={student.id} style={styles.studentPreview}>
                        {student.name}
                      </Text>
                    ))}
                    {class_.students.length > 3 && (
                      <Text style={styles.moreStudents}>
                        +{class_.students.length - 3} more
                      </Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteClass(class_)}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  studentsList: {
    marginBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedStudentItem: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  studentClass: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  classesList: {
    padding: 16,
  },
  classItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classContent: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  createdDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  studentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  studentPreview: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  moreStudents: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
