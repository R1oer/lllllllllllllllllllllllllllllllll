import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'AUTO_PARTS_CART_';
const CART_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export const CartProvider = ({ children }) => {
 
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  
 
  useEffect(() => {
    initializeSession();
  }, []);

 
  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

 
  const initializeSession = async () => {
    try {
      setLoading(true);
      
   
      let existingSessionId = await AsyncStorage.getItem('AUTO_PARTS_SESSION_ID');
      
      if (!existingSessionId) {
     
        existingSessionId = uuidv4();
        await AsyncStorage.setItem('AUTO_PARTS_SESSION_ID', existingSessionId);
      }
      
      setSessionId(existingSessionId);
      
   
      await loadCartFromStorage(existingSessionId);
    } catch (error) {
      console.error('Ошибка при инициализации сессии:', error);
    } finally {
      setLoading(false);
    }
  };

 
  const loadCartFromStorage = async (sid) => {
    try {
      const cartKey = `${CART_STORAGE_KEY}${sid}`;
      
      const storedCartData = await AsyncStorage.getItem(cartKey);
      
      if (storedCartData) {
        const { items, timestamp } = JSON.parse(storedCartData);
        
     
        if (!Array.isArray(items)) {
          console.error('Некорректные данные корзины в хранилище');
          setCartItems([]);
          setTotalPrice(0);
          return;
        }
        
     
        const currentTime = Date.now();
        if (currentTime - timestamp > CART_EXPIRATION_TIME) {
       
          await AsyncStorage.removeItem(cartKey);
          setCartItems([]);
          setTotalPrice(0);
        } else {
       
          
       
          const validatedItems = items.map(item => {
            if (!item.cartItemId) {
           
              return {
                ...item,
                cartItemId: `cart_${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
              };
            }
            return item;
          });
          
          setCartItems(validatedItems);
       
        }
      } else {
        setCartItems([]);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error('Ошибка при загрузке корзины из хранилища:', error);
      setCartItems([]);
      setTotalPrice(0);
    }
  };

 
  const saveCartToStorage = async () => {
    if (!sessionId) {
      console.error('Нет идентификатора сессии, невозможно сохранить корзину');
      return Promise.reject('Нет идентификатора сессии');
    }
    
    try {
      const cartData = {
        items: cartItems,
        timestamp: Date.now()
      };
      
      const cartKey = `${CART_STORAGE_KEY}${sessionId}`;
      
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (error) {
      console.error('Ошибка при сохранении корзины в хранилище:', error);
      return Promise.reject(error);
    }
  };

 
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) {
      setTotalPrice(0);
      return;
    }
    
 
    let hasInvalidItems = false;
    
    const total = cartItems.reduce((sum, item) => {
   
      if (!item || typeof item !== 'object') {
        hasInvalidItems = true;
        return sum;
      }
      
   
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      
      if (isNaN(price) || isNaN(quantity)) {
        hasInvalidItems = true;
        return sum;
      }
      
      return sum + (price * quantity);
    }, 0);
    
 
    if (hasInvalidItems) {
      const validItems = cartItems.filter(item => 
        item && 
        typeof item === 'object' && 
        !isNaN(Number(item.price)) && 
        !isNaN(Number(item.quantity))
      );
      
      setCartItems(validItems);
   
      setTimeout(() => {
        saveCartToStorage();
      }, 0);
    }
    
    setTotalPrice(total);
  };

 
  const addToCart = async (product) => {
    if (!product || !product.id) {
      console.error('Невозможно добавить товар: неверные данные', product);
      return;
    }
    
 
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    let updatedItems;
    if (existingItemIndex >= 0) {
   
      updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
    } else {
   
   
      const cartItemId = `cart_${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      updatedItems = [...cartItems, { 
        ...product, 
        quantity: 1, 
        cartItemId: cartItemId 
      }];
    }
    
    try {
   
      setCartItems(updatedItems);
      
   
      const cartData = {
        items: updatedItems,
        timestamp: Date.now()
      };
      
      const cartKey = `${CART_STORAGE_KEY}${sessionId}`;
      
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
      
   
      Alert.alert(
        'Товар добавлен',
        `${product.name} добавлен в корзину`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Ошибка при сохранении корзины:', error);
    }
  };

 
  const increaseQuantity = async (itemId) => {
    const updatedItems = cartItems.map(item => {
   
      const isMatch = (item.cartItemId && item.cartItemId === itemId) || 
                      (!item.cartItemId && item.id === itemId);
      
      return isMatch ? { ...item, quantity: item.quantity + 1 } : item;
    });
    
    try {
   
      setCartItems(updatedItems);
      
   
      const cartData = {
        items: updatedItems,
        timestamp: Date.now()
      };
      
      const cartKey = `${CART_STORAGE_KEY}${sessionId}`;
      
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (error) {
      console.error('Ошибка при сохранении корзины:', error);
    }
  };

 
  const decreaseQuantity = async (itemId) => {
    const updatedItems = cartItems.map(item => {
      const isMatch = (item.cartItemId && item.cartItemId === itemId) || 
                      (!item.cartItemId && item.id === itemId);
      
   
      return isMatch && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item;
    });
    
    try {
   
      setCartItems(updatedItems);
      
   
      const cartData = {
        items: updatedItems,
        timestamp: Date.now()
      };
      
      const cartKey = `${CART_STORAGE_KEY}${sessionId}`;
      
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (error) {
      console.error('Ошибка при сохранении корзины:', error);
    }
  };

 
  const removeFromCart = async (itemId) => {
    if (!itemId) {
      console.error('Невозможно удалить товар: не указан ID');
      return;
    }
    
 
    const itemToRemove = cartItems.find(item => 
      (item.cartItemId === itemId) || (item.id === itemId)
    );
    
    if (!itemToRemove) {
      console.error(`Товар с ID ${itemId} не найден в корзине`);
      return;
    }
    
 
    const updatedItems = cartItems.filter(item => 
      (item.cartItemId !== itemId) && (item.id !== itemId)
    );
    
 
    try {
   
      setCartItems(updatedItems);
      
   
      const cartData = {
        items: updatedItems,
        timestamp: Date.now()
      };
      
      const cartKey = `${CART_STORAGE_KEY}${sessionId}`;
      
   
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (error) {
      console.error('Ошибка при сохранении корзины после удаления:', error);
    }
    
 
    Alert.alert(
      'Товар удалён',
      'Товар был удалён из корзины',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

 
  const clearCart = async () => {
    if (!sessionId) {
      console.error('Нет идентификатора сессии, невозможно очистить корзину');
      return;
    }
    
    try {
   
      setCartItems([]);
      setTotalPrice(0);
      
   
      const cartKey = `${CART_STORAGE_KEY}${sessionId}`;
      
   
      await AsyncStorage.removeItem(cartKey);
      
   
      const emptyCartData = {
        items: [],
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(cartKey, JSON.stringify(emptyCartData));
    } catch (error) {
      console.error('Ошибка при очистке корзины в хранилище:', error);
    }
    
 
    Alert.alert(
      'Корзина очищена',
      'Все товары удалены из корзины',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

 
  const contextValue = {
    cartItems,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartItemsCount: cartItems.length
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Хук для удобного использования контекста
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
}; 