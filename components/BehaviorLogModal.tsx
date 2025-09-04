import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { Student, BehaviorCategory } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { BehaviorButton } from './BehaviorButton';

interface BehaviorLogModalProps {
  visible: boolean;
  onClose: () => void;
  student?: Student;
}

export const BehaviorLogModal: React.FC<BehaviorLogModalProps> = ({
  visible,
  onClose,
  student,
}) => {
  const { behaviors, logBehavior, addBehavior, getClassName } = useAppContext();
  const [notes, setNotes] = useState('');
  const [showAddBehavior, setShowAddBehavior] = useState(false);
  const [newBehaviorName, setNewBehaviorName] = useState('');
  const [newBehaviorType, setNewBehaviorType] = useState<'positive' | 'negative'>('positive');
  const [newBehaviorPoints, setNewBehaviorPoints] = useState('3');

  const handleLogBehavior = (behavior: BehaviorCategory) => {
    if (!student) return;

    logBehavior({
      studentId: student.id,
      behaviorId: behavior.id,
      notes: notes.trim() || undefined,
      teacherId: 'current_teacher', // In real app, this would come from auth
    });

    Alert.alert(
      'Behavior Logged',
      `${behavior.name} logged for ${student.name}`,
      [{ text: 'OK' }]
    );

    setNotes('');
    onClose();
  };

  const handleAddCustomBehavior = () => {
    if (!newBehaviorName.trim()) {
      Alert.alert('Error', 'Please enter a behavior name');
      return;
    }

    const points = parseInt(newBehaviorPoints);
    if (isNaN(points)) {
      Alert.alert('Error', 'Please enter a valid point value');
      return;
    }

    addBehavior({
      name: newBehaviorName.trim(),
      type: newBehaviorType,
      points: newBehaviorType === 'positive' ? Math.abs(points) : -Math.abs(points),
      isCustom: true,
    });

    setNewBehaviorName('');
    setNewBehaviorPoints('3');
    setShowAddBehavior(false);
    Alert.alert('Success', 'Custom behavior added');
  };

  const positiveBehaviors = behaviors.filter(b => b.type === 'positive');
  const negativeBehaviors = behaviors.filter(b => b.type === 'negative');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Log Behavior</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {student && (
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentClass}>{getClassName(student)}</Text>
          </View>
        )}

        <ScrollView style={styles.content}>
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add context or details about this behavior..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.behaviorSection}>
            <Text style={styles.sectionTitle}>Positive Behaviors</Text>
            {positiveBehaviors.map(behavior => (
              <BehaviorButton
                key={behavior.id}
                behavior={behavior}
                onPress={() => handleLogBehavior(behavior)}
              />
            ))}
          </View>

          <View style={styles.behaviorSection}>
            <Text style={styles.sectionTitle}>Negative Behaviors</Text>
            {negativeBehaviors.map(behavior => (
              <BehaviorButton
                key={behavior.id}
                behavior={behavior}
                onPress={() => handleLogBehavior(behavior)}
              />
            ))}
          </View>

          {!showAddBehavior ? (
            <TouchableOpacity
              style={styles.addBehaviorButton}
              onPress={() => setShowAddBehavior(true)}
            >
              <Plus size={20} color="#2563EB" />
              <Text style={styles.addBehaviorText}>Add Custom Behavior</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addBehaviorForm}>
              <Text style={styles.sectionTitle}>Add Custom Behavior</Text>
              
              <TextInput
                style={styles.input}
                value={newBehaviorName}
                onChangeText={setNewBehaviorName}
                placeholder="Behavior name"
              />

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, newBehaviorType === 'positive' && styles.activeTypeButton]}
                  onPress={() => setNewBehaviorType('positive')}
                >
                  <Text style={[styles.typeButtonText, newBehaviorType === 'positive' && styles.activeTypeText]}>
                    Positive
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newBehaviorType === 'negative' && styles.activeTypeButton]}
                  onPress={() => setNewBehaviorType('negative')}
                >
                  <Text style={[styles.typeButtonText, newBehaviorType === 'negative' && styles.activeTypeText]}>
                    Negative
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                value={newBehaviorPoints}
                onChangeText={setNewBehaviorPoints}
                placeholder="Point value"
                keyboardType="numeric"
              />

              <View style={styles.customButtonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddBehavior(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddCustomBehavior}
                >
                  <Text style={styles.saveButtonText}>Add Behavior</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  studentInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  studentClass: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  notesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  behaviorSection: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  addBehaviorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 16,
  },
  addBehaviorText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
  addBehaviorForm: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginHorizontal: 2,
  },
  activeTypeButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  customButtonRow: {
    flexDirection: 'row',
    marginTop: 16,
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
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});