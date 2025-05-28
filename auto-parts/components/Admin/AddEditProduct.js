import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../constants/supabase';

const AddEditProduct = ({ route, navigation }) => {
 
  const productToEdit = route.params?.product;
  const isEditMode = !!productToEdit;

 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (isEditMode && productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price ? productToEdit.price.toString() : '');
      setImageUrl(productToEdit.image_url || '');
      setCategory(productToEdit.category || '');
      setStock(productToEdit.stock ? productToEdit.stock.toString() : '');
    }
  }, [isEditMode, productToEdit]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Название товара не может быть пустым');
      return false;
    }
    
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Ошибка', 'Указана некорректная цена');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const productData = {
        name,
        description,
        price: parseFloat(price),
        image_url: imageUrl,
        category,
        stock: parseInt(stock) || 0,
        updated_at: new Date()
      };
      
      let result;
      
      if (isEditMode) {
     
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', productToEdit.id);
      } else {
     
        productData.created_at = new Date();
        result = await supabase
          .from('products')
          .insert(productData);
      }
      
      if (result.error) throw result.error;
      
      Alert.alert(
        'Успех',
        isEditMode ? 'Товар успешно обновлен' : 'Товар успешно добавлен',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Ошибка', `Не удалось ${isEditMode ? 'обновить' : 'добавить'} товар`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>
          {isEditMode ? 'Редактирование товара' : 'Добавление нового товара'}
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Название*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Введите название товара"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Введите описание товара"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Цена*</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Введите цену"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>URL изображения</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Введите URL изображения"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Категория</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Введите категорию товара"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Количество на складе</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="Введите количество"
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Сохранить изменения' : 'Добавить товар'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#0070e0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddEditProduct; 