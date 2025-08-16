import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function FloatingCart() {
  const router = useRouter();
  const { 
    items, 
    totals, 
    isVisible, 
    itemCount, 
    totalAmount,
    hideCart, 
    updateQuantity, 
    removeItem 
  } = useCartStore();

  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: height,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleCheckout = () => {
    hideCart();
    router.push('/checkout');
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        { opacity: opacityAnim }
      ]}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={hideCart}
        activeOpacity={1}
      />
      
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <BlurView intensity={100} style={styles.blurContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ShoppingCart size={24} color="#1D1D1F" />
              <Text style={styles.title}>Cart ({itemCount})</Text>
            </View>
            <TouchableOpacity onPress={hideCart} style={styles.closeButton}>
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Cart Items */}
          <View style={styles.content}>
            {items.length === 0 ? (
              <View style={styles.emptyCart}>
                <ShoppingCart size={48} color="#8E8E93" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
              </View>
            ) : (
              <>
                {items.map((item) => (
                  <View key={item.cart_id} style={styles.cartItem}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.itemActions}>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => {
                            const newQuantity = parseInt(item.quantity) - 1;
                            if (newQuantity > 0) {
                              updateQuantity(item.cart_id, newQuantity);
                            } else {
                              removeItem(item.cart_id);
                            }
                          }}
                        >
                          <Minus size={14} color="#007AFF" />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(item.cart_id, parseInt(item.quantity) + 1)}
                        >
                          <Plus size={14} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeItem(item.cart_id)}
                      >
                        <Trash2 size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Totals */}
                <View style={styles.totalsContainer}>
                  {totals.map((total, index) => (
                    <View key={index} style={styles.totalRow}>
                      <Text style={styles.totalLabel}>{total.title}</Text>
                      <Text style={styles.totalValue}>{total.text}</Text>
                    </View>
                  ))}
                </View>

                {/* Checkout Button */}
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <Text style={styles.checkoutText}>Checkout</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  totalsContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});