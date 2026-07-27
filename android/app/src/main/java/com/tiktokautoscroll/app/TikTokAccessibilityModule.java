package com.tiktokautoscroll.app;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TikTokAccessibilityModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String MODULE_NAME = "AccessibilityModule";

    public TikTokAccessibilityModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    public static ReactApplicationContext getReactContext() {
        return reactContext;
    }

    @ReactMethod
    public void startService() {
        Log.d("TikTokAccessibility", "startService called");
        TikTokAccessibilityService service = TikTokAccessibilityService.getInstance();
        if (service != null) {
            service.startTracking();
        }
    }

    @ReactMethod
    public void stopService() {
        Log.d("TikTokAccessibility", "stopService called");
        TikTokAccessibilityService service = TikTokAccessibilityService.getInstance();
        if (service != null) {
            service.stopTracking();
        }
    }

    @ReactMethod
    public void performSwipe() {
        Log.d("TikTokAccessibility", "performSwipe called");
        TikTokAccessibilityService service = TikTokAccessibilityService.getInstance();
        if (service != null) {
            service.manualSwipe();
        }
    }
}
