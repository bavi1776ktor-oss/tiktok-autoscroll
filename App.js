import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import AccessibilityService from 'react-native-accessibility-service';

const { height } = Dimensions.get('window');

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ожидание...');
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);

  useEffect(() => {
    // Проверяем, включена ли доступность
    checkAccessibility();
  }, []);

  const checkAccessibility = async () => {
    const enabled = await AccessibilityService.isAccessibilityEnabled();
    setIsServiceEnabled(enabled);
    if (!enabled) {
      setStatusText('Включите доступность в настройках');
    }
  };

  const startWatching = () => {
    setStatusText('Слежу за бегунком...');
    // Начинаем мониторинг экрана
    AccessibilityService.startMonitoring((event) => {
      if (event.type === 'progress') {
        setProgress(event.progress);
      } else if (event.type === 'reset') {
        // Ролик закончился - делаем свайп
        performSwipe();
      }
    });
  };

  const stopWatching = () => {
    setStatusText('Ожидание...');
    setProgress(0);
    AccessibilityService.stopMonitoring();
  };

  const performSwipe = () => {
    setStatusText('Свайп!');
    AccessibilityService.swipeUp();
    setTimeout(() => {
      if (isPlaying) {
        setStatusText('Слежу за бегунком...');
      }
    }, 500);
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      checkAccessibility();
      if (isServiceEnabled) {
        startWatching();
      } else {
        setStatusText('Сначала включите доступность');
        setIsPlaying(false);
      }
    } else {
      stopWatching();
    }
  };

  const handleSkip = () => {
    if (isPlaying) {
      performSwipe();
    }
  };

  const openSettings = () => {
    AccessibilityService.openAccessibilitySettings();
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
        <Text style={styles.hintText}>
          Доступность: {isServiceEnabled ? '✅ Включена' : '❌ Выключена'}
        </Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={openSettings}
        >
          <Text style={styles.settingsButtonText}>
            Открыть настройки доступности
          </Text>
        </TouchableOpacity>
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
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#888888',
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
