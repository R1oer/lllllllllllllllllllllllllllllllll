import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../constants/supabase';

const TABS = {
  PRODUCTS: 'products',
  ORDERS: 'orders'
};

const CATEGORIES = [
  'Двигатель',
  'Трансмиссия',
  'Тормозная система',
  'Подвеска',
  'Рулевое управление',
  'Электрика',
  'Кузовные детали',
  'Фильтры',
  'Расходники',
  'Масла и жидкости',
  'Аксессуары'
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TABS.PRODUCTS);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
 
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productInStock, setProductInStock] = useState(true);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [productStock, setProductStock] = useState(0);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      switch (activeTab) {
        case TABS.PRODUCTS:
          await fetchProducts();
          break;
        case TABS.ORDERS:
          await fetchOrders();
          break;
        case TABS.USERS:
          await fetchUsers();
          break;
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async () => {
    console.log('Загрузка списка товаров...');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Ошибка загрузки товаров:', error);
        throw error;
      }
      
      console.log(`Загружено товаров: ${data ? data.length : 0}`);
      
   
      setProducts(data || []);
    } catch (error) {
      console.error('Ошибка при получении данных из Supabase:', error);
      setError(error.message);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setOrders(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setUsers(data || []);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      Alert.alert('Ошибка', 'Не удалось обновить данные.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddProduct = () => {
 
    setEditingProduct(null);
    setModalTitle('Добавление товара');
    setProductName('');
    setProductSku('');
    setProductPrice('');
    setProductDescription('');
    setProductCategory('');
    setProductInStock(true);
    setProductImageUrl('');
    setProductStock(0);
    setProductModalVisible(true);
  };

  const handleEditProduct = (product) => {
 
    setEditingProduct(product);
    setModalTitle('Редактирование товара');
    setProductName(product.name || '');
    setProductSku(product.sku || '');
    setProductPrice(product.price ? product.price.toString() : '');
    setProductDescription(product.description || '');
    setProductCategory(product.category || '');
    setProductInStock(product.in_stock || false);
    setProductImageUrl(product.image_url || '');
    setProductStock(product.stock || 0);
    
 
    console.log('Исходные данные товара:', product);
    
 
    setProductModalVisible(true);
  };

  const handleSaveProduct = async () => {
 
    if (!productName.trim()) {
      Alert.alert('Ошибка', 'Название товара не может быть пустым');
      return;
    }

    if (!productPrice.trim() || isNaN(parseFloat(productPrice))) {
      Alert.alert('Ошибка', 'Укажите корректную цену');
      return;
    }

 
    const priceValue = parseFloat(productPrice);
    if (priceValue <= 0 || priceValue > 1000000) {
      Alert.alert('Ошибка', 'Цена должна быть положительной и не превышать 1 000 000');
      return;
    }

    setIsSaving(true);

    try {
   
      const productData = {
        name: productName.trim(),
        sku: productSku.trim() || null,
        price: parseFloat(productPrice),
        description: productDescription.trim() || null,
        category: productCategory.trim() || null,
        in_stock: productInStock,
        image_url: productImageUrl.trim() || null,
        stock: productInStock ? productStock : 0
      };

      if (editingProduct) {
     
        console.log('Обновление товара с ID:', editingProduct.id);
        
     
        console.log('Отправляем данные для обновления:', productData);
        
        try {
       
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.id);
            
          if (updateError) {
            console.error('Ошибка обновления товара:', updateError);
            
         
            if (updateError.message && updateError.message.includes('violates constraint')) {
              Alert.alert('Ошибка сохранения', 'Введенные данные не соответствуют ограничениям базы данных.');
              return;
            }
            
            throw updateError;
          }
          
       
          const { data: checkData, error: checkError } = await supabase
            .from('products')
            .select('*')
            .eq('id', editingProduct.id)
            .single();
          
          if (checkError) {
            console.error('Ошибка проверки обновления товара:', checkError);
            throw checkError;
          }
          
          console.log('Данные после обновления:', checkData);
          
       
          const discrepancies = [];
          
          if (productName !== checkData.name) {
            discrepancies.push(`Название: отправлено "${productName}", сохранено "${checkData.name}"`);
          }
          
          if (productData.price !== checkData.price) {
            discrepancies.push(`Цена: отправлено ${productData.price}, сохранено ${checkData.price}`);
          }
          
          if (productData.in_stock !== checkData.in_stock) {
            discrepancies.push(`Наличие: отправлено ${productData.in_stock ? 'да' : 'нет'}, сохранено ${checkData.in_stock ? 'да' : 'нет'}`);
          }
          
       
          const updatedProduct = { 
            ...checkData
          };
          
       
          setProducts(prevProducts => 
            prevProducts.map(p => p.id === editingProduct.id ? updatedProduct : p)
          );
          
       
          setProductModalVisible(false);
          
       
          if (discrepancies.length > 0) {
            Alert.alert(
              'Товар обновлен с изменениями',
              `Товар успешно обновлен, но некоторые значения были изменены системой:\n\n${discrepancies.join('\n')}\n\nЭто может быть связано с правилами базы данных или форматированием значений на сервере.`,
              [{ text: 'Понятно', style: 'default' }]
            );
          } else {
            Alert.alert(
              'Успех', 
              'Товар успешно обновлен'
            );
          }
        } catch (updateError) {
          console.error('Критическая ошибка при обновлении товара:', updateError);
          throw updateError;
        }
      } else {
     
        console.log('Добавление нового товара:', productData);
        try {
          const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();
            
          if (error) {
            console.error('Ошибка добавления товара:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            console.log('Товар успешно добавлен:', data[0]);
         
            setProducts(prevProducts => [...prevProducts, data[0]]);
            
         
            setProductModalVisible(false);
            
         
            Alert.alert(
              'Успех', 
              'Товар успешно добавлен'
            );
          } else {
            throw new Error('Не удалось получить данные о добавленном товаре');
          }
        } catch (addError) {
          console.error('Критическая ошибка при добавлении товара:', addError);
          throw addError;
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      Alert.alert('Ошибка', `Не удалось сохранить товар: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsSaving(false);
    }
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

  const handleViewOrder = (order) => {
    router.push(`/admin/order/${order.id}`);
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const getFilteredItems = () => {
    if (!searchQuery.trim()) {
      switch (activeTab) {
        case TABS.PRODUCTS: return products;
        case TABS.ORDERS: return orders;
        case TABS.USERS: return users;
        default: return [];
      }
    }

    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case TABS.PRODUCTS:
        return products.filter(item => 
          item.name.toLowerCase().includes(query) || 
          (item.description && item.description.toLowerCase().includes(query)) ||
          (item.sku && item.sku.toLowerCase().includes(query))
        );
      case TABS.ORDERS:
        return orders.filter(item => 
          (item.customer_name && item.customer_name.toLowerCase().includes(query)) ||
          (item.id.toString().includes(query))
        );
      case TABS.USERS:
        return users.filter(item => 
          (item.email && item.email.toLowerCase().includes(query))
        );
      default:
        return [];
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.productInfo}>
          <View style={styles.productImageContainer}>
            {item.image_url ? (
              <Image 
                source={{ uri: item.image_url }}
                style={styles.productImage}
                resizeMode="cover"
                onError={(e) => console.log('Ошибка загрузки изображения:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={24} color="#ccc" />
              </View>
            )}
          </View>
          <View style={styles.productTextContainer}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productCode}>Арт: {item.sku || 'N/A'}</Text>
            <Text style={styles.productPrice}>{item.price} ₽</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.in_stock ? 'В наличии' : 'Нет в наличии'}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="create-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Изменить</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleViewOrder(item)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderTitle}>Заказ #{item.id}</Text>
          <Text style={styles.orderCustomer}>{item.customer_name}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View>
          <Text style={styles.orderAmount}>{item.total_amount} ₽</Text>
          <View style={[
            styles.orderStatusBadge,
            item.status === 'completed' ? styles.statusCompleted :
            item.status === 'processing' ? styles.statusProcessing :
            item.status === 'cancelled' ? styles.statusCancelled :
            styles.statusPending
          ]}>
            <Text style={styles.orderStatusText}>
              {item.status === 'completed' ? 'Выполнен' :
               item.status === 'processing' ? 'В обработке' : 
               item.status === 'cancelled' ? 'Отменен' :
               'Ожидает'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color="#1a3c5b" />
          </View>
          <View>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userRole}>
              {item.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </Text>
          </View>
        </View>
        <Text style={styles.userDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a3c5b" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#d32f2f" />
          <Text style={styles.errorText}>Ошибка: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const items = getFilteredItems();

    if (items.length === 0) {
      let emptyMessage = 'Нет данных для отображения';
      if (searchQuery.trim()) {
        emptyMessage = 'По вашему запросу ничего не найдено';
      } else if (activeTab === TABS.PRODUCTS) {
        emptyMessage = 'В каталоге нет товаров';
      } else if (activeTab === TABS.ORDERS) {
        emptyMessage = 'Нет заказов';
      } else if (activeTab === TABS.USERS) {
        emptyMessage = 'Нет пользователей';
      }

      return (
        <View style={styles.centered}>
          <Ionicons name="search" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    const renderItem = activeTab === TABS.PRODUCTS ? renderProductItem : 
                      activeTab === TABS.ORDERS ? renderOrderItem : 
                      renderUserItem;

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1a3c5b']}
          />
        }
      />
    );
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case TABS.PRODUCTS: return 'Товары';
      case TABS.ORDERS: return 'Заказы';
      case TABS.USERS: return 'Пользователи';
      default: return 'Панель администратора';
    }
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case TABS.PRODUCTS: return 'Поиск товаров по названию, артикулу...';
      case TABS.ORDERS: return 'Поиск заказов по номеру, имени...';
      case TABS.USERS: return 'Поиск пользователей по email...';
      default: return 'Поиск...';
    }
  };

 
  const renderCategorySelector = () => (
    <View>
      <Text style={styles.inputLabel}>Категория</Text>
      <TouchableOpacity 
        style={styles.categorySelector}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text style={productCategory ? styles.categorySelectorText : styles.categorySelectorPlaceholder}>
          {productCategory || "Выберите категорию"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#0f2942" />
      </TouchableOpacity>

      {/* Модальное окно выбора категории */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.categoryModalOverlay}>
          <View style={styles.categoryModalContent}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Выберите категорию</Text>
              <TouchableOpacity 
                onPress={() => setCategoryModalVisible(false)}
                style={styles.categoryCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.categoryItem,
                    productCategory === item && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    setProductCategory(item);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.categoryItemText,
                    productCategory === item && styles.categoryItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {productCategory === item && (
                    <Ionicons name="checkmark" size={22} color="#0f2942" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.categoryDivider} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

 
  const renderProductModal = () => (
    <Modal
      visible={isProductModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setProductModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TouchableOpacity 
              onPress={() => setProductModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <Text style={styles.inputLabel}>Название товара*</Text>
            <TextInput
              style={styles.textInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="Введите название товара"
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Артикул</Text>
            <TextInput
              style={styles.textInput}
              value={productSku}
              onChangeText={setProductSku}
              placeholder="Введите артикул товара"
              maxLength={30}
            />

            <Text style={styles.inputLabel}>Цена*</Text>
            <TextInput
              style={styles.textInput}
              value={productPrice}
              onChangeText={setProductPrice}
              placeholder="Введите цену"
              keyboardType="numeric"
            />

            {renderCategorySelector()}

            <Text style={styles.inputLabel}>Описание</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={productDescription}
              onChangeText={setProductDescription}
              placeholder="Введите описание товара"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>URL изображения</Text>
            <TextInput
              style={styles.textInput}
              value={productImageUrl}
              onChangeText={setProductImageUrl}
              placeholder="Введите URL изображения"
            />
            
            <Text style={styles.inputLabel}>Количество на складе</Text>
            <TextInput
              style={styles.textInput}
              value={productStock.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setProductStock(value);
             
                if (value > 0 && !productInStock) {
                  setProductInStock(true);
                }
              }}
              placeholder="Введите количество"
              keyboardType="numeric"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>В наличии</Text>
              <Switch
                value={productInStock}
                onValueChange={(value) => {
                  setProductInStock(value);
               
                  if (!value) {
                    setProductStock(0);
                  }
                }}
                trackColor={{ false: "#ccc", true: "#0f2942" }}
                thumbColor={productInStock ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.formFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setProductModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProduct}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0f2942" barStyle="light-content" />
      
      {/* Верхняя панель */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{getTabTitle()}</Text>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Поиск */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholderText()}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Кнопка добавления для товаров */}
      {activeTab === TABS.PRODUCTS && (
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={handleAddProduct}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Основной контент */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Нижняя навигация */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === TABS.PRODUCTS && styles.activeTab]} 
          onPress={() => setActiveTab(TABS.PRODUCTS)}
        >
          <Ionicons 
            name={activeTab === TABS.PRODUCTS ? "cube" : "cube-outline"} 
            size={24} 
            color={activeTab === TABS.PRODUCTS ? "#0f2942" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === TABS.PRODUCTS && styles.activeTabText]}>
            Товары
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === TABS.ORDERS && styles.activeTab]} 
          onPress={() => setActiveTab(TABS.ORDERS)}
        >
          <Ionicons 
            name={activeTab === TABS.ORDERS ? "document-text" : "document-text-outline"} 
            size={24} 
            color={activeTab === TABS.ORDERS ? "#0f2942" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === TABS.ORDERS && styles.activeTabText]}>
            Заказы
          </Text>
        </TouchableOpacity>
      </View>

      {/* Модальное окно редактирования/добавления товара */}
      {renderProductModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5fa',
  },
  header: {
    backgroundColor: '#0f2942',
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#0f2942',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  list: {
    padding: 15,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2.5,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f2942',
  },
  statusBadge: {
    backgroundColor: 'rgba(15, 41, 66, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#0f2942',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#2271b1',
  },
  deleteButton: {
    backgroundColor: '#d63638',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#777',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f2942',
    textAlign: 'right',
    marginBottom: 5,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  statusPending: {
    backgroundColor: '#f8f0d6',
  },
  statusProcessing: {
    backgroundColor: '#e5f1ff',
  },
  statusCompleted: {
    backgroundColor: '#e4f6e9',
  },
  statusCancelled: {
    backgroundColor: '#fde2e2',
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 41, 66, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: '#666',
  },
  userDate: {
    fontSize: 13,
    color: '#777',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0f2942',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 5,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#0f2942',
    paddingTop: 3,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  activeTabText: {
    color: '#0f2942',
    fontWeight: '600',
  },
 
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 70,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f2942',
  },
  closeButton: {
    padding: 5,
  },
  modalForm: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0f2942',
    paddingVertical: 12,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    height: 50,
  },
  categorySelectorText: {
    fontSize: 15,
    color: '#333',
  },
  categorySelectorPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f2942',
  },
  categoryCloseButton: {
    padding: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(15, 41, 66, 0.08)',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  categoryItemTextSelected: {
    fontWeight: 'bold',
    color: '#0f2942',
  },
  categoryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});