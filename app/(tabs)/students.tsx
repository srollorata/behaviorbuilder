import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/contexts/AppContext';
import { AddStudentModal } from '@/components/AddStudentModal';
import { StudentDashboard } from '@/components/StudentDashboard';
import { BehaviorLogModal } from '@/components/BehaviorLogModal';
import { Student } from '@/types';
import { UserPlus, Users, ArrowLeft, Trash2 } from 'lucide-react-native';

export default function StudentsScreen() {
  const { students, behaviors, entries, deleteStudent, getClassName } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showBehaviorLog, setShowBehaviorLog] = useState(false);

  const handleStudentPress = (student: Student) => {
    setSelectedStudent(student);
    setShowDashboard(true);
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove ${student.name} from your roster? This will also delete all their behavior records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteStudent(student.id),
        },
      ]
    );
  };

  const handleLogBehavior = () => {
    setShowDashboard(false);
    setShowBehaviorLog(true);
  };

  if (showDashboard && selectedStudent) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.dashboardHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowDashboard(false)}
          >
            <ArrowLeft size={24} color="#2563EB" />
            <Text style={styles.backText}>Students</Text>
          </TouchableOpacity>
        </View>
        
        <StudentDashboard
          student={selectedStudent}
          entries={entries}
          behaviors={behaviors}
          onLogBehavior={handleLogBehavior}
        />

        <BehaviorLogModal
          visible={showBehaviorLog}
          onClose={() => setShowBehaviorLog(false)}
          student={selectedStudent}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Student Roster</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <UserPlus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Students Added</Text>
          <Text style={styles.emptyText}>
            Start by adding students to your roster using the + button above
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.studentsList}>
          {students.map(student => {
            const studentEntries = entries.filter(e => e.studentId === student.id);
            const totalScore = studentEntries.reduce((score, entry) => {
              const behavior = behaviors.find(b => b.id === entry.behaviorId);
              return score + (behavior?.points || 0);
            }, 0);

            return (
              <View key={student.id} style={styles.studentRow}>
                <TouchableOpacity
                  style={styles.studentCard}
                  onPress={() => handleStudentPress(student)}
                >
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentClass}>{getClassName(student)}</Text>
                    {student.email && (
                      <Text style={styles.studentEmail}>{student.email}</Text>
                    )}
                  </View>
                  <View style={styles.studentStats}>
                    <Text style={[
                      styles.score,
                      totalScore >= 0 ? styles.positiveScore : styles.negativeScore
                    ]}>
                      {totalScore >= 0 ? '+' : ''}{totalScore}
                    </Text>
                    <Text style={styles.entryCount}>{studentEntries.length} entries</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteStudent(student)}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      <AddStudentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
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
  dashboardHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  studentsList: {
    flex: 1,
    paddingVertical: 16,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  studentCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  studentClass: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  studentStats: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  positiveScore: {
    color: '#059669',
  },
  negativeScore: {
    color: '#DC2626',
  },
  entryCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 8,
  },
});