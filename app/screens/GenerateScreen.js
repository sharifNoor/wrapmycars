// app/screens/GenerateScreen.js
import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Share, Platform, PermissionsAndroid, PanResponder, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import RNShare from 'react-native-share';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import api, { API_BASE_URL } from '../api/api';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import ImagePreview from '../components/ImagePreview';
import CreditBadge from '../components/CreditBadge';
import ZoomableImage from '../components/ZoomableImage';
import { AuthContext } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MODIFICATION_TYPES, COLORS, FINISHES, WHEEL_STYLES, BODYKIT_STYLES, TINT_LEVELS, SPOILER_STYLES, DECAL_STYLES, STANCE_STYLES, LIGHT_STYLES, ENVIRONMENT_STYLES, ACCENT_STYLES, PATTERN_WRAPS } from '../data/dummyData';
import { theme } from '../constants/theme';
import { analyticsService } from '../utils/AnalyticsService';

const HUE_COLORS = [
  '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'
];

const TIPS = [
  { id: '1', icon: 'sunny-outline', text: 'Good lighting works best' },
  { id: '2', icon: 'camera-outline', text: 'Capture the full car angle' },
  { id: '3', icon: 'color-wand-outline', text: 'Avoid shadows and reflections' },
];

const FEATURED_EXAMPLES = [
  { id: '1', label: 'Matte Black Wrap', image: require('../assets/matte_black_wrap.jpeg') },
  { id: '2', label: 'Racing Red Paint', image: require('../assets/racing_red_paint.jpeg') },
  { id: '3', label: 'Widebody Kit', image: require('../assets/widebody_kit.jpeg') },
];

export default function GenerateScreen() {
  const { credits, updateCredits } = useContext(AuthContext);
  const { showAlert } = useAlert();

  // Color Picker State
  const [hueWidth, setHueWidth] = useState(0);
  const hueValue = useMemo(() => {
    // If we have a custom hex, try to estimate hue if possible (optional)
    return 0.5; // Default center
  }, []);

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
  const [isFullScreen, setIsFullScreen] = useState(false);

  const addToHistory = (uri, id = null) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ uri, id });
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);

    // Reset wizard completely
    setSelectedModType(null);
    setCurrentCustomization({});
    setPendingModifications([]);
  };

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 2000,
      maxHeight: 2000,
    });
    if (res.errorCode) return showAlert({ type: 'error', title: 'Error', message: res.errorMessage });
    if (!res.assets) return;
    setHistory([{ uri: res.assets[0].uri, id: null }]);
    setCurrentIndex(0);
    resetWizard();
  };

  const takePhoto = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 2000,
      maxHeight: 2000,
    });
    if (res.errorCode) return showAlert({ type: 'error', title: 'Error', message: res.errorMessage });
    if (!res.assets) return;
    setHistory([{ uri: res.assets[0].uri, id: null }]);
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
    }
  };

  const handleExit = () => {
    setHistory([]);
    setCurrentIndex(-1);
    resetWizard();
  };

  const handleBackFromCustomization = () => {
    // Cancel current customization
    setSelectedModType(null);
    setCurrentCustomization({});
  };

  const handleApplyCustomization = () => {
    // Add or Update in pending
    if (!selectedModType) return;

    const existingIndex = pendingModifications.findIndex(m => m.modType.id === selectedModType.id);

    const newMod = {
      modType: selectedModType,
      customization: currentCustomization,
      id: existingIndex >= 0 ? pendingModifications[existingIndex].id : uuidv4(),
    };

    if (existingIndex >= 0) {
      // Update existing
      const updatedMods = [...pendingModifications];
      updatedMods[existingIndex] = newMod;
      setPendingModifications(updatedMods);
    } else {
      // Add new
      setPendingModifications([...pendingModifications, newMod]);
    }

    // Return to grid
    setSelectedModType(null);
    setCurrentCustomization({});
  };

  const removePendingMod = (id) => {
    setPendingModifications(prev => prev.filter(m => m.id !== id));
  };


  const hueToHex = (h) => {
    const r = Math.max(0, Math.min(255, Math.abs(h * 6 - 3) - 1));
    const g = Math.max(0, Math.min(255, 2 - Math.abs(h * 6 - 2)));
    const b = Math.max(0, Math.min(255, 2 - Math.abs(h * 6 - 4)));

    // Simpler Hue to RGB for 0-1 range
    const f = (n, k = (n + h * 6) % 6) => 1 - Math.max(Math.min(k, 4 - k, 1), 0);
    const rgb = [f(5), f(3), f(1)].map(v => Math.round(v * 255));

    return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const createHueResponder = () => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, state) => handleHueTouch(evt, state),
    onPanResponderMove: (evt, state) => handleHueTouch(evt, state),
  });

  const handleHueTouch = (evt) => {
    if (hueWidth <= 0) return;
    const x = Math.max(0, Math.min(evt.nativeEvent.locationX, hueWidth));
    const h = x / hueWidth;
    const hex = hueToHex(h);

    setCurrentCustomization(prev => ({
      ...prev,
      color: { ...prev.color, hex, hue: h, isCustom: true, id: 'custom', name: 'Custom' }
    }));
  };

  const hueResponder = useMemo(() => createHueResponder().panHandlers, [hueWidth]);


  // --- LOGIC ---
  const isStepComplete = useMemo(() => {
    if (!selectedModType) return false;
    if (!selectedModType.steps) return true;
    for (const step of selectedModType.steps) {
      if (step === 'custom_prompt') {
        if (!currentCustomization[step] || currentCustomization[step].trim().length < 3) return false;
      } else if (!currentCustomization[step]) {
        return false;
      }
    }
    return true;
  }, [selectedModType, currentCustomization]);

  const constructPrompt = () => {
    if (pendingModifications.length === 0) return '';

    const parts = pendingModifications.map(mod => {
      let prompt = mod.modType.promptTemplate;
      prompt = prompt.replace('{car}', 'the car'); // Default to "the car" if {car} placeholder exists
      prompt = prompt.replace('{colorName}', mod.customization.color?.isCustom ? `hex ${mod.customization.color.hex}` : (mod.customization.color?.name || 'custom color'));
      prompt = prompt.replace('{finish}', mod.customization.finish?.name || 'standard');
      prompt = prompt.replace('{patternName}', mod.customization.pattern?.id === 'solid' ? '' : (mod.customization.pattern?.name || ''));
      prompt = prompt.replace('{styleName}', mod.customization.style?.name || 'custom');
      prompt = prompt.replace('{customPrompt}', mod.customization.custom_prompt || '');
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
    if (currentIndex < 0) return showAlert({ type: 'error', title: 'Error', message: 'Please choose an image' });
    if (pendingModifications.length === 0) return showAlert({ type: 'error', title: 'Error', message: 'Please select at least one modification' });

    // Construct Prompt
    const finalPrompt = constructPrompt();
    console.log('Generating with prompt:', finalPrompt);

    const currentImage = history[currentIndex];
    setLoading(true);
    try {
      const idKey = uuidv4();
      const form = new FormData();

      if (currentImage.id) {
        // Use ID for sequential generation
        form.append('input_image_id', currentImage.id.toString());
      } else {
        // Upload image blob for first time
        let imageForUpload = { uri: currentImage.uri, name: 'image.jpg', type: 'image/jpeg' };

        if (currentImage.uri.startsWith('http')) {
          try {
            const base64Uri = await fetchImageAsBlob(currentImage.uri);
            imageForUpload = { uri: base64Uri, name: 'edited_image.jpg', type: 'image/jpeg' };
          } catch (fetchErr) {
            console.warn('Failed fetch', fetchErr);
            setLoading(false);
            return;
          }
        }
        form.append('image', imageForUpload);
      }

      form.append('prompt', finalPrompt);

      const response = await api.post('/generate', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-idempotency-key': idKey,
        },
      });
      console.log(response.data);
      let { image_url, output_image_id } = response.data;
      if (image_url && image_url.includes('localhost')) {
        const ip = API_BASE_URL.split('://')[1].split(':')[0];
        image_url = image_url.replace('localhost', ip);
      }

      // Prefetch the image to ensure it's ready for rendering
      try {
        await Image.prefetch(image_url);
      } catch (prefetchErr) {
        console.warn('Prefetch failed', prefetchErr);
      }

      addToHistory(image_url, output_image_id);
      await analyticsService.logEvent('generate_image', { prompt: finalPrompt });
      await updateCredits();

    } catch (err) {
      console.warn(err);
      if (err.response?.status === 413) {
        showAlert({ type: 'error', title: 'Error', message: 'The image is too large. Try uploading a smaller version.' });
      } else {
        showAlert({ type: 'error', title: 'Error', message: 'Generation failed' });
      }
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
        // Load existing customization for editing
        setCurrentCustomization(pendingModifications[existingIndex].customization);
        setSelectedModType(mod);
      } else {
        // New customization
        setCurrentCustomization({});
        setSelectedModType(mod);
      }
    }
  };

  const requestStoragePermission = async () => {
    return true;

    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to save images',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getAbsoluteImageUrl = (uri) => {
    if (!uri) return null;

    // Already absolute
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }

    // Relative → make absolute
    return `${API_BASE_URL}${uri}`;
  };


  const handleDownload = async () => {
    if (currentIndex < 0) return;

    try {
      let imageUrl = getAbsoluteImageUrl(history[currentIndex].uri);
      const filename = `wrapmycars_${Date.now()}.jpg`;

      if (Platform.OS === 'android') {
        const { dirs } = ReactNativeBlobUtil.fs;
        ReactNativeBlobUtil.config({
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${dirs.DownloadDir}/${filename}`,
            description: 'Downloading image from WrapMyCars',
            mime: 'image/jpeg',
            mediaScannable: true,
          },
        })
          .fetch('GET', imageUrl)
          .then((res) => {
            console.log('File downloaded to: ', res.path());
            showAlert({ type: 'success', title: 'Success', message: 'Download started...' });
          })
          .catch((err) => {
            console.error('Download error:', err);
            showAlert({ type: 'error', title: 'Error', message: 'Download failed' });
          });
      } else {
        // iOS
        const { dirs } = ReactNativeBlobUtil.fs;
        const localPath = `${dirs.CacheDir}/${filename}`;

        const res = await ReactNativeBlobUtil.config({
          fileCache: true,
          path: localPath,
        }).fetch('GET', imageUrl);

        await CameraRoll.save(`file://${res.path()}`, { type: 'photo' });
        showAlert({ type: 'success', title: 'Success', message: 'Image saved to Photos!' });
      }
    } catch (error) {
      console.error('Download error:', error);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to save image' });
    }
  };




  const handleShare = async () => {
    if (currentIndex < 0) return;

    const imageUri = getAbsoluteImageUrl(history[currentIndex].uri);

    try {
      let shareUri = imageUri;

      // If it's a remote URL, download it first
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        const filename = `car_wrap_${Date.now()}.jpg`;
        const downloadDest = `${RNFS.CachesDirectoryPath}/${filename}`;

        // Download the image
        const download = await RNFS.downloadFile({
          fromUrl: imageUri,
          toFile: downloadDest,
        }).promise;

        if (download.statusCode === 200) {
          shareUri = `file://${downloadDest}`;
        } else {
          throw new Error('Download failed');
        }
      }

      await RNShare.open({
        url: shareUri,
        title: 'Share Car Wrap',
        message: 'Check out my AI-generated car wrap! Created with WrapMyCars',
        type: 'image/jpeg',
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Share error:', error);
        showAlert({ type: 'error', title: 'Error', message: 'Failed to share image' });
      }
    }
  };

  // --- RENDER HELPERS ---

  // 1. Mod Grid
  function renderModGrid() {
    return (
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
  }

  // 2. Customization Screens
  function renderCustomization() {
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
              if (step === 'pattern') return renderOptionSelector('pattern', PATTERN_WRAPS, 'Select Pattern');
              if (step === 'style') return renderStyleSelector();
              if (step === 'custom_prompt') return renderCustomPromptInput();
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
  }

  function renderColorPicker() {
    const isCustom = currentCustomization.color?.isCustom;

    return (
      <View key="color" style={styles.section}>
        <Text style={styles.sectionTitle}>Select Color</Text>
        <View style={styles.colorCategoryGrid}>
          <TouchableOpacity
            style={[styles.colorButton, isCustom && styles.colorButtonActive]}
            onPress={() => setCurrentCustomization(prev => ({
              ...prev,
              color: { ...prev.color, name: 'Custom', id: 'custom', isCustom: true, hex: prev.color?.hex || '#ff0000' }
            }))}
          >
            <Ionicons name="color-palette-outline" size={16} color={isCustom ? theme.colors.primary : "#fff"} />
            <Text style={[styles.colorButtonText, isCustom && { color: theme.colors.primary }]}>Custom</Text>
          </TouchableOpacity>

          {COLORS.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.colorButton,
                currentCustomization.color?.parentId === c.id && !isCustom && styles.colorButtonActive
              ]}
              onPress={() => setCurrentCustomization(prev => ({
                ...prev,
                color: { name: c.shades[0].name, id: c.shades[0].id, hex: c.shades[0].hex, parentId: c.id }
              }))}
            >
              <View style={[styles.colorChip, { backgroundColor: c.color }]} />
              <Text style={styles.colorButtonText}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shades or Custom Picker */}
        {currentCustomization.color?.parentId && !isCustom && (
          <View style={styles.shadeGrid}>
            {COLORS.find(c => c.id === currentCustomization.color.parentId).shades.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.shadeCircle,
                  { backgroundColor: s.hex, borderWidth: currentCustomization.color?.id === s.id ? 2 : 1 },
                  { borderColor: currentCustomization.color?.id === s.id ? '#fff' : 'rgba(255,255,255,0.2)' }
                ]}
                onPress={() => setCurrentCustomization(prev => ({
                  ...prev,
                  color: { name: s.name, id: s.id, hex: s.hex, parentId: prev.color.parentId }
                }))}
              />
            ))}
          </View>
        )}

        {isCustom && (
          <View style={styles.customColorArea}>
            <Text style={styles.subLabel}>Hue Selection</Text>
            <View
              style={styles.hueContainer}
              onLayout={(e) => setHueWidth(e.nativeEvent.layout.width)}
              {...hueResponder}
            >
              <LinearGradient
                colors={HUE_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.hueBar}
                pointerEvents="none"
              />
              <View
                style={[
                  styles.hueSlider,
                  { left: `${(currentCustomization.color?.hue || 0) * 100}%` },
                  { transform: [{ translateX: -12 }] }
                ]}
                pointerEvents="none"
              />
            </View>
            <View style={styles.hexInputRow}>
              <Text style={styles.hexPrefix}>#</Text>
              <TextInput
                style={styles.hexInput}
                value={currentCustomization.color?.hex?.replace('#', '')}
                onChangeText={(text) => {
                  const hex = text.startsWith('#') ? text : `#${text}`;
                  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                    setCurrentCustomization(prev => ({
                      ...prev,
                      color: { ...prev.color, hex }
                    }));
                  }
                }}
                maxLength={6}
                placeholder="FFFFFF"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <View style={[styles.colorPreview, { backgroundColor: currentCustomization.color?.hex || '#ff0000' }]} />
            </View>
          </View>
        )}

        <Text style={styles.selectedColorText}>
          Selected: {currentCustomization.color?.name || 'None'} {currentCustomization.color?.hex}
        </Text>
      </View>
    );
  }

  function renderStyleSelector() {
    let options = [];
    if (selectedModType.id === 'wheels') options = WHEEL_STYLES;
    if (selectedModType.id === 'bodykit') options = BODYKIT_STYLES;
    if (selectedModType.id === 'tint') options = TINT_LEVELS;
    if (selectedModType.id === 'spoiler') options = SPOILER_STYLES;
    if (selectedModType.id === 'decals') options = DECAL_STYLES;
    if (selectedModType.id === 'stance') options = STANCE_STYLES;
    if (selectedModType.id === 'lights_style') options = LIGHT_STYLES;
    if (selectedModType.id === 'environment') options = ENVIRONMENT_STYLES;
    if (selectedModType.id === 'accents') options = ACCENT_STYLES;

    return renderOptionSelector('style', options, 'Select Style');
  }

  function renderOptionSelector(key, options, title) {
    return (
      <View key={key} style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.optionsGrid}>
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
                <Image source={opt.image} style={styles.optionImage} />
              ) : (
                <View style={[styles.placeholderBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
              )}
              <Text style={styles.optionText} numberOfLines={1}>{opt.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function renderCustomPromptInput() {
    return (
      <View key="custom_prompt" style={styles.section}>
        <Text style={styles.sectionTitle}>Describe your modification</Text>
        <TextInput
          style={styles.customInput}
          placeholder="e.g. Add a carbon fiber spoiler, police decals, etc."
          placeholderTextColor="rgba(255,255,255,0.3)"
          multiline
          numberOfLines={4}
          value={currentCustomization.custom_prompt || ''}
          onChangeText={(text) => setCurrentCustomization(prev => ({ ...prev, custom_prompt: text }))}
        />
        <Text style={styles.inputHelp}>Be as descriptive as possible for best results.</Text>
      </View>
    );
  }


  // --- MAIN RENDER ---
  return (
    <LinearGradient colors={theme.gradients.midnight} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* Navigation Actions */}
            {currentIndex >= 0 && !selectedModType ? (
              <TouchableOpacity onPress={handleExit} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}

            <Text style={styles.title}>AI Generator</Text>
            <CreditBadge credits={credits} />
          </View>

          {/* Main Content Area */}
          <View style={{ flex: 1 }}>
            {currentIndex < 0 ? (
              // Step 0: Pick Image (Enhanced Empty State)
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.emptyStateContent}>
                  <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Transform Your Ride</Text>
                    <Text style={styles.heroSubtitle}>Upload a photo to start customizing with AI</Text>
                  </View>

                  <View style={styles.uploadRow}>
                    <TouchableOpacity onPress={pickImage} style={{ flex: 1 }}>
                      <LinearGradient
                        colors={['rgba(167, 66, 234, 0.2)', 'rgba(167, 66, 234, 0.05)']}
                        style={styles.uploadCard}
                      >
                        <View style={styles.iconCircle}>
                          <Ionicons name="images" size={32} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Gallery</Text>
                        <Text style={styles.uploadDesc}>Pick from library</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePhoto} style={{ flex: 1 }}>
                      <LinearGradient
                        colors={['rgba(212, 20, 90, 0.2)', 'rgba(212, 20, 90, 0.05)']}
                        style={styles.uploadCard}
                      >
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(212, 20, 90, 0.1)' }]}>
                          <Ionicons name="camera" size={32} color="#D4145A" />
                        </View>
                        <Text style={styles.uploadTitle}>Camera</Text>
                        <Text style={styles.uploadDesc}>Snap a photo</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tipsSection}>
                    <Text style={styles.sectionHeading}>Pro Tips</Text>
                    <View style={styles.tipsGrid}>
                      {TIPS.map(tip => (
                        <View key={tip.id} style={styles.tipItem}>
                          <Ionicons name={tip.icon} size={20} color={theme.colors.secondary} />
                          <Text style={styles.tipText}>{tip.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.examplesSection}>
                    <Text style={styles.sectionHeading}>Get Inspired</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.examplesScroll}>
                      {FEATURED_EXAMPLES.map(ex => (
                        <View key={ex.id} style={styles.exampleCard}>
                          <Image source={ex.image} style={styles.exampleImage} />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.exampleOverlay}
                          >
                            <Text style={styles.exampleLabel}>{ex.label}</Text>
                          </LinearGradient>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
            ) : (
              <View style={{ flex: 1 }}>
                {!selectedModType && (
                  <View style={{ height: 200, position: 'relative' }}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setIsFullScreen(true)}
                      style={{ flex: 1 }}
                    >
                      <ImagePreview uri={history[currentIndex].uri} />
                    </TouchableOpacity>

                    {/* Action Buttons Overlay - Left */}
                    {currentIndex > 0 && (
                      <View style={styles.imageActionsLeft}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleUndo}>
                          <Ionicons name="arrow-undo-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Action Buttons Overlay - Right */}
                    <View style={styles.imageActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                        <Ionicons name="download-outline" size={24} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.controlsArea}>
                  {!selectedModType ? renderModGrid() : renderCustomization()}
                </View>

                {/* Full Screen Image Modal */}
                <Modal
                  visible={isFullScreen}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setIsFullScreen(false)}
                >
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <View style={styles.fullScreenModal}>
                      <ZoomableImage uri={history[currentIndex]?.uri} />

                      <TouchableOpacity
                        style={styles.closeModalBtn}
                        onPress={() => setIsFullScreen(false)}
                      >
                        <Ionicons name="close" size={32} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </GestureHandlerRootView>
                </Modal>
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
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  backBtn: { padding: 8 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  promptText: { color: theme.colors.textDim, fontSize: 16 },
  bigBtn: {
    width: 120, height: 120,
    backgroundColor: theme.colors.cardBackground, // Glass
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border
  },
  btnTxt: { color: theme.colors.text, marginTop: 12, fontWeight: '600' },

  // Mods Grid
  gridContainer: { flex: 1, padding: 16, paddingTop: 64 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  modCard: {
    width: '48%',
    backgroundColor: theme.colors.cardBackground, // Glass
    padding: 16, borderRadius: 16,
    minHeight: 100, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border
  },
  modLabel: { color: theme.colors.text, fontSize: 14, fontWeight: '600', marginTop: 8 },

  // Chips
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16
  },
  chipText: { color: '#fff', marginRight: 4, fontWeight: '600' },

  floatingBtnContainer: {
    position: 'absolute', bottom: 20, left: 20, right: 20
  },

  // Customization
  controlsArea: { flex: 1, marginTop: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { color: theme.colors.textDim, fontSize: 16, marginBottom: 12 },

  colorCategoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorButtonActive: {
    backgroundColor: 'rgba(11,99,255,0.15)',
    borderColor: '#0b63ff',
  },
  colorChip: { width: 16, height: 16, borderRadius: 8, marginRight: 8 },
  colorButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  shadeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  shadeCircle: { width: 44, height: 44, borderRadius: 22 },

  customColorArea: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16 },
  subLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  hueContainer: { height: 40, justifyContent: 'center', marginBottom: 16 },
  hueBar: { height: 12, borderRadius: 6 },
  hueSlider: {
    position: 'absolute',
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    elevation: 3,
  },
  hexInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hexPrefix: { color: '#fff', fontSize: 18, fontWeight: '700' },
  hexInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorPreview: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  selectedColorText: { color: '#aaa', marginTop: 12, fontSize: 13 },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionCard: {
    backgroundColor: theme.colors.cardBackground, // Glass
    padding: 8, borderRadius: 16,
    width: '31%', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border
  },
  optionSelected: { borderColor: theme.colors.primary, backgroundColor: 'rgba(255,255,255,0.2)' },
  optionText: { color: theme.colors.text, fontSize: 12, marginTop: 4, textAlign: 'center' },
  optionImage: { width: '100%', height: 60, borderRadius: 10, resizeMode: 'cover' },
  placeholderBox: { width: '100%', height: 60, borderRadius: 10 },

  // Image Actions
  imageActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  imageActionsLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  actionBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Modal
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeModalBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 100,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },

  centerMsg: { padding: 40, alignItems: 'center' },

  // Enhanced Empty State Styles
  emptyStateContent: { padding: 20 },
  heroSection: { alignItems: 'center', marginVertical: 32 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  uploadRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  uploadCard: {
    height: 160,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(167, 66, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  uploadDesc: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

  tipsSection: { marginBottom: 40 },
  sectionHeading: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  tipsGrid: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  tipItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },

  examplesSection: { marginBottom: 20 },
  examplesScroll: { gap: 16 },
  exampleCard: {
    width: 200,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  exampleImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  exampleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
  },
  exampleLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },

  customInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputHelp: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
