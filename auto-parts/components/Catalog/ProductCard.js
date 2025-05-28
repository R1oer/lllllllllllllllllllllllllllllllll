import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const ProductCard = ({ product, onPress, onAddToCart, viewType = 'list', isSmallDevice = false }) => {
 
  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
  };

 
  const isProductInStock = product.in_stock !== undefined ? product.in_stock : product.stock > 0;

 
  if (viewType === 'grid') {
    return (
      <TouchableOpacity 
        style={styles.gridCard} 
        onPress={() => onPress(product)} 
        activeOpacity={0.9}
      >
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          {isProductInStock ? (
            <View style={styles.gridStockBadge}>
              <Text style={[styles.stockText, isSmallDevice && styles.smallStockText]}>В НАЛИЧИИ</Text>
            </View>
          ) : (
            <View style={[styles.gridStockBadge, styles.outOfStockBadge]}>
              <Text style={[styles.stockText, isSmallDevice && styles.smallStockText]}>НЕТ В НАЛИЧИИ</Text>
            </View>
          )}
        </View>

        <View style={styles.gridInfoContainer}>
          <Text style={[styles.gridTitle, isSmallDevice && styles.smallGridTitle]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={styles.code}>Арт: {product.sku || 'N/A'}</Text>
          
          <View style={styles.gridFooter}>
            <Text style={[styles.price, isSmallDevice && styles.smallPrice]}>
              {formatPrice(product.price)} ₽
            </Text>
            
            {isProductInStock && (
              <TouchableOpacity 
                style={styles.gridButton} 
                onPress={() => onAddToCart(product)}
              >
                <Ionicons name="cart" size={isSmallDevice ? 14 : 16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

 
  return (
    <TouchableOpacity 
      style={[styles.card, isSmallDevice && styles.smallCard]} 
      onPress={() => onPress(product)} 
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, isSmallDevice && styles.smallImageContainer]}>
        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
          style={styles.image}
          resizeMode="cover"
        />
        {isProductInStock ? (
          <View style={styles.stockBadge}>
            <Text style={[styles.stockText, isSmallDevice && styles.smallStockText]}>В НАЛИЧИИ</Text>
          </View>
        ) : (
          <View style={[styles.stockBadge, styles.outOfStockBadge]}>
            <Text style={[styles.stockText, isSmallDevice && styles.smallStockText]}>НЕТ В НАЛИЧИИ</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <View>
          <Text style={[styles.title, isSmallDevice && styles.smallTitle]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={styles.code}>Артикул: {product.sku || 'N/A'}</Text>
          
          {!isSmallDevice && (
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          )}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, isSmallDevice && styles.smallPrice]}>
              {formatPrice(product.price)} ₽
            </Text>
            {product.old_price && (
              <Text style={[styles.oldPrice, isSmallDevice && styles.smallOldPrice]}>
                {formatPrice(product.old_price)} ₽
              </Text>
            )}
          </View>
          
          {isProductInStock && (
            <TouchableOpacity 
              style={[styles.button, isSmallDevice && styles.smallButton]} 
              onPress={() => onAddToCart(product)}
            >
              <Ionicons 
                name="cart" 
                size={isSmallDevice ? 14 : 18} 
                color="white" 
                style={styles.buttonIcon} 
              />
              <Text style={[styles.buttonText, isSmallDevice && styles.smallButtonText]}>
                {isSmallDevice ? 'КУПИТЬ' : 'В КОРЗИНУ'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
 
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 160,
  },
  smallCard: {
    height: 120,
    margin: 6,
  },
  imageContainer: {
    width: 130,
    position: 'relative',
  },
  smallImageContainer: {
    width: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#1a8754',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  outOfStockBadge: {
    backgroundColor: '#dc3545',
  },
  stockText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  smallStockText: {
    fontSize: 7,
    letterSpacing: 0.3,
  },
  infoContainer: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  smallTitle: {
    fontSize: 13,
    marginBottom: 3,
  },
  code: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  smallPrice: {
    fontSize: 14,
  },
  oldPrice: {
    fontSize: 13,
    color: '#6c757d',
    textDecorationLine: 'line-through',
  },
  smallOldPrice: {
    fontSize: 11,
  },
  button: {
    backgroundColor: '#1a3c5b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  smallButtonText: {
    fontSize: 10,
    letterSpacing: 0.3,
    marginLeft: 4,
  },

 
  gridCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    height: 'auto',
    minHeight: 220,
  },
  gridImageContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridStockBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#1a8754',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  gridInfoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  smallGridTitle: {
    fontSize: 12,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  gridButton: {
    backgroundColor: '#1a3c5b',
    padding: 8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#8395a7',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: 'rgba(255,255,255,0.8)',
  },
});

export default ProductCard; 