import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function HabitCard({ title }: any) {
  return (
    <View style={styles.card}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
});