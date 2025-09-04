import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { X, Upload, UserPlus, ChevronDown } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import { parseCSV, generateCSVTemplate } from '@/utils/csvUtils';
import { Class } from '@/types';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
}) => {
  const { addStudent, addStudents, classes } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [mode, setMode] = useState<'single' | 'csv'>('single');

  const handleAddSingle = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a student name');
      return;
    }

    addStudent({
      name: name.trim(),
      email: email.trim() || undefined,
      classId: selectedClassId || undefined,
    });

    resetForm();
    onClose();
  };

  const handleAddCSV = () => {
    if (!csvInput.trim()) {
      Alert.alert('Error', 'Please paste CSV data');
      return;
    }

    try {
      const students = parseCSV(csvInput, classes);
      if (students.length === 0) {
        Alert.alert('Error', 'No valid student data found in CSV');
        return;
      }

      addStudents(students);
      Alert.alert('Success', `Added ${students.length} students`);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSelectedClassId('');
    setShowClassDropdown(false);
    setCsvInput('');
  };

  const getSelectedClassName = () => {
    if (!selectedClassId) return 'Select a class (optional)';
    const selectedClass = classes.find(c => c.id === selectedClassId);
    return selectedClass?.name || 'Unknown Class';
  };

  const showCSVTemplate = () => {
    const template = generateCSVTemplate();
    Alert.alert(
      'CSV Template',
      `Copy this template and fill with your data:\n\n${template}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Students</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'single' && styles.activeModeButton]}
            onPress={() => setMode('single')}
          >
            <UserPlus size={20} color={mode === 'single' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.modeText, mode === 'single' && styles.activeModeText]}>
              Single Student
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, mode === 'csv' && styles.activeModeButton]}
            onPress={() => setMode('csv')}
          >
            <Upload size={20} color={mode === 'csv' ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.modeText, mode === 'csv' && styles.activeModeText]}>
              Import CSV
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'single' ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter student's full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="student@school.edu"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Class (Optional)</Text>
              <TouchableOpacity
                style={styles.classSelector}
                onPress={() => setShowClassDropdown(!showClassDropdown)}
              >
                <Text style={[styles.classSelectorText, !selectedClassId && styles.placeholderText]}>
                  {getSelectedClassName()}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              
              {showClassDropdown && (
                <View style={styles.classDropdown}>
                  <ScrollView style={styles.classDropdownScroll}>
                    <TouchableOpacity
                      style={styles.classOption}
                      onPress={() => {
                        setSelectedClassId('');
                        setShowClassDropdown(false);
                      }}
                    >
                      <Text style={styles.classOptionText}>No Class</Text>
                    </TouchableOpacity>
                    {classes.map(class_ => (
                      <TouchableOpacity
                        key={class_.id}
                        style={styles.classOption}
                        onPress={() => {
                          setSelectedClassId(class_.id);
                          setShowClassDropdown(false);
                        }}
                      >
                        <Text style={styles.classOptionText}>{class_.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddSingle}>
              <Text style={styles.addButtonText}>Add Student</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.csvHeader}>
              <Text style={styles.label}>CSV Data</Text>
              <TouchableOpacity onPress={showCSVTemplate} style={styles.templateButton}>
                <Text style={styles.templateButtonText}>View Template</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.csvInput}
              value={csvInput}
              onChangeText={setCsvInput}
              placeholder="Paste your CSV data here..."
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddCSV}>
              <Text style={styles.addButtonText}>Import Students</Text>
            </TouchableOpacity>
          </View>
        )}
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
  modeSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeModeButton: {
    backgroundColor: '#2563EB',
  },
  modeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  csvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  templateButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  csvInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 200,
    fontFamily: 'monospace',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  classSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  classSelectorText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  classDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classDropdownScroll: {
    maxHeight: 200,
  },
  classOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  classOptionText: {
    fontSize: 16,
    color: '#111827',
  },
});