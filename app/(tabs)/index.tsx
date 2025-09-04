import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/contexts/AppContext';
import { StudentCard } from '@/components/StudentCard';
import { BehaviorLogModal } from '@/components/BehaviorLogModal';
import { Student } from '@/types';
import { BookOpen, Users, Activity, TrendingUp, TrendingDown } from 'lucide-react-native';

export default function HomeScreen() {
  const { students, behaviors, entries, loading } = useAppContext();
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [showBehaviorLog, setShowBehaviorLog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refresh data from server
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowBehaviorLog(true);
  };

  const todayEntries = entries.filter(
    entry => {
      const today = new Date();
      const entryDate = entry.timestamp;
      return (
        entryDate.getDate() === today.getDate() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    }
  );

  const todayPositive = todayEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'positive';
  }).length;

  const todayNegative = todayEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'negative';
  }).length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Behavior Builder</Text>
        <Text style={styles.subtitle}>Classroom Management Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={24} color="#2563EB" />
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        
        <View style={styles.statCard}>
          <Activity size={24} color="#059669" />
          <Text style={styles.statNumber}>{todayPositive}</Text>
          <Text style={styles.statLabel}>Today Positive</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingDown size={24} color="#DC2626" />
          <Text style={styles.statNumber}>{todayNegative}</Text>
          <Text style={styles.statLabel}>Today Negative</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Students Yet</Text>
          <Text style={styles.emptyText}>
            Add students to start tracking behavior and building positive classroom management
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.studentsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Quick Log Behavior</Text>
          <Text style={styles.sectionSubtitle}>Tap on any student to log a behavior</Text>
          
          {students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              entries={entries}
              behaviors={behaviors}
              onPress={() => handleStudentSelect(student)}
            />
          ))}
        </ScrollView>
      )}

      <BehaviorLogModal
        visible={showBehaviorLog}
        onClose={() => {
          setShowBehaviorLog(false);
          setSelectedStudent(undefined);
        }}
        student={selectedStudent}
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    marginHorizontal: 20,
  },
});