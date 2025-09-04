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
import { BehaviorCategory } from '@/types';
import { Plus, Trash2, Edit3 } from 'lucide-react-native';

export default function BehaviorsScreen() {
  const { behaviors, entries, addBehavior, updateBehavior, deleteBehavior } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBehavior, setEditingBehavior] = useState<BehaviorCategory | null>(null);
  const [newBehaviorName, setNewBehaviorName] = useState('');
  const [newBehaviorType, setNewBehaviorType] = useState<'positive' | 'negative'>('positive');
  const [newBehaviorPoints, setNewBehaviorPoints] = useState('3');

  const handleAddBehavior = () => {
    if (!newBehaviorName.trim()) {
      Alert.alert('Error', 'Please enter a behavior name');
      return;
    }

    const points = parseInt(newBehaviorPoints);
    if (isNaN(points)) {
      Alert.alert('Error', 'Please enter a valid point value');
      return;
    }

    if (editingBehavior) {
      // Update existing behavior
      updateBehavior(editingBehavior.id, {
        name: newBehaviorName.trim(),
        type: newBehaviorType,
        points: newBehaviorType === 'positive' ? Math.abs(points) : -Math.abs(points),
      });
      Alert.alert('Success', 'Behavior updated successfully');
    } else {
      // Add new behavior
      addBehavior({
        name: newBehaviorName.trim(),
        type: newBehaviorType,
        points: newBehaviorType === 'positive' ? Math.abs(points) : -Math.abs(points),
        isCustom: true,
      });
      Alert.alert('Success', 'Behavior added successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setNewBehaviorName('');
    setNewBehaviorPoints('3');
    setNewBehaviorType('positive');
    setShowAddForm(false);
    setEditingBehavior(null);
  };

  const handleEditBehavior = (behavior: BehaviorCategory) => {
    if (!behavior.isCustom) {
      Alert.alert('Cannot Edit', 'Default behaviors cannot be edited');
      return;
    }

    setEditingBehavior(behavior);
    setNewBehaviorName(behavior.name);
    setNewBehaviorType(behavior.type);
    setNewBehaviorPoints(Math.abs(behavior.points).toString());
    setShowAddForm(true);
  };

  const handleDeleteBehavior = (behavior: BehaviorCategory) => {
    if (!behavior.isCustom) {
      Alert.alert('Cannot Delete', 'Default behaviors cannot be deleted');
      return;
    }

    // Check if behavior has existing entries
    const behaviorEntries = entries.filter(e => e.behaviorId === behavior.id);
    const hasEntries = behaviorEntries.length > 0;

    const message = hasEntries 
      ? `Are you sure you want to delete "${behavior.name}"? This will also remove ${behaviorEntries.length} behavior entry(ies) associated with this behavior.`
      : `Are you sure you want to delete "${behavior.name}"?`;

    Alert.alert(
      'Delete Behavior',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBehavior(behavior.id),
        },
      ]
    );
  };

  const positiveBehaviors = behaviors.filter(b => b.type === 'positive');
  const negativeBehaviors = behaviors.filter(b => b.type === 'negative');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Behavior Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>
              {editingBehavior ? 'Edit Behavior' : 'Add Custom Behavior'}
            </Text>
            
            <TextInput
              style={styles.input}
              value={newBehaviorName}
              onChangeText={setNewBehaviorName}
              placeholder="Behavior name (e.g., 'Excellent teamwork')"
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
              placeholder="Point value (e.g., 3)"
              keyboardType="numeric"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddBehavior}
              >
                <Text style={styles.saveButtonText}>
                  {editingBehavior ? 'Update Behavior' : 'Add Behavior'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Positive Behaviors</Text>
          {positiveBehaviors.map(behavior => (
            <View key={behavior.id} style={styles.behaviorItem}>
              <View style={styles.behaviorContent}>
                <Text style={styles.behaviorName}>{behavior.name}</Text>
                <View style={styles.behaviorMeta}>
                  <Text style={styles.behaviorPoints}>+{behavior.points} points</Text>
                  {behavior.isCustom && (
                    <Text style={styles.customLabel}>Custom</Text>
                  )}
                </View>
              </View>
              {behavior.isCustom && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => handleEditBehavior(behavior)}
                  >
                    <Edit3 size={16} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={() => handleDeleteBehavior(behavior)}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Negative Behaviors</Text>
          {negativeBehaviors.map(behavior => (
            <View key={behavior.id} style={styles.behaviorItem}>
              <View style={styles.behaviorContent}>
                <Text style={styles.behaviorName}>{behavior.name}</Text>
                <View style={styles.behaviorMeta}>
                  <Text style={styles.behaviorPoints}>{behavior.points} points</Text>
                  {behavior.isCustom && (
                    <Text style={styles.customLabel}>Custom</Text>
                  )}
                </View>
              </View>
              {behavior.isCustom && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => handleEditBehavior(behavior)}
                  >
                    <Edit3 size={16} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={() => handleDeleteBehavior(behavior)}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Removed stray AddStudentModal from Behaviors screen */}
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
  content: {
    flex: 1,
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  formButtons: {
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  behaviorItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  behaviorContent: {
    flex: 1,
  },
  behaviorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  behaviorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  behaviorPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  customLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteIconButton: {
    padding: 8,
  },
});