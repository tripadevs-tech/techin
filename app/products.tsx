import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { Search, Filter, Grid3x3 as Grid3X3, List, Star, Heart, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Product } from '@/types/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import apiService from '@/services/apiService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import FloatingCart from '@/components/FloatingCart';
import CartButton from '@/components/CartButton';

export default function ProductsScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 50 };
      if (category) {
        params.category_id = parseInt(category as string);
      }
      
      const response = await apiService.getProducts(params);
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    await addToCart(productId, 1);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredProducts.map((product, index) => (
        <Animated.View
          key={product.product_id}
          entering={FadeInDown.delay(index * 100)}
          style={styles.gridItem}
        >
          <TouchableOpacity 
            onPress={() => router.push(`/product/${product.product_id}`)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: product.thumb }} style={styles.productImage} />
              {product.special && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>SALE</Text>
                </View>
              )}
              <TouchableOpacity style={styles.wishlistButton}>
                <Heart size={16} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
                {product.special && (
                  <Text style={styles.originalPrice}>${parseFloat(product.special).toFixed(2)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddToCart(product.product_id)}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {filteredProducts.map((product, index) => (
        <Animated.View
          key={product.product_id}
          entering={FadeInDown.delay(index * 50)}
        >
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => router.push(`/product/${product.product_id}`)}
          >
            <View style={styles.listImageContainer}>
              <Image source={{ uri: product.thumb }} style={styles.listImage} />
              {product.special && (
                <View style={styles.listDiscountBadge}>
                  <Text style={styles.discountText}>SALE</Text>
                </View>
              )}
            </View>
            <View style={styles.listProductInfo}>
              <Text style={styles.listProductName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
                {product.special && (
                  <Text style={styles.originalPrice}>${parseFloat(product.special).toFixed(2)}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.listAddButton}
              onPress={() => handleAddToCart(product.product_id)}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} color={viewMode === 'grid' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
              onPress={() => setViewMode('list')}
            >
              <List size={16} color={viewMode === 'list' ? '#FFFFFF' : '#8E8E93'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredProducts.length} products found</Text>
      </View>

      {/* Products */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </ScrollView>

      <FloatingCart />
      <CartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    padding: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E5EA',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
    paddingBottom: 44,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  listImageContainer: {
    position: 'relative',
  },
  listImage: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E5EA',
  },
  listDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listProductInfo: {
    flex: 1,
    padding: 12,
  },
  listProductName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  listAddButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});