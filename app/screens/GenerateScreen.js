// app/screens/GenerateScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import api from '../api/api';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import ImagePreview from '../components/ImagePreview';
import CreditBadge from '../components/CreditBadge';
import { AuthContext } from '../contexts/AuthContext';

export default function GenerateScreen() {
  const { credits, updateCredits } = useContext(AuthContext);

  const [source, setSource] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedUri, setGeneratedUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (res.errorCode) return Alert.alert('Error', res.errorMessage);
    if (!res.assets) return;
    setSource(res.assets[0].uri);
    setGeneratedUri(null);
  };

  const takePhoto = async () => {
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (res.errorCode) return Alert.alert('Error', res.errorMessage);
    if (!res.assets) return;
    setSource(res.assets[0].uri);
    setGeneratedUri(null);
  };

  const handleGenerate = async () => {
    if (!source) return Alert.alert('Error', 'Please choose an image');
    if (!prompt) return Alert.alert('Error', 'Please enter a prompt');

    setLoading(true);
    try {
      const idKey = uuidv4();
      const form = new FormData();

      const fileName = source.split('/').pop();
      form.append('image', {
        uri: source,
        name: fileName,
        type: 'image/jpeg',
      });

      form.append('prompt', prompt);

      const response = await api.post('/generate', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-idempotency-key': idKey,
        },
      });

      console.log('Generation response', response);
      const { generated_image } = response.data;
      setGeneratedUri(generated_image);

      // 🔥 update global credits
      await updateCredits();
    } catch (err) {
      console.warn(err?.response?.data || err?.message);
      Alert.alert('Error', 'Generation failed, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Wrap Generator</Text>
        <CreditBadge credits={credits} />
      </View>

      {/* Pick source */}
      <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
        <Text style={{ color: '#0b63ff' }}>{source ? 'Change Image' : 'Pick Image from Gallery'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.pickBtn, { marginTop: 8 }]} onPress={takePhoto}>
        <Text style={{ color: '#0b63ff' }}>Take Photo</Text>
      </TouchableOpacity>

      {/* Preview */}
      <ImagePreview uri={generatedUri || source} style={{ marginTop: 16 }} />

      {/* Prompt */}
      <TextInput
        style={styles.input}
        placeholder="Describe the wrap design (e.g. matte black + red stripes)"
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />

      {/* Generate */}
      <Button
        title={loading ? 'Generating...' : 'Generate'}
        onPress={handleGenerate}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  pickBtn: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    minHeight: 80,
    fontSize: 14,
  },
});
