import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useState } from "react";
import { colors } from "../theme/colors";
import { useHabits, Habit } from "../context/HabitContext";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const HABIT_ICONS = ["🚴", "🌱", "💡", "♻️", "🍽️", "🚗", "🌍", "⏱️", "🏃", "🎋", "📱", "💧"];
const HABIT_CATEGORIES = ["transport", "food", "energy", "household"];

export default function HabitsScreen({ navigation }: any) {
  const { habits, addHabit, toggleHabit, removeHabit } = useHabits();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🌱");
  const [selectedCategory, setSelectedCategory] = useState("household");
  const [carbonReduction, setCarbonReduction] = useState("1.0");

  const toggleHabitItem = (id: string) => {
    toggleHabit(id);
  };

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      icon: selectedIcon,
      title: newHabitTitle,
      category: selectedCategory,
      completed: false,
      carbonReduction: parseFloat(carbonReduction) || 1.0,
    };

    addHabit(newHabit);
    setNewHabitTitle("");
    setSelectedIcon("🌱");
    setSelectedCategory("household");
    setCarbonReduction("1.0");
    setShowAddModal(false);
    Alert.alert("Success", "Habit added successfully!");
  };

  const handleDeleteHabit = (id: string) => {
    Alert.alert("Delete Habit", "Are you sure you want to delete this habit?", [
      { text: "Cancel", onPress: () => {} },
      { text: "Delete", onPress: () => removeHabit(id), style: "destructive" },
    ]);
  };

  const renderHabitItem = ({ item }: { item: Habit }) => {
    const categoryColors: { [key: string]: string } = {
      transport: "#FF6B6B",
      food: "#4ECDC4",
      energy: "#FFE66D",
      household: "#95E1D3",
    };

    return (
      <TouchableOpacity
        style={[styles.habitCard, item.completed && styles.habitCardCompleted]}
        onPress={() => toggleHabitItem(item.id)}
      >
        <View style={styles.habitLeft}>
          <Text style={styles.habitIcon}>{item.icon}</Text>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitTitle, item.completed && styles.habitCompleted]}>
              {item.title}
            </Text>
            <Text style={styles.habitCategory}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.habitRight}>
          <Text style={styles.carbonReduction}>-{item.carbonReduction}kg CO₂</Text>
          <TouchableOpacity onPress={() => handleDeleteHabit(item.id)}>
            <Text style={styles.deleteBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalCarbonReduction = habits
    .filter(h => h.completed)
    .reduce((sum, h) => sum + h.carbonReduction, 0);

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top","bottom"]}>
      <View style={styles.container}>  
        <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Daily Habits</Text>
          <Text style={styles.headerSubtitle}>{habits.length} total habits</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{completedCount}/{habits.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalCarbonReduction.toFixed(1)}</Text>
          <Text style={styles.statLabel}>kg CO₂ Saved</Text>
        </View>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitItem}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom }]}
        scrollEnabled={true}
      />

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Habit</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Habit Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter habit title"
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Select Icon</Text>
              <View style={styles.iconGrid}>
                {HABIT_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.iconButtonSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {HABIT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat && styles.categoryButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Carbon Reduction (kg CO₂)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1.5"
                value={carbonReduction}
                onChangeText={setCarbonReduction}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddHabit}>
                <Text style={styles.submitButtonText}>Add Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 20,
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitCardCompleted: {
    backgroundColor: "#f0fdf4",
    borderLeftColor: "#10b981",
  },
  habitLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  habitCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  habitCategory: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
    textTransform: "capitalize",
  },
  habitRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
  },
  carbonReduction: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  deleteBtn: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 25,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
  },
  closeButton: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  iconButton: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  iconButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconText: {
    fontSize: 28,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  categoryButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "capitalize",
  },
  categoryTextSelected: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});