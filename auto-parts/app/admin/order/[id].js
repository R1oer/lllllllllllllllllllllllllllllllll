import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../constants/supabase';

const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const translateStatus = (status) => {
  switch (status) {
    case ORDER_STATUSES.PENDING: return 'Ожидает';
    case ORDER_STATUSES.PROCESSING: return 'В обработке';
    case ORDER_STATUSES.COMPLETED: return 'Выполнен';
    case ORDER_STATUSES.CANCELLED: return 'Отменен';
    default: return 'Неизвестно';
  }
};

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case ORDER_STATUSES.PENDING: return styles.statusPending;
    case ORDER_STATUSES.PROCESSING: return styles.statusProcessing;
    case ORDER_STATUSES.COMPLETED: return styles.statusCompleted;
    case ORDER_STATUSES.CANCELLED: return styles.statusCancelled;
    default: return styles.statusPending;
  }
};

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
   
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) throw orderError;
      
   
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product:product_id(*)')
        .eq('order_id', id);
      
      if (itemsError) throw itemsError;
      
      setOrder(orderData);
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error('Ошибка загрузки данных заказа:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setIsSavingStatus(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
   
      setOrder({ ...order, status: newStatus });
      Alert.alert('Успех', 'Статус заказа обновлен');
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      Alert.alert('Ошибка', 'Не удалось обновить статус заказа');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const toggleStatusModal = () => {
    setStatusModalVisible(!statusModalVisible);
  };

 
  const renderOrderItem = ({ item }) => {
 
    const price = item.product_price ? parseFloat(item.product_price) : 0;
    const totalPrice = price * item.quantity;
    
 
    const formatPrice = (value) => {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    };
    
    return (
      <View style={styles.orderItem}>
        <View style={styles.orderItemContent}>
          <Text style={styles.orderItemName} numberOfLines={2}>
            {item.product_name || item.product?.name || 'Товар недоступен'}
          </Text>
          <View style={styles.orderItemDetails}>
            <Text style={styles.orderItemPrice}>
              {price > 0 ? `${formatPrice(price)} ₽` : '0 ₽'} × {item.quantity} шт.
            </Text>
            <Text style={styles.orderItemTotal}>
              {totalPrice > 0 ? `${formatPrice(totalPrice)} ₽` : '0 ₽'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

 
  const renderStatusModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={statusModalVisible}
      onRequestClose={toggleStatusModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Изменить статус заказа</Text>
            <TouchableOpacity onPress={toggleStatusModal}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusOptions}>
            {Object.values(ORDER_STATUSES).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  order?.status === status && styles.selectedStatusOption
                ]}
                onPress={() => updateOrderStatus(status)}
                disabled={isSavingStatus}
              >
                <View style={[styles.statusIndicator, getStatusBadgeStyle(status)]} />
                <Text style={styles.statusOptionText}>
                  {translateStatus(status)}
                </Text>
                {order?.status === status && (
                  <Ionicons name="checkmark" size={18} color="#1a3c5b" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {isSavingStatus && (
            <ActivityIndicator size="small" color="#1a3c5b" style={styles.loadingIndicator} />
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a3c5b" />
          <Text style={styles.loadingText}>Загрузка данных заказа...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#d32f2f" />
          <Text style={styles.errorText}>Ошибка: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Заказ не найден</Text>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>Вернуться назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen 
        options={{
          title: `Заказ #${order.id}`,
          headerLeft: () => (
            <TouchableOpacity onPress={goBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#1a3c5b" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Заказ #{order.id}</Text>
            <Text style={styles.orderDate}>
              от {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.statusBadge}
            onPress={toggleStatusModal}
          >
            <View style={[styles.statusDot, getStatusBadgeStyle(order.status)]} />
            <Text style={styles.statusText}>
              {translateStatus(order.status)}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#333" style={styles.statusIcon} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Информация о покупателе</Text>
          <View style={styles.customerDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ФИО:</Text>
              <Text style={styles.detailValue}>{order.customer_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Телефон:</Text>
              <Text style={styles.detailValue}>{order.customer_phone || 'Не указан'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{order.customer_email || 'Не указан'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Адрес:</Text>
              <Text style={styles.detailValue}>
                {(() => {
                  if (!order.shipping_address) return 'Не указан';
                  
                  if (typeof order.shipping_address === 'string') {
                    try {
                   
                      const addressObj = JSON.parse(order.shipping_address);
                      return addressObj.address || 'Не указан формат адреса';
                    } catch (e) {
                   
                      return order.shipping_address;
                    }
                  } else if (typeof order.shipping_address === 'object') {
                    return order.shipping_address.address || 'Не указан формат адреса';
                  }
                  
                  return 'Не указан';
                })()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Товары в заказе</Text>
          {orderItems.length > 0 ? (
            <FlatList
              data={orderItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOrderItem}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>Нет товаров в заказе</Text>
          )}
          
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Количество товаров:</Text>
              <Text style={styles.summaryValue}>{totalItems} шт.</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Способ доставки:</Text>
              <Text style={styles.summaryValue}>{order.shipping_method || 'Не указан'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Способ оплаты:</Text>
              <Text style={styles.summaryValue}>{order.payment_method || 'Не указан'}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Скидка:</Text>
                <Text style={styles.summaryValue}>-{order.discount} ₽</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Итого:</Text>
              <Text style={styles.totalValue}>{order.total_amount} ₽</Text>
            </View>
          </View>
        </View>
        
        {order.notes && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Комментарий к заказу</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.replace('/admin/dashboard')}
        >
          <Text style={styles.returnButtonText}>Вернуться к списку заказов</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {renderStatusModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a3c5b',
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a3c5b',
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3c5b',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusPending: {
    backgroundColor: '#f59e0b',
  },
  statusProcessing: {
    backgroundColor: '#3b82f6',
  },
  statusCompleted: {
    backgroundColor: '#10b981',
  },
  statusCancelled: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusIcon: {
    marginLeft: 5,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a3c5b',
    marginBottom: 12,
  },
  customerDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
  },
  orderItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a3c5b',
  },
  orderSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a3c5b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3c5b',
  },
  notes: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusOptions: {
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#f5f7fa',
  },
  selectedStatusOption: {
    backgroundColor: '#e5f1ff',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  returnButton: {
    backgroundColor: '#1a3c5b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 