import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../constants/supabase';

const CartScreen = ({ route, navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

 
  useEffect(() => {
    if (route.params?.cart) {
      setCartItems(route.params.cart);
    } else {
   
    }
  }, [route.params]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return false;
    }
    
    if (!phone.trim()) {
      Alert.alert('Ошибка', 'Введите телефон');
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Ошибка', 'Корзина пуста');
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
   
      const orderData = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        delivery_address: address,
        total_amount: calculateTotal(),
        status: 'новый',
        created_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select();
      
      if (error) throw error;
      
   
      const orderId = data[0].id;
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
   
      Alert.alert(
        'Заказ оформлен',
        'Ваш заказ успешно оформлен! Мы свяжемся с вами для подтверждения.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setCartItems([]);
              navigation.navigate('Catalog');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Ошибка', 'Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Корзина</Text>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ваша корзина пуста</Text>
          <TouchableOpacity 
            style={styles.continueShopping}
            onPress={() => navigation.navigate('Catalog')}
          >
            <Text style={styles.continueShoppingText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price} ₽</Text>
                </View>
                
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.subtotal}>{item.price * item.quantity} ₽</Text>
                
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Итого:</Text>
                <Text style={styles.totalAmount}>{calculateTotal()} ₽</Text>
              </View>
            }
          />
          
          <View style={styles.checkoutForm}>
            <Text style={styles.formTitle}>Оформление заказа</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Имя*"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Телефон*"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Адрес доставки"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              <Text style={styles.checkoutButtonText}>
                {loading ? 'Оформление...' : 'Оформить заказ'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  continueShopping: {
    backgroundColor: '#0070e0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#ddd',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0070e0',
  },
  checkoutForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: '#0070e0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen; 