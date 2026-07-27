package com.tiktokautoscroll.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

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

        findProgressBar(root);
        root.recycle();
    }

    private void findProgressBar(AccessibilityNodeInfo node) {
        if (node == null) return;

        CharSequence className = node.getClassName();
        if (className != null && className.toString().contains("ProgressBar")) {
            if (node.getRangeInfo() != null) {
                int currentProgress = (int) node.getRangeInfo().getCurrent();
                if (currentProgress >= 0) {
                    onProgressUpdate(currentProgress);
                }
            }
        }

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

        if (lastProgress > 95 && progress < 10 && (currentTime - lastResetTime) > 1000) {
            lastResetTime = currentTime;
            Log.d(TAG, "Ролик закончился! Делаем свайп.");
            performSwipe();
        }

        lastProgress = progress;
    }

    private void performSwipe() {
        int screenWidth = getResources().getDisplayMetrics().widthPixels;
        int screenHeight = getResources().getDisplayMetrics().heightPixels;

        Path swipePath = new Path();
        swipePath.moveTo(screenWidth / 2, screenHeight / 2);
        swipePath.lineTo(screenWidth / 2, screenHeight / 4);

        GestureDescription.Builder gestureBuilder = new GestureDescription.Builder();
        gestureBuilder.addStroke(new GestureDescription.StrokeDescription(swipePath, 0, 300));

        dispatchGesture(gestureBuilder.build(), new GestureResultCallback() {
            @Override
            public void onCompleted(GestureDescription gestureDescription) {
                super.onCompleted(gestureDescription);
                Log.d(TAG, "Свайп выполнен успешно");
                lastProgress = -1;
            }

            @Override
            public void onCancelled(GestureDescription gestureDescription) {
                super.onCancelled(gestureDescription);
                Log.d(TAG, "Свайп отменен");
            }
        }, null);
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Сервис прерван");
    }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Сервис доступности подключен");

        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED | 
                          AccessibilityEvent.TYPE_VIEW_SCROLLED |
                          AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.notificationTimeout = 100;
        info.flags = AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
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

    public boolean isTracking() {
        return isTracking;
    }
}
