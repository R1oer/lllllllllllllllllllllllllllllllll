import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCart } from '../../contexts/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { 
    cartItems, 
    totalPrice, 
    loading, 
    removeFromCart: removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart
  } = useCart();
  
 
 
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Корзина пуста', 'Добавьте товары в корзину для оформления заказа');
      return;
    }
    
 
    router.push('/main/checkout');
  };
  
  const handleBackToCatalog = () => {
    router.push('/main/catalog');
  };
  
 
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
  const renderCartItem = ({ item }) => {
 
    const itemId = item.cartItemId || item.id;
    
    return (
      <View style={styles.cartItem}>
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)} ₽</Text>
        </View>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(itemId)}
          >
            <Ionicons name="remove" size={18} color="#0f2942" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => increaseQuantity(itemId)}
          >
            <Ionicons name="add" size={18} color="#0f2942" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeItem(itemId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={22} color="#d63638" />
        </TouchableOpacity>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f2942" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToCatalog}
        >
          <Ionicons name="arrow-back" size={24} color="#0f2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Корзина</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearCart}
          >
            <Ionicons name="trash-outline" size={20} color="#d63638" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Список товаров в корзине */}
      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cartItemId || item.id.toString()}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCartText}>Корзина пуста</Text>
          <Text style={styles.emptyCartSubtext}>Добавьте товары из каталога</Text>
          <TouchableOpacity 
            style={styles.backToCatalogButton}
            onPress={handleBackToCatalog}
          >
            <Text style={styles.backToCatalogButtonText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Итоговая сумма и кнопка оформления заказа */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)} ₽</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Нижняя панель навигации */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleBackToCatalog}
        >
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Каталог</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => {}}
        >
          <View style={styles.bottomNavIconContainer}>
            <Ionicons name="cart" size={24} color="#1a3c5b" />
            <View style={styles.activeIndicator} />
          </View>
          <Text style={[styles.bottomNavText, { color: '#1a3c5b', fontWeight: '600' }]}>Корзина</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={handleCheckout}
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f2942',
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(214, 54, 56, 0.1)',
    borderRadius: 5,
  },
  listContent: {
    padding: 15,
    paddingBottom: 150,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  productImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f2942',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 25,
    textAlign: 'center',
  },
  removeButton: {
    padding: 10,
    backgroundColor: 'rgba(214, 54, 56, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  backToCatalogButton: {
    backgroundColor: '#0f2942',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backToCatalogButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f2942',
  },
  checkoutButton: {
    backgroundColor: '#0f2942',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
}); 