// app/screens/GenerateScreen.js
import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import api, { API_BASE_URL } from '../api/api';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import ImagePreview from '../components/ImagePreview';
import CreditBadge from '../components/CreditBadge';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MODIFICATION_TYPES, COLORS, FINISHES, WHEEL_STYLES, BODYKIT_STYLES, TINT_LEVELS } from '../data/dummyData';

export default function GenerateScreen() {
  const { credits, updateCredits } = useContext(AuthContext);

  // --- STATE ---
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Wizard State
  // Step 0: Image Picked (handled by history[currentIndex])
  // Step 1: Mod Type Selection
  const [selectedModType, setSelectedModType] = useState(null);

  // New Stacked State
  const [pendingModifications, setPendingModifications] = useState([]);
  // pendingModifications = [{ modType: {...}, customization: {...} }, ...]

  // Current customization being edited
  const [currentCustomization, setCurrentCustomization] = useState({});

  const addToHistory = (uri) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(uri);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);

    // Reset wizard completely
    setSelectedModType(null);
    setCurrentCustomization({});
    setPendingModifications([]);
  };

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (res.errorCode) return Alert.alert('Error', res.errorMessage);
    if (!res.assets) return;
    setHistory([res.assets[0].uri]);
    setCurrentIndex(0);
    resetWizard();
  };

  const takePhoto = async () => {
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (res.errorCode) return Alert.alert('Error', res.errorMessage);
    if (!res.assets) return;
    setHistory([res.assets[0].uri]);
    setCurrentIndex(0);
    resetWizard();
  };

  const resetWizard = () => {
    setSelectedModType(null);
    setCurrentCustomization({});
    setPendingModifications([]);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Reset wizard
      resetWizard();
    } else {
      // Remove image if at start
      setHistory([]);
      setCurrentIndex(-1);
      resetWizard();
    }
  };

  const handleBackFromCustomization = () => {
    // Cancel current customization
    setSelectedModType(null);
    setCurrentCustomization({});
  };

  const handleApplyCustomization = () => {
    // Add to pending
    if (!selectedModType) return;

    const newMod = {
      modType: selectedModType,
      customization: currentCustomization,
      id: uuidv4(),
    };

    setPendingModifications([...pendingModifications, newMod]);
    // Return to grid
    setSelectedModType(null);
    setCurrentCustomization({});
  };

  const removePendingMod = (id) => {
    setPendingModifications(prev => prev.filter(m => m.id !== id));
  };


  // --- LOGIC ---
  const isStepComplete = useMemo(() => {
    if (!selectedModType) return false;
    if (!selectedModType.steps) return true;
    for (const step of selectedModType.steps) {
      if (!currentCustomization[step]) return false;
    }
    return true;
  }, [selectedModType, currentCustomization]);

  const constructPrompt = () => {
    if (pendingModifications.length === 0) return '';

    const parts = pendingModifications.map(mod => {
      let prompt = mod.modType.promptTemplate;
      prompt = prompt.replace('{colorName}', mod.customization.color?.name || 'custom color');
      prompt = prompt.replace('{finish}', mod.customization.finish?.name || 'standard');
      prompt = prompt.replace('{styleName}', mod.customization.style?.name || 'custom');
      return prompt;
    });

    return parts.join(', ');
  };

  const fetchImageAsBlob = async (url) => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerate = async () => {
    if (currentIndex < 0) return Alert.alert('Error', 'Please choose an image');
    if (pendingModifications.length === 0) return Alert.alert('Error', 'Please select at least one modification');

    // Construct Prompt
    const finalPrompt = constructPrompt();
    console.log('Generating with prompt:', finalPrompt);

    const currentImageUri = history[currentIndex];
    setLoading(true);
    try {
      const idKey = uuidv4();
      const form = new FormData();

      let imageForUpload = { uri: currentImageUri, name: 'image.jpg', type: 'image/jpeg' };

      if (currentImageUri.startsWith('http')) {
        try {
          const base64Uri = await fetchImageAsBlob(currentImageUri);
          imageForUpload = { uri: base64Uri, name: 'edited_image.jpg', type: 'image/jpeg' };
        } catch (fetchErr) {
          console.warn('Failed fetch', fetchErr);
          setLoading(false);
          return;
        }
      }

      form.append('image', imageForUpload);
      form.append('prompt', finalPrompt);

      const response = await api.post('/generate', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-idempotency-key': idKey,
        },
      });

      let { image_url } = response.data;
      if (image_url && image_url.includes('localhost')) {
        const ip = API_BASE_URL.split('://')[1].split(':')[0];
        image_url = image_url.replace('localhost', ip);
      }

      addToHistory(image_url);
      await updateCredits();

    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Generation failed');
    } finally {
      setLoading(false);
    }
  };


  const handleModSelect = (mod) => {
    // Check if already applied
    const existingIndex = pendingModifications.findIndex(m => m.modType.id === mod.id);

    if (mod.id === 'improve') {
      if (existingIndex >= 0) {
        // Remove if already selected (toggle)
        setPendingModifications(prev => prev.filter(m => m.modType.id !== mod.id));
      } else {
        // Add immediately
        const newMod = {
          modType: mod,
          customization: {},
          id: uuidv4(),
        };
        setPendingModifications([...pendingModifications, newMod]);
      }
    } else {
      // Prepare to customize
      if (existingIndex >= 0) {
        // Optional: Edit existing? For now, let's just allow selecting to re-customize or add new?
        // Simplest: Just open customization. Note: If we want to allow editing, we'd need to load currentCustomization from pending.
        // For now, let's just open standard customization.
        setSelectedModType(mod);
      } else {
        setSelectedModType(mod);
      }
    }
  };

  // --- RENDER HELPERS ---

  // 1. Mod Grid
  const renderModGrid = () => (
    <View style={styles.gridContainer}>
      <Text style={styles.stepTitle}>Select Modification</Text>

      {/* Pending Chips */}
      {pendingModifications.length > 0 && (
        <ScrollView horizontal style={{ maxHeight: 50, marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
          {pendingModifications.map(mod => (
            <View key={mod.id} style={styles.chip}>
              <Text style={styles.chipText}>{mod.modType.label}</Text>
              <TouchableOpacity onPress={() => removePendingMod(mod.id)}>
                <Ionicons name="close-circle" size={18} color="#fff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.grid}>
          {MODIFICATION_TYPES.map(mod => {
            const isApplied = pendingModifications.some(m => m.modType.id === mod.id);
            return (
              <TouchableOpacity
                key={mod.id}
                style={[
                  styles.modCard,
                  isApplied && { borderColor: '#0b63ff', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.15)' } // Highlight active mods
                ]}
                onPress={() => handleModSelect(mod)}
              >
                <Ionicons name={mod.icon} size={32} color={isApplied ? '#0b63ff' : '#fff'} />
                <Text style={[styles.modLabel, isApplied && { color: '#0b63ff' }]}>{mod.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Generate Button */}
      {pendingModifications.length > 0 && (
        <View style={styles.floatingBtnContainer}>
          <Button
            title={loading ? "Generating..." : `Generate (${pendingModifications.length})`}
            onPress={handleGenerate}
            disabled={loading}
            style={{ shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 }}
          />
        </View>
      )}
    </View>
  );

  // 2. Customization Screens
  const renderCustomization = () => {
    const steps = selectedModType.steps || [];

    return (
      <View style={{ flex: 1, padding: 16 }}>
        {/* Custom Header in View */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={handleBackFromCustomization} style={{ padding: 8, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>Customize {selectedModType.label}</Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {steps.length === 0 ? (
            <View style={styles.centerMsg}>
              <Text style={{ color: '#fff' }}>No options for this modification.</Text>
            </View>
          ) : (
            steps.map(step => {
              if (step === 'color') return renderColorPicker();
              if (step === 'finish') return renderOptionSelector('finish', FINISHES, 'Select Finish');
              if (step === 'style') return renderStyleSelector();
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        <Button
          title="Apply Modification"
          onPress={handleApplyCustomization}
          disabled={!isStepComplete}
        />
      </View>
    );
  };

  const renderColorPicker = () => (
    <View key="color" style={styles.section}>
      <Text style={styles.sectionTitle}>Select Color</Text>
      <View style={styles.colorGrid}>
        {COLORS.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.colorCircle, { backgroundColor: c.color, borderWidth: currentCustomization.color?.id === c.id ? 2 : 0, borderColor: '#fff' }]}
            onPress={() => setCurrentCustomization(prev => ({ ...prev, color: { name: c.label, id: c.id } }))}
          />
        ))}
      </View>
      <Text style={{ color: '#aaa', marginTop: 8 }}>Selected: {currentCustomization.color?.name || 'None'}</Text>
    </View>
  );

  const renderStyleSelector = () => {
    let options = [];
    if (selectedModType.id === 'wheels') options = WHEEL_STYLES;
    if (selectedModType.id === 'bodykit') options = BODYKIT_STYLES;
    if (selectedModType.id === 'tint') options = TINT_LEVELS;

    return renderOptionSelector('style', options, 'Select Style');
  };

  const renderOptionSelector = (key, options, title) => (
    <View key={key} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.optionCard,
              currentCustomization[key]?.id === opt.id && styles.optionSelected
            ]}
            onPress={() => setCurrentCustomization(prev => ({ ...prev, [key]: opt }))}
          >
            {opt.image ? (
              <View style={{ width: 60, height: 60, backgroundColor: '#333', marginBottom: 8 }} />
            ) : null}
            <Text style={styles.optionText}>{opt.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );


  // --- MAIN RENDER ---
  return (
    <LinearGradient colors={['#1B4CFF', '#8B2EFF']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* Back Button */}
            {currentIndex >= 0 && !selectedModType && (
              <TouchableOpacity onPress={handleUndo} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {/* Spacer */}
            {currentIndex < 0 || selectedModType ? <View style={{ width: 40 }} /> : null}

            <Text style={styles.title}>AI Generator</Text>
            <CreditBadge credits={credits} />
          </View>

          {/* Main Content Area */}
          <View style={{ flex: 1 }}>
            {currentIndex < 0 ? (
              // Step 0: Pick Image
              <View style={styles.centerContainer}>
                <Text style={styles.promptText}>Start by uploading a photo of your car</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 20 }}>
                  <TouchableOpacity style={styles.bigBtn} onPress={pickImage}>
                    <Ionicons name="images-outline" size={40} color="#0b63ff" />
                    <Text style={styles.btnTxt}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bigBtn} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={40} color="#0b63ff" />
                    <Text style={styles.btnTxt}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {!selectedModType && (
                  <View style={{ height: 200 }}>
                    <ImagePreview uri={history[currentIndex]} />
                  </View>
                )}

                <View style={styles.controlsArea}>
                  {!selectedModType ? renderModGrid() : renderCustomization()}
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  backBtn: { padding: 8 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  promptText: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  bigBtn: {
    width: 120, height: 120,
    backgroundColor: 'rgba(255,255,255,0.1)', // Glass
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  btnTxt: { color: '#fff', marginTop: 12, fontWeight: '600' },

  // Mods Grid
  gridContainer: { flex: 1, padding: 16, paddingTop: 64 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  modCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)', // Glass
    padding: 16, borderRadius: 16,
    minHeight: 100, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  modLabel: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8 },

  // Chips
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0b63ff',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16
  },
  chipText: { color: '#fff', marginRight: 4, fontWeight: '600' },

  floatingBtnContainer: {
    position: 'absolute', bottom: 20, left: 20, right: 20
  },

  // Customization
  controlsArea: { flex: 1, marginTop: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 12 },

  colorGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorCircle: { width: 48, height: 48, borderRadius: 24 },

  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Glass
    padding: 12, borderRadius: 16, marginRight: 12,
    minWidth: 100, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  optionSelected: { borderColor: '#0b63ff', backgroundColor: 'rgba(255,255,255,0.2)' },
  optionText: { color: '#fff', marginTop: 8, textAlign: 'center' },

  centerMsg: { padding: 40, alignItems: 'center' },
});
