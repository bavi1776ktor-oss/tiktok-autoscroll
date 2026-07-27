import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { height, width } = Dimensions.get('window');

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(30); // средняя длина ролика

  // Эмуляция бегунка (работает независимо от TikTok)
  useEffect(() => {
    if (isPlaying) {
      setProgress(0);
      setCurrentTime(0);
      
      // Бегунок растет
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1;
          if (next >= 100) {
            // Достигли 100% - делаем свайп
            performSwipe();
            return 0;
          }
          return next;
        });
      }, videoDuration * 10); // Длительность ролика в мс

      // Таймер реального времени
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      setProgress(0);
      setCurrentTime(0);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [isPlaying, videoDuration]);

  // Эмуляция свайпа (просто анимация)
  const performSwipe = () => {
    console.log('Свайп вверх!');
    // В реальности здесь будет эмуляция касания
    // Пока просто вибрация и звук (если добавить)
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    if (isPlaying) {
      performSwipe();
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const handleDurationChange = (seconds) => {
    setVideoDuration(seconds);
  };

  return (
    <View style={styles.container}>
      {/* Панель управления поверх всех окон */}
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

      {/* Информация о прогрессе (для отладки) */}
      <View style={styles.debugPanel}>
        <Text style={styles.debugText}>Прогресс: {progress}%</Text>
        <Text style={styles.debugText}>Время: {currentTime} сек</Text>
        <View style={styles.durationButtons}>
          <TouchableOpacity 
            style={[styles.durationBtn, videoDuration === 15 && styles.durationActive]}
            onPress={() => handleDurationChange(15)}
          >
            <Text style={styles.durationText}>15с</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.durationBtn, videoDuration === 30 && styles.durationActive]}
            onPress={() => handleDurationChange(30)}
          >
            <Text style={styles.durationText}>30с</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.durationBtn, videoDuration === 60 && styles.durationActive]}
            onPress={() => handleDurationChange(60)}
          >
            <Text style={styles.durationText}>60с</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Плавающая панель (левая сторона)
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
  // Панель отладки (внизу)
  debugPanel: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 14,
    marginVertical: 2,
  },
  durationButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  durationBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  durationActive: {
    backgroundColor: 'rgba(0, 200, 100, 0.3)',
    borderColor: '#00cc66',
    borderWidth: 1,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
  },
});
