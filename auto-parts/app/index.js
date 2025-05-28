import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ADMIN_PASSWORD = 'admin2203';

export default function Index() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLoginAsGuest = () => {
    router.push('/main/catalog');
  };

  const handleAdminButtonPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setPassword('');
    setIsPasswordVisible(false);
  };

  const handleLoginAttempt = () => {
    if (password === ADMIN_PASSWORD) {
   
      handleCloseModal();
      router.push('/admin/dashboard');
    } else {
   
      Alert.alert('Ошибка', 'Неверный пароль администратора');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ImageBackground 
        source={require('../assets/images/car-parts-bg.jpg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.6)', 'rgba(20,20,40,0.5)']}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={64} color="#FFFFFF" />
              <Text style={styles.title}>Автозапчасти</Text>
            </View>
            
            <Text style={styles.subtitle}>Мобильное приложение для сервиса продажи автомобильных комплектующих</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleAdminButtonPress}
                activeOpacity={0.7}
              >
                <View style={styles.adminButton}>
                  <Ionicons name="person" size={22} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>ВХОД КАК АДМИНИСТРАТОР</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLoginAsGuest}
                activeOpacity={0.7}
              >
                <View style={styles.guestButton}>
                  <Ionicons name="cart" size={22} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>ВОЙТИ КАК ГОСТЬ</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.footerText}>Версия 1.0.0</Text>
          </View>

          {/* Модальное окно для ввода пароля администратора */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal}
          >
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Вход для администратора</Text>
                    <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalText}>
                    Введите пароль для доступа к административной панели
                  </Text>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Пароль администратора"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="none"
                      secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton} 
                      onPress={togglePasswordVisibility}
                    >
                      <Ionicons 
                        name={isPasswordVisible ? "eye-off" : "eye"} 
                        size={24} 
                        color="#777" 
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleLoginAttempt}
                  >
                    <Text style={styles.loginButtonText}>ВОЙТИ</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 60,
    textAlign: 'center',
    color: '#FFFFFF',
    maxWidth: width * 0.9,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
  },
  button: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  adminButton: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1a3c5b',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  guestButton: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#2c3e50',
    borderWidth: 1,
    borderColor: '#7f8c8d',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },

 
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3c5b',
  },
  closeButton: {
    padding: 5,
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#1a3c5b',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  }
}); 