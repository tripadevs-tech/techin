import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/api';
import apiService from '@/services/apiService';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WishlistScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getWishlist();
      setWishlistItems(response.products);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await apiService.removeFromWishlist(productId);
      setWishlistItems(items => items.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      console.log('Added to cart successfully');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Heart size={80} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Please sign in</Text>
        <Text style={styles.emptySubtitle}>Sign in to view your wishlist</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.shopButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Heart size={80} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>Save products you love to your wishlist</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.itemCount}>{wishlistItems.length} items</Text>
      </View>

      {/* Wishlist Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {wishlistItems.map((item, index) => (
          <Animated.View 
            key={item.product_id} 
            entering={FadeInDown.delay(index * 100)}
            style={styles.wishlistItem}
          >
            <TouchableOpacity 
              style={styles.itemContent}
              onPress={() => router.push(`/product/${item.product_id}`)}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.thumb }} style={styles.itemImage} />
                {item.special && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>SALE</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                
                <View style={styles.ratingContainer}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
                  {item.special && (
                    <Text style={styles.originalPrice}>${parseFloat(item.special).toFixed(2)}</Text>
                  )}
                </View>
                
                <Text style={styles.stockStatus}>
                  {item.stock_status || 'In Stock'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFromWishlist(item.product_id)}
              >
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(item.product_id)}
              >
                <ShoppingCart size={16} color="#FFFFFF" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.addAllButton}
          onPress={() => {
            wishlistItems.forEach(item => handleAddToCart(item.product_id));
          }}
        >
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.addAllText}>Add All to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  wishlistItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  itemContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  stockStatus: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 12,
    gap: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  addAllButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});