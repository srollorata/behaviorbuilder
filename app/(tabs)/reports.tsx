import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/contexts/AppContext';
import { generateStudentReport, formatDateRange, calculateBehaviorScore } from '@/utils/reportUtils';
import { Student } from '@/types';
import { FileText, Calendar, TrendingUp, ChartBar as BarChart3, Download } from 'lucide-react-native';

export default function ReportsScreen() {
  const { students, behaviors, entries, loading, getClassName } = useAppContext();
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // Last 30 days
    return { start, end };
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // The context will automatically update when data changes
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Force re-render when entries change to ensure real-time updates
  useEffect(() => {
    // This effect will trigger re-renders when entries change
  }, [entries, behaviors, students]);

  const handleGenerateReport = (student: Student) => {
    const report = generateStudentReport(student, entries, behaviors, dateRange);
    
    const reportText = `
BEHAVIOR REPORT
Student: ${student.name}
Class: ${getClassName(student)}
Period: ${formatDateRange(report.dateRange.start, report.dateRange.end)}

SUMMARY:
• Positive Behaviors: ${report.totalPositive}
• Negative Behaviors: ${report.totalNegative}
• Total Score: ${calculateBehaviorScore(report.entries, behaviors)}

RECENT ENTRIES:
${report.entries.slice(0, 10).map(entry => {
  const behavior = behaviors.find(b => b.id === entry.behaviorId);
  return `• ${behavior?.name || 'Unknown'} - ${entry.timestamp.toLocaleDateString()}`;
}).join('\n')}
    `.trim();

    Alert.alert(
      'Student Report',
      reportText,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share Report', onPress: () => handleShareReport(student, reportText) },
      ]
    );
  };

  const handleShareReport = (student: Student, reportText: string) => {
    // In a real app, this would use React Native's Share API or generate a PDF
    Alert.alert(
      'Share Report',
      'Report sharing functionality would be implemented here using React Native Share API or PDF generation.',
      [{ text: 'OK' }]
    );
  };

  const classSummary = useMemo(() => {
    const classEntries = entries.filter(entry => {
      return entry.timestamp >= dateRange.start && entry.timestamp <= dateRange.end;
    });

    const positiveEntries = classEntries.filter(entry => {
      const behavior = behaviors.find(b => b.id === entry.behaviorId);
      return behavior?.type === 'positive';
    });

    const negativeEntries = classEntries.filter(entry => {
      const behavior = behaviors.find(b => b.id === entry.behaviorId);
      return behavior?.type === 'negative';
    });

    return {
      totalEntries: classEntries.length,
      positiveCount: positiveEntries.length,
      negativeCount: negativeEntries.length,
      ratio: positiveEntries.length > 0 ? (positiveEntries.length / (positiveEntries.length + negativeEntries.length)) * 100 : 0,
    };
  }, [entries, behaviors, dateRange]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Class Overview</Text>
          <Text style={styles.dateRangeText}>
            {formatDateRange(dateRange.start, dateRange.end)}
          </Text>
          
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <BarChart3 size={24} color="#2563EB" />
              <Text style={styles.overviewNumber}>{classSummary.totalEntries}</Text>
              <Text style={styles.overviewLabel}>Total Behaviors</Text>
            </View>
            
            <View style={styles.overviewCard}>
              <TrendingUp size={24} color="#059669" />
              <Text style={styles.overviewNumber}>{classSummary.positiveCount}</Text>
              <Text style={styles.overviewLabel}>Positive</Text>
            </View>
            
            <View style={styles.overviewCard}>
              <Calendar size={24} color="#EA580C" />
              <Text style={styles.overviewNumber}>{classSummary.ratio.toFixed(0)}%</Text>
              <Text style={styles.overviewLabel}>Positive Ratio</Text>
            </View>
          </View>
        </View>

        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>Individual Student Reports</Text>
          
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No students to report on</Text>
              <Text style={styles.emptySubtext}>Add students to generate behavior reports</Text>
            </View>
          ) : (
            students.map(student => {
              const studentEntries = entries.filter(e => 
                e.studentId === student.id &&
                e.timestamp >= dateRange.start &&
                e.timestamp <= dateRange.end
              );
              
              const studentScore = calculateBehaviorScore(studentEntries, behaviors);
              const positiveCount = studentEntries.filter(entry => {
                const behavior = behaviors.find(b => b.id === entry.behaviorId);
                return behavior?.type === 'positive';
              }).length;
              
              const negativeCount = studentEntries.filter(entry => {
                const behavior = behaviors.find(b => b.id === entry.behaviorId);
                return behavior?.type === 'negative';
              }).length;

              return (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentReportCard}
                  onPress={() => handleGenerateReport(student)}
                >
                  <View style={styles.studentReportHeader}>
                    <Text style={styles.studentReportName}>{student.name}</Text>
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={16} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.studentReportStats}>
                    <View style={styles.reportStat}>
                      <Text style={styles.reportStatNumber}>{positiveCount}</Text>
                      <Text style={styles.reportStatLabel}>Positive</Text>
                    </View>
                    <View style={styles.reportStat}>
                      <Text style={styles.reportStatNumber}>{negativeCount}</Text>
                      <Text style={styles.reportStatLabel}>Negative</Text>
                    </View>
                    <View style={styles.reportStat}>
                      <Text style={[
                        styles.reportStatNumber,
                        studentScore >= 0 ? styles.positiveScore : styles.negativeScore
                      ]}>
                        {studentScore >= 0 ? '+' : ''}{studentScore}
                      </Text>
                      <Text style={styles.reportStatLabel}>Score</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        </ScrollView>
      )}
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
  content: {
    flex: 1,
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateRangeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  overviewCards: {
    flexDirection: 'row',
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  studentsSection: {
    padding: 20,
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
  studentReportCard: {
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
  studentReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentReportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  downloadButton: {
    padding: 4,
  },
  studentReportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  reportStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  positiveScore: {
    color: '#059669',
  },
  negativeScore: {
    color: '#DC2626',
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
});