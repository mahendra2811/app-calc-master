# CalcMaster — Troubleshooting Guide

## Known Issues & Fixes

---

### ❌ "Cannot manually set color scheme, as dark mode is type 'media'"

**Cause:** NativeWind requires `darkMode: "class"` to allow manual theme switching.
**Fix:** In `tailwind.config.js`:
```javascript
module.exports = {
  darkMode: "class",  // ← THIS LINE
  // ...
}
```
Also wrap `setColorScheme()` in try-catch in `ThemeContext.tsx`.

---

### ❌ Web bundling fails: "Unable to resolve react-native-web/dist/index"

**Cause:** `react-native-web` not installed (this is an Android-first app).
**Fix:** Either install it for web dev:
```bash
npx expo install react-native-web react-dom
```
Or ignore — only affects web (`w` key in dev server). Android Expo Go works fine.

---

### ❌ "react@19.2.0 does not satisfy peer dependency react@^19.2.4"

**Cause:** `react-dom@19.2.4` (web dependency) needs newer React.
**Fix:**
```bash
npm install react@19.2.4 react-dom@19.2.4 --legacy-peer-deps
```
Or update in `package.json`: `"react": "19.2.4"`

---

### ❌ typedRoutes error: "Cannot find module @expo/router-server/typed-routes"

**Cause:** Node.js v24+ blocks loading `.ts` files from node_modules for type generation.
**Fix:** In `app.config.js`, remove or disable:
```javascript
experiments: {
  typedRoutes: false,  // or remove this block entirely
}
```

---

### ❌ Package version warnings on `npx expo start`

**Cause:** Manually installed packages with wrong versions.
**Fix:** Always use `npx expo install` instead of `npm install`:
```bash
npx expo install package-name    # installs correct version for SDK 55
npx expo install --fix           # fixes all version mismatches
```

---

### ❌ Reanimated animations not working

**Cause:** Missing Reanimated babel plugin or not clearing cache.
**Fix:**
1. Verify `babel.config.js` has `"react-native-reanimated/plugin"` as **last** plugin
2. Clear cache: `npx expo start --clear`

---

### ❌ NativeWind styles not applying

**Cause:** `global.css` not imported, or content paths wrong in tailwind config.
**Fix:**
1. Check `src/app/_layout.tsx` imports `'../../../global.css'`
2. Check `tailwind.config.js` content: `["./src/**/*.{js,jsx,ts,tsx}"]`
3. Run `npx expo start --clear`

---

### ❌ AsyncStorage "key must be a string" error

**Cause:** Passing `undefined` as key (usually from `STORAGE_KEYS.CALC_HISTORY(undefined)`).
**Fix:** Always validate calcId before calling storage:
```typescript
if (!calcId) return;
storage.get(STORAGE_KEYS.CALC_HISTORY(calcId), []);
```

---

### ❌ Calculator shows blank screen / infinite loading

**Cause:** Calculator slug not in `calculatorRegistry`.
**Fix:** Add entry to `src/utils/calculator-registry.ts`:
```typescript
'my-new-slug': MyNewCalculator,
```
Also add metadata to `src/constants/calculators.ts`.

---

### ❌ i18n fallback showing key name instead of text

**Cause:** Key doesn't exist in translation file.
**Fix:**
1. Check `src/i18n/locales/en.ts` has the key
2. Check `src/i18n/locales/hi.ts` has the same key
3. Verify `i18n.enableFallback = true` in `src/i18n/index.ts`

---

### ❌ Expo Go "Something went wrong" on Android

**Cause:** Usually a JS runtime error. Check Metro console.
**Fix:**
1. Check Metro terminal for the actual error
2. Press `j` in Metro to open debugger
3. Look for: missing imports, undefined variables, circular dependencies

---

### ❌ "Module not found: @/*" path alias not working

**Cause:** `tsconfig.json` paths not set up or Metro doesn't know about them.
**Fix:** Verify `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```
And `babel.config.js` must use `babel-preset-expo` (handles path aliases).

---

### ❌ EAS Build fails on Android

**Common causes and fixes:**

1. **google-services.json missing** — add placeholder or disable Firebase:
   ```bash
   EXPO_PUBLIC_FIREBASE_ENABLED=false
   ```

2. **Keystore not configured** — run:
   ```bash
   eas credentials
   ```

3. **compileSdkVersion mismatch** — in `app.config.js`:
   ```javascript
   android: { compileSdkVersion: 35, targetSdkVersion: 35 }
   ```

4. **Node/npm version** — EAS uses Node 18 LTS. Check `eas.json` for `node` field.

---

## Performance Debugging

### App feels slow
1. Check all calculator screens have `React.memo()`
2. Check context values are wrapped in `useMemo()`
3. Verify `useCallback()` on all dispatch functions
4. Run with Flipper profiler or React DevTools

### History loading slowly
- Check `src/utils/storage.ts` cache is working (first load slow is normal)
- Verify history limits (50/calculator, 200 global)
- If still slow, check for missing `keyExtractor` on FlatList

### Animations janky
- Reanimated animations must run on UI thread (use `useAnimatedStyle`)
- Avoid heavy JS computation in animated components
- Clear Metro cache: `npx expo start --clear`

---

## Development Tips

```bash
# Start with clean cache (fixes most weird issues)
npx expo start --clear

# Check what's slowing the bundle
npx expo start --dev-client

# Inspect AsyncStorage in real device
# Use Flipper → Database Inspector → AsyncStorage

# Test Hindi language
# Change device language to Hindi, or toggle in Settings screen
```
