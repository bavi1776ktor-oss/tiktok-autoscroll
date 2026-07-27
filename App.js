import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  Linking,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ожидание...');
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  // Проверка доступности
  const checkAccessibility = async () => {
    const enabled = await AccessibilityInfo.isScreenReaderEnabled();
    setIsAccessibilityEnabled(enabled);
    if (!enabled) {
      setStatusText('Включите доступность в настройках');
    } else {
      setStatusText('Доступность включена. Нажмите Play');
    }
  };

  useEffect(() => {
    checkAccessibility();
  }, []);

  // Эмуляция свайпа (через AccessibilityService)
  const performSwipe = () => {
    setStatusText('Свайп!');
    // TODO: Реальный свайп через AccessibilityService
    setTimeout(() => {
      if (isPlaying) {
        setStatusText('Слежу за бегунком...');
      }
    }, 500);
  };

  // Эмуляция бегунка (пока тестовая)
  useEffect(() => {
    let interval;
    if (isPlaying) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1;
          if (next >= 100) {
            // Достигли 100% - свайп
            performSwipe();
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (newState) {
      setStatusText('Слежу за бегунком...');
      // TODO: Реальный мониторинг бегунка
    } else {
      setStatusText('Ожидание...');
    }
  };

  const handleSkip = () => {
    if (isPlaying) {
      performSwipe();
    }
  };

  const openSettings = () => {
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
        <Text style={styles.hintText}>
          Доступность: {isAccessibilityEnabled ? '✅ Включена' : '❌ Выключена'}
        </Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={openSettings}
        >
          <Text style={styles.settingsButtonText}>
            Открыть настройки доступности
          </Text>
        </TouchableOpacity>

        <Text style={styles.debugHint}>
          {isAccessibilityEnabled ? 
            'Доступность включена. Ищем бегунок...' : 
            'Включите доступность в настройках телефона'}
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
  debugHint: {
    fontSize: 14,
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
