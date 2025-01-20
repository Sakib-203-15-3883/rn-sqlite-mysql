import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const App = () => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [db, setDb] = useState(null);

  // Initialize SQLite database
  useEffect(() => {
    const initDB = async () => {
      const database = await SQLite.openDatabase({ name: 'StudentInfo.db', location: 'default' });
      setDb(database);
      await database.executeSql(
        'CREATE TABLE IF NOT EXISTS information (id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT, student_id TEXT);'
      );
      fetchStudents(database); // Load existing data
    };
    initDB();
  }, []);

  // Fetch data from the SQLite database
  const fetchStudents = async (database) => {
    const results = await database.executeSql('SELECT * FROM information;');
    const rows = results[0].rows;
    const studentsList = [];
    for (let i = 0; i < rows.length; i++) {
      studentsList.push(rows.item(i));
    }
    setStudents(studentsList);
  };

  // Add student to the SQLite database
  const addStudent = async () => {
    if (studentName.trim() === '' || studentId.trim() === '') {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    try {
      await db.executeSql('INSERT INTO information (student_name, student_id) VALUES (?, ?);', [
        studentName,
        studentId,
      ]);
      Alert.alert('Success', 'Student added successfully');
      setStudentName('');
      setStudentId('');
      fetchStudents(db); // Refresh the list
    } catch (error) {
      console.error(error);
    }
  };

  // Sync data from SQLite to MySQL
  const syncData = async () => {
    try {
      // Fetch all data from SQLite
      const results = await db.executeSql('SELECT * FROM information;');
      const rows = results[0].rows;
      const studentsToSync = [];
      for (let i = 0; i < rows.length; i++) {
        studentsToSync.push(rows.item(i));
      }

      // Check if there's data to sync
      if (studentsToSync.length === 0) {
        Alert.alert('Info', 'No data to sync');
        return;
      }

      // Send data to the server
      const response = await fetch('http://192.168.214.173:3000/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students: studentsToSync }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message || 'Failed to sync data');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  // Render student items
  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <Text style={styles.studentText}>
        Name: {item.student_name} | ID: {item.student_id}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Information</Text>

      {/* Form */}
      <TextInput
        style={styles.input}
        placeholder="Enter Student Name"
        value={studentName}
        onChangeText={setStudentName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Student ID"
        value={studentId}
        onChangeText={setStudentId}
      />
      <TouchableOpacity style={styles.button} onPress={addStudent}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {/* Sync Button */}
      <TouchableOpacity style={styles.syncButton} onPress={syncData}>
        <Text style={styles.buttonText}>Sync to MySQL</Text>
      </TouchableOpacity>

      {/* Student List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStudentItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    marginTop: 10,
  },
  studentCard: {
    padding: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 10,
  },
  studentText: {
    fontSize: 16,
    color: '#343a40',
  },
});


export default App;