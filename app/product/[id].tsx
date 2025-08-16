import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ArrowLeft, Heart, Share, Star, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Product } from '@/types/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import apiService from '@/services/apiService';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getProduct(id as string);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (product) {
      const result = await addToCart(product.product_id, quantity);
      if (result.success) {
        console.log('Added to cart successfully');
      }
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (product) {
      try {
        if (isFavorite) {
          await apiService.removeFromWishlist(product.product_id);
        } else {
          await apiService.addToWishlist(product.product_id);
        }
        setIsFavorite(!isFavorite);
      } catch (error) {
        console.error('Failed to update wishlist:', error);
      }
    }
  };

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleWishlist}
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#FF3B30" : "#1D1D1F"} 
              fill={isFavorite ? "#FF3B30" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {product.images && product.images.length > 0 ? (
            <>
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setSelectedImage(index);
                }}
              >
                {product.images.map((image, index) => (
                  <Image key={index} source={{ uri: image }} style={styles.productImage} />
                ))}
              </ScrollView>
              <View style={styles.imageIndicators}>
                {product.images.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.indicator, 
                      selectedImage === index && styles.activeIndicator
                    ]} 
                  />
                ))}
              </View>
            </>
          ) : (
            <Image source={{ uri: product.image || product.thumb }} style={styles.productImage} />
          )}
        </View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.productInfo}>
          <View style={styles.brandCategory}>
            <Text style={styles.brand}>{product.manufacturer || 'Brand'}</Text>
            <Text style={styles.category}>Electronics</Text>
          </View>
          
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.stockText}>
              {product.stock_status || 'In Stock'}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
            {product.special && (
              <>
                <Text style={styles.originalPrice}>${parseFloat(product.special).toFixed(2)}</Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>
                    Save ${(parseFloat(product.special) - parseFloat(product.price)).toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(-1)}
              >
                <Minus size={16} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(1)}
              >
                <Plus size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add to Cart Button */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            Add to Cart - ${(parseFloat(product.price) * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#F2F2F7',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
  productInfo: {
    padding: 20,
  },
  brandCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  stockText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 18,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 16,
    color: '#1D1D1F',
    flex: 1,
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  specKey: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  specValue: {
    fontSize: 16,
    color: '#1D1D1F',
    flex: 2,
    textAlign: 'right',
  },
  relatedProduct: {
    width: 140,
    marginRight: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5E5EA',
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    padding: 8,
    paddingBottom: 4,
  },
  relatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  relatedRatingText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 4,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});