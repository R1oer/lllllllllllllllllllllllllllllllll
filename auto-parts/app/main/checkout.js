import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../constants/supabase';
import { useCart } from '../../contexts/CartContext';

export default function CheckoutScreen() {
  const router = useRouter();
  
 
  const { cartItems, totalPrice, clearCart } = useCart();
  
 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [comments, setComments] = useState('');
  
 
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [generalError, setGeneralError] = useState('');
  
 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
 
  const clearErrors = () => {
    setNameError('');
    setPhoneError('');
    setAddressError('');
    setGeneralError('');
  };
  
  const handleBackToCart = () => {
    router.push('/main/cart');
  };
  
  const handleBackToCatalog = () => {
    router.push('/main/catalog');
  };
    
  const handleSubmitOrder = async () => {
    console.log('Начало оформления заказа');
    
 
    clearErrors();
    
 
    let isValid = true;
    
 
    if (!name.trim()) {
      console.log('Ошибка: имя не указано');
      setNameError('Укажите ваше имя');
      isValid = false;
    }
    
    if (!phone.trim()) {
      console.log('Ошибка: телефон не указан');
      setPhoneError('Укажите номер телефона');
      isValid = false;
    }
    
    if (address.trim().length < 10) {
      console.log('Ошибка: адрес слишком короткий');
      setAddressError('Укажите полный адрес доставки (не менее 10 символов)');
      isValid = false;
    }
    
 
    if (cartItems.length === 0) {
      console.log('Ошибка: корзина пуста');
      setGeneralError('Корзина пуста. Добавьте товары для оформления заказа');
      isValid = false;
    }
    
 
    if (!isValid) {
      return;
    }
    
    console.log('Валидация формы пройдена успешно');
    setIsSubmitting(true);
    
    try {
      console.log('Подготовка данных заказа');
   
      const finalTotalAmount = totalPrice > 5000 ? totalPrice : totalPrice + 500;
      
      const orderPayload = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        shipping_address: JSON.stringify({ address: address }),
        payment_method: paymentMethod,
        notes: comments || null,
        total_amount: finalTotalAmount,
        status: 'new'
      };
      
      console.log('Данные заказа для отправки:', orderPayload);
      
   
      const { data: orderData, error: orderError } = await supabase
        .rpc('create_order', {
          customer_name: orderPayload.customer_name,
          customer_phone: orderPayload.customer_phone,
          customer_email: orderPayload.customer_email,
          shipping_address: orderPayload.shipping_address,
          payment_method: orderPayload.payment_method,
          notes: orderPayload.notes,
          total_amount: orderPayload.total_amount,
          status: orderPayload.status
        });
        
      if (orderError) {
        console.error('Ошибка при создании заказа:', orderError);
        setGeneralError(`Ошибка при создании заказа: ${orderError.message}`);
        throw new Error(`Не удалось создать заказ: ${orderError.message}`);
      }
      
      console.log('Ответ от Supabase RPC:', orderData);
      
      if (!orderData) {
        console.error('Заказ не был создан, данные отсутствуют');
        setGeneralError('Не удалось создать заказ: пустой ответ от сервера');
        throw new Error('Заказ не был создан, получены пустые данные от сервера');
      }
      
   
      const orderId = orderData.id;
      console.log('Создан заказ с ID:', orderId);
      
   
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        product_price: item.price
      }));
      
      console.log('Товары для добавления в заказ:', orderItems);
      
   
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        console.error('Ошибка при сохранении товаров заказа:', itemsError);
     
      } else {
        console.log('Товары успешно добавлены к заказу');
      }
      
   
      console.log('Очистка корзины...');
      await clearCart();
      console.log('Корзина успешно очищена');
      
   
      Alert.alert(
        'Заказ оформлен',
        'Ваш заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.',
        [
          { 
            text: 'ОК', 
            onPress: () => {
              console.log('Переход на страницу каталога');
              router.push('/main/catalog');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Полная ошибка при оформлении заказа:', error);
      setGeneralError(`Не удалось оформить заказ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      console.log('Процесс оформления заказа завершен');
    }
  };
  
 
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  
 
  const renderCartItem = ({ item }) => (
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
        <Text style={styles.productQuantity}>Количество: {item.quantity} шт.</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price * item.quantity)} ₽</Text>
      </View>
    </View>
  );
  
 
  if (cartItems.length === 0) {
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
          <Text style={styles.headerTitle}>Оформление заказа</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCartText}>Корзина пуста</Text>
          <Text style={styles.emptyCartSubtext}>Добавьте товары для оформления заказа</Text>
          <TouchableOpacity 
            style={styles.backToCatalogButton}
            onPress={handleBackToCatalog}
          >
            <Text style={styles.backToCatalogButtonText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
        
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
            onPress={handleBackToCart}
          >
            <Ionicons name="cart-outline" size={24} color="#666" />
            <Text style={styles.bottomNavText}>Корзина</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bottomNavItem}
            onPress={() => {}}
          >
            <View style={styles.bottomNavIconContainer}>
              <Ionicons name="card" size={24} color="#1a3c5b" />
              <View style={styles.activeIndicator} />
            </View>
            <Text style={[styles.bottomNavText, { color: '#1a3c5b', fontWeight: '600' }]}>Оформить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToCart}
        >
          <Ionicons name="arrow-back" size={24} color="#0f2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оформление заказа</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Общая ошибка формы */}
          {generalError ? (
            <View style={styles.generalErrorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" style={{ marginRight: 8 }} />
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          ) : null}
          
          {/* Раздел товаров корзины */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Товары в корзине</Text>
            
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.cartItemId || item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.cartItemSeparator} />}
            />
          </View>
          
          {/* Контактная информация */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Контактная информация</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Имя*</Text>
              <TextInput
                style={[
                  styles.input,
                  nameError ? styles.inputError : null
                ]}
                placeholder="Укажите ваше имя"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError('');
                }}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Телефон*</Text>
              <TextInput
                style={[
                  styles.input,
                  phoneError ? styles.inputError : null
                ]}
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (phoneError) setPhoneError('');
                }}
                keyboardType="phone-pad"
              />
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
          </View>
          
          {/* Адрес доставки */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Адрес доставки</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Полный адрес*</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  addressError ? styles.inputError : null
                ]}
                placeholder="Город, улица, дом, квартира"
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  if (addressError) setAddressError('');
                }}
                multiline={true}
                numberOfLines={3}
              />
              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
            </View>
          </View>
          
          {/* Способ оплаты */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Способ оплаты</Text>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.paymentRadio}>
                {paymentMethod === 'card' && <View style={styles.paymentRadioInner} />}
              </View>
              <Ionicons name="card-outline" size={24} color="#0f2942" style={styles.paymentIcon} />
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>Банковской картой</Text>
                <Text style={styles.paymentSubtitle}>Онлайн через систему электронных платежей</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <View style={styles.paymentRadio}>
                {paymentMethod === 'cash' && <View style={styles.paymentRadioInner} />}
              </View>
              <Ionicons name="cash-outline" size={24} color="#0f2942" style={styles.paymentIcon} />
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>Наличными</Text>
                <Text style={styles.paymentSubtitle}>Оплата при получении</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Дополнительная информация */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Дополнительно</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Комментарий к заказу</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Напишите, если есть особые пожелания"
                value={comments}
                onChangeText={setComments}
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>
          
          {/* Итоговая сумма */}
          <View style={styles.totalSection}>
            <Text style={styles.sectionTitle}>Сводка заказа</Text>
            
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Товары ({cartItems.length}):</Text>
                <Text style={styles.summaryValue}>{formatPrice(totalPrice)} ₽</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Доставка:</Text>
                <Text style={styles.summaryValue}>
                  {totalPrice > 5000 ? 'Бесплатно' : `${formatPrice(500)} ₽`}
                </Text>
              </View>
              
              {totalPrice < 5000 && (
                <Text style={styles.freeDeliveryNote}>
                  До бесплатной доставки не хватает {formatPrice(5000 - totalPrice)} ₽
                </Text>
              )}
              
              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Итого:</Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(totalPrice > 5000 ? totalPrice : totalPrice + 500)} ₽
                </Text>
              </View>
            </View>
          </View>
          
          {/* Кнопка оформления */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Оформить заказ</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
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
          onPress={handleBackToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#666" />
          <Text style={styles.bottomNavText}>Корзина</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => {}}
        >
          <View style={styles.bottomNavIconContainer}>
            <Ionicons name="card" size={24} color="#1a3c5b" />
            <View style={styles.activeIndicator} />
          </View>
          <Text style={[styles.bottomNavText, { color: '#1a3c5b', fontWeight: '600' }]}>Оформить</Text>
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
  contentContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f2942',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
 
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  generalErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  paymentOptionActive: {
    borderColor: '#0f2942',
    backgroundColor: 'rgba(15, 41, 66, 0.05)',
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0f2942',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f2942',
  },
  paymentIcon: {
    marginRight: 10,
  },
  paymentText: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f2942',
  },
  submitButton: {
    backgroundColor: '#0f2942',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backToCatalogButton: {
    backgroundColor: '#0f2942',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backToCatalogButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  productQuantity: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f2942',
  },
  cartItemSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  orderSummary: {
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  freeDeliveryNote: {
    fontSize: 12,
    color: '#1a73e8',
    marginVertical: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  }
}); 