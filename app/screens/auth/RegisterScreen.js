// app/screens/auth/RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import api from '../../api/api';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../components/Button';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token, user } = res.data;
      await login({ token, user });
    } catch (err) {
      console.warn(err?.response?.data || err.message);
      alert(err?.response?.data?.message ?? 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1B4CFF', '#8B2EFF']}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Glass Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.sub}>Start your journey with us</Text>

            {/* Input: Full Name */}
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Input: Email */}
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Input: Password */}
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Ionicons
                onPress={() => setShowPassword(!showPassword)}
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#fff"
                style={styles.iconAbsolute} />
            </View>

            {/* CTA */}
            <Button
              title={loading ? 'Creating...' : 'Register'}
              onPress={handleRegister}
              disabled={loading}
              style={{ marginTop: 10 }}
            />

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 18 }}
            >
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 26,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  iconAbsolute: {
    marginRight: 12
  },
  link: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 18,
  },
});
