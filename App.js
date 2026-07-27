import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Platform,
  PanResponder,
  Alert
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ============================================================
// 1. ДЕТЕКТОР БЕГУНКА (пока заглушка)
// ============================================================
// ВАЖНО: Реальный детектор требует нативный модуль для чтения экрана.
// Сейчас стоит заглушка, которая эмулирует сброс бегунка через 5 секунд.
// ПОЗЖЕ мы заменим это на реальный Accessibility Service.
// ============================================================

export default function App() {
  // Состояния
  const [isPlaying, setIsPlaying] = useState(false);   // Play/Pause
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [progress, setProgress] = useState(0);         // 0-100
  const [isWatching, setIsWatching] = useState(false); // Следим за бегунком?

  // Таймеры
  const progressInterval = useRef(null);
  const watchTimeout = useRef(null);
  const lastResetTime = useRef(Date.now());

  // ============================================================
  // 2. ЛОГИКА СБРОСА БЕГУНКА (эмуляция)
  // ============================================================

  const startWatching = () => {
    if (isWatching) return;
    setIsWatching(true);
    setProgress(0);

    // Сбрасываем старые таймеры
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (watchTimeout.current) clearTimeout(watchTimeout.current);

    // Эмуляция роста бегунка от 0 до 100 за 5 секунд
    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += 2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval.current);
        progressInterval.current = null;

        // Бегунок достиг 100% → сброс
        handleProgressReset();
      } else {
        setProgress(currentProgress);
      }
    }, 100);

    // Страховка: если бегунок не появился за 1.5 сек → реклама
    watchTimeout.current = setTimeout(() => {
      if (progress === 0 && isPlaying) {
        console.log('[DEBUG] Бегунок не появился → свайп (реклама)');
        performSwipe();
        // Перезапускаем ожидание
        if (isPlaying) {
          startWatching();
        }
      }
    }, 1500);
  };

  // Сброс бегунка (100% → 0%)
  const handleProgressReset = () => {
    const now = Date.now();
    const timeSinceLastReset = now - lastResetTime.current;

    console.log(`[DEBUG] Сброс бегунка! Прошло: ${timeSinceLastReset}ms`);

    // Игнорируем сброс, если прошло меньше 0.3 сек (защита от ложных срабатываний)
    if (timeSinceLastReset < 300) {
      console.log('[DEBUG] Игнорируем сброс (слишком быстро)');
      return;
    }

    lastResetTime.current = now;

    // Если режим Play включен — свайпаем
    if (isPlaying) {
      console.log('[DEBUG] Свайп!');
      performSwipe();
      // Начинаем следить за новым роликом
      setTimeout(() => {
        if (isPlaying) {
          startWatching();
        }
      }, 500);
    }
  };

  // ============================================================
  // 3. ЭМУЛЯЦИЯ СВАЙПА (через Accessibility Service)
  // ============================================================

  const performSwipe = () => {
    console.log('[DEBUG] Выполняем свайп вверх');
    // TODO: Реальный свайп через AccessibilityService.dispatchGesture()
    // Сейчас просто вибрация (заглушка)
    if (Platform.OS === 'android') {
      // В будущем здесь будет вызов нативного модуля
    }
  };

  // ============================================================
  // 4. КНОПКИ УПРАВЛЕНИЯ
  // ============================================================

  // Play/Pause
  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      console.log('[DEBUG] Play включен');
      lastResetTime.current = Date.now();
      startWatching();
    } else {
      console.log('[DEBUG] Pause включен');
      setIsWatching(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (watchTimeout.current) {
        clearTimeout(watchTimeout.current);
        watchTimeout.current = null;
      }
    }
  };

  // Skip (ручной свайп)
  const handleSkip = () => {
    console.log('[DEBUG] Нажат Skip');
    performSwipe();
    if (isPlaying) {
      // Перезапускаем слежение
      setIsWatching(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (watchTimeout.current) {
        clearTimeout(watchTimeout.current);
        watchTimeout.current = null;
      }
      setTimeout(() => {
        if (isPlaying) {
          startWatching();
        }
      }, 500);
    }
  };

  // ============================================================
  // 5. ПЕРЕТАСКИВАНИЕ ПАНЕЛИ
  // ============================================================

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // В реальном приложении здесь двигаем панель
        // Сейчас просто логируем
        console.log('[DEBUG] Перетаскивание панели');
      },
    })
  ).current;

  // ============================================================
  // 6. ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ
  // ============================================================

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (watchTimeout.current) clearTimeout(watchTimeout.current);
    };
  }, []);

  // ============================================================
  // 7. ИНТЕРФЕЙС
  // ============================================================

  return (
    <View style={styles.container}>
      {/* Основное содержимое (заглушка) */}
      <View style={styles.content}>
        <Text style={styles.title}>TikTok AutoScroll</Text>
        <Text style={styles.subtitle}>
          {isPlaying ? '▶ Воспроизведение...' : '⏸ На паузе'}
        </Text>
        <Text style={styles.progressText}>
          Прогресс: {Math.round(progress)}%
        </Text>
        <Text style={styles.debugText}>
          {isWatching ? 'Слежу за бегунком...' : 'Ожидание...'}
        </Text>
      </View>

      {/* Плавающая панель с кнопками (левая сторона, вертикально) */}
      <View 
        style={styles.floatingPanel}
        {...panResponder.panHandlers}
      >
        {/* Кнопка Play/Pause */}
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.buttonPlay,
            isPlaying && styles.buttonActive
          ]}
          onPress={togglePlay}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Кнопка Skip */}
        <TouchableOpacity 
          style={[styles.button, styles.buttonSkip]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================
// 8. СТИЛИ
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#555',
  },

  // ===== Плавающая панель (левая сторона) =====
  floatingPanel: {
    position: 'absolute',
    left: 16,
    top: height * 0.12, // 12% от высоты экрана (ниже статус-бара)
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

  // ===== Кнопки =====
  button: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)",
  },
  buttonPlay: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  buttonActive: {
    backgroundColor: 'rgba(0, 200, 100, 0.3)',
    borderColor: '#00cc66',
  },
  buttonSkip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  buttonText: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
});
