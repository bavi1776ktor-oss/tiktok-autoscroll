package com.tiktokautoscroll.app;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TikTokAccessibilityModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public TikTokAccessibilityModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "AccessibilityModule";
    }

    public static ReactApplicationContext getReactContext() {
        return reactContext;
    }

    @ReactMethod
    public void startService() {
        TikTokAccessibilityService service = TikTokAccessibilityService.getInstance();
        if (service != null) {
            service.startTracking();
        }
    }

    @ReactMethod
    public void stopService() {
        TikTokAccessibilityService service = TikTokAccessibilityService.getInstance();
        if (service != null) {
            service.stopTracking();
        }
    }
}
