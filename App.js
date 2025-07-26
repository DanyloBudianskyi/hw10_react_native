import {Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {createStackNavigator} from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import {NavigationContainer} from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
const Stack = createStackNavigator();

// Екран списку завдань
const TasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const saveTasks = async (newTasks) => {
        try {
            await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
            setTasks(newTasks);
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

    const updateTask = (updatedTask) => {
        const updatedTasks = tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
        );
        saveTasks(updatedTasks);
    };

    const deleteTask = (id) => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedTasks = tasks.filter((task) => task.id !== id);
                        await saveTasks(updatedTasks);
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const deleteAllTask = () => {
        Alert.alert(
            'Delete Tasks',
            'Are you sure you want to delete all tasks?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await saveTasks([]);
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tasks</Text>

            <View style={styles.menuRow}>
                <View style={styles.pickeWrapper}>
                    <Picker
                        selectedValue={filter}
                        onValueChange={(value) => setFilter(value)}
                    >
                        <Picker.Item label="All Tasks" value="all" />
                        <Picker.Item label="Active Tasks" value="active" />
                        <Picker.Item label="Completed Tasks" value="completed" />
                    </Picker>
                </View>
                <TouchableOpacity onPress={() => deleteAllTask()}>
                    <Ionicons name="trash-bin" size={24} color="#ff5c5c" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.taskItemContainer}>
                        <TouchableOpacity
                            style={styles.taskItem}
                            onPress={() =>
                                navigation.navigate('TaskDetails', {
                                    task: item,
                                    updateTask,
                                })
                            }
                        >
                            <Text style={styles.taskText} numberOfLines={1}>
                                {item.text}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                                const updated = { ...item, completed: !item.completed };
                                updateTask(updated);
                            }}>
                            <Ionicons
                                name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={item.completed ? '#4CAF50' : '#aaa'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteTask(item.id)}>
                            <Ionicons name="trash-outline" size={24} color="#ff5c5c" />
                        </TouchableOpacity>
                    </View>
                )}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTask', { saveTasks, tasks })}
            >
                <Text style={styles.addButtonText}>+ Add New Task</Text>
            </TouchableOpacity>
        </View>
    );
};

// Екран додавання нового завдання
const AddTaskScreen = ({ route, navigation }) => {
    const { saveTasks, tasks } = route.params;
    const [taskText, setTaskText] = useState('');

    const addTask = async () => {
        if (!taskText.trim()) {
            alert('Task text cannot be empty');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
        };

        const updatedTasks = [...tasks, newTask];
        await saveTasks(updatedTasks);
        navigation.goBack(); // Повертає користувача до списку завдань
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Task</Text>
            <TextInput
                style={styles.textArea}
                placeholder="Enter your task details here..."
                value={taskText}
                onChangeText={setTaskText}
                multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={addTask}>
                <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
        </View>
    );
};

// Екран деталей завдання
const TaskDetailsScreen = ({ route, navigation }) => {
    const { task, updateTask } = route.params;
    const [taskText, setTaskText] = useState(task.text);

    const saveTask = async () => {
        if (!taskText.trim()) {
            alert('Task text cannot be empty');
            return;
        }

        const updatedTask = { ...task, text: taskText };
        updateTask(updatedTask);
        navigation.goBack(); // Повертаємося до списку
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Task Details</Text>
            <TextInput
                style={styles.input}
                value={taskText}
                onChangeText={setTaskText}
                multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

// Головний компонент
const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Tasks" component={TasksScreen} />
                <Stack.Screen name="AddTask" component={AddTaskScreen} />
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    taskItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    taskItem: {
        flex: 1,
        padding: 10,
    },
    taskText: {
        fontSize: 16,
    },
    addButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
        minHeight: 150,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    pickeWrapper: {
        flex: 1,
        backgroundColor: '#fff', 
        borderRadius: 5,
        
    },
});

export default App;
