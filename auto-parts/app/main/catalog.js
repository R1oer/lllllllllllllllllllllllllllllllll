import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ProductCard from '../../components/Catalog/ProductCard';
import { supabase } from '../../constants/supabase';
import { useCart } from '../../contexts/CartContext';


const categories = [
  { id: 'all', name: 'Все товары' },
  { id: 'Двигатель', name: 'Двигатель' },
  { id: 'Трансмиссия', name: 'Трансмиссия' },
  { id: 'Тормозная система', name: 'Тормозная система' },
  { id: 'Подвеска', name: 'Подвеска' },
  { id: 'Рулевое управление', name: 'Рулевое управление' },
  { id: 'Электрика', name: 'Электрика' },
  { id: 'Кузовные детали', name: 'Кузовные детали' },
  { id: 'Фильтры', name: 'Фильтры' },
  { id: 'Расходники', name: 'Расходники' },
  { id: 'Масла и жидкости', name: 'Масла и жидкости' },
  { id: 'Аксессуары', name: 'Аксессуары' },
];


const getCategoryMapping = () => {
 
  return {
    'all': null,
    'Двигатель': ['Двигатель', 'двигатель', 'engine'],
    'Трансмиссия': ['Трансмиссия', 'трансмиссия', 'transmission'],
    'Тормозная система': ['Тормозная система', 'тормозная система', 'brake', 'Тормоза', 'тормоза'],
    'Подвеска': ['Подвеска', 'подвеска', 'suspension'],
    'Рулевое управление': ['Рулевое управление', 'рулевое управление', 'steering'],
    'Электрика': ['Электрика', 'электрика', 'electrical'],
    'Кузовные детали': ['Кузовные детали', 'кузовные детали', 'body', 'Кузов', 'кузов'],
    'Фильтры': ['Фильтры', 'фильтры', 'filters'],
    'Расходники': ['Расходники', 'расходники', 'consumables'],
    'Масла и жидкости': ['Масла и жидкости', 'масла и жидкости', 'oils', 'fluids'],
    'Аксессуары': ['Аксессуары', 'аксессуары', 'accessories']
  };
};

export default function CatalogScreen() {
  const router = useRouter();
 
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  
 
  const { addToCart, cartItemsCount } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [sortOrder, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      console.log(`Загружаем товары с фильтром по категории: "${categoryFilter}"`);
      
      let query = supabase
        .from('products')
        .select('*');
      
   
      if (categoryFilter !== 'all') {
        console.log(`Применяем фильтр: category = "${categoryFilter}"`);
        
     
        const categoryMapping = getCategoryMapping();
        const possibleCategories = categoryMapping[categoryFilter];
        
        if (possibleCategories && possibleCategories.length > 0) {
       
          console.log(`Расширенный поиск по категориям: ${JSON.stringify(possibleCategories)}`);
          query = query.in('category', possibleCategories);
        } else {
       
          query = query.eq('category', categoryFilter);
        }
      }
      
   
      const { data, error } = await query.order(sortOrder);
      
      if (error) {
        console.error('Ошибка при загрузке товаров:', error);
        throw error;
      }
      
      console.log(`Загружено товаров: ${data ? data.length : 0}`);
      
      if (data && data.length > 0) {
        console.log('Пример первого товара:', {
          name: data[0].name,
          category: data[0].category
        });
      }
      
      setProducts(data || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
 
    console.log('Product pressed:', product.name);
  };

  const handleAddToCart = (product) => {
 
    addToCart(product);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  const changeSortOrder = (order) => {
    setSortOrder(order);
  };

  const changeCategory = (category) => {
    setCategoryFilter(category);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

 
  const bannerWidth = width * (width > 500 ? 0.4 : 0.85);

 
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        categoryFilter === item.id && styles.activeCategoryItem
      ]}
      onPress={() => changeCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryText, 
          categoryFilter === item.id && styles.activeCategoryText,
          isSmallDevice && styles.smallCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
 
  const renderListItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      onAddToCart={handleAddToCart}
      viewType="list"
      isSmallDevice={isSmallDevice}
    />
  );

 
  const goToCart = () => {
    router.push('/main/cart');
  };
  
 
  const goToCheckout = () => {
    router.push('/main/checkout');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a3c5b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>ПОВТОРИТЬ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Заголовок и иконки */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Каталог запчастей</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFilters}>
            <Ionicons name={showFilters ? "options" : "options-outline"} size={24} color="#1a3c5b" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Строка поиска */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={isSmallDevice ? "Поиск..." : "Поиск по названию, артикулу..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Баннер акций - адаптивная версия */}
      <View style={styles.promotionContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promotionScrollContent}
          snapToInterval={bannerWidth + 15}
          decelerationRate="fast"
          snapToAlignment="center"
        >
          <View style={[styles.promotionBanner, { width: bannerWidth }]}>
            <Image 
              source={require('../../assets/images/car-parts-bg.jpg')} 
              style={styles.promotionImage}
              resizeMode="cover"
            />
            <View style={styles.promotionOverlay}>
              <Text style={[styles.promotionTitle, isSmallDevice && styles.smallPromotionTitle]}>
                Скидка 15%
              </Text>
              <Text style={[styles.promotionSubtitle, isSmallDevice && styles.smallPromotionSubtitle]}>
                На все тормозные системы
              </Text>
            </View>
          </View>
          
          <View style={[styles.promotionBanner, styles.bluePromotion, { width: bannerWidth }]}>
            <View style={styles.promotionOverlay}>
              <Text style={[styles.promotionTitle, isSmallDevice && styles.smallPromotionTitle]}>
                Бесплатная доставка
              </Text>
              <Text style={[styles.promotionSubtitle, isSmallDevice && styles.smallPromotionSubtitle]}>
                При заказе от 5000 ₽
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* Горизонтальный список категорий */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>
      
      {/* Панель фильтров - отображается только если showFilters = true */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Сортировка:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, sortOrder === 'name' && styles.activeFilterButton]} 
              onPress={() => changeSortOrder('name')}
            >
              <Text style={[styles.filterButtonText, sortOrder === 'name' && styles.activeFilterText]}>
                По названию
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, sortOrder === 'price' && styles.activeFilterButton]} 
              onPress={() => changeSortOrder('price')}
            >
              <Text style={[styles.filterButtonText, sortOrder === 'price' && styles.activeFilterText]}>
                По цене
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterButton, sortOrder === 'created_at' && styles.activeFilterButton]} 
              onPress={() => changeSortOrder('created_at')}
            >
              <Text style={[styles.filterButtonText, sortOrder === 'created_at' && styles.activeFilterText]}>
                Новинки
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Результаты поиска - только список */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderListItem}
        contentContainerStyle={[
          styles.listContent,
          filteredProducts.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cube-outline" size={70} color="#fff" />
            </View>
            <Text style={styles.emptyText} numberOfLines={2}>
              {searchQuery.trim()
                ? 'Товары не найдены по запросу'
                : categoryFilter !== 'all'
                  ? `В категории "${categories.find(c => c.id === categoryFilter)?.name || ''}" нет товаров`
                  : 'Товары не найдены'}
            </Text>
            <Text style={styles.emptySubtext} numberOfLines={2}>
              {searchQuery.trim() || categoryFilter !== 'all'
                ? 'Попробуйте изменить параметры поиска'
                : 'В данный момент каталог пуст'}
            </Text>
            {categoryFilter !== 'all' && (
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => setCategoryFilter('all')}
              >
                <Text style={styles.resetButtonText}>Показать все товары</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {/* Нижняя панель навигации */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => {}}
        >
          <View style={styles.bottomNavIconContainer}>
            <Ionicons name="home" size={24} color="#1a3c5b" />
            <View style={styles.activeIndicator} />
          </View>
          <Text style={[styles.bottomNavText, { color: '#1a3c5b', fontWeight: '600' }]}>Каталог</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={goToCart}
        >
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={24} color="#666" />
            {cartItemsCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.bottomNavText}>Корзина</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={goToCheckout}
        >
          <Ionicons name="card-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Оформить</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3c5b',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  promotionContainer: {
    height: 130,
    marginVertical: 10,
  },
  promotionScrollContent: {
    paddingHorizontal: 15,
  },
  promotionBanner: {
    height: 120,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2c3e50',
  },
  promotionImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  promotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 15,
  },
  bluePromotion: {
    backgroundColor: '#1a3c5b',
  },
  promotionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  smallPromotionTitle: {
    fontSize: 16,
  },
  promotionSubtitle: {
    color: 'white',
    fontSize: 14,
  },
  smallPromotionSubtitle: {
    fontSize: 12,
  },
  categoriesContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  categoriesContent: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  categoryItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategoryItem: {
    backgroundColor: '#1a3c5b',
    borderColor: '#1a3c5b',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  smallCategoryText: {
    fontSize: 12,
  },
  activeCategoryText: {
    color: 'white',
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    marginRight: 8,
    marginBottom: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterButton: {
    backgroundColor: '#1a3c5b',
    borderColor: '#1a3c5b',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 80,
    marginHorizontal: 20,
  },
  emptyIconContainer: {
    backgroundColor: '#1a3c5b',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: '#1a3c5b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#1a3c5b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 10,
  },
  bottomNavItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  bottomNavText: {
    fontSize: 12,
    marginTop: 3,
    color: '#666',
  },
  bottomNavIconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a3c5b',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
}); 