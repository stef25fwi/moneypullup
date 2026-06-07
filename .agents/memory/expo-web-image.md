---
name: Expo web background image crash
description: Using expo-image or RN Image in an absoluteFill View silently causes a blank white screen on Expo web; the fix uses CSS backgroundImage on web and copies the asset to public/.
---

## Rule
Never use `expo-image` or React Native `Image` inside an `overflow: "hidden"` absoluteFill background component for Expo web. It silently causes a blank white screen with no console error.

## Fix
1. Copy the image to `artifacts/<app>/public/` — Expo's web dev server serves this folder at the site root.
2. Use `Platform.OS === "web"` to switch between CSS and RN:
```tsx
{Platform.OS === "web" ? (
  <View style={[StyleSheet.absoluteFill, {
    backgroundImage: "url(/image.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as unknown as object]} />
) : (
  <Image source={require("../assets/image.png")} style={StyleSheet.absoluteFill} resizeMode="cover" />
)}
```

**Why:** On Expo web, `expo-image` renders an HTML `<img>` tag that creates a stacking context issue inside an `overflow: hidden` container, blocking the entire React tree. React Native's built-in `Image` has the same problem. CSS `backgroundImage` on a View avoids the img tag stacking issue entirely.

**How to apply:** Any time a full-screen or large background image is needed in Expo web preview, use this platform-split pattern.
