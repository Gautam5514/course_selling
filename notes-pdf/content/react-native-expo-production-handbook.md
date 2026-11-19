---
title: Cross-Platform Mobile Pro: React Native & Expo Guide
subtitle: Build, polish and ship real Android and iOS apps from one codebase, explained step by step in simple language.
category: Mobile
level: Beginner to Intermediate
accent: teal
tags: react-native, expo, reanimated, mobile, ios-android
highlights: How React Native Works | Expo Router Navigation | Offline-First Storage | Gestures & Reanimated | Push & Auth | EAS Build & Release
tagline: Expo Router • TanStack Query • Reanimated • Offline-First • EAS Release
description: Learn how React Native and Expo really work, from the JS thread and UI thread to a published app on the Play Store and App Store. Each chapter explains one production topic in plain language with commented code, dry runs, common mistakes and interview questions with model answers. Expo changes with every SDK release, so this handbook teaches the stable ideas and tells you where to check the current Expo docs.
---

# How React Native works

*What really happens between your JavaScript code and the pixels on the phone, and why it is not a website inside an app.*

## Why it matters

Imagine a film shooting. The **director** reads the script and decides what should happen in each scene. The **camera crew** does the actual work of putting the picture on film. If the director is busy on a long phone call, the crew waits and the shooting stops.

React Native works in a very similar way. Your JavaScript code is the director. The phone's own drawing system is the camera crew. Most bugs that beginners call "the app is laggy" come from one fact: the director was busy, so the crew had nothing to do.

If you understand this picture, later topics such as list performance, animations and gestures become easy. If you skip it, they feel like magic rules.

## The idea

**React Native** is a framework that lets you write an app in JavaScript (or TypeScript) with React, and shows it with the **real native views** of Android and iOS. A "native view" is the same building block that an app written in Kotlin or Swift uses: a real Android `TextView`, a real iOS `UIView`.

This is the main difference from a **hybrid app**. A hybrid app opens a hidden browser (called a WebView) and shows a website inside it. React Native does not draw HTML. It asks the phone to create real buttons, text and scroll views.

You still use everything you know from React: components, props, state, hooks. Only the "tags" and the styling system change.

## React on the web vs React Native

| Topic | React on the web | React Native |
|---|---|---|
| Building blocks | `div`, `span`, `img` | `View`, `Text`, `Image` |
| Output | HTML in the DOM | Native Android and iOS views |
| Styling | CSS files, classes | JavaScript style objects |
| Default layout | Block and inline | Flexbox, column direction |
| Navigation | URLs and the browser | A navigation library (Expo Router) |

Things that do **not** exist in React Native:

- There is no **DOM** (the tree of HTML elements in a browser). So `document.getElementById` does not work.
- There is no `window.localStorage`. You use a storage library instead.
- There are no CSS files, no class names and no media queries by default.
- A bare string outside a `Text` component is an error. Every piece of text must sit inside `Text`.

Things that **do** exist: `fetch`, `setTimeout`, `Promise`, `async/await`, `console.log` and almost all of modern JavaScript.

## The two threads you must know

A **thread** is one line of work inside the app. Think of it as one worker who can do only one thing at a time.

| Thread | Its job | What happens when it is busy |
|---|---|---|
| **JS thread** | Runs your React code, state updates, API calls | Taps feel late, JS-driven animations stutter |
| **UI thread** (main thread) | Draws views, handles touches, native scrolling | The whole app freezes |

There is also background work for layout. React Native uses an engine called **Yoga** to calculate the size and position of every view from your Flexbox styles.

A smooth screen shows 60 pictures per second. Each picture is called a **frame**. So every frame has a budget of 1000 / 60, which is about 16.7 milliseconds. Many new phones show 120 frames per second, and then the budget is only about 8.3 milliseconds. If the work for one frame takes longer, the frame is skipped. The user sees a small jump. This is called a **dropped frame**.

:::flow From your code to the screen
Your JSX | components and state
React | finds what changed
Yoga layout | sizes and positions
Native views | Android and iOS draw
:::

## The JavaScript engine: Hermes

JavaScript needs a program to run it. In a browser this is the browser's engine. In React Native the default engine is **Hermes**, an engine made for React Native. During the build, your JavaScript is converted into **bytecode** (a compact form that the engine can start running quickly). This helps the app open faster and use less memory. You do not need to configure it in a normal Expo project.

## The old bridge and the New Architecture

For many years, the JS side and the native side talked through a part called the **bridge**. Think of two offices that can talk only by posting letters. Every message was converted to text (JSON), put in a queue, sent across, and converted back. It worked, but it was slow when many messages were sent, for example on every frame of a gesture.

The **New Architecture** removes this post office. In plain words:

| Part | What it is in simple words |
|---|---|
| **JSI** | A direct phone line. JavaScript can hold a native object and call it directly, without converting to JSON |
| **Fabric** | The new drawing system. It creates and updates native views, and can do urgent updates in sync |
| **TurboModules** | Native features (camera, storage) that load only when first used, not all at app start |
| **Codegen** | A tool that reads your TypeScript types and writes the glue code, so both sides agree on types |

You do not write JSI code as an app developer. You get the benefit through libraries. Reanimated, for example, uses this direct line to run animation code on the UI thread.

## Dry run: what happens when you tap a button

```jsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 32 }}>{count}</Text>
      <Pressable onPress={() => setCount(count + 1)}>
        <Text>Add one</Text>
      </Pressable>
    </View>
  );
}
```

:::example One tap, step by step
| Step | Where | What happens |
|---|---|---|
| 1 | UI thread | The finger touches the screen. The phone finds the pressed view |
| 2 | JS thread | The `onPress` function runs and calls `setCount(1)` |
| 3 | JS thread | React runs `Counter` again and sees that only the text changed |
| 4 | Layout | Yoga checks if the size of the text changed |
| 5 | UI thread | The native text view is updated to show `1` |

If step 2 or 3 is slow, the user sees the new number late. The finger was fast. Your JavaScript was not.
:::

:::warn Heavy work in a press handler or in render
Sorting ten thousand items, parsing a huge JSON file or running a long loop inside a component blocks the JS thread. The app looks frozen even though it has not crashed. Native scrolling may still move, because the UI thread is free, but no press handler runs. Keep render functions light, move heavy work to the server when you can, break big jobs into small pieces, and let animations run on the UI thread (the Reanimated chapter shows how).
:::

:::interview What is the New Architecture in React Native?
"In the old design, JavaScript and native code talked through an asynchronous bridge that turned every message into JSON. That was a bottleneck. The New Architecture replaces it with JSI, which lets JavaScript call native code directly. On top of JSI there is Fabric, the new renderer, and TurboModules, which are native modules that load lazily. Codegen creates type-safe glue code from TypeScript types. The result is faster startup, less overhead per call, and support for modern React features."
:::

:::revise
- React Native draws real native views. It is not a WebView and there is no DOM.
- The JS thread runs your React code. The UI thread draws and handles touches.
- At 60 frames per second, each frame has about 16.7 ms. Slow work drops frames.
- A blocked JS thread makes taps feel dead, but native scrolling can still move.
- New Architecture: JSI (direct calls), Fabric (renderer), TurboModules (lazy native modules).
- Hermes is the default JavaScript engine and runs precompiled bytecode.
:::

# Setting up with Expo

*Create a project, run it on your own phone in minutes, and understand Expo Go, development builds and production builds.*

## Why it matters

To build a native app without help you need Android Studio, Xcode, Gradle, CocoaPods, signing keys and a lot of patience. It is like wanting to cook dinner and first having to build the kitchen.

**Expo** is a ready kitchen. It is a framework and a set of tools on top of React Native. It gives you a project template, a large set of well-tested libraries (camera, notifications, storage, and more), file-based navigation, and a cloud service to build and release the app. The React Native team itself recommends starting new apps with a framework such as Expo.

## What you need

- **Node.js** (the LTS version, which means the long-term support version).
- A code editor such as VS Code.
- A phone with the **Expo Go** app, or an Android emulator, or an iOS simulator.

## Create and run a project

```bash
# Create a new project from the default template
npx create-expo-app@latest my-app

cd my-app

# Start the development server (called Metro)
npx expo start
```

**Metro** is the bundler. A bundler collects all your JavaScript files and sends them to the app as one bundle. The terminal shows a QR code. Scan it with the Expo Go app (Android) or the Camera app (iPhone). Your phone and your computer must be on the same Wi-Fi network.

Useful keys in the terminal where Metro is running:

| Key | Action |
|---|---|
| `a` | Open on the Android emulator or a connected device |
| `i` | Open on the iOS simulator (Mac only) |
| `r` | Reload the app |
| `j` | Open the debugger (React Native DevTools) |
| `m` | Open the developer menu on the device |

When you save a file, the screen updates in about a second and keeps its state. This is called **Fast Refresh**.

## What is inside the project

```text
my-app/
  app/               screens and layouts (Expo Router reads this folder)
    _layout.tsx      the root layout
    index.tsx        the first screen
  assets/            images and fonts
  components/        your reusable components
  app.json           app name, icon, permissions, plugins
  package.json       dependencies and scripts
  tsconfig.json      TypeScript settings
```

Some templates place the `app` folder inside `src/`. The idea is the same.

The file `app.json` is the **app config**. It is the one place where you describe the native side of your app.

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "scheme": "myapp",
    "icon": "./assets/icon.png",
    "ios": { "bundleIdentifier": "com.example.myapp" },
    "android": { "package": "com.example.myapp" },
    "plugins": ["expo-router"]
  }
}
```

- `slug` is a short name used by Expo services.
- `scheme` lets links such as `myapp://profile` open your app. This is called a **deep link**.
- `bundleIdentifier` and `package` are the unique ID of your app in each store. Choose them carefully. You cannot change them after the app is published.

## Expo Go vs development build

This is the most important idea in this chapter.

**Expo Go** is a ready-made app from the store. It already contains a fixed set of native libraries. Your project sends only JavaScript to it. Think of it as a rented room with fixed furniture. You can live in it today, but you cannot add a new wall.

A **development build** is **your own** app, built with the exact native libraries your project needs, plus the Expo developer tools. Think of it as your own flat. You can change anything, but you have to build it first.

| | Expo Go | Development build | Production build |
|---|---|---|---|
| Who builds it | Expo (from the store) | You (EAS or local) | You (EAS or local) |
| Native libraries | Fixed set | Any library | Any library |
| Developer menu | Yes | Yes | No |
| Your icon and app ID | No | Yes | Yes |
| Use it for | Learning, quick tries | Daily development | Store release |

You need a development build as soon as you add a library with native code that Expo Go does not contain, or when you test things tied to your own app ID, such as push notifications, sign-in with a provider, or deep links from the web.

```bash
# Add the library that turns your app into a development build
npx expo install expo-dev-client

# Option 1: build on your own computer (needs Android Studio or Xcode)
npx expo run:android
npx expo run:ios

# Option 2: build in the cloud with EAS (works without a Mac for iOS)
eas build --profile development --platform android
```

After the development build is installed on the phone, daily work is the same as before: run `npx expo start`, open the app, edit, save.

:::flow Which one do I use
Learning | Expo Go
Custom native library | Development build
Testers | Preview build
Store | Production build
:::

## Installing libraries the right way

```bash
# Good: Expo picks the version that matches your SDK
npx expo install expo-image expo-secure-store

# Check the project for version problems
npx expo-doctor
```

Every Expo **SDK** version (a numbered release of Expo) works with one React Native version and matching versions of the native libraries. `npx expo install` knows this table. Plain `npm install` takes the newest version, which may not match.

:::warn A native library needs a new build
Fast Refresh updates only JavaScript. If you install a library that contains native code, the already installed development build does not have that code. You will see an error such as "native module cannot be found". Build the app again and install the new build. Rule: JavaScript change means reload, native change means rebuild.
:::

## Config plugins and prebuild

In a classic React Native project you edit files in the `android` and `ios` folders by hand. In Expo you normally do not keep these folders. You describe what you want in `app.json`, and Expo generates the native folders when it builds. This is called **prebuild**, and the approach is called **Continuous Native Generation**.

A **config plugin** is a small script from a library that changes the native project for you during prebuild. For example, a camera library adds the camera permission text. You only list the plugin in `app.json`.

```bash
# Generate the android and ios folders to look inside (optional)
npx expo prebuild
```

## Environment variables

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.example.com
```

```typescript
// Any variable that starts with EXPO_PUBLIC_ is available in your code
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

:::warn EXPO_PUBLIC_ variables are not secret
These values are copied into the JavaScript bundle. Anyone can unpack your app and read them. Never put a database password, a payment secret key or an admin token there. Secrets belong on your server. The app should call your server, and your server calls the paid service.
:::

:::example Your first ten minutes
1. Run `npx create-expo-app@latest chai-menu` and then `npx expo start`.
2. Scan the QR code with Expo Go. The starter screen opens on your phone.
3. Open `app/index.tsx`, change a text and save. The phone updates without a rebuild.
4. Shake the phone (or press `m`) to open the developer menu.
5. Press `j` to open the debugger and look at the console output.
:::

:::interview What is the difference between Expo Go and a development build?
"Expo Go is a prebuilt sandbox app with a fixed set of native modules. My project only sends JavaScript to it, so it is very fast to start with, but I cannot add native code that it does not already contain, and it does not use my app's own ID. A development build is my own app with `expo-dev-client`. It contains exactly my native dependencies and my config, and it still has the developer menu and Fast Refresh. For a real product I use a development build for daily work and keep Expo Go for learning and quick experiments."
:::

:::revise
- Expo is a framework on top of React Native: template, libraries, router and build service.
- `npx create-expo-app@latest` creates the project, `npx expo start` runs Metro.
- Expo Go is a fixed sandbox. A development build is your own app with any native library.
- Use `npx expo install` so library versions match your Expo SDK.
- JavaScript change: reload. Native change (new native library, app config): rebuild.
- `EXPO_PUBLIC_` variables are visible to everyone. Keep secrets on the server.
:::

# Core components, Flexbox and styling

*The building blocks of every screen, how layout works on a phone, and how to handle notches and platform differences.*

## Why it matters

A phone screen is small, comes in hundreds of sizes, has a notch at the top and a gesture bar at the bottom, and the same app must look right on a small Android phone and a large iPhone. You cannot place things with fixed pixel positions. You need a layout system that stretches and adapts. In React Native that system is Flexbox.

## The core components

Think of these as the bricks of a house. Almost every screen is made of only a few of them.

| Component | Web cousin | Use it for |
|---|---|---|
| `View` | `div` | A box that holds and arranges other things |
| `Text` | `span`, `p` | Every piece of text |
| `Image` | `img` | Pictures |
| `ScrollView` | a scrolling `div` | A small amount of content that must scroll |
| `Pressable` | `button` | Anything the user can tap |
| `TextInput` | `input` | Typing |
| `FlatList` | none | Long lists |

Other useful ones are `ActivityIndicator` (a loading spinner), `Switch` (an on and off toggle) and `Modal` (a layer above the screen).

:::warn Text outside a Text component
`<View>Hello</View>` crashes with "Text strings must be rendered within a Text component". A hidden form of this bug is `{count && <Badge />}`. When `count` is `0`, React tries to draw the number `0` as text inside a `View`. Write `{count > 0 && <Badge />}` or `{count ? <Badge /> : null}` instead.
:::

## Styling without CSS

There are no CSS files. A style is a plain JavaScript object. Property names use **camelCase**: `backgroundColor`, not `background-color`.

```jsx
import { StyleSheet, Text, View } from 'react-native';

export function PriceTag({ price, onSale }) {
  return (
    <View style={styles.box}>
      {/* An array merges styles. Later items win. false is ignored */}
      <Text style={[styles.price, onSale && styles.sale]}>
        Rs {price}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12, borderRadius: 8, backgroundColor: '#f2f2f2' },
  price: { fontSize: 18, fontWeight: '700', color: '#222' },
  sale: { color: '#d62828' },
});
```

Three big differences from CSS:

1. **Numbers have no unit.** `padding: 12` means 12 **density-independent pixels**. One such pixel is about the same physical size on every phone. A sharp screen simply uses more real pixels to draw it. So you never write `px`.
2. **Styles are not inherited.** Setting `color` on a `View` does nothing for the `Text` inside it. Only a `Text` inside another `Text` inherits text styles.
3. **There is no cascade.** No selectors, no class names. Each component gets its style through the `style` prop.

## Flexbox on mobile

Flexbox arranges children inside a parent. Imagine putting books on a shelf. You decide the direction of the row, how to spread the books along the shelf, and how to line them up across it.

| Property | What it decides | Common values |
|---|---|---|
| `flexDirection` | The main direction | `column` (default), `row` |
| `justifyContent` | Spread along the main direction | `flex-start`, `center`, `space-between` |
| `alignItems` | Position across the main direction | `stretch` (default), `center`, `flex-start` |
| `flex` | How much free space a child takes | `1`, `2` |
| `gap` | Space between children | a number |

Differences from Flexbox on the web:

- The default `flexDirection` is `column`, because phone screens are tall. On the web it is `row`.
- Every `View` is already a flex container. You do not write `display: 'flex'`.
- `flex` takes one number only. `flex: 1` means "take all the free space".

```jsx
import { StyleSheet, Text, View } from 'react-native';

export function Screen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text>Orders</Text>
        <Text>Filter</Text>
      </View>
      <View style={styles.body}><Text>List goes here</Text></View>
      <View style={styles.footer}><Text>Total: Rs 420</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },                 // fill the whole screen
  header: {
    height: 56, paddingHorizontal: 16,
    flexDirection: 'row',              // children side by side
    justifyContent: 'space-between',   // one left, one right
    alignItems: 'center',              // centred top to bottom
  },
  body: { flex: 1 },                   // takes all the space left over
  footer: { height: 64, justifyContent: 'center', padding: 16 },
});
```

:::example Dry run: how the heights are decided
Say the screen is 800 units tall.

| View | Rule | Height |
|---|---|---|
| `header` | fixed `height: 56` | 56 |
| `footer` | fixed `height: 64` | 64 |
| `body` | `flex: 1`, takes the rest | 800 - 56 - 64 = 680 |

On a phone that is 600 units tall, the header and footer stay the same and the body becomes 480. This is why `flex: 1` is the most used style in React Native. If there were two children with `flex: 1` and `flex: 2`, they would share the free space in the ratio 1 to 2.
:::

:::warn The screen is empty or the list does not scroll
If a parent has no height, a child with `flex: 1` has nothing to fill, so it becomes 0 tall and you see a blank screen. Make sure every parent up to the root has `flex: 1` (or a fixed height). The same bug stops a `FlatList` or `ScrollView` from scrolling, because it grows to the size of its content instead of the size of the screen.
:::

## Safe areas: notches and gesture bars

Modern phones have a camera cut-out (the **notch**), rounded corners, a status bar at the top and a gesture bar at the bottom. The part of the screen where content is fully visible and touchable is called the **safe area**. If you ignore it, your title hides under the clock and your bottom button sits under the gesture bar.

Use the library `react-native-safe-area-context`. It comes with the Expo template.

```jsx
import { Text, View } from 'react-native';
import {
  SafeAreaView, useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Way 1: a wrapper that adds padding on the edges you choose
export function SimpleScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Text>Safe content</Text>
    </SafeAreaView>
  );
}

// Way 2: read the numbers and use them yourself
export function BottomBar() {
  const insets = useSafeAreaInsets();   // { top, bottom, left, right }
  return (
    <View style={{ paddingBottom: insets.bottom + 12, padding: 12 }}>
      <Text>Pay now</Text>
    </View>
  );
}
```

Both ways need a `SafeAreaProvider` at the root of the app. Expo Router adds it for you. In a project without Expo Router, wrap your root component in `SafeAreaProvider` yourself.

:::warn Double padding
A navigation header and a tab bar already handle the safe area on their side. If you also wrap the screen in a `SafeAreaView` with all edges, you get a strange empty band. Under a visible header, use `edges={['bottom']}` or no safe area view at all. Add the top edge only on screens where you hide the header.
:::

:::note
Current Android versions draw apps **edge to edge**, which means the app also draws behind the status bar and the navigation bar. This makes safe area insets important on Android too, not only on iPhones. React Native also ships its own older `SafeAreaView`, but it does less than the library version. Prefer `react-native-safe-area-context`.
:::

## Platform differences

Most code is shared, but Android and iOS are different products with different habits.

| Topic | iOS | Android |
|---|---|---|
| Going back | Swipe from the left edge | System back button or gesture |
| Shadows | `shadowColor`, `shadowOpacity`, `shadowRadius` | `elevation` |
| Press feedback | Opacity change | Ripple (`android_ripple`) |
| Default font | San Francisco | Roboto |
| Permissions text | Must explain every permission | Declared in the manifest |

```jsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    // Platform.select returns the value for the current platform
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
});

const isIOS = Platform.OS === 'ios';   // 'ios', 'android' or 'web'
```

For bigger differences, create two files with the same name and different endings: `DatePicker.ios.tsx` and `DatePicker.android.tsx`. When you write `import DatePicker from './DatePicker'`, the bundler picks the right file for each platform.

:::interview How is Flexbox in React Native different from Flexbox on the web?
The default direction is `column`, not `row`. Every `View` is a flex container already, so there is no `display: flex` to write. The `flex` property takes a single number instead of the three-value shorthand. Sizes are unitless density-independent pixels. Layout is calculated by the Yoga engine on the native side, not by a browser. The names and meaning of `justifyContent` and `alignItems` are the same.
:::

:::revise
- All text must be inside `Text`. Watch out for `{count && ...}` when `count` is 0.
- Styles are JavaScript objects with unitless numbers. There is no inheritance and no cascade.
- Flexbox default direction is `column`. `flex: 1` means fill the free space.
- A blank screen often means a parent without `flex: 1` or a height.
- Use `react-native-safe-area-context` for notches and gesture bars on both platforms.
- Use `Platform.OS`, `Platform.select` or `.ios.tsx` and `.android.tsx` files for differences.
:::

# Lists with FlatList

*How to show hundreds or thousands of rows smoothly, with pull to refresh and infinite scroll.*

## Why it matters

Almost every app is a list: chats, orders, products, songs, notifications. A list is also the first place where an app feels slow. If you draw 5,000 rows at once, the phone must create 5,000 groups of native views. Memory fills up and the screen takes seconds to open.

Think of a long train passing a railway crossing. You stand at the crossing and see only three or four coaches at a time. You do not need the whole train in front of you. A good list works the same way: it builds only the rows near the window you can see.

## The idea

- `ScrollView` builds **all** its children at once. It is fine for a settings page or a form with twenty fields.
- `FlatList` is **virtualized**. This means it creates only the rows that are on the screen, plus a small buffer above and below. Rows that scroll far away are removed to free memory.

| | `ScrollView` | `FlatList` |
|---|---|---|
| Builds | Everything at once | Only rows near the screen |
| Good for | Short, mixed content | Long lists of similar rows |
| Memory | Grows with content | Stays roughly flat |
| Extras | None | Refresh, infinite scroll, empty view |

## A basic list

```jsx
import { FlatList, StyleSheet, Text, View } from 'react-native';

const ORDERS = [
  { id: 'o1', item: 'Masala dosa', price: 90 },
  { id: 'o2', item: 'Filter coffee', price: 30 },
  { id: 'o3', item: 'Idli plate', price: 50 },
];

export default function OrderList() {
  return (
    <FlatList
      data={ORDERS}                          // the array
      keyExtractor={(order) => order.id}     // a stable, unique key
      renderItem={({ item }) => (            // how to draw one row
        <View style={styles.row}>
          <Text>{item.item}</Text>
          <Text>Rs {item.price}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.line} />}
      ListEmptyComponent={<Text>No orders yet</Text>}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between',
         paddingVertical: 12 },
  line: { height: 1, backgroundColor: '#eee' },
});
```

Note that `renderItem` receives an object. The row data is in its `item` field, and the position is in `index`.

:::warn Using the index as the key
`keyExtractor={(item, index) => String(index)}` looks harmless. But when you delete the first row, every row gets a new key. React then thinks every row changed. It redraws all of them, and local state inside a row (such as a ticked checkbox) jumps to the wrong row. Always use a real ID from your data.
:::

## Pull to refresh and infinite scroll

```jsx
import { ActivityIndicator, FlatList } from 'react-native';

export function Feed({ posts, refreshing, onRefresh, loadMore,
                       loadingMore }) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => <PostRow post={item} />}
      // Pull down from the top to refresh
      refreshing={refreshing}
      onRefresh={onRefresh}
      // Called when the user is near the end of the list
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}   // half a screen before the end
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
      }
    />
  );
}
```

`onEndReached` can fire more than once for the same position. Your `loadMore` function must protect itself: if a page is already loading, or there are no more pages, it should return without doing anything. The data fetching chapter shows a clean way to do this with `useInfiniteQuery`.

## How virtualization works

:::example Dry run: a list of 1,000 rows
Each row is 80 units tall and the screen is 800 units tall, so 10 rows fit on the screen.

| Moment | Rows that exist as native views |
|---|---|
| Screen opens | About the first 10 (set by `initialNumToRender`) |
| A moment later | The buffer is filled in small batches, a few screens deep |
| User scrolls to row 500 | Rows around 500, a few screens before and after |
| Rows 1 to 300 | Removed and replaced by empty space of the same height |

The other rows exist only as data in the array, which is cheap. The buffer size is set by `windowSize`. Its default is 21, which means 10 screens above, 10 below and the visible one.
:::

If the user flings very fast, the list may not build rows in time, and a blank area appears for a moment. That is the trade: a smaller buffer saves memory, a larger buffer shows fewer blanks.

## Making rows cheap

The list is only as fast as one row. Three habits help.

1. Wrap the row component in `memo`, so a row is skipped when its props did not change.
2. Keep `renderItem` and the callbacks you pass to rows stable with `useCallback`.
3. If every row has the same height, tell the list with `getItemLayout`. Then it does not have to measure the rows.

The performance chapter explains `memo` and `useCallback` with a dry run. Here is the third habit.

```jsx
<FlatList
  data={products}
  keyExtractor={(p) => p.id}
  renderItem={renderItem}
  // Every row is exactly 72 units tall
  getItemLayout={(_, index) => (
    { length: 72, offset: 72 * index, index }
  )}
/>
```

`getItemLayout` is only correct when every row has the same known height. If you use a separator, add its height to the calculation. For rows with different heights, leave it out.

## Tuning props

| Prop | What it does | When to change it |
|---|---|---|
| `initialNumToRender` | Rows built for the first screen | Set it to about one screen of rows |
| `maxToRenderPerBatch` | Rows built in each later batch | Lower if scrolling stutters |
| `windowSize` | Buffer measured in screens | Lower to save memory |
| `removeClippedSubviews` | Detaches views that are off screen | Try on very long Android lists |
| `getItemLayout` | Gives row sizes in advance | Fixed-height rows |

Do not change these numbers by feeling. Change one, test on a slow Android phone, and keep it only if it helps.

:::warn A FlatList inside a ScrollView
If you put a vertical `FlatList` inside a vertical `ScrollView`, the outer scroll view gives the list unlimited height. The list then believes every row is visible and builds all of them. Virtualization is lost, and React Native prints a warning about nested lists. Fix: make the `FlatList` the only scroller and put the content above it into `ListHeaderComponent`.
:::

## Other list tools

- `numColumns={2}` turns a `FlatList` into a grid.
- `horizontal` makes it scroll sideways, for example for a row of categories.
- `SectionList` shows grouped data with headers, such as contacts under A, B, C.
- **FlashList** is a popular community list library that **recycles** row views, which means it reuses the same native views for new data instead of destroying and creating them. Its props are close to `FlatList`. Check its docs for the current setup if `FlatList` is not fast enough for you.

:::interview A FlatList with 2,000 items scrolls badly. How do you fix it?
First I measure in a release build, because development mode is much slower. Then I check the row: is it wrapped in `memo`, are `renderItem` and callbacks stable, does it avoid heavy work and oversized images? I make sure keys are stable IDs. If rows have a fixed height I add `getItemLayout`. I confirm the list is not nested in a `ScrollView`. Then I tune `initialNumToRender`, `maxToRenderPerBatch` and `windowSize` on a low-end device. If it is still not enough, I try a recycling list such as FlashList.
:::

:::revise
- `ScrollView` builds everything. `FlatList` builds only the rows near the screen.
- `renderItem` receives `{ item, index }`. Use a real ID in `keyExtractor`, never the index.
- `refreshing` with `onRefresh` gives pull to refresh. `onEndReached` gives infinite scroll.
- Wrap rows in `memo`, keep `renderItem` stable, use `getItemLayout` for fixed heights.
- Never nest a vertical `FlatList` in a vertical `ScrollView`. Use `ListHeaderComponent`.
- Measure list speed in a release build on a slow phone.
:::

# Text input, keyboard and forms

*How to take typed input on a phone without the keyboard hiding your fields, and how to validate a form properly.*

## Why it matters

On a laptop the keyboard is a separate thing. On a phone the keyboard slides up and covers almost half of the screen. If your "Login" button sits at the bottom, it is now hidden behind the keyboard, and the user is stuck.

Think of filling a paper form at a bank counter while someone holds a file over the lower half of the page. You must slide the page up to see what you are writing. Your app must do this sliding for the user.

## The idea

`TextInput` is the typing box. In React you normally make it a **controlled input**: the text lives in state, and the input shows whatever the state says.

```jsx
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

export function PhoneField() {
  const [phone, setPhone] = useState('');
  return (
    <TextInput
      value={phone}
      onChangeText={setPhone}       // gives the new text directly
      placeholder="Mobile number"
      keyboardType="phone-pad"      // shows the number keyboard
      maxLength={10}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
           padding: 12, fontSize: 16 },
});
```

On the web you write `onChange` and read `event.target.value`. In React Native, `onChangeText` hands you the string directly. A `TextInput` has no default border on some platforms, so always give it a visible style.

## Props that make typing pleasant

| Prop | Example value | What it does |
|---|---|---|
| `keyboardType` | `email-address`, `number-pad` | Chooses the keyboard layout |
| `autoCapitalize` | `none`, `words` | Controls automatic capital letters |
| `autoCorrect` | `false` | Turns off spelling correction |
| `secureTextEntry` | `true` | Hides the text, for passwords |
| `returnKeyType` | `next`, `done`, `search` | Label of the enter key |
| `autoComplete` | `email`, `one-time-code` | Lets the system offer saved values |

Small choices matter. An email field with `autoCapitalize="none"`, `autoCorrect={false}` and `keyboardType="email-address"` saves the user from fighting the keyboard. To jump to the next field when the user presses the enter key, keep a `ref` to the next input and call `nextRef.current?.focus()` inside `onSubmitEditing`.

## Keeping fields above the keyboard

`KeyboardAvoidingView` is a `View` that changes its size or padding when the keyboard opens, so the content moves up.

```jsx
import {
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';

export function FormScreen({ children }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // iOS needs 'padding'. Android often resizes the window itself
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        // A tap on a button works on the first try, even with keyboard
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

Two details in this code solve the two most common complaints:

1. The form is inside a `ScrollView`. If the form is longer than the space above the keyboard, the user can scroll to the hidden fields.
2. `keyboardShouldPersistTaps="handled"`. Without it, the first tap on "Submit" only closes the keyboard, and the user must tap a second time.

:::flow What happens when the user taps a field
Tap on input | field gets focus
Keyboard opens | covers the lower part
Layout shrinks | padding is added
Field stays visible | user can type
:::

:::warn Keyboard behaviour is different on each platform
On Android the system often resizes or pans the window by itself, and on iOS it never does. So one `behavior` value rarely fits both. If there is a navigation header above your form on iOS, the content may still be hidden by the height of the header. Set `keyboardVerticalOffset` to that height. Always test forms on a real Android phone and a real iPhone. If your app has complex forms or a chat screen, look at the community library `react-native-keyboard-controller`, which gives the same behaviour on both platforms.
:::

To close the keyboard from code, call `Keyboard.dismiss()`. It is imported from `react-native`. A common use is right before you submit a form.

## Forms with validation

For one or two fields, `useState` is enough. A real sign-up form has many fields, validation rules, error messages and a submit state. Writing this by hand becomes a mess. **React Hook Form** is a small library that manages form state and validation for you. Install it with `npx expo install react-hook-form`.

Because `TextInput` is not an HTML input, you connect it through the `Controller` component.

```tsx
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

type FormData = { email: string; password: string };

export function SignUpForm({ onDone }: { onDone: (d: FormData) => void }) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ defaultValues: { email: '', password: '' } });

  return (
    <View style={{ gap: 12 }}>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput value={value} onChangeText={onChange} onBlur={onBlur}
                     placeholder="Email" autoCapitalize="none"
                     keyboardType="email-address" />
        )}
      />
      {errors.email && <Text style={{ color: 'red' }}>
        {errors.email.message}</Text>}
      {/* The password field and the button come next */}
    </View>
  );
}
```

The password field follows the same pattern with the rule `minLength: { value: 8, message: 'Use at least 8 characters' }`. The submit button is a `Pressable` with `disabled={isSubmitting}` and `onPress={handleSubmit(onDone)}`.

`handleSubmit(onDone)` runs all the rules first. It calls `onDone` with the data only when every rule passes. If `onDone` returns a promise, `isSubmitting` stays `true` until the promise finishes.

:::example Dry run: the user taps "Create account"
The user typed `ravi@mail` as email and `abc` as password.

| Step | What happens |
|---|---|
| 1 | `handleSubmit` checks `email`. The pattern needs a dot after the `@`, so it fails |
| 2 | It checks `password`. Length 3 is less than 8, so it fails |
| 3 | `errors` now holds both messages and the form re-renders |
| 4 | `onDone` is **not** called, so no network request is sent |
| 5 | The user fixes both fields and taps again. All rules pass and `onDone` runs |
:::

:::warn Validation only in the app
Rules in the app are for a good user experience, not for security. Anyone can send a request to your API without using your app. The server must check every value again.
:::

:::interview How do you stop the keyboard from covering the input fields?
"I wrap the screen in a `KeyboardAvoidingView` with `behavior='padding'` on iOS and put the form inside a `ScrollView`, so the user can reach every field. I set `keyboardShouldPersistTaps='handled'` so buttons work on the first tap while the keyboard is open. If there is a header, I set `keyboardVerticalOffset`. Android handles resizing differently, so I test on both platforms. For chat screens or complex forms I use a dedicated keyboard library that behaves the same on both."
:::

:::revise
- `onChangeText` gives the string directly. There is no `event.target.value`.
- Choose `keyboardType`, `autoCapitalize`, `autoCorrect` and `secureTextEntry` for each field.
- Use `ref` and `onSubmitEditing` to jump to the next field.
- `KeyboardAvoidingView` plus `ScrollView` keeps fields visible. Test on both platforms.
- `keyboardShouldPersistTaps="handled"` makes buttons work on the first tap.
- React Hook Form with `Controller` handles values, rules, errors and submit state.
:::

# Navigation with Expo Router

*Screens as files: stacks, tabs, dynamic routes, modals, typed links and protected routes.*

## Why it matters

A website has URLs and a back button from the browser. A mobile app has nothing like that by default. Something must remember which screens are open, animate between them, and handle the Android back button and the iOS back swipe.

Think of a pile of plates. You open a screen, and a plate is placed on top. You go back, and the top plate is removed. This pile is called a **stack**, and it is the base of mobile navigation.

## The idea

**Expo Router** is a file-based router. Every file inside the `app` folder becomes a screen, and the folder structure becomes the URL structure. You do not write a list of routes by hand. Under the hood it uses React Navigation, the standard navigation library for React Native.

```text
app/
  _layout.tsx            root layout (wraps everything)
  index.tsx              "/"
  login.tsx              "/login"
  cart.tsx               "/cart"  (shown as a modal)
  +not-found.tsx         shown for unknown URLs
  (tabs)/
    _layout.tsx          the tab bar
    index.tsx            "/"  (first tab)
    orders.tsx           "/orders"
    profile.tsx          "/profile"
  product/
    [id].tsx             "/product/42", "/product/abc"
```

| File or folder name | Meaning |
|---|---|
| `index.tsx` | The default screen of its folder |
| `_layout.tsx` | A wrapper that decides how sibling screens are shown |
| `(name)/` | A **group**: organises files without adding to the URL |
| `[id].tsx` | A **dynamic route**: `id` can be any value |
| `+not-found.tsx` | The screen for a URL that matches nothing |

Because every screen has a URL, deep links work almost for free. The link `myapp://product/42` opens the product screen directly.

## The root layout and the Stack

A `_layout.tsx` file is the frame around its sibling screens. The root layout is the best place for things that wrap the whole app.

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* The tabs group draws its own header, so hide this one */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
      {/* presentation: 'modal' makes the screen slide up from below */}
      <Stack.Screen
        name="cart"
        options={{ presentation: 'modal', title: 'Your cart' }}
      />
    </Stack>
  );
}
```

`Stack` gives you a native header with a back button, the native slide animation and the back swipe. The `name` is the path of the file relative to this layout, without the file ending.

## Tabs

```tsx
// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#12a39a' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

The usual app shape is a `Stack` at the root with a `Tabs` group inside it. Screens that should cover the tab bar, such as a product page or a checkout, are placed in the root stack, outside the `(tabs)` folder.

:::flow A typical app structure
Root Stack | app/_layout.tsx
Tabs group | Home, Orders, Profile
Detail screen | product/[id]
Modal | cart
:::

## Moving between screens

```tsx
import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {/* Way 1: a Link component, like an anchor tag */}
      <Link href="/orders">See my orders</Link>

      {/* asChild passes the press to your own component */}
      <Link href="/cart" asChild>
        <Pressable><Text>Open cart</Text></Pressable>
      </Link>

      {/* Way 2: navigate from code, for example after an API call */}
      <Pressable onPress={() => router.push('/product/42')}>
        <Text>Open product 42</Text>
      </Pressable>
    </View>
  );
}
```

| Call | What it does | Typical use |
|---|---|---|
| `router.push(path)` | Puts a new screen on top of the stack | Open a detail page |
| `router.replace(path)` | Swaps the current screen, no way back | After login or logout |
| `router.back()` | Removes the top screen | Close, cancel |

## Dynamic routes

```tsx
// app/product/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function ProductScreen() {
  // For the URL /product/42?ref=home this gives id "42", ref "home"
  const { id, ref } = useLocalSearchParams<{ id: string; ref?: string }>();

  return (
    <View style={{ padding: 16 }}>
      {/* A screen can set its own header options */}
      <Stack.Screen options={{ title: `Product ${id}` }} />
      <Text>Showing product {id}</Text>
      {ref ? <Text>You came from {ref}</Text> : null}
    </View>
  );
}
```

To pass parameters in a safe way, use the object form of `href`:

```tsx
<Link href={{ pathname: '/product/[id]', params: { id: product.id } }}>
  {product.name}
</Link>
```

:::warn Passing whole objects through the URL
Route params are part of a URL, so they are always **strings**. `id` is `"42"`, not the number `42`. Do not push a full product object through params. It becomes a huge string, breaks deep links and goes stale. Pass only the ID, and let the detail screen load the data by ID (from the cache or the API).
:::

:::example Dry run: opening a product and coming back
Start: the user is on the Home tab.

| Action | Stack after the action (bottom to top) |
|---|---|
| App opens | `(tabs)` |
| `router.push('/product/42')` | `(tabs)`, `product/42` |
| `router.push('/cart')` | `(tabs)`, `product/42`, `cart` (modal) |
| `router.back()` | `(tabs)`, `product/42` |
| Android back button | `(tabs)` |
| Android back button again | The app goes to the background |
:::

## Typed links

Typed routes let TypeScript check your paths. A typing mistake such as `/prodcut/42` becomes an error in the editor, not a broken button in production.

You turn it on with `"experiments": { "typedRoutes": true }` inside the `expo` object of `app.json`. Expo then generates types from your `app` folder while the dev server runs. Then `href` and `router.push` accept only paths that really exist. The name and place of this setting can change between SDK versions, so check the current Expo docs when you enable it.

## Protected routes

Some screens need a signed-in user. The idea is a security guard at the gate of a housing society. The guard checks your pass. Without a pass you are sent to the reception desk.

Put all private screens in one group and let the layout of that group be the guard.

```tsx
// app/(app)/_layout.tsx  - every screen in this group is private
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  // Still reading the saved token: show a loader, decide nothing yet
  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  // No user: send to the login screen
  if (!user) return <Redirect href="/login" />;

  return <Stack />;
}
```

The `useAuth` hook is built in the authentication chapter. The login screen lives outside this group, for example in `app/login.tsx`. Remember that a guard only decides what the app shows. The server must still check the token on every request.

:::note
Newer Expo Router versions also offer a declarative guard, written as `Stack.Protected` with a `guard` prop around a set of screens. It does the same job with less code. Check the current Expo Router docs to see if your version supports it. The redirect pattern above works in all versions.
:::

:::interview How does file-based routing work in Expo Router?
"Every file in the `app` directory is a route, and the path of the file is the URL. `index.tsx` is the default route of a folder. `_layout.tsx` defines how sibling routes are presented, for example in a `Stack` or in `Tabs`. Folders in round brackets are groups that organise files without changing the URL. Square brackets create dynamic segments that I read with `useLocalSearchParams`. Since every screen has a URL, deep linking works automatically. Under the hood it is built on React Navigation."
:::

:::revise
- Files in `app/` are screens. `_layout.tsx` wraps its siblings in a `Stack` or `Tabs`.
- `(group)` folders organise files without changing the URL. `[id].tsx` is a dynamic route.
- Navigate with `Link` or `useRouter()`: `push`, `replace`, `back`.
- Params are strings. Pass an ID, not a whole object.
- A modal is a stack screen with `presentation: 'modal'`.
- Protect a group with a layout that redirects when there is no user. The server still checks.
:::

# State and data fetching

*Where to keep each kind of data, and how TanStack Query handles loading, errors, caching and refreshing for you.*

## Why it matters

A mobile app lives on a bad network. The user enters a lift, the train goes into a tunnel, the mobile data pack ends. A screen that works only when the request succeeds quickly is a broken screen.

Think of a restaurant where the waiter runs to the kitchen every time you ask "what is on the menu?". A smart waiter remembers the menu, answers immediately, and only checks with the kitchen now and then to see if something changed. That memory is a **cache**.

## Three kinds of state

Not all data is the same. Putting everything in one big global store is a common beginner mistake.

| Kind | Example | Good tool |
|---|---|---|
| **Local UI state** | Is the dropdown open? Text in a field | `useState` |
| **Shared client state** | Theme, cart items, current user | Context or a small store such as Zustand |
| **Server state** | Products, orders, profile from the API | TanStack Query |

**Server state** is special. You do not own it. The real data lives on the server, and your copy can become old at any moment. It needs loading states, error states, caching and refreshing. That is a lot of work to write by hand.

## TanStack Query

**TanStack Query** (earlier called React Query) is a library that manages server state. You tell it **what** to fetch and under which **key** to store it. It handles the rest. Install it with `npx expo install @tanstack/react-query`.

```tsx
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

// Create it once, outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,   // data counts as fresh for 1 minute
      retry: 2,               // try 2 more times after a failure
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

First write a small fetch helper. Note that `fetch` does **not** throw an error for a 404 or 500 response. You must check it yourself.

```typescript
// lib/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    // Throwing tells TanStack Query that the request failed
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

## A query with loading, error and empty states

```tsx
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Pressable, Text, View }
  from 'react-native';
import { getJson } from '../lib/api';

type Product = { id: string; name: string; price: number };

export default function ProductsScreen() {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useQuery({
      queryKey: ['products'],                       // the cache key
      queryFn: () => getJson<Product[]>('/products'),
    });

  if (isPending) return <ActivityIndicator style={{ flex: 1 }} />;

  if (isError) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Could not load products. {error.message}</Text>
        <Pressable onPress={() => refetch()}><Text>Try again</Text>
        </Pressable>
      </View>
    );
  }
  // The success case comes next
}
```

When the data has arrived, the same component returns the list. This `return` replaces the comment above.

```tsx
  return (
    <FlatList
      data={data}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <Text>{item.name} - Rs {item.price}</Text>}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListEmptyComponent={<Text>No products found</Text>}
    />
  );
```

Every data screen has four states. Design all four, not only the happy one.

| State | What the user should see |
|---|---|
| Loading | A spinner or grey placeholder shapes |
| Error | A clear message and a "Try again" button |
| Empty | A friendly line that explains there is nothing yet |
| Success | The data |

:::warn The error state that nobody built
Beginners test on fast office Wi-Fi and never see a failed request. The first user on a weak network gets an endless spinner or a blank page. Turn on airplane mode and open every screen of your app. Each one should say what went wrong and offer a retry.
:::

## Fresh, stale and the query key

The **query key** is the name of a drawer in the cache. `['products']` is one drawer. `['product', '42']` is another. If two components use the same key, they share one request and one copy of the data. Put every value that the request depends on into the key.

```tsx
function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],                 // a new id is a new entry
    queryFn: () => getJson<Product>(`/products/${id}`),
    enabled: !!id,                             // do not run without an id
  });
}
```

Two time settings decide how the cache behaves.

| Setting | Meaning |
|---|---|
| `staleTime` | How long data counts as **fresh**. Fresh data is shown with no new request |
| `gcTime` | How long unused data stays in memory before it is thrown away |

**Stale** means "maybe old". Stale data is still shown at once, and a new request runs quietly in the background. When the answer arrives, the screen updates. This pattern is called **stale-while-revalidate**.

:::example Dry run: opening the products screen three times
`staleTime` is 1 minute.

| Time | Action | What the user sees | Network |
|---|---|---|---|
| 10:00:00 | First visit | Spinner, then the list | 1 request |
| 10:00:30 | Visit again | The list at once | No request, data is fresh |
| 10:05:00 | Visit again | The old list at once, then it updates quietly | 1 background request |

In the third visit there is no spinner. The user never waits for data they already have.
:::

## Changing data with a mutation

A **query** reads data. A **mutation** changes data on the server: create, update or delete.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

async function addToCart(productId: string) {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Could not add to cart');
  return res.json();
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // The cart on the server changed, so our copy is now old.
      // Mark it stale. Screens that show it will fetch it again.
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// In a component:
// const addMutation = useAddToCart();
// <Pressable disabled={addMutation.isPending}
//            onPress={() => addMutation.mutate(product.id)} />
```

:::flow The life of a mutation
User taps | Add to cart
mutate() | isPending is true
Server saves | returns 200
invalidateQueries | cart marked stale
Cart refetches | screen updates
:::

## Infinite scroll with useInfiniteQuery

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

type Page = { items: Product[]; nextPage: number | null };

export function useProductPages() {
  return useInfiniteQuery({
    queryKey: ['products', 'pages'],
    queryFn: ({ pageParam }) =>
      getJson<Page>(`/products?page=${pageParam}`),
    initialPageParam: 1,
    // Return undefined when there are no more pages
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
}

// In the screen:
// const q = useProductPages();
// const products = q.data?.pages.flatMap((p) => p.items) ?? [];
// <FlatList data={products}
//   onEndReached={() => {
//     if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
//   }} />
```

The `if` inside `onEndReached` is the guard from the lists chapter. It stops duplicate requests when the event fires many times.

## Two settings that matter on mobile

On the web, TanStack Query refetches when the browser tab gets focus and when the network comes back. A phone has no browser tab, so you connect these two signals yourself, once, at app start.

```typescript
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

// Tell the library when the device goes online or offline
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected)),
);

// Tell the library when the app comes back to the foreground
AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});
```

`NetInfo` comes from `@react-native-community/netinfo`, a library that reports the network state. `AppState` tells you if the app is active or in the background.

:::interview Why use TanStack Query instead of useEffect with fetch?
"`useEffect` with `fetch` gives me only the request. I would have to build loading and error state, caching, de-duplication of the same request from two screens, retries, background refresh and pagination myself, and handle race conditions. TanStack Query gives all of this with a query key and a query function. It shows cached data instantly and refreshes in the background, so the app feels fast on a slow network. I still use `useState` for local UI state and a small store for client state. TanStack Query is for server state."
:::

:::revise
- Local UI state: `useState`. Shared client state: Context or Zustand. Server state: TanStack Query.
- `fetch` does not throw on 404 or 500. Check `res.ok` and throw yourself.
- Build four states for every data screen: loading, error, empty and success.
- The query key is the cache address. Put every input of the request into it.
- After a mutation, call `invalidateQueries` so screens load the new data.
- On mobile, connect `onlineManager` to NetInfo and `focusManager` to `AppState`.
:::

# Local storage and offline-first

*Where to save data on the phone, which storage is safe for secrets, and how to make an app that keeps working without internet.*

## Why it matters

When the user closes the app, everything in memory is gone: state, cache, variables. If you want something to be there the next time, you must write it to the phone's storage.

Think of your own things at home. Your everyday items lie on an open shelf. Your gold and documents are in a locker. Your account books are in a neat register with rows and columns. You do not keep gold on the shelf, and you do not keep ten thousand bills in the locker. A phone has the same three places.

## The three storage choices

| | AsyncStorage | SecureStore | expo-sqlite |
|---|---|---|---|
| What it is | Simple key and value store | Encrypted key and value store | A real SQL database |
| Encrypted | No | Yes, by the system | No, by default |
| Good for | Settings, flags, small caches | Tokens, secrets | Lists, relations, search |
| Size | Small to medium | Very small values | Large |
| Query by field | No | No | Yes |

A quick rule:

- Is it a secret? Use **SecureStore**.
- Is it a small setting? Use **AsyncStorage**.
- Is it many records that you filter, sort or join? Use **expo-sqlite**.

## AsyncStorage: the open shelf

It stores **strings** under string keys. Install it with `npx expo install @react-native-async-storage/async-storage`. For objects, convert to JSON text first.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

type Settings = { darkMode: boolean; language: string };

export async function saveSettings(settings: Settings) {
  // Only strings can be stored, so turn the object into JSON text
  await AsyncStorage.setItem('settings', JSON.stringify(settings));
}

export async function loadSettings(): Promise<Settings | null> {
  const raw = await AsyncStorage.getItem('settings');
  // The key does not exist on the first launch, so raw is null
  return raw ? (JSON.parse(raw) as Settings) : null;
}

export async function clearSettings() {
  await AsyncStorage.removeItem('settings');
}
```

Every call is asynchronous. It returns a promise, so you must `await` it.

:::note
The AsyncStorage library has published a newer major version with a different way to create a storage instance. The `getItem`, `setItem` and `removeItem` ideas stay the same. Check the library's current docs for the import style that matches your installed version.
:::

:::warn Saving a token in AsyncStorage
AsyncStorage is plain, unencrypted text inside the app's folder. On a rooted or jailbroken phone, or from a device backup, it can be read. A login token in AsyncStorage is like a house key under the doormat. Put tokens, passwords and any secret in SecureStore.
:::

## SecureStore: the locker

`expo-secure-store` saves values in the secure storage of the system: the **Keychain** on iOS and storage protected by the **Keystore** on Android. The data is encrypted, and other apps cannot read it.

```typescript
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  // Returns the string, or null if nothing is saved
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

SecureStore is made for **small** values such as tokens. Do not store a list of products in it. Very large values may be rejected on some devices. The library can also ask for Face ID or a fingerprint before reading a value. Check the current Expo docs for that option.

## expo-sqlite: the register

**SQLite** is a small SQL database that lives in one file inside your app. There is no server. You can store thousands of rows and ask questions such as "all unpaid orders from this week, newest first".

```typescript
import * as SQLite from 'expo-sqlite';

export type Note = { id: string; title: string; done: number };

// Opens the file, or creates it the first time
const dbPromise = SQLite.openDatabaseAsync('app.db');

export async function setupDb() {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function addNote(id: string, title: string) {
  const db = await dbPromise;
  // The ? marks are placeholders. Values are passed separately
  await db.runAsync('INSERT INTO notes (id, title) VALUES (?, ?)',
                    [id, title]);
}

export async function getOpenNotes() {
  const db = await dbPromise;
  return db.getAllAsync<Note>(
    'SELECT * FROM notes WHERE done = 0 ORDER BY title');
}
```

SQLite has no boolean type, so `done` is stored as `0` or `1`.

:::warn Building SQL with string joins
Never write `` `... WHERE title = '${text}'` ``. If the text contains a quote mark, the query breaks. It also allows **SQL injection**, where typed text is run as SQL. Always use `?` placeholders and pass the values in an array. The database then treats them only as data.
:::

:::note
The `expo-sqlite` API was redesigned some time ago. Old tutorials use `openDatabase` with callbacks and `transaction`. The current API uses `openDatabaseAsync` and async methods as shown here, and also offers a `SQLiteProvider` component with a `useSQLiteContext` hook. Check the current Expo docs if a method name differs in your SDK.
:::

## Offline-first: the idea

Most apps are "online-first". Every tap waits for the server. No network means no app.

An **offline-first** app turns this around. The local database is the main source for the screen. The network is used only to **sync** (to make the phone and the server agree again).

Think of a postman. You drop your letter into the letter box and go home. You do not stand there until the letter is delivered. The box keeps the letters safely. When the van comes, they are sent in order. In our app the letter box is a table called the **outbox** or **sync queue**.

:::flow Offline-first write
User action | add a note
Local DB | save at once
Outbox | queue the change
Sync worker | when online
Server | confirms, row removed
:::

## A sync queue step by step

First add an `outbox` table for the queue. It has five columns: `id` (also used as the idempotency key), `type` (for example `note.create`), `payload` (the change as JSON text), `created_at` (to keep the order) and `attempts` (a counter that starts at 0).

When the user does something, write the local row and the queue row **together**. A **transaction** makes sure that both writes happen, or neither does.

```typescript
import * as Crypto from 'expo-crypto';

export async function createNoteOffline(title: string) {
  const db = await dbPromise;
  const noteId = Crypto.randomUUID();   // ID made on the phone
  const jobId = Crypto.randomUUID();
  const payload = JSON.stringify({ id: noteId, title });

  await db.withTransactionAsync(async () => {
    // 1. The screen reads from this table, so the note shows at once
    await db.runAsync('INSERT INTO notes (id, title) VALUES (?, ?)',
                      [noteId, title]);
    // 2. Remember that the server does not know about it yet
    await db.runAsync(
      `INSERT INTO outbox (id, type, payload, created_at)
       VALUES (?, ?, ?, ?)`,
      [jobId, 'note.create', payload, Date.now()]);
  });
}
```

The ID is created on the phone as a **UUID** (a long random ID that is practically unique). The phone cannot wait for the server to hand out an ID, because the server may not be reachable.

Next is the worker that empties the queue.

```typescript
type Job = { id: string; type: string; payload: string };
let syncing = false;                     // only one sync at a time

export async function syncOutbox() {
  if (syncing) return;
  syncing = true;
  const db = await dbPromise;
  try {
    const jobs = await db.getAllAsync<Job>(
      'SELECT * FROM outbox ORDER BY created_at LIMIT 20');
    for (const job of jobs) {
      const res = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                   'Idempotency-Key': job.id },
        body: JSON.stringify({ type: job.type, data: job.payload }),
      });
      if (res.ok) {
        await db.runAsync('DELETE FROM outbox WHERE id = ?', [job.id]);
      } else {
        await db.runAsync(
          'UPDATE outbox SET attempts = attempts + 1 WHERE id = ?',
          [job.id]);
        break;                           // keep the order, retry later
      }
    }
  } catch {
    // No network: do nothing. The jobs stay in the queue
  } finally {
    syncing = false;
  }
}
```

Finally, decide when to run `syncOutbox`: when the app starts, when it comes to the foreground, and when the network comes back. For the last one, use `NetInfo.addEventListener` and start the sync when `state.isConnected` is true.

:::example Dry run: adding two notes inside a tunnel
| Time | Event | `notes` table | `outbox` table |
|---|---|---|---|
| 1 | Offline. User adds "Buy milk" | 1 row | 1 job |
| 2 | Offline. User adds "Call Amma" | 2 rows | 2 jobs |
| 3 | The screen shows both notes at once | 2 rows | 2 jobs |
| 4 | Network returns, sync starts | 2 rows | 2 jobs |
| 5 | Server accepts job 1 | 2 rows | 1 job |
| 6 | Server accepts job 2 | 2 rows | 0 jobs |

The user never saw a spinner or an error. If the app is killed at time 3, nothing is lost. Both tables are on disk, and the sync continues at the next launch.
:::

## The hard parts, honestly

A sync queue is simple to start with and hard to make perfect. Know these problems before you promise "full offline support".

| Problem | What it means | Common answer |
|---|---|---|
| Duplicate sends | The request reached the server but the reply was lost, so the app sends it again | An **idempotency key**: the server remembers each job ID and ignores a repeat |
| Conflicts | Two devices changed the same record | "Last write wins" using a timestamp, or ask the user |
| Poison job | A job fails every time and blocks the queue | Count attempts, then move it aside and show an error |
| Server changes | Other people changed data | Pull changes "since my last sync time" |

**Idempotent** means: doing the same thing twice has the same result as doing it once. Pressing the lift button five times still calls the lift only once.

:::warn Not everything should work offline
A payment, a ticket booking or a stock check needs the real, current answer from the server. Queueing a payment and sending it two hours later is dangerous. Make reading, drafts and simple edits work offline. For critical actions, tell the user clearly that internet is needed.
:::

:::interview How would you design an offline-first feature?
"The UI reads from and writes to a local database, so it is instant and works without a network. Every write also adds a row to an outbox table in the same transaction. A sync worker runs when the app starts, comes to the foreground or gets connectivity. It sends the queued jobs in order and removes each one only after the server confirms. IDs are generated on the client as UUIDs, and each job carries an idempotency key, so a retry cannot create duplicates. For conflicts I start with last-write-wins using timestamps and use a stricter rule where the data is important. Actions like payments stay online-only."
:::

:::revise
- AsyncStorage: unencrypted strings for small settings. Use `JSON.stringify` for objects.
- SecureStore: encrypted by the system, for small secrets such as tokens.
- expo-sqlite: a real database for large, structured data. Always use `?` placeholders.
- Offline-first: write to the local database first, queue the change, sync later.
- Write the data row and the outbox row in one transaction.
- Use client-made UUIDs and idempotency keys so that retries do not create duplicates.
:::

# Gestures and animations with Reanimated

*Smooth, finger-following motion that runs on the UI thread, with a full swipe-to-dismiss card example.*

## Why it matters

A good mobile app feels alive. A card follows your finger. A sheet slides up with a soft bounce. A deleted row slides away. These small motions tell the user what happened. Without them the app works but feels like a form on a government portal.

Now remember the film set from the first chapter. If the director (the JS thread) must approve every single frame of a moving card, the card stops whenever the director is busy with an API response. The fix is to hand the crew a small written instruction once: "keep the card under the finger". Then the crew does not need the director for each frame. That written instruction is called a **worklet**.

## The idea

Two libraries work together. Both are part of the default Expo template or can be added with `npx expo install`.

| Library | Its job |
|---|---|
| `react-native-gesture-handler` | Recognises touches: tap, pan (drag), pinch, long press, fling |
| `react-native-reanimated` | Runs animations and style updates on the UI thread |

React Native also has a built-in `Animated` API. It is fine for a simple fade. For gestures and anything that follows the finger, Reanimated is the standard choice because the work runs on the UI thread.

Four words to learn:

- **Shared value**: a box holding a number (or another value) that both the JS thread and the UI thread can read and write. You create it with `useSharedValue` and use it through `.value`.
- **Animated style**: a style that is calculated from shared values. You create it with `useAnimatedStyle`.
- **Animation function**: `withTiming` and `withSpring` change a shared value smoothly instead of in one jump.
- **Worklet**: a small JavaScript function that Reanimated copies to the UI thread and runs there.

## Your first animation

```tsx
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';

export function PulseButton() {
  const scale = useSharedValue(1);          // starts at normal size

  // Runs on the UI thread every time scale.value changes
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.9); }}   // shrink
      onPressOut={() => { scale.value = withSpring(1); }}>
      {/* Animated styles work only on Animated components */}
      <Animated.View style={[{ padding: 16 }, animatedStyle]}>
        <Text>Press and hold me</Text>
      </Animated.View>
    </Pressable>
  );
}
```

Three things to notice:

1. A change of `scale.value` does **not** re-render the component. A shared value is not React state. This is the reason it is fast.
2. The view must be `Animated.View`, not a normal `View`. There are also `Animated.Text`, `Animated.Image` and `Animated.ScrollView`.
3. Writing `scale.value = withSpring(0.9)` does not set the value to 0.9 at once. It starts an animation that moves towards 0.9.

## withTiming and withSpring

| | `withTiming` | `withSpring` |
|---|---|---|
| How it moves | A fixed duration and curve | Like a real spring, by physics |
| You control | `duration`, `easing` | `damping`, `stiffness`, `mass` |
| Feels like | Calm and exact | Natural, a little bouncy |
| Good for | Fades, progress bars, exits | Things that follow a finger |

A spring has one extra advantage. It continues from the current speed, so if the user lets go of a moving card, the motion stays smooth.

## Worklets: why the code runs on the UI thread

Reanimated creates a second, small JavaScript environment on the UI thread. A **worklet** is a function that is copied into that environment. The functions you pass to `useAnimatedStyle` and to gesture callbacks are turned into worklets automatically by a Babel plugin. In Expo this plugin is already set up for you.

:::flow How a worklet moves a card
Finger moves | UI thread gets the touch
Worklet runs | on the UI thread
Style updates | in the same frame
JS thread | not needed
:::

Because a worklet lives on the UI thread, it does not wait for your React code. Even if the JS thread is busy parsing a big API response, the card still follows the finger at full speed.

There is one rule. A worklet cannot directly call a normal JavaScript function from your component, such as `setState`, a navigation call or an API call. Those live on the JS thread. To call them, you schedule them with `runOnJS`.

```tsx
import { runOnJS } from 'react-native-reanimated';

// Inside a gesture callback or animation callback (a worklet):
runOnJS(onDismiss)(cardId);   // runs onDismiss(cardId) on the JS thread
```

:::note
In the newest Reanimated versions the worklet engine lives in a separate package named `react-native-worklets`, and that package offers a newer helper for the same job as `runOnJS`. The idea is unchanged: UI thread code must schedule calls to the JS thread. Check the current Reanimated docs for the import your version expects.
:::

## Setting up gestures

Wrap the whole app once in `GestureHandlerRootView`. Without it, gestures do nothing.

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    // flex: 1 is needed, or the app has no height
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}
```

You describe a gesture with the `Gesture` object and attach it to a view with `GestureDetector`.

## Example: a swipe-to-dismiss card

The goal: the user drags a card left or right. If they drag far enough or flick fast enough, the card flies off the screen and is removed. Otherwise it springs back to the centre.

First the values and the gesture.

```tsx
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation, interpolate, runOnJS, useAnimatedStyle,
  useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';

type Props = { title: string; onDismiss: () => void };
```

The component keeps one shared value and describes the pan gesture.

```tsx
export function SwipeCard({ title, onDismiss }: Props) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);     // how far the card has moved
  const limit = width * 0.3;                // 30% of the screen width

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])               // start only on sideways drag
    .onUpdate((e) => {
      translateX.value = e.translationX;    // follow the finger
    })
    .onEnd((e) => {
      const farEnough = Math.abs(translateX.value) > limit;
      const fastEnough = Math.abs(e.velocityX) > 800;
      if (farEnough || fastEnough) {
        const direction = translateX.value > 0 ? 1 : -1;
        // Fly out, then tell React to remove the card
        translateX.value = withTiming(
          direction * width, { duration: 200 },
          (finished) => { if (finished) runOnJS(onDismiss)(); });
      } else {
        translateX.value = withSpring(0);   // not enough: go back
      }
    });
  // The style and the JSX follow in the next block
}
```

Now the style and the JSX, which complete the same component.

```tsx
  const cardStyle = useAnimatedStyle(() => {
    // Turn the distance into a small rotation and a fade
    const rotate = interpolate(
      translateX.value, [-width, 0, width], [-12, 0, 12]);
    const opacity = interpolate(
      Math.abs(translateX.value), [0, width], [1, 0.3],
      Extrapolation.CLAMP);                 // stay between 1 and 0.3
    return {
      opacity,
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </GestureDetector>
  );
```

Here `styles.card` and `styles.title` are normal `StyleSheet` entries with padding, a border radius and a background colour. `interpolate` maps one range of numbers to another. Here, a movement from `-width` to `width` becomes a rotation from -12 to 12 degrees. `Extrapolation.CLAMP` stops the output at the ends of the range, so the opacity never goes below 0.3.

:::example Dry run: two swipes on a screen 400 units wide
The limit is 30% of 400, which is 120.

| Swipe | Finger moved | Speed at release | Check | Result |
|---|---|---|---|---|
| A | 60 to the right | 200 | 60 > 120 is false, 200 > 800 is false | Springs back to 0 |
| B | 150 to the right | 300 | 150 > 120 is true | Flies to 400, then `onDismiss` |
| C | 50 to the left | 1200 | 50 > 120 is false, 1200 > 800 is true | Flies to -400, then `onDismiss` |

While the finger was at 150, the rotation was `150 / 400 * 12`, which is 4.5 degrees. All of this was calculated on the UI thread. The JS thread got only one message at the very end: `onDismiss`.
:::

The parent removes the card from its state inside `onDismiss`, for example with `setCards((list) => list.filter((c) => c.id !== card.id))`.

:::warn Calling a normal function from a worklet
If you write `onDismiss()` directly inside `.onEnd`, the app will crash or show an error, because `onDismiss` lives on the JS thread and the callback runs on the UI thread. Use `runOnJS(onDismiss)()`. The opposite mistake is also common: reading `sharedValue.value` during render and expecting the component to update. It will not. Read shared values inside `useAnimatedStyle`, not in the JSX.
:::

:::warn A horizontal swipe inside a vertical list
A pan gesture on a row can steal the touch, so the list stops scrolling. `activeOffsetX([-10, 10])` tells the gesture to start only after 10 units of sideways movement. A mostly vertical movement is left to the list. For the common "swipe a row to show a delete button" pattern, Gesture Handler ships a ready swipeable row component. Check its docs before you build your own.
:::

:::interview Why does Reanimated run animations on the UI thread?
"An animation must produce a new frame about every 16 milliseconds. If each frame is calculated on the JS thread, any busy moment there, such as a re-render or JSON parsing, drops frames. Reanimated keeps animation state in shared values and runs the style calculation in worklets, which are small JavaScript functions executed in a separate runtime on the UI thread. Gesture events also arrive on the UI thread, so the whole loop from touch to style update never waits for the JS thread. I call `runOnJS` only when I need React state or navigation at the end."
:::

:::interview What is the difference between a shared value and React state?
React state lives on the JS thread, and changing it re-renders the component. A shared value can be read and written from both threads through `.value`, and changing it does not re-render anything. It only updates the animated styles that use it. So I use state for data that changes what is rendered, and shared values for numbers that change many times per second, such as a position, a scale or an opacity.
:::

:::revise
- Gesture Handler recognises touches. Reanimated animates on the UI thread.
- A shared value (`useSharedValue`) is read with `.value` and does not cause re-renders.
- `useAnimatedStyle` builds a style from shared values. Use it on `Animated.View`.
- `withTiming` is duration based. `withSpring` is physics based and feels natural.
- Worklets run on the UI thread. Use `runOnJS` to call React code from them.
- Wrap the app in `GestureHandlerRootView` with `flex: 1`.
:::

# Images, camera and permissions

*Show pictures efficiently, let the user pick or take a photo, and ask for permissions in a way users accept.*

## Why it matters

Pictures are usually the heaviest thing in an app. One photo from a modern phone camera can be several megabytes. Ten of them in a list can use more memory than the rest of the app together. Handled badly, images cause slow scrolling, high data use and crashes on cheap phones.

Permissions are the other half. A phone guards the camera, photos, location and contacts. Think of visiting someone's home. You do not walk straight into the kitchen. You ask, and you say why. If you ask politely at the right moment, people say yes.

## Showing images

There are two kinds of image source.

```jsx
import { Image } from 'react-native';

// 1. Local: bundled inside the app. The size is known at build time
<Image source={require('../assets/logo.png')} />

// 2. Remote: loaded from a URL. You MUST give a width and a height
<Image
  source={{ uri: 'https://example.com/photos/42.jpg' }}
  style={{ width: 120, height: 120, borderRadius: 12 }}
/>
```

:::warn The invisible remote image
A remote image without `width` and `height` is drawn with size 0 by 0. Nothing shows, and there is no error. React Native cannot know the size of a picture before it is downloaded. Give it a fixed size, or a width plus `aspectRatio`, for example `{ width: '100%', aspectRatio: 16 / 9 }`.
:::

## expo-image for real apps

The built-in `Image` is basic. `expo-image` is a stronger component with disk caching, placeholders and smooth transitions. Install it with `npx expo install expo-image`.

```jsx
import { Image } from 'expo-image';

export function ProductPhoto({ url }) {
  return (
    <Image
      source={url}
      style={{ width: '100%', aspectRatio: 1, borderRadius: 12 }}
      contentFit="cover"          // fill the box and crop the extra part
      transition={200}            // fade in over 200 ms
      cachePolicy="memory-disk"   // keep it for the next app launch
    />
  );
}
```

`expo-image` can also show a blurred placeholder while the real picture loads. Check the Expo docs for the `placeholder` prop.

:::tip The biggest image win is on the server
Do not download a 4000 pixel wide photo to show it in a 100 unit wide box. Ask your backend or image CDN for a smaller version, such as a thumbnail for lists and a medium size for detail screens. This saves data, memory and time, and no setting in the app can match it.
:::

## How permissions work

| | iOS | Android |
|---|---|---|
| When the user is asked | When your code requests it | When your code requests it |
| Reason text | Required in the app config | Optional, in your own screen |
| If denied | The system will not ask again | Can ask again, then it stops too |
| After a final denial | User must open Settings | User must open Settings |

The key fact: you get very few chances. On iOS the system dialog appears **once**. If the user taps "Don't Allow", calling the request again shows nothing. So do not waste that one chance at app start, before the user knows why you need it.

:::flow A good permission flow
User taps a feature | Scan QR code
Your screen explains | why the camera is needed
System dialog | allow or deny
Granted | open the camera
Denied | show a button to Settings
:::

A permission result has three useful fields: `granted`, `status` and `canAskAgain`. When `canAskAgain` is `false`, the system dialog will not appear again.

The reason texts for iOS are set in `app.json` through the config plugin of each library.

```json
{
  "expo": {
    "plugins": [
      ["expo-image-picker", {
        "photosPermission": "Allow access to choose a profile photo.",
        "cameraPermission": "Allow the camera to take a profile photo."
      }]
    ]
  }
}
```

A change here is a native change, so you need a new build to see it. App reviewers reject apps with vague reasons such as "Camera needed". Say what the user gets.

## Picking an image from the gallery

`expo-image-picker` opens the system's own photo picker or camera screen. Install it with `npx expo install expo-image-picker`.

```tsx
import * as ImagePicker from 'expo-image-picker';

export async function pickPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],   // only pictures, no videos
    allowsEditing: true,      // let the user crop
    aspect: [1, 1],           // square crop
    quality: 0.7,             // compress: 0 is smallest, 1 is best
  });

  // The user closed the picker without choosing
  if (result.canceled) return null;

  // A local file address, for example file:///.../photo.jpg
  return result.assets[0].uri;
}
```

On current Android and iOS versions, the system photo picker runs outside your app and returns only the photos the user selected. So opening the gallery normally needs no permission request.

:::note
The shape of the `mediaTypes` option has changed between SDK versions. Older code uses `ImagePicker.MediaTypeOptions.Images`. If TypeScript complains, check the current Expo docs for `expo-image-picker`.
:::

## Taking a photo with the camera

The camera does need a permission.

```tsx
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export async function takePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();

  if (!perm.granted) {
    if (!perm.canAskAgain) {
      // The system will not show its dialog again. Guide the user
      Alert.alert('Camera is blocked',
        'Please allow camera access in Settings.',
        [{ text: 'Cancel' },
         { text: 'Open Settings', onPress: () => Linking.openSettings() }]);
    }
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  return result.canceled ? null : result.assets[0].uri;
}
```

If you need a camera **inside** your own screen, for example a QR scanner or a custom frame around a document, use `expo-camera`. It gives you a camera view component and a permission hook. Its API was redesigned in recent SDKs, so follow the current Expo docs for it.

## Uploading the photo

The picker gives you a local file address. To send the file to a server, use `FormData`, the standard format for file uploads.

```typescript
export async function uploadAvatar(uri: string, token: string) {
  const form = new FormData();
  // React Native accepts this object shape for a file
  form.append('avatar', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${API_URL}/me/avatar`, {
    method: 'POST',
    // Do not set Content-Type yourself. fetch adds it with the
    // boundary string that separates the parts of the form
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
```

:::example Dry run: changing the profile photo
| Step | What happens | What the user sees |
|---|---|---|
| 1 | User taps "Change photo" | A sheet: Camera or Gallery |
| 2 | User chooses Camera. `requestCameraPermissionsAsync` runs | The system dialog, the first time only |
| 3 | User allows. `launchCameraAsync` opens | The camera |
| 4 | User takes the photo. `result.assets[0].uri` is returned | The new photo is shown at once from the local file |
| 5 | `uploadAvatar` runs | A small progress sign on the photo |
| 6 | Server answers with the new URL | The sign disappears |

If the upload fails at step 5, keep the local photo on the screen and show "Retry". Do not throw away the user's work.
:::

:::interview How do you handle permissions in a mobile app?
"I ask at the moment the user needs the feature, not at app launch, and I first explain the reason in my own UI. Then I request the permission and check the result. If it is granted, I continue. If it is denied but I can ask again, I simply let the user try later. If `canAskAgain` is false, the system dialog will not appear any more, so I show a message with a button that opens the app settings through `Linking.openSettings()`. On iOS I also provide a clear usage description in the app config, because Apple rejects apps with missing or vague texts. And the app must still be usable when the user says no."
:::

:::revise
- A remote image needs explicit dimensions, or it is invisible.
- `expo-image` adds caching, placeholders and transitions. Load images at display size.
- Ask for a permission when the feature is used, and explain why first.
- On iOS the system dialog appears once. After that, send the user to Settings.
- `result.canceled` and `result.assets[0].uri` are the two things to read from the picker.
- Upload with `FormData` and do not set the `Content-Type` header yourself.
:::

# Push notifications

*How a message travels from your server to a locked phone, how to set it up with expo-notifications, and what push cannot promise.*

## Why it matters

Your app is closed most of the day. A push notification is the only way to reach the user at that time: "Your order is out for delivery", "Your OTP is 4821", "Class starts in 10 minutes". Used well, it brings users back. Used badly, it makes them turn notifications off or uninstall the app.

Many beginners think the server talks to the phone directly. It does not. Think of sending a parcel by courier. You do not carry the parcel to the house yourself. You give it to the courier company with an address. Only the courier company can enter that locality. For phones there are exactly two courier companies, and each one serves its own area.

## The idea

| Term | Meaning |
|---|---|
| **APNs** | Apple Push Notification service. The only way to push to an iPhone |
| **FCM** | Firebase Cloud Messaging, from Google. The usual way to push to Android |
| **Device token** | The address of one app on one device, given by APNs or FCM |
| **Expo push token** | An address from Expo that works for both platforms |
| **Expo push service** | A free relay by Expo. You call one API and it talks to APNs and FCM |

There are two kinds of notification.

- A **local notification** is scheduled by the app itself on the device, such as a reminder at 8 pm. No server and no internet are needed.
- A **remote (push) notification** is sent from a server through APNs or FCM.

:::flow How a push notification travels
Your server | order shipped
Expo push service | one API for both
APNs or FCM | Apple or Google
Phone | system shows it
Your app | opens on tap
:::

## Setup facts before the code

- Use a **real device** for testing push. Simulators and emulators have limits.
- Use a **development build**. Remote push does not work in Expo Go on Android in current SDK versions, and Expo Go does not use your own app ID anyway.
- You need **credentials**: an FCM setup for Android and a push key from your Apple Developer account for iOS. EAS can create and store most of these for you. The steps change from time to time, so follow the current Expo push notification setup guide.

```bash
npx expo install expo-notifications expo-device expo-constants
```

## Step 1: decide how notifications look in the foreground

By default, a notification that arrives while the app is open is not shown as a banner. You choose the behaviour with a handler. Set it once, at the top level of your app.

```typescript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,    // show the banner at the top
    shouldShowList: true,      // keep it in the notification list
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

:::note
The field names in this handler have changed between SDK versions. Older code uses `shouldShowAlert`. If TypeScript reports an unknown field, check the current `expo-notifications` docs.
:::

## Step 2: ask permission and get the token

```typescript
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null;       // not a real device

  if (Platform.OS === 'android') {
    // Android needs a channel. Create it before asking permission
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;   // the user said no

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;                       // "ExponentPushToken[...]"
}
```

A **channel** is an Android idea. It is a named category of notifications, such as "Orders" or "Offers". The user can mute each channel separately in the system settings. The `projectId` is your EAS project ID. It is added to the app config when you set up EAS.

## Step 3: send the token to your server

The token is useless on the phone. Your server needs it, linked to the user.

Send it with a normal authenticated POST request after login, and again on later app starts, because a token can change. One user can have many devices, so the server should store a **list** of tokens for each user. On logout, tell the server to delete this device's token. If you forget, the next person who signs in on that phone gets the old user's notifications.

## Step 4: react when the user taps

```tsx
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export function useNotificationTaps() {
  const router = useRouter();

  useEffect(() => {
    // Fires when the user taps a notification
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        // The server puts a path in data, for example "/orders/42"
        if (typeof data?.url === 'string') router.push(data.url);
      });

    return () => sub.remove();   // clean up the listener
  }, [router]);
}
```

There is also `addNotificationReceivedListener`, which fires when a notification arrives while the app is open. For the case where a tap **starts** a closed app, the library has a way to read the last notification response. Check the Expo docs for the current function or hook name.

## Step 5: send from your server

```javascript
// Node.js on your backend. Never do this from the app itself
async function sendPush(expoPushToken, orderId) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: expoPushToken,
      title: 'Order shipped',
      body: 'Your order is on the way.',
      data: { url: `/orders/${orderId}` },   // read by the app on tap
    }),
  });
  const result = await res.json();
  // result holds a "ticket" for the message. It says whether Expo
  // accepted it, not whether the phone received it
  return result;
}
```

Expo answers with a **ticket**. Some time later you can ask Expo for the **receipt** of that ticket, which tells you if APNs or FCM accepted the message. If the receipt has the error `DeviceNotRegistered`, the app was uninstalled or the token is dead. Delete that token from your database. Expo also provides a server library for Node.js that handles batching and receipts.

:::example Dry run: "Your order is shipped"
| Step | Who | What happens |
|---|---|---|
| 1 | App | After login, gets `ExponentPushToken[abc]` and sends it to the server |
| 2 | Server | Stores the token in the list for user 17 |
| 3 | Server | The order status changes. It loads the tokens of user 17 |
| 4 | Server | Sends a POST to the Expo push service with title, body and data |
| 5 | Expo | Returns a ticket and forwards the message to FCM or APNs |
| 6 | Phone | The system shows the notification. The app is not even running |
| 7 | User | Taps it. The app opens, the listener reads `data.url` and opens `/orders/42` |
:::

## Honest limits of push

Push is **best effort**. That means the system tries, but nobody promises delivery.

| Limit | What it means for you |
|---|---|
| No delivery promise | A message can arrive late or never |
| The user can refuse | On iOS and on new Android versions the user must allow notifications |
| Battery savers | Some Android phone makers stop background apps hard, which delays messages |
| Force stop | An Android app that the user force-stopped gets nothing until it is opened again |
| Offline device | The service keeps a message only for a limited time |
| Small payload | The data size is limited to a few kilobytes |
| Extra relay | With Expo push there is one more service between you and the phone |

:::warn Using push as your only source of truth
Do not build logic like "the order screen updates only when the push arrives". If the push is lost, the screen is wrong forever. Treat a push as a doorbell, not as the parcel. The bell says "something changed". When the app opens, it must fetch the real data from the server. With TanStack Query, you can invalidate the right query when a notification arrives.
:::

:::interview Explain how push notifications work end to end.
"The app asks the user for permission and registers with the platform push service: APNs on iOS, FCM on Android. It gets a device token. With Expo, I get an Expo push token, which hides the difference between the platforms. The app sends this token to my backend, which stores it for the user. When something happens, the backend calls the Expo push service, or APNs and FCM directly, with the token and the payload. The platform service delivers it to the device, and the operating system shows it even if the app is closed. When the user taps it, my app reads the data in the payload and navigates to the right screen. Delivery is best effort, so the app always fetches the real data from the API."
:::

:::revise
- Remote push goes: your server, then APNs or FCM (often through Expo), then the phone.
- Flow in the app: permission, token, send the token to your server, handle taps.
- Android needs a notification channel. Remote push needs a real device and a development build.
- Store many tokens per user, refresh them, and delete them on logout and on `DeviceNotRegistered`.
- Push is best effort. Use it as a signal and fetch the real data from the API.
- Ask for permission at a useful moment, not on the first screen.
:::

# Authentication with secure token storage

*A complete login flow: tokens, safe storage, automatic refresh, protected screens and a clean logout.*

## Why it matters

Almost every real app has "my" data: my orders, my profile, my chats. The server must know who is asking. Authentication is how the app proves "this request comes from Ravi".

Think of an amusement park. At the gate you show your ID and pay once. You get a wristband. After that, each ride checks only the wristband, not your ID again. The wristband is valid for one day. If someone steals it, they can use it only until it expires.

## The idea

A **token** is that wristband: a long string that the server gives after a correct login. The app sends it with every request. Most apps use two tokens.

| | Access token | Refresh token |
|---|---|---|
| Purpose | Sent with every API request | Used only to get a new access token |
| Lifetime | Short, often minutes | Long, often days or weeks |
| If stolen | Useful for a short time | Serious, so the server must be able to cancel it |
| Where to keep | In memory (and optionally SecureStore) | SecureStore only |

Why two tokens? A short access token limits the damage if it leaks. A long refresh token means the user does not have to type the password every fifteen minutes.

:::flow Login and later requests
Login screen | email and password
Server checks | returns two tokens
SecureStore | tokens saved encrypted
API request | Bearer access token
401 received | refresh and retry once
:::

## Step 1: a token module

Keep the access token in a variable (fast to read) and the refresh token in SecureStore (safe and permanent).

```typescript
// lib/tokens.ts
import * as SecureStore from 'expo-secure-store';

const REFRESH_KEY = 'refresh_token';
let accessToken: string | null = null;     // lives only in memory

export const getAccessToken = () => accessToken;

export async function setTokens(access: string, refresh: string) {
  accessToken = access;
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens() {
  accessToken = null;
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
```

## Step 2: an API helper that refreshes by itself

When the access token expires, the server answers with status **401** (unauthorised). The helper then gets a new access token with the refresh token and sends the same request again. The screen that made the request never notices.

```typescript
// lib/api.ts
import { clearTokens, getAccessToken, getRefreshToken, setTokens }
  from './tokens';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;               // refresh token is invalid
  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return true;
}
```

```typescript
export async function apiFetch(path: string, options: RequestInit = {}) {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${getAccessToken() ?? ''}`,
      },
    });

  let res = await send();
  if (res.status === 401) {
    // If a refresh is already running, wait for that one
    refreshing ??= refreshTokens().finally(() => { refreshing = null; });
    const ok = await refreshing;
    if (!ok) {
      await clearTokens();
      throw new Error('SESSION_EXPIRED');
    }
    res = await send();                    // try once more, new token
  }
  return res;
}
```

The shared `refreshing` promise is important. A screen often fires three or four requests at the same time. When the token has expired, all of them get a 401. Without the shared promise, each one would start its own refresh.

:::example Dry run: three requests with an expired token
| Step | Request A | Request B | Request C |
|---|---|---|---|
| 1 | Sent, gets 401 | Sent, gets 401 | Sent, gets 401 |
| 2 | `refreshing` is null, so it starts the refresh | Sees `refreshing`, waits | Sees `refreshing`, waits |
| 3 | The refresh succeeds and new tokens are saved | Same promise resolves | Same promise resolves |
| 4 | Sent again, gets 200 | Sent again, gets 200 | Sent again, gets 200 |

Only **one** refresh call was made. This matters even more when the server uses **refresh token rotation**, which means every refresh token works only once. With three parallel refresh calls, two would fail and the user would be logged out for no reason.
:::

## Step 3: an auth context

The whole app needs to know two things: who is the user, and are we still checking? A React context shares this.

```tsx
// lib/auth.tsx
import { createContext, useContext, useEffect, useState }
  from 'react';
import { apiFetch } from './api';
import { clearTokens, getRefreshToken, setTokens } from './tokens';

type User = { id: string; name: string; email: string };
type AuthValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}
```

The provider restores the session when the app starts.

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Is there a saved session from the last time?
        if (await getRefreshToken()) {
          // No access token in memory yet, so this call gets a 401.
          // apiFetch refreshes and retries by itself
          const res = await apiFetch('/me');
          if (res.ok) setUser(await res.json());
        }
      } catch {
        // Expired session or no network: stay signed out for now
      } finally {
        setIsLoading(false);               // the check is finished
      }
    })();
  }, []);
  // signIn, signOut and the return statement come next
}
```

And the two actions, which complete the same component.

```tsx
  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Wrong email or password');
    const data = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const signOut = async () => {
    // Tell the server first, so it can cancel the refresh token
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    await clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
```

## Step 4: connect it to the router

Wrap the root `Stack` in `AuthProvider` inside `app/_layout.tsx`. The guard layout from the navigation chapter then does the rest. On the login screen, call `signIn` and then `router.replace('/')`, so that the back button cannot return to the login screen.

:::warn The login screen flashes at app start
Reading from SecureStore and calling `/me` takes a moment. If your guard checks only `if (!user)`, a signed-in user sees the login screen for half a second before being redirected. That is why the context has `isLoading`. While it is `true`, show a loader or keep the splash screen visible, and decide nothing. Expo's splash screen library has `preventAutoHideAsync` and `hideAsync` for this. Check the Expo docs for the current usage.
:::

## What must happen on logout

Logout is more than `setUser(null)`. Call the logout API so that the server cancels the refresh token. Delete the tokens from SecureStore. Clear the query cache with `queryClient.clear()`. Remove this device's push token on the server, and clear user data in the local database. If you skip these steps, the next person who signs in on the same phone may see the old user's data or get their notifications.

:::warn SecureStore data can outlive the app on iOS
On iOS, values in the Keychain may still be there after the user deletes and reinstalls the app. A fresh install could then start "logged in" as the old user. A common fix is to save a "first launch done" flag in AsyncStorage (which is deleted with the app). If the flag is missing at start, clear SecureStore.
:::

:::note
For "Sign in with Google" or "Sign in with Apple", do not ask for the user's password yourself. Use the provider's official flow. In Expo, `expo-auth-session` handles browser-based OAuth, including a safety step called PKCE that protects the login code. If your iOS app offers third-party sign-in, Apple's review rules may also require an option such as Sign in with Apple. Check the current guidelines. For a quick unlock with fingerprint or Face ID, look at `expo-local-authentication`.
:::

:::interview Where do you store auth tokens in a React Native app, and why?
"In the platform's secure storage through `expo-secure-store`: the Keychain on iOS and Keystore-backed encrypted storage on Android. It is encrypted and sandboxed to my app. I do not use AsyncStorage for tokens, because it is plain text on disk and can be read on a rooted device or from a backup. I keep the access token short-lived and in memory, and the refresh token in SecureStore. On logout I delete both and ask the server to revoke the refresh token."
:::

:::revise
- An access token is short-lived and goes with each request. A refresh token only gets new access tokens.
- Store tokens in SecureStore, never in AsyncStorage.
- One API helper adds the `Authorization` header and handles 401 with refresh and one retry.
- Share a single refresh promise so parallel requests do not refresh many times.
- Use `isLoading` so the login screen does not flash while the session is restored.
- Logout: cancel on the server, delete tokens, clear caches and remove the push token.
:::

# Performance

*Why apps feel slow, how to measure it properly, and the small set of fixes that solve most problems.*

## Why it matters

You develop on a good laptop and probably test on a fairly new phone. Many of your users have a budget Android phone that is a few years old, with less memory and a slower processor. An app that feels fine on your device can feel heavy on theirs.

Think of a cook in a small dhaba. Customers do not wait because the cook is slow. They wait because the cook makes the same dal again and again for every order instead of keeping a pot ready. Most slow apps have the same problem: they repeat work that was not needed.

## The idea

Almost all performance problems fall into four groups.

| Group | Symptom | Usual cause |
|---|---|---|
| Too many re-renders | Typing or tapping feels late | State placed too high, unstable props |
| Slow lists | Jerky scrolling, blank areas | Heavy rows, missing keys, nested scrollers |
| Slow start | A long splash screen | Too much work and too many imports at launch |
| Heavy assets | Crashes, high memory | Huge images, big JSON kept in memory |

The first rule of performance: **measure first, then fix**. Guessing wastes days.

## Understanding re-renders

A **render** means React calls your component function to find out what the UI should look like. A component renders again when:

1. its own state changes,
2. its parent renders again, or
3. a context it reads changes.

Point 2 surprises beginners. When a parent renders, **all** its children render again by default, even if their props are the same. Usually this is cheap. It becomes a problem when the child is heavy or when there are hundreds of children, as in a list.

```tsx
function ChatScreen({ messages }) {
  const [draft, setDraft] = useState('');   // changes on every key press

  return (
    <View style={{ flex: 1 }}>
      {/* Renders again for every typed letter, for no reason */}
      <MessageList messages={messages} />
      <TextInput value={draft} onChangeText={setDraft} />
    </View>
  );
}
```

Every typed letter updates `draft`. `ChatScreen` renders again, and so does `MessageList` with its hundreds of rows.

## Fix 1: move state down

The cheapest fix has no special API. Put the state in the smallest component that needs it.

```tsx
function Composer({ onSend }) {
  const [draft, setDraft] = useState('');   // the state lives here now
  return <TextInput value={draft} onChangeText={setDraft}
                    onSubmitEditing={() => onSend(draft)} />;
}

function ChatScreen({ messages, onSend }) {
  return (
    <View style={{ flex: 1 }}>
      <MessageList messages={messages} />   {/* not touched by typing */}
      <Composer onSend={onSend} />
    </View>
  );
}
```

Now typing renders only `Composer`.

## Fix 2: memo, useCallback and useMemo

| Tool | What it remembers | Use it when |
|---|---|---|
| `memo(Component)` | The last render result | A heavy child gets the same props often |
| `useCallback(fn, deps)` | A function, between renders | You pass the function to a memoised child |
| `useMemo(calc, deps)` | A calculated value | The calculation is slow, or the value is a prop of a memoised child |

`memo` compares the new props with the old props. If all are equal, it skips the render. The comparison is **shallow**: for objects, arrays and functions it checks only "is this the very same thing in memory?".

```tsx
import { memo, useCallback, useMemo, useState } from 'react';

const Row = memo(function Row({ item, onPress }) {
  return <Pressable onPress={() => onPress(item.id)}>
    <Text>{item.name}</Text></Pressable>;
});

function Shop({ items }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  // Without useCallback, this would be a NEW function on every render
  const onPress = useCallback((id) => setSelected(id), []);

  // Filter again only when items or query change
  const visible = useMemo(
    () => items.filter((i) => i.name.includes(query)),
    [items, query]);

  return visible.map((item) =>
    <Row key={item.id} item={item} onPress={onPress} />);
}
```

:::example Dry run: the user taps one row in a list of 500
`setSelected` runs, so `Shop` renders again.

| Version | What `Row` receives | Rows that render again |
|---|---|---|
| No `memo` | It does not matter | 500 |
| `memo`, but `onPress` written inline | A new function each time, so the props differ | 500 |
| `memo` with `useCallback` | The same `item` and the same `onPress` | 0 |

The middle row is the classic trap. `memo` alone does nothing if you pass a fresh function, object or array as a prop on every render. For example, `style={{ margin: 8 }}` creates a new object each time.
:::

:::warn Wrapping everything in memo and useCallback
These tools are not free. They add comparisons, use memory and make code harder to read. On a cheap component they can cost more than they save. Use them where you have measured a problem: list rows, heavy charts, large screens. Do not add them by habit.
:::

:::note
The React team has built the **React Compiler**, a build tool that adds this kind of memoisation automatically. Newer Expo templates can enable it. When it is on, you write much less `memo` and `useCallback` by hand. Check the current Expo docs to see whether it is enabled in your project. The ideas above still explain what the compiler does for you.
:::

## Measure before you fix

:::flow A performance workflow
Notice | a screen feels slow
Reproduce | release build, slow phone
Measure | profiler, perf monitor
Fix one thing | the biggest cost
Measure again | keep or undo
:::

**Always measure in a release build.** In development mode, React Native runs extra checks and shows warnings, and the bundle is not optimised. It can be several times slower than the real app.

```bash
# Run an optimised build on a connected device
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

| Tool | How to open it | What it shows |
|---|---|---|
| Performance monitor | Developer menu on the device | Live frame rate of the UI and JS threads |
| React DevTools Profiler | Press `j` in the Metro terminal | Which components rendered and how long each took |
| Android Studio and Xcode profilers | Open the native project | Memory, CPU and native work |

Read the performance monitor like this: if the **JS** frame rate drops but the **UI** frame rate stays high, your JavaScript is too busy. If the UI frame rate drops, the native side has too much to draw: too many views, large images or heavy shadows.

## Startup time and Hermes

Hermes already helps startup, because JavaScript is compiled to bytecode at build time. You can help more:

- Do less before the first screen. Load remote config, analytics and other extras after the first screen is visible.
- Keep the root layout light. Every provider and import there is paid for at launch.
- Remove unused libraries. Each one adds to the bundle.
- Avoid a flood of `console.log` calls in hot paths such as list rows and scroll handlers. Logging is real work for the JS thread.

:::interview How would you find and fix unnecessary re-renders?
"I first reproduce the issue in a release build. Then I record the interaction with the React DevTools Profiler and look at which components rendered and why. Common causes are state that lives too high in the tree, context values that change on every render, and new object or function props passed to children. My fixes, in order: move state down to the component that needs it, split large contexts or use store selectors, then wrap expensive children in `memo` with stable props through `useCallback` and `useMemo`. I measure again to confirm, because memoisation has its own cost."
:::

:::revise
- Measure in a release build on a slow phone. Development mode is much slower.
- A component renders when its state, its parent or a context it reads changes.
- First fix: move state down. Then use `memo` with stable props on heavy children.
- `memo` is useless if you pass new objects or functions as props on every render.
- JS frame rate low: too much JavaScript. UI frame rate low: too much to draw.
- Remove listeners and timers in the `useEffect` cleanup, and keep the root layout light for a fast start.
:::

# Testing

*How to check your app automatically with Jest and React Native Testing Library, so that a new feature does not quietly break an old one.*

## Why it matters

Your app has a login, a cart and a checkout. You change one small thing in the cart. Is the checkout still correct? To be sure, you must tap through the whole app by hand, on two platforms, every single time. Nobody does that for long. So bugs slip into the store, and a store release takes hours or days to fix.

Think of the checklist a pilot reads before every flight. It does not make the pilot fly better. It makes sure nothing basic is forgotten. Automated tests are your checklist, and the computer reads it in seconds.

## The idea

| Layer | What it checks | Tool | Speed |
|---|---|---|---|
| Static checks | Typing mistakes, wrong types | TypeScript, ESLint | Instant |
| Unit tests | One function | Jest | Very fast |
| Component tests | One component or screen, as a user sees it | React Native Testing Library | Fast |
| End-to-end tests | The real app on a device | Maestro or Detox | Slow |

- **Jest** is the test runner. It finds test files, runs them and reports pass or fail.
- **React Native Testing Library** (RNTL) renders a component in a test environment, without a phone, and lets you find text, press buttons and check the result.

Write many unit and component tests, and a few end-to-end tests for the most important paths, such as login and payment.

## Setup

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

The `jest-expo` **preset** is a ready set of Jest settings for Expo. It also provides fake versions of many native parts, so they can run on your laptop. Test files are named `something.test.ts` or `something.test.tsx`. Run them with `npm test`. The install steps change a little between SDK versions, so compare with the current Expo "Unit testing" guide.

:::flow The shape of every test
Arrange | render, prepare data
Act | press, type, call
Assert | expect the result
:::

## A unit test

Start with pure logic. A **pure function** gives the same output for the same input and touches nothing else. It is the easiest thing to test.

```typescript
// lib/cart.ts
export type CartItem = { price: number; qty: number };

export function cartTotal(items: CartItem[], discountPercent = 0) {
  const sum = items.reduce((total, i) => total + i.price * i.qty, 0);
  return Math.round(sum * (1 - discountPercent / 100));
}
```

```typescript
// lib/cart.test.ts
import { cartTotal } from './cart';

describe('cartTotal', () => {
  it('adds price times quantity', () => {
    const items = [{ price: 90, qty: 2 }, { price: 30, qty: 1 }];
    expect(cartTotal(items)).toBe(210);          // 180 + 30
  });

  it('applies a discount', () => {
    expect(cartTotal([{ price: 200, qty: 1 }], 10)).toBe(180);
  });

  it('returns 0 for an empty cart', () => {
    expect(cartTotal([])).toBe(0);               // an edge case
  });
});
```

Every test has three parts: **arrange** (prepare the data), **act** (call the code) and **assert** (check the result with `expect`).

## A component test

```tsx
// components/Counter.tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <View>
      <Text>Count: {count}</Text>
      <Pressable accessibilityRole="button"
                 onPress={() => setCount((c) => c + 1)}>
        <Text>Add one</Text>
      </Pressable>
    </View>
  );
}
```

```tsx
// components/Counter.test.tsx
import { fireEvent, render, screen }
  from '@testing-library/react-native';
import { Counter } from './Counter';

test('pressing the button increases the count', () => {
  render(<Counter />);                               // arrange

  expect(screen.getByText('Count: 0')).toBeOnTheScreen();

  fireEvent.press(screen.getByText('Add one'));      // act

  expect(screen.getByText('Count: 1')).toBeOnTheScreen();   // assert
});
```

The test reads like a user story: I see "Count: 0", I press "Add one", I see "Count: 1". It does not look at the `count` state variable. This is the main idea of Testing Library: **test what the user sees, not how the code is written inside**.

:::note
Newer major versions of RNTL make `render` and the event helpers asynchronous, so you write `await render(...)`. The library also has `userEvent`, which simulates a press or typing more realistically than `fireEvent`. Check the RNTL docs for the style that matches your installed version.
:::

## Finding elements

| Query | Finds by | Example |
|---|---|---|
| `getByText` | Visible text | `getByText('Add one')` |
| `getByRole` | Accessibility role and name | `getByRole('button', { name: 'Add one' })` |
| `getByPlaceholderText` | Placeholder of an input | `getByPlaceholderText('Email')` |
| `getByLabelText` | Accessibility label | `getByLabelText('Close')` |
| `getByTestId` | The `testID` prop | `getByTestId('cart-badge')` |

Prefer the queries at the top. They work the way a real user (or a screen reader) finds things. Use `testID` only as a last choice.

Each query has three forms.

| Form | If nothing is found | Use it for |
|---|---|---|
| `getBy...` | Throws an error | Things that must be there now |
| `queryBy...` | Returns `null` | Checking that something is **not** there |
| `findBy...` | Waits, then throws | Things that appear after an async action |

## Testing a screen that loads data

A test must not call the real server. It would be slow, and it would fail when the network is down. Replace the API function with a fake one. This is called a **mock**.

```tsx
// screens/Products.test.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { getJson } from '../lib/api';
import ProductsScreen from './Products';

jest.mock('../lib/api');                      // replace the module
const mockGetJson = getJson as jest.Mock;

function renderWithClient(ui: React.ReactElement) {
  // A new client per test, with no retries, so errors show quickly
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

test('shows the products from the API', async () => {
  mockGetJson.mockResolvedValue([{ id: '1', name: 'Chai', price: 15 }]);
  renderWithClient(<ProductsScreen />);
  // findBy waits until the text appears
  expect(await screen.findByText(/Chai/)).toBeOnTheScreen();
});

test('shows an error message when the request fails', async () => {
  mockGetJson.mockRejectedValue(new Error('Network down'));
  renderWithClient(<ProductsScreen />);
  expect(await screen.findByText(/Could not load/)).toBeOnTheScreen();
});
```

:::example Dry run: the error test
| Step | What happens |
|---|---|
| 1 | `jest.mock` replaces `getJson` with a fake function |
| 2 | `mockRejectedValue` makes the fake function fail with "Network down" |
| 3 | The screen renders and shows the spinner (`isPending` is true) |
| 4 | The query fails. `retry: false` means it does not try again |
| 5 | The screen renders the error view with "Could not load products..." |
| 6 | `findByText` was waiting, finds the text, and the test passes |

You have now proved that the error state works, without turning off your Wi-Fi.
:::

## Mocking native modules

Native code cannot run inside Jest on your laptop. For libraries without a built-in mock, write a small fake with `jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn() }))` and give each function the behaviour your test needs.

:::warn Tests that check the inside, not the behaviour
A test that checks "the state variable `isOpen` is true" or compares a huge **snapshot** (a saved copy of the full rendered tree) breaks whenever you rename something or change a style, even when the app still works. People then update snapshots without reading them, and the tests stop protecting anything. Test behaviour that a user can see: "after I press Save, the text Saved appears".
:::

## End-to-end tests

Component tests cannot check real navigation, the real keyboard or native modules. An **end-to-end** (E2E) test drives the installed app like a robot finger. **Maestro** is a popular tool, with flows written in a simple YAML file: a list of steps such as `launchApp`, `tapOn: "Login"`, `inputText: "secret123"` and `assertVisible: "My orders"`.

E2E tests are slow and can be flaky, which means they sometimes fail without a real bug. Keep only a few, for the paths that earn money or lose trust: sign up, login, checkout.

:::tip What to test first
Do not chase a coverage number. Test in this order: money and data logic (totals, discounts, validation), the error and empty states of important screens, and every bug you fix. Write a test that fails because of the bug, then fix the bug. It can never come back unseen.
:::

:::interview What is the difference between unit, component and end-to-end tests?
"A unit test checks one function in isolation, for example a price calculation. It is very fast. A component test renders one component or screen with React Native Testing Library and checks what the user would see after some interaction, with network and native modules mocked. An end-to-end test runs the real app on a device or emulator with a tool like Maestro or Detox and goes through a whole flow. It gives the most confidence but is slow and less stable. So I write many unit and component tests and a small number of end-to-end tests for critical flows."
:::

:::revise
- Jest runs the tests. RNTL renders components and lets you act like a user.
- Use the `jest-expo` preset in an Expo project.
- Every test: arrange, act, assert.
- `getBy` throws, `queryBy` returns null, `findBy` waits for async results.
- Mock the network and native modules. Never call the real server from a test.
- Test what the user sees, and keep only a few end-to-end tests for critical flows.
:::

# Builds, releases and updates with EAS

*From code on your laptop to an app in the Play Store and App Store, plus fast JavaScript updates without a new store release.*

## Why it matters

During development, your phone loads JavaScript from your laptop. A real user has no laptop. They need one complete, signed package from a store.

Think of cooking at home versus selling packaged food. At home you just serve it. To sell it in a shop, you need sealed packing, a label, a batch number, a licence, and the shop must accept it. The food is the same. The process around it is the big part. Releasing an app is that process.

## The idea

**EAS** (Expo Application Services) is Expo's cloud service for the release process.

| Service | What it does |
|---|---|
| **EAS Build** | Builds the app in the cloud and handles signing |
| **EAS Submit** | Uploads the finished build to the Play Store or App Store |
| **EAS Update** | Sends new JavaScript and assets to installed apps |

Words you will meet:

| Term | Meaning |
|---|---|
| **Signing** | A digital signature that proves the app comes from you |
| **Keystore** | The Android file that holds your signing key |
| **Certificate and provisioning profile** | The iOS files for signing |
| **APK** | An Android file you can install directly. Good for testers |
| **AAB** | The Android format that the Play Store wants for upload |
| **IPA** | The iOS app file |

:::flow The release pipeline
Your code | git commit
EAS Build | signed AAB or IPA
EAS Submit | upload to the store
Store review | Apple and Google check it
Users | install or update
:::

## Setting up

```bash
# Install the command line tool and sign in to your Expo account
npm install -g eas-cli
eas login

# Create eas.json and link the project to EAS
eas build:configure
```

The file `eas.json` describes **build profiles**. A profile is a named set of build settings.

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": { "production": {} }
}
```

`"distribution": "internal"` means the build is shared with a link or QR code instead of a store. On Android that is an APK anyone can install. On iOS, internal builds run only on devices that are registered in your Apple Developer account. Most teams use TestFlight for iOS testers.

## Building and submitting

```bash
# A test build for Android testers (an APK from the preview profile)
eas build --platform android --profile preview

# Production builds for both stores
eas build --platform all --profile production

# Upload the latest production build to the stores
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

On the first build, EAS asks whether it should create and store the signing credentials for you. For most people the answer is yes. A cloud build can take a while, and on the free plan it may wait in a queue.

:::warn Losing the Android signing key
Every update of an Android app must be signed in a way the Play Store accepts for that app. If you manage your own keystore and lose it, updating the app becomes a painful support process. Let EAS manage the credentials, keep your Expo account safe with two-factor login, and use Play App Signing, where Google keeps the final app key and you hold only an upload key that can be reset.
:::

:::note
You need developer accounts before you can publish. The Apple Developer Program has a yearly fee, and Google Play has a one-time registration fee. For the first Android release, Google usually requires you to upload the first build by hand in the Play Console, and submitting through the API needs a service account key. The exact steps and prices change, so follow the current EAS Submit docs.
:::

## Versioning

An app has **two** version numbers. Mixing them up is a very common cause of rejected uploads.

| | User-facing version | Build number |
|---|---|---|
| Example | `1.4.0` | `37` |
| Seen by | Users, on the store page | Only the stores and you |
| In the app config | `version` | `ios.buildNumber`, `android.versionCode` |
| Rule | You decide when it changes | Must go **up** with every upload |

For the user-facing version, most teams follow **semantic versioning**: `MAJOR.MINOR.PATCH`. Raise PATCH for bug fixes (1.4.0 to 1.4.1), MINOR for new features (1.4.1 to 1.5.0) and MAJOR for big changes (1.5.0 to 2.0.0).

With `"autoIncrement": true` in the production profile and `"appVersionSource": "remote"`, EAS keeps the build number on its servers and raises it for every production build. You change only `version` by hand.

## OTA updates with EAS Update

A store release can take hours or days to reach users because of review. But most of your app is JavaScript, and JavaScript is only data that the app loads. **OTA** means "over the air". With EAS Update, the installed app downloads a new JavaScript bundle from Expo's servers and uses it on the next start. No store review is needed for that step.

```bash
# One-time setup
npx expo install expo-updates
eas update:configure

# Publish a JavaScript fix to all production builds
eas update --channel production --message "Fix cart total rounding"
```

A **channel** is a named pipe that connects builds to updates. A build made with the `production` profile above listens to the `production` channel.

| An OTA update can change | An OTA update cannot change |
|---|---|
| JavaScript and TypeScript code | Native libraries (adding or upgrading) |
| Styles, texts, screens | Permissions and app config that affects native code |
| Images and fonts loaded from JS | The Expo SDK version |
| Bug fixes in your logic | The app icon, the app name, the splash screen |

### Runtime version: the safety lock

Suppose you add a camera library (native code) and call it from JavaScript. You then send this JavaScript as an OTA update to users who still have the old build without the camera library. Their app calls native code that does not exist, and it crashes on start.

The **runtime version** prevents this. It is a label that describes the native side of a build. An update is delivered only to builds with the **same** runtime version.

```json
{
  "expo": {
    "version": "1.4.0",
    "runtimeVersion": { "policy": "appVersion" }
  }
}
```

With the `appVersion` policy, the runtime version is the same as `version`. So the rule for the team becomes simple: whenever the native side changes, raise `version` and make a new store build. Expo also offers a policy that calculates the runtime version from a fingerprint of your native project. Check the current Expo docs for the options.

:::example Dry run: who gets the update?
Three users have the app. You publish an update from code with `version` 1.4.0.

| User | Installed build | Runtime version | Gets the update? |
|---|---|---|---|
| Asha | 1.4.0 from the store | 1.4.0 | Yes |
| Bilal | 1.3.0, never updated | 1.3.0 | No, the runtime differs |
| Chitra | 1.4.0 preview build, preview channel | 1.4.0 | No, the channel differs |

Asha's app downloads the update in the background when she opens it. By default she sees the new code on the **next** launch, not immediately.
:::

:::warn Treating OTA as a way around the store
OTA is for bug fixes and small improvements. It does not replace store releases. Native changes need a new build. Both stores also have rules against changing the main purpose of an app after review. And a bad OTA update reaches users quickly, so test it on the preview channel first, and learn how to roll back before you need it. EAS lets you publish an earlier update again or roll back. Check the current EAS Update docs for the command.
:::

## Store checklist

### Both stores

| Item | Notes |
|---|---|
| App name, icon and splash screen | Final versions, in the sizes each store asks for |
| Unique app ID | `bundleIdentifier` and `package`. They cannot be changed later |
| Privacy policy URL | Required when you collect any user data |
| Screenshots and description | Real screens of your app, with no false claims |
| Test login for reviewers | A working demo account if the app needs login |
| Account deletion | If users can create an account, give them a way to delete it |
| No crashes on a clean install | Test the production build, not only the development build |
| No development leftovers | Test API URLs, debug menus and placeholder text removed |

### Google Play

- A developer account and a completed store listing.
- The **Data safety** form: what data you collect and why.
- The content rating questionnaire and the target audience.
- An AAB that targets a recent Android API level. Google raises this requirement regularly.
- Newer personal developer accounts must run a closed test with a number of testers for some days before they can publish to production. Check the current Play Console rules.

### Apple App Store

- An Apple Developer Program membership and an app record in App Store Connect.
- **App Privacy** details, also called the privacy labels.
- A clear purpose text for every permission. Vague texts are a common reason for rejection.
- A TestFlight build tested on a real iPhone.
- Screenshots in the device sizes that Apple currently requires.

:::interview What is an OTA update, and what are its limits?
"An over-the-air update sends a new JavaScript bundle and assets directly to installed apps, without a store release. With EAS Update, I publish to a channel, and builds on that channel with a matching runtime version download it and apply it on the next launch. The limit is that it can change only JavaScript and assets. Anything native, such as a new native library, a new permission or an SDK upgrade, needs a new store build. The runtime version protects users from getting JavaScript that does not match their native code. I use OTA for urgent bug fixes and small changes, not to bypass store review."
:::

:::revise
- EAS Build makes signed builds, EAS Submit uploads them, EAS Update sends JavaScript updates.
- Profiles in `eas.json`: `development` (you), `preview` (testers), `production` (stores).
- APK is for direct install. AAB is for the Play Store.
- `version` is for users. The build number must increase with every upload.
- OTA changes only JavaScript and assets. A native change needs a new store build.
- An update reaches only builds with the same channel and the same runtime version.
:::

# Cheat sheet, interview questions and study plan

*Everything on a few pages: quick tables to revise, the questions interviewers ask, and a six-week plan to build a real app.*

## Why this chapter exists

Before an exam you do not read the whole textbook again. You read your own short notes. This chapter is those notes. Use it the night before an interview and during the first weeks of your first real project.

## Which tool for which job

| Need | Use |
|---|---|
| Start a project | `npx create-expo-app@latest` |
| Screens and navigation | Expo Router (`app/` folder) |
| Server data | TanStack Query |
| Small shared state | Context or Zustand |
| Forms | React Hook Form |
| Secrets and tokens | `expo-secure-store` |
| Small settings | AsyncStorage |
| Large local data | `expo-sqlite` |
| Long lists | `FlatList` (or FlashList) |
| Animations | `react-native-reanimated` |
| Touch gestures | `react-native-gesture-handler` |
| Images | `expo-image` |
| Pick or take a photo | `expo-image-picker` |
| Push notifications | `expo-notifications` |
| Tests | Jest with React Native Testing Library |
| Build and release | EAS Build, Submit and Update |

## Commands

```bash
npx create-expo-app@latest my-app     # new project
npx expo start                        # start Metro
npx expo start --clear                # start and clear the cache
npx expo install <package>            # install a matching version
npx expo-doctor                       # check for project problems
npx expo run:android                  # local development build
npx expo prebuild                     # generate native folders

eas build -p android --profile preview      # test build
eas build -p all --profile production       # store builds
eas submit -p ios --profile production      # upload to the store
eas update --channel production -m "Fix"    # OTA update
```

## Mistakes that cost the most time

| Mistake | What you see | Fix |
|---|---|---|
| Parent without `flex: 1` | A blank screen | Give every parent `flex: 1` |
| Text outside `Text` | A red error screen | Wrap it. Avoid `{0 && ...}` |
| Remote image without a size | Nothing shows | Set width and height |
| Native library added, no rebuild | "Native module not found" | Make a new development build |
| `npm install` for native libraries | Version mismatch errors | `npx expo install` |
| Index used as a list key | Wrong row updates | Use a real ID |
| Token in AsyncStorage | A security hole | SecureStore |
| Measuring speed in dev mode | Wrong conclusions | Use a release build |

:::warn The cache problem
Sometimes the app shows old code or a strange error after you change the config, install a library or switch a git branch. Before you spend an hour debugging, stop Metro and run `npx expo start --clear`. If you changed anything native, rebuild the development build too. Many "impossible" bugs are only a stale cache.
:::

## Debugging order

:::flow When something breaks
Read the error | the first lines matter
Clear the cache | expo start --clear
Run expo-doctor | version problems
Rebuild | if native changed
Test the other platform | is it platform specific?
:::

## Interview questions

The chapters already contain model answers for the main questions. Here are more, with shorter answers. Practise saying them aloud in your own words.

:::interview When would you choose React Native, and when not?
"I choose it when one team must ship to both Android and iOS, when the app is mostly screens, lists, forms and API calls, and when the team already knows React. Shared code and OTA updates make delivery faster. I would be careful with apps whose main part is heavy native work, such as advanced camera or video processing, a 3D game or very deep system integration. Those are possible with native modules, but then a large part of the work is native anyway. I would be honest about that trade-off instead of saying one tool fits everything."
:::

:::interview How do you keep an app secure on the device?
Tokens go into SecureStore, not AsyncStorage. All calls use HTTPS. No secret keys are inside the bundle, because `EXPO_PUBLIC_` values and JavaScript code can be read by anyone. The server validates every request and every input. Tokens are short-lived and can be revoked. Logs and crash reports never contain tokens or personal data. On logout I clear tokens, caches and the push token.
:::

### Rapid-fire questions

| Question | Short answer |
|---|---|
| Default `flexDirection`? | `column` |
| Unit of `fontSize: 16`? | Density-independent pixels, no unit is written |
| `ScrollView` or `FlatList` for 1,000 rows? | `FlatList`, because it is virtualized |
| What does `keyExtractor` return? | A unique, stable string for each item |
| How do you read `/product/[id]`? | `useLocalSearchParams()` |
| `push` or `replace` after login? | `replace` |
| Does changing a shared value re-render? | No |
| Where do worklets run? | On the UI thread |
| Can OTA add a native library? | No, that needs a new build |
| What does `EXPO_PUBLIC_` mean? | The value is put into the bundle and is public |
| `findBy` or `getBy` for async content? | `findBy` |
| What is the JS engine? | Hermes |

:::tip How to answer in an interview
Use the same order as this handbook: first the problem ("a list of 5,000 rows uses too much memory"), then the idea ("so we render only the visible rows"), then the tool (`FlatList`), then one trade-off ("fast scrolling can show blank areas"). An answer with a trade-off sounds like experience. An answer without one sounds memorised.
:::

## A six-week study plan

Build **one** app through all six weeks. A good choice is a small "canteen ordering" or "expense tracker" app. One real project teaches more than ten tutorials. Plan about one to two hours a day.

| Week | Chapters | What you build |
|---|---|---|
| 1 | How it works, Expo setup, components and layout | Three static screens with Flexbox that look right on two phone sizes |
| 2 | Lists, forms, navigation | Tabs, a list screen, a detail screen with a dynamic route and a form with validation |
| 3 | Data fetching, storage | Real API data with loading, error and empty states. Settings saved on the device |
| 4 | Auth, offline-first | Login with SecureStore, protected routes, and one feature that works without a network |
| 5 | Gestures, images, push | A swipe-to-dismiss card, a profile photo upload and one push notification on a real device |
| 6 | Performance, testing, release | Profile one slow screen, write ten tests, make a preview build and share it with friends |

Rules for the plan:

1. **Type the code yourself.** Copy and paste teaches the fingers nothing.
2. **Test on a real phone every day**, not only on the simulator.
3. **Break things on purpose.** Remove `flex: 1`, use the index as a key, turn on airplane mode. Seeing the bug once makes you recognise it forever.
4. **Read the official docs** for each library you use. APIs change between SDK versions, and the docs are always more current than any book or video.
5. **Finish and ship.** A small app that friends can install is worth more on your resume than a big one that is half done.

:::revise
- React Native runs your JavaScript on the JS thread and draws real native views on the UI thread.
- Expo gives you the router, the libraries and EAS. Use a development build for real work.
- Server data goes to TanStack Query, secrets to SecureStore, large local data to SQLite.
- Animations and gestures belong on the UI thread with Reanimated worklets.
- A native change needs a rebuild. A JavaScript change needs only a reload or an OTA update.
- Build one real app, test it on a real slow phone, and ship it.
:::
