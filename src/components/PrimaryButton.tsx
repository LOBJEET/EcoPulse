import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function PrimaryButton({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: colors.white,
    fontWeight: "bold",
  },
});