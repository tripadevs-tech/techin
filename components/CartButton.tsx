import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useRef } from 'react';

export default function CartButton() {
  const { itemCount, showCart } = useCartStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (itemCount > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 150,
          friction: 3,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 3,
        }),
      ]).start();
    }
  }, [itemCount]);

  return (
    <TouchableOpacity style={styles.container} onPress={showCart}>
      <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
        <ShoppingCart size={24} color="#FFFFFF" />
        {itemCount > 0 && (
          <Animated.View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});