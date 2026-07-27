package com.tiktokautoscroll.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.WindowManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.List;

public class TikTokAccessibilityService extends AccessibilityService {
    private static final String TAG = "TikTokAccessibility";
    private static TikTokAccessibilityService instance;
    private Handler handler = new Handler(Looper.getMainLooper());
    private boolean isTracking = false;
    private int lastProgress = -1;
    private long lastResetTime = 0;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!isTracking) return;

        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return;

        // Ищем бегунок (прогресс-бар TikTok)
        findProgressBar(root);
    }

    private void findProgressBar(AccessibilityNodeInfo node) {
        if (node == null) return;

        // Проверяем, является ли этот элемент прогресс-баром
        if (node.getClassName() != null && node.getClassName().toString().contains("ProgressBar")) {
            int currentProgress = node.getRangeInfo() != null ? 
                (int) node.getRangeInfo().getCurrent() : -1;
            
            if (currentProgress >= 0) {
                onProgressUpdate(currentProgress);
            }
        }

        // Рекурсивно идем по дочерним элементам
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                findProgressBar(child);
                child.recycle();
            }
        }
    }

    private void onProgressUpdate(int progress) {
        long currentTime = System.currentTimeMillis();

        // Если прогресс резко упал (сброс 100% -> 0%)
        if (lastProgress > 90 && progress < 10 && (currentTime - lastResetTime) > 1000) {
            lastResetTime = currentTime;
            Log.d(TAG, "Ролик закончился! Свайп!");
            performSwipe();
            sendEvent("onProgressReset", null);
        }

        lastProgress = progress;

        // Отправляем прогресс в JS
        WritableMap params = Arguments.createMap();
        params.putInt("progress", progress);
        sendEvent("onProgressUpdate", params);
    }

    private void performSwipe() {
        // Свайп из центра экрана вверх
        int screenWidth = getResources().getDisplayMetrics().widthPixels;
        int screenHeight = getResources().getDisplayMetrics().heightPixels;

        Path path = new Path();
        path.moveTo(screenWidth / 2, screenHeight / 2);
        path.lineTo(screenWidth / 2, screenHeight / 4);

        GestureDescription.Builder gestureBuilder = new GestureDescription.Builder();
        gestureBuilder.addStroke(new GestureDescription.StrokeDescription(path, 0, 500));

        dispatchGesture(gestureBuilder.build(), new GestureResultCallback() {
            @Override
            public void onCompleted(GestureDescription gestureDescription) {
                super.onCompleted(gestureDescription);
                Log.d(TAG, "Свайп выполнен");
                sendEvent("onSwipeCompleted", null);
            }

            @Override
            public void onCancelled(GestureDescription gestureDescription) {
                super.onCancelled(gestureDescription);
                Log.d(TAG, "Свайп отменен");
            }
        }, null);
    }

    private void sendEvent(String eventName, WritableMap params) {
        ReactApplicationContext context = TikTokAccessibilityModule.getReactContext();
        if (context != null) {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Сервис прерван");
    }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Сервис подключен");

        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED | 
                          AccessibilityEvent.TYPE_VIEW_SCROLLED |
                          AccessibilityEvent.TYPE_VIEW_CLICKED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.notificationTimeout = 100;
        setServiceInfo(info);
    }

    public static TikTokAccessibilityService getInstance() {
        return instance;
    }

    public void startTracking() {
        isTracking = true;
        lastProgress = -1;
        lastResetTime = System.currentTimeMillis();
        Log.d(TAG, "Трекинг запущен");
    }

    public void stopTracking() {
        isTracking = false;
        lastProgress = -1;
        Log.d(TAG, "Трекинг остановлен");
    }

    public void manualSwipe() {
        performSwipe();
    }

    public boolean isTracking() {
        return isTracking;
    }
}
