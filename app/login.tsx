import AsyncStorage from '@react-native-async-storage/async-storage'; // lưu token cục bộ
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password); 

      await AsyncStorage.setItem('token', res.token);

      Alert.alert('Đăng nhập thành công!');
      router.push('/(tabs)');
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sai tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require("../assets/images/logo_dut.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : "Đăng nhập"}</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  // 🌟 STYLE MỚI CHO LOGO
  logo: {
    width: 150, // Điều chỉnh kích thước
    height: 150, // Điều chỉnh kích thước
    marginBottom: 40, // Khoảng cách bên dưới logo
    // Nếu bạn dùng logo không có nền, có thể bỏ 'backgroundColor'
  },
  // -----------------------
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10, // Thêm chút khoảng cách trên nút
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});