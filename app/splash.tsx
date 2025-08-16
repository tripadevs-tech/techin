import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>Techin</Text>
        </View>
        <Text style={styles.tagline}>Your Tech Shopping Destination</Text>
      </View>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#007AFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#8E8E93',
  },
});