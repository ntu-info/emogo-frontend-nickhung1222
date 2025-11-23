import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert, Share } from 'react-native';
import { Link } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [emotions, setEmotions] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const EMOTION_OPTIONS = [
    { label: 'Happy 😀', value: 'happy' },
    { label: 'Calm 😐', value: 'calm' },
    { label: 'Sad 😢', value: 'sad' },
    { label: 'Angry 😡', value: 'angry' },
  ];

  useEffect(() => {
    loadEmotions();
  }, []);

  const loadEmotions = async () => {
    try {
      const storedEmotions = await AsyncStorage.getItem('emotion_data');
      if (storedEmotions) {
        setEmotions(JSON.parse(storedEmotions));
      }
    } catch (error) {
      console.error('Failed to load emotions', error);
    }
  };

  const saveEmotion = async () => {
    if (!selectedEmotion) {
      Alert.alert('Please select an emotion first!');
      return;
    }

    const newRecord = {
      id: Date.now().toString(),
      emotion: selectedEmotion,
      timestamp: new Date().toISOString(),
    };

    const updatedEmotions = [...emotions, newRecord];
    setEmotions(updatedEmotions);
    setSelectedEmotion(null);

    try {
      await AsyncStorage.setItem('emotion_data', JSON.stringify(updatedEmotions));
      Alert.alert('Success', 'Emotion recorded!');
    } catch (error) {
      console.error('Failed to save emotion', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const clearData = async () => {
      try {
          await AsyncStorage.removeItem('emotion_data');
          setEmotions([]);
          Alert.alert('Cleared', 'All data has been cleared.');
      } catch (e) {
          console.error(e);
      }
  }

  const exportData = async () => {
    const dataStr = JSON.stringify(emotions, null, 2);
    console.log(dataStr); // For debugging
    try {
        await Share.share({
            message: dataStr,
            title: 'Emogo Data Export'
        });
    } catch (error) {
        Alert.alert(error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemEmoji}>
        {EMOTION_OPTIONS.find(e => e.value === item.emotion)?.label || item.emotion}
      </Text>
      <Text style={styles.itemTime}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>

      <View style={styles.optionsContainer}>
        {EMOTION_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedEmotion === option.value && styles.selectedOption,
            ]}
            onPress={() => setSelectedEmotion(option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Save Record" onPress={saveEmotion} />

      <View style={styles.divider} />

      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>History ({emotions.length})</Text>
        <View style={styles.actionButtons}>
            <Button title="Export Data" onPress={exportData} />
            <Button title="Clear" color="red" onPress={clearData} />
        </View>
      </View>

      <FlatList
        data={[...emotions].reverse()} // Show newest first
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />
      
      <View style={styles.footer}>
        <Link href="/details" style={styles.link}>
            Go to details screen
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    width: '45%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#e0f7fa',
    borderColor: '#006064',
  },
  optionText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
  },
  actionButtons: {
      flexDirection: 'row',
      gap: 10
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemEmoji: {
    fontSize: 16,
  },
  itemTime: {
    color: '#666',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  }
});
