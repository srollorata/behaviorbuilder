import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BehaviorCategory } from '@/types';

interface BehaviorButtonProps {
  behavior: BehaviorCategory;
  onPress: () => void;
}

export const BehaviorButton: React.FC<BehaviorButtonProps> = ({
  behavior,
  onPress,
}) => {
  const isPositive = behavior.type === 'positive';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPositive ? styles.positiveButton : styles.negativeButton,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, isPositive ? styles.positiveText : styles.negativeText]}>
        {behavior.name}
      </Text>
      <Text style={[styles.points, isPositive ? styles.positiveText : styles.negativeText]}>
        {behavior.points >= 0 ? '+' : ''}{behavior.points}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positiveButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  negativeButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  buttonText: {
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
  points: {
    fontSize: 12,
    fontWeight: '600',
  },
});