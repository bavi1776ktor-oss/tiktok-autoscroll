import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { NativeModules, NativeEventEmitter } from 'react-native';

const { height } = Dimensions.get('window');
const { AccessibilityModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(AccessibilityModule);

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [statusText, setStatusText] = useState('Ожидание...');

  useEffect(() => {
    // Слушаем события от Accessibility Service
    const subscription = eventEmitter.addListener('onProgressUpdate', (event) => {
      setProgress(event.progress);
    });

    const resetSubscription = eventEmitter.addListener('onProgressReset', () => {
      if (isPlaying) {
        setStatusText('Свайп!');
        setTimeout(() => setStatusText('Слежу за бегунком...'), 500);
      }
    });

    const adSubscription = eventEmitter.addListener('onAdDetected', () => {
      setStatusText('Реклама! Свайп...');
    });

    return () => {
      subscription.remove();
      resetSubscription.remove();
      adSubscription.remove();
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      setStatusText('Запуск сервиса...');
      AccessibilityModule.startService();
      setIsServiceRunning(true);
      setStatusText('Слежу за бегунком...');
    } else {
      AccessibilityModule.stopService();
      setIsServiceRunning(false);
      setProgress(0);
      setStatusText('Ожидание...');
    }
  };

  const handleSkip = () => {
    AccessibilityModule.performSwipe();
    if (isPlaying) {
      setStatusText('Пропуск...');
      setTimeout(() => setStatusText('Слежу за бегунком...'), 500);
    }
  };

  const openAccessibilitySettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>TikTok AutoScroll</Text>
        <Text style={styles.subtitle}>
          {isPlaying ? '▶ Активен' : '⏸ На паузе'}
        </Text>
        
        <Text style={styles.progressBig}>
          {Math.round(progress)}%
        </Text>

        <Text style={styles.statusText}>{statusText}</Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={openAccessibilitySettings}
        >
          <Text style={styles.settingsButtonText}>
            Открыть настройки доступности
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.hintText}>
          Включите "TikTok AutoScroll" в настройках доступности
        </Text>
      </View>

      <View style={styles.floatingPanel}>
        <TouchableOpacity
          style={[styles.button, isPlaying && styles.buttonActive]}
          onPress={togglePlay}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#a0c4ff',
    marginBottom: 30,
  },
  progressBig: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#00cc66',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  settingsButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
  },
  floatingPanel: {
    position: 'absolute',
    left: 16,
    top: height * 0.12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 999,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  buttonActive: {
    backgroundColor: 'rgba(0, 200, 100, 0.3)',
    borderColor: '#00cc66',
  },
  buttonText: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
});
