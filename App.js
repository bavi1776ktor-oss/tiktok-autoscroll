import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const startProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Автоматический рестарт через 0.5 сек (эмуляция нового ролика)
          setTimeout(() => {
            if (isPlaying) {
              startProgress();
            }
          }, 500);
          return 100;
        }
        return next;
      });
    }, 50); // Обновление каждые 50 мс = плавный рост
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      // Запускаем прогресс
      if (intervalRef.current) clearInterval(intervalRef.current);
      startProgress();
    } else {
      // Останавливаем
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(0);
    }
  };

  const handleSkip = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(0);
      startProgress();
    } else {
      // Если на паузе — просто сбрасываем
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>TikTok AutoScroll</Text>
        <Text style={styles.subtitle}>
          {isPlaying ? '▶ Воспроизведение...' : '⏸ На паузе'}
        </Text>
        
        {/* ГЛАВНОЕ - ЦИФРА ПРОГРЕССА ВЫВЕДЕНА КРУПНО */}
        <Text style={styles.progressBig}>
          {progress}%
        </Text>

        <Text style={styles.debugText}>
          {isPlaying ? 'Слежу за бегунком...' : 'Ожидание...'}
        </Text>
        <Text style={styles.hintText}>
          Нажми Play — цифра начнет расти
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
  debugText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
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
