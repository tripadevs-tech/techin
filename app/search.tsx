import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Search, Clock, X, Star, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Product } from '@/types/api';
import apiService from '@/services/apiService';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'iPhone',
    'MacBook',
    'AirPods',
    'iPad',
  ]);

  const trendingSearches = [
    'iPhone',
    'MacBook',
    'AirPods',
    'Apple Watch',
    'iPad Pro',
  ];

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      // Add to recent searches if not already there
      if (!recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches.slice(0, 4)]);
      }
      
      setIsSearching(true);
      try {
        const response = await apiService.searchProducts(query);
        if (response.success && response.data) {
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const removeRecentSearch = (searchToRemove: string) => {
    setRecentSearches(recentSearches.filter(search => search !== searchToRemove));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearAllRecentSearches}>
                    <Text style={styles.clearButton}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.searchItem}
                    onPress={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Clock size={16} color="#8E8E93" />
                    <Text style={styles.searchItemText}>{search}</Text>
                    <TouchableOpacity 
                      onPress={() => removeRecentSearch(search)}
                      style={styles.removeButton}
                    >
                      <X size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending</Text>
                <TrendingUp size={16} color="#007AFF" />
              </View>
              {trendingSearches.map((search, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.searchItem}
                  onPress={() => {
                    setSearchQuery(search);
                    handleSearch(search);
                  }}
                >
                  <TrendingUp size={16} color="#FF6B6B" />
                  <Text style={styles.searchItemText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
          /* Loading or minimum characters */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : 'Type at least 3 characters to search'}
            </Text>
          </View>
        ) : (
          /* Search Results */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : `${searchResults.length} results for "${searchQuery}"`}
            </Text>
            {searchResults.map((product, index) => (
              <Animated.View
                key={product.product_id}
                entering={FadeInDown.delay(index * 100)}
              >
                <TouchableOpacity 
                style={styles.resultItem}
                  onPress={() => router.push(`/product/${product.product_id}`)}
                >
                  <Image source={{ uri: product.thumb }} style={styles.resultImage} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.resultRating}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                    <Text style={styles.resultPrice}>${parseFloat(product.price).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  clearButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  searchItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  resultItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  resultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 4,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});