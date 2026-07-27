import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);

  const progressInterval = useRef(null);
  const watchTimeout = useRef(null);
  const lastResetTime = useRef(Date.now());

  const startWatching = () => {
    if (isWatching) return;
    setIsWatching(true);
    setProgress(0);

    if (progressInterval.current) clearInterval(progressInterval.current);
    if (watchTimeout.current) clearTimeout(watchTimeout.current);

    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += 2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(progressInterval.current);
        progressInterval.current = null;
        handleProgressReset();
      } else {
        setProgress(currentProgress);
      }
    }, 100);

    watchTimeout.current = setTimeout(() => {
      if (progress === 0 && isPlaying) {
        console.log('Реклама или стрим -> свайп');
        performSwipe();
        if (isPlaying) {
          startWatching();
        }
      }
    }, 1500);
  };

  const handleProgressReset = () => {
    const now = Date.now();
    const timeSinceLastReset = now - lastResetTime.current;

    if (timeSinceLastReset < 300) {
      return;
    }

    lastResetTime.current = now;

    if (isPlaying) {
      performSwipe();
      setTimeout(() => {
        if (isPlaying) {
          startWatching();
        }
      }, 500);
    }
  };

  const performSwipe = () => {
    console.log('Свайп вверх');
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      lastResetTime.current = Date.now();
      startWatching();
    } else {
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

  const handleSkip = () => {
    performSwipe();
    if (isPlaying) {
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: () => {},
    })
  ).current;

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (watchTimeout.current) clearTimeout(watchTimeout.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>TikTok AutoScroll</Text>
        <Text style={styles.subtitle}>
          {isPlaying ? 'Воспроизведение...' : 'На паузе'}
        </Text>
        <Text style={styles.progressText}>
          Прогресс: {Math.round(progress)}%
        </Text>
        <Text style={styles.debugText}>
          {isWatching ? 'Слежу за бегунком...' : 'Ожидание...'}
        </Text>
      </View>

      <View style={styles.floatingPanel} {...panResponder.panHandlers}>
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
    color: '#888888',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#555555',
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
