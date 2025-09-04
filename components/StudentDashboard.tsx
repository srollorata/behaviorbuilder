import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Student, BehaviorEntry, BehaviorCategory } from '@/types';
import { Calendar, TrendingUp, TrendingDown, Clock, Plus } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';

interface StudentDashboardProps {
  student: Student;
  entries: BehaviorEntry[];
  behaviors: BehaviorCategory[];
  onLogBehavior: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  entries,
  behaviors,
  onLogBehavior,
}) => {
  const { getClassName } = useAppContext();
  const studentEntries = entries
    .filter(entry => entry.studentId === student.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const totalScore = studentEntries.reduce((score, entry) => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return score + (behavior?.points || 0);
  }, 0);

  const positiveCount = studentEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'positive';
  }).length;

  const negativeCount = studentEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'negative';
  }).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.className}>{getClassName(student)}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalScore >= 0 ? '+' : ''}{totalScore}</Text>
          <Text style={styles.statLabel}>Total Score</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <TrendingUp size={16} color="#059669" />
            <Text style={styles.positiveCount}>{positiveCount}</Text>
          </View>
          <Text style={styles.statLabel}>Positive</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <TrendingDown size={16} color="#DC2626" />
            <Text style={styles.negativeCount}>{negativeCount}</Text>
          </View>
          <Text style={styles.statLabel}>Negative</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logButton} onPress={onLogBehavior}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.logButtonText}>Log New Behavior</Text>
      </TouchableOpacity>

      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {studentEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No behaviors logged yet</Text>
            <Text style={styles.emptySubtext}>Tap "Log New Behavior" to get started</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {studentEntries.slice(0, 20).map((entry) => {
              const behavior = behaviors.find(b => b.id === entry.behaviorId);
              if (!behavior) return null;

              return (
                <View key={entry.id} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIndicator,
                    behavior.type === 'positive' ? styles.positiveIndicator : styles.negativeIndicator
                  ]} />
                  <View style={styles.timelineContent}>
                    <View style={styles.behaviorHeader}>
                      <Text style={[
                        styles.behaviorName,
                        behavior.type === 'positive' ? styles.positiveText : styles.negativeText
                      ]}>
                        {behavior.name}
                      </Text>
                      <Text style={styles.behaviorPoints}>
                        {behavior.points >= 0 ? '+' : ''}{behavior.points}
                      </Text>
                    </View>
                    <View style={styles.timelineMeta}>
                      <Clock size={12} color="#9CA3AF" />
                      <Text style={styles.timestamp}>
                        {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                      </Text>
                    </View>
                    {entry.notes && (
                      <Text style={styles.entryNotes}>{entry.notes}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  className: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  positiveCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  negativeCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 4,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  timelineSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  timeline: {
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  positiveIndicator: {
    backgroundColor: '#059669',
  },
  negativeIndicator: {
    backgroundColor: '#DC2626',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  behaviorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  behaviorName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  positiveText: {
    color: '#059669',
  },
  negativeText: {
    color: '#DC2626',
  },
  behaviorPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  entryNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
});