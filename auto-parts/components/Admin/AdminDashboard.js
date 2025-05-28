import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../constants/supabase';

const AdminDashboard = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    
 
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });

 
    return unsubscribe;
  }, [navigation]);

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

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct');
  };

  const handleEditProduct = (product) => {
    navigation.navigate('AddEditProduct', { product });
  };

  const handleDeleteProduct = async (product) => {
    Alert.alert(
      'Удаление товара',
      `Вы уверены, что хотите удалить "${product.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);
              
              if (error) throw error;
              
           
              setProducts(products.filter(p => p.id !== product.id));
              Alert.alert('Успех', 'Товар успешно удален');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Ошибка', 'Не удалось удалить товар');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Панель администратора</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddProduct}
        >
          <Text style={styles.addButtonText}>+ Добавить товар</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text>Загрузка...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Ошибка: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price} ₽</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => handleEditProduct(item)}
                >
                  <Text style={styles.actionButtonText}>Изменить</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => handleDeleteProduct(item)}
                >
                  <Text style={styles.actionButtonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Нет товаров для отображения</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0070e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  },
  productItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#0070e0',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#f0ad4e',
  },
  deleteButton: {
    backgroundColor: '#d9534f',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AdminDashboard; 