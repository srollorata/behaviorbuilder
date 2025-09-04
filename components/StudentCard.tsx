import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Student, BehaviorEntry, BehaviorCategory } from '@/types';
import { User, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';

interface StudentCardProps {
  student: Student;
  entries: BehaviorEntry[];
  behaviors: BehaviorCategory[];
  onPress: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  entries,
  behaviors,
  onPress,
}) => {
  const { getClassName } = useAppContext();
  const studentEntries = entries.filter(entry => entry.studentId === student.id);
  
  const positiveCount = studentEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'positive';
  }).length;

  const negativeCount = studentEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'negative';
  }).length;

  const totalScore = studentEntries.reduce((score, entry) => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return score + (behavior?.points || 0);
  }, 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.userIconContainer}>
          <User size={24} color="#374151" />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.className}>{getClassName(student)}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, totalScore >= 0 ? styles.positiveScore : styles.negativeScore]}>
            {totalScore >= 0 ? '+' : ''}{totalScore}
          </Text>
        </View>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <TrendingUp size={16} color="#059669" />
          <Text style={styles.positiveText}>{positiveCount}</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingDown size={16} color="#DC2626" />
          <Text style={styles.negativeText}>{negativeCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  className: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveScore: {
    color: '#059669',
  },
  negativeScore: {
    color: '#DC2626',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  positiveText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  negativeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
});