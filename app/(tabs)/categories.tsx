import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Search, Grid3x3 as Grid3X3, List, Package } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Category } from '@/types/api';
import apiService from '@/services/apiService';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CategoriesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const colors = ['#007AFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = parseInt(categoryId) % colors.length;
    return colors[index];
  };

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredCategories.map((category, index) => (
        <Animated.View
          key={category.category_id}
          entering={FadeInDown.delay(index * 100)}
        >
          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: getCategoryColor(category.category_id) + '20' }]}
            onPress={() => router.push(`/products?category=${category.category_id}`)}
          >
            {category.image ? (
              <Image source={{ uri: category.image }} style={styles.gridCategoryImage} />
            ) : (
              <Package size={32} color={getCategoryColor(category.category_id)} />
            )}
            <Text style={styles.categoryNameGrid}>{category.name}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {filteredCategories.map((category, index) => (
        <Animated.View
          key={category.category_id}
          entering={FadeInDown.delay(index * 50)}
        >
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => router.push(`/products?category=${category.category_id}`)}
          >
            <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(category.category_id) + '20' }]}>
              {category.image ? (
                <Image source={{ uri: category.image }} style={styles.listCategoryImage} />
              ) : (
                <Package size={24} color={getCategoryColor(category.category_id)} />
              )}
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryNameList}>{category.name}</Text>
              {category.description && (
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {category.description}
                </Text>
              )}
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
            onPress={() => setViewMode('grid')}
          >
            <Grid3X3 size={20} color={viewMode === 'grid' ? '#FFFFFF' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <List size={20} color={viewMode === 'list' ? '#FFFFFF' : '#8E8E93'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {viewMode === 'grid' ? renderGridView() : renderListView()}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
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
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCategoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  categoryNameGrid: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listCategoryImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameList: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  arrow: {
    fontSize: 20,
    color: '#8E8E93',
  },
});