import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../constants/supabase';
import ProductCard from './ProductCard';

const CatalogScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { product });
  };

  const handleAddToCart = (product) => {
 
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
   
      setCart(cart.map(item => 
        item.id === product.id 
          ? {...item, quantity: item.quantity + 1} 
          : item
      ));
    } else {
   
      setCart([...cart, {...product, quantity: 1}]);
    }
    
 
    navigation.setParams({ cartCount: cart.length + 1 });
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0070e0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск автозапчастей..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={handleProductPress}
            onAddToCart={handleAddToCart}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Товары не найдены</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  listContent: {
    padding: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CatalogScreen; 