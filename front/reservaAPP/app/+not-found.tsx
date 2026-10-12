import { Link, Stack } from "expo-router";
import { StyleSheet, Image } from "react-native";
import { Text, View } from "@/components/Themed";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2748/2748558.png",
          }}
          style={styles.image}
        />
        <Text style={styles.title}>¡Página no encontrada!</Text>
        <Text style={styles.subtitle}>
          La pantalla que buscás no existe o fue movida.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  image: {
    width: 110,
    height: 110,
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4c68d7",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
    textAlign: "center",
    maxWidth: 300,
  },
  link: {
    backgroundColor: "#4c68d7",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 10,
    elevation: 2,
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
