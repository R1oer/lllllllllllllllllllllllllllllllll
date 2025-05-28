import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
 
    Alert.alert(
      'Товар добавлен',
      `${product.name} добавлен в корзину в количестве ${quantity} шт.`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image_url || 'https://via.placeholder.com/400' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{product.price} ₽</Text>
        
        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.description}>{product.description}</Text>
        
        {product.specifications && (
          <>
            <Text style={styles.sectionTitle}>Характеристики</Text>
            <View style={styles.specificationsContainer}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View style={styles.specRow} key={key}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Количество:</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>Добавить в корзину</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0070e0',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  specificationsContainer: {
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specKey: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  specValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  quantityContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#ddd',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#0070e0',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen; 