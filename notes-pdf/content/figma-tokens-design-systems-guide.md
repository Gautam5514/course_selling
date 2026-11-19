---
title: Modern Design Systems: Figma Variables to React Code
subtitle: Build one design language that lives in Figma and in code, from design tokens to accessible, themeable React components.
category: UI/UX
level: Beginner to Intermediate
accent: rose
tags: figma, design-tokens, tailwind, radix-ui, accessibility
highlights: Design Tokens | Figma Variables & Modes | Style Dictionary | Tailwind v4 Theming | Radix UI Components | WCAG 2.2 Accessibility
tagline: Design Tokens • Figma Variables • Tailwind v4 • Radix UI • Accessibility
description: Learn how a design system is planned in Figma and shipped as real code. The handbook covers design tokens, colour and type scales, Figma variables and modes, Style Dictionary, CSS variables, Tailwind CSS v4 and accessible React components built on Radix UI. Every chapter has commented code, worked examples, common mistakes and interview questions, and the last chapter is a cheat sheet with a study plan.
---

# What a design system is and why teams need one

*One shared set of decisions, parts and rules, so that every screen looks and behaves like it belongs to the same product.*

## Why it matters

Think of the Indian Railways. Every station in the country uses the same kind of yellow name board with black letters, written in the same order of languages. Nobody redesigns the board for each station. Someone decided the rules once, and thousands of stations follow them. A passenger who has seen one station can read all of them.

Now think of an app without such rules. One page has a blue button with round corners. Another page has a slightly different blue and square corners. A third page has a button that cannot be reached with the keyboard. Nobody planned this. It happened because five people built five pages and each one decided alone.

A design system stops this drift. It answers small questions once, so that nobody has to answer them again.

## The idea

A **design system** is a shared collection of design decisions, reusable parts and written rules that a team uses to build a product. It lives in two places at the same time: in the design tool (Figma) and in the code (for example a React package). Both places must say the same thing.

It is useful to split a design system into layers. Each layer builds on the one before it.

:::flow The layers of a design system
Tokens | named values: colour, space, type
Components | Button, Dialog, Tabs
Patterns | forms, empty states, page layouts
Guidelines | when to use what, and why
:::

| Layer | What it holds | Example |
|---|---|---|
| Design tokens | The smallest decisions, each with a name | `color.action.primary` |
| Components | Reusable building blocks | A Button with three sizes |
| Patterns | Ways to combine components | A login form layout |
| Guidelines | Written rules and reasons | "One primary button per screen" |
| Process | How the system changes | Who reviews a new component |

People often mix up three words. They are related but not the same.

| Term | What it is | What it is not |
|---|---|---|
| Style guide | A document about brand: logo, colours, tone | Not code, not components |
| Component library | Coded parts such as buttons and inputs | No rules about when to use them |
| Design system | Tokens, components, patterns, rules and process | Not just a Figma file |

A component library is one part of a design system. A design system without documentation and process is only a folder of buttons.

## The cost of not having one

Here is the same button written by two developers in the same project. Both work. Both look "almost" the same.

```css
/* File: checkout.css, written by developer A */
.pay-button {
  background: #e11d48;        /* a rose red typed by hand */
  padding: 10px 18px;         /* numbers picked by eye */
  border-radius: 6px;
}

/* File: profile.css, written by developer B */
.save-btn {
  background: #e21e4a;        /* almost the same red, but not equal */
  padding: 12px 16px;
  border-radius: 8px;
}
```

The two reds differ by a tiny amount. No user will report it as a bug, but the product slowly looks untidy. Now imagine the brand colour changes. You must search the whole project for every red that looks similar, and you will miss some.

With a design system, both developers write the same thing.

```css
/* Both files now use the same named decisions */
.button-primary {
  background: var(--color-action-primary);   /* one source of truth */
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}
```

If the brand colour changes, you change one value in one file. Every button in the product follows.

:::example One change, two worlds
A product has 40 screens and the primary colour appears in about 200 places.

| Task | Without a system | With a system |
|---|---|---|
| Change the brand colour | Find and edit about 200 values | Edit 1 token |
| Add dark mode | Rewrite every stylesheet | Add one set of token values |
| Fix button focus ring | Fix every custom button | Fix the Button component once |
| New developer builds a page | Copies styles from old pages | Imports ready components |

The numbers 40 and 200 are only an illustration. The shape of the result is what matters: the cost moves from "every place" to "one place".
:::

## The source of truth problem

A **source of truth** is the one place that everyone agrees is correct. A design system has a hard problem here: design lives in Figma and the product lives in code. If they are edited separately, they drift apart.

The modern answer, and the path this handbook follows, is a pipeline. Tokens are defined once, exported as data, and transformed into code automatically.

:::flow The path this handbook follows
Figma variables | designers choose values
Token JSON | exported as plain data
Style Dictionary | transforms to each platform
CSS variables | used by Tailwind v4
React components | Radix UI + variants
Docs and tests | Storybook, axe
:::

Each box in this diagram is one or more chapters. By the end you will be able to follow a colour from a Figma variable all the way to a tested React button.

## When you do not need one

A design system has a cost. Someone must build it, document it and maintain it. Be honest about whether you need it.

| Situation | Good choice |
|---|---|
| Weekend project, one developer | A few CSS variables are enough |
| Small product, one team | Use an existing open source library and add your tokens |
| Several teams or several products | Your own design system pays off |
| Multi-brand company | A token-based system is almost required |

:::warn Do not start by building 60 components
A common mistake is to spend months building a "complete" system before any product uses it. Then real screens need things the system does not have, and nobody trusts it. Start small: tokens first, then the five or six components your product uses most (Button, Input, Dialog, Tabs, Select). Grow it from real needs.
:::

:::interview What is the difference between a component library and a design system?
A component library is a set of coded UI parts, such as buttons and dialogs. A design system is bigger. It includes design tokens (named values for colour, spacing and type), the components in both Figma and code, usage guidelines, accessibility rules, and a process for how changes are proposed, reviewed, versioned and released. I would say the library is the product you can install, and the design system is the product plus the agreement around it. A library without tokens, docs and governance drifts quickly, because nobody knows which choice is the right one.
:::

:::revise
- A design system is shared decisions, reusable parts, written rules and a process.
- Layers: tokens, components, patterns, guidelines.
- A component library is only one part of a design system.
- The big win: a change is made in one place, not in every screen.
- Keep one source of truth and generate the rest: Figma variables, token JSON, CSS, components.
- Start small with tokens and the most used components, then grow from real needs.
:::

# Design tokens: decisions with names

*A design token is a small design decision, such as a colour or a gap, stored as data with a clear name.*

## Why it matters

In a kitchen, a recipe that says "add some salt" gives a different dish every time. A recipe that says "add 1 teaspoon of salt" gives the same dish in every kitchen. The teaspoon is a shared, named measure.

Design has the same problem. "Make it a bit red with some padding" gives a different button from every developer. Design tokens are the teaspoons of design. They turn a feeling into a named value that everyone can repeat.

## The idea

A **design token** is a name and a value that together store one design decision. The name says what the decision is for. The value says what it is today.

```json
{
  "name": "color.action.primary",
  "value": "#e11d48",
  "type": "color",
  "description": "Background of the main action on a screen"
}
```

The important part is that a token is **data**, not code for one platform. The same token can become a CSS variable for the web, a constant for Android and a value for iOS. A plain hex code inside a CSS file cannot do that.

A value typed directly into the code, with no name, is called a **hard-coded value** or a **magic number**. Tokens exist to remove them.

| Hard-coded value | Token | What the name tells you |
|---|---|---|
| `#e11d48` | `color.action.primary` | Used for the main action |
| `16px` | `space.4` | Step 4 of the spacing scale |
| `8px` | `radius.md` | The medium corner radius |
| `200ms` | `duration.fast` | A quick animation |
| `600` | `font.weight.semibold` | A semi-bold font weight |

## What can be a token

Almost any repeated visual decision can be a token. These are the common types.

| Type | Stores | Example value |
|---|---|---|
| color | A colour | `#e11d48` |
| dimension | A size with a unit | `16px`, `1rem` |
| fontFamily | A font name or list | `Inter, sans-serif` |
| fontWeight | Thickness of text | `600` |
| duration | A length of time | `200ms` |
| cubicBezier | An easing curve | `[0.2, 0, 0, 1]` |
| shadow | A drop shadow | offset, blur, colour |
| typography | A group: family, size, weight, line height | a composite token |

A **composite token** is a token made of several values that belong together. A text style is a good example: font family, size, weight and line height are always chosen together.

## The standard format

For years every tool wrote token files in its own way. The **Design Tokens Community Group** (often shortened to DTCG, a group that works under the W3C) defined a common JSON format so that tools can exchange tokens. In this format the special keys start with a dollar sign.

```json
{
  "color": {
    "rose": {
      "600": {
        "$value": "#e11d48",
        "$type": "color",
        "$description": "Main brand rose"
      }
    }
  },
  "space": {
    "$type": "dimension",
    "4": { "$value": "16px" },
    "6": { "$value": "24px" }
  }
}
```

Read this file like a folder tree. The path `color` then `rose` then `600` gives the token name `color.rose.600`. Three things to notice:

- `$value` holds the value. An object with a `$value` key is a token. An object without it is a **group** (a folder).
- `$type` says what kind of value it is. A group can set `$type` once and all tokens inside inherit it, as `space` does above.
- `$description` is a human note. Good tools show it in the documentation.

:::note
The DTCG format has gone through several drafts, and the newest versions also allow a more detailed object form for colours and dimensions (for example a dimension written as a number plus a unit). Tools are at different stages of support. The simple string forms used in this handbook, such as `"#e11d48"` and `"16px"`, are understood by the common tools, including Style Dictionary and Tokens Studio. Always check what your own tool version expects.
:::

## Aliases: a token that points to another token

A token does not have to hold a raw value. It can point to another token. This is called an **alias** or a **reference**. In the DTCG format you write the path of the other token inside curly braces.

```json
{
  "color": {
    "rose": {
      "600": { "$value": "#e11d48", "$type": "color" }
    },
    "action": {
      "primary": {
        "$value": "{color.rose.600}",
        "$type": "color"
      }
    }
  }
}
```

Now `color.action.primary` has no colour of its own. It says "I am whatever `color.rose.600` is". If the brand moves from rose to blue, you point the alias to a blue token. Every place that uses `color.action.primary` changes, and no component is edited.

:::example Resolving an alias step by step
Suppose a component asks for the token `button.primary.background`.

| Step | Token looked up | Value found |
|---|---|---|
| 1 | `button.primary.background` | `{color.action.primary}` |
| 2 | `color.action.primary` | `{color.rose.600}` |
| 3 | `color.rose.600` | `#e11d48` |

The tool follows the chain until it reaches a raw value. The final answer is `#e11d48`. This chain is the base of the three-tier hierarchy in the next chapter.
:::

## Naming tokens well

A name is read far more often than it is written. Use a fixed order of words so that people can guess a name before they look it up. A common order is:

:::flow Parts of a token name
Category | color, space, font
Role or concept | text, action, surface
Variant | primary, danger, muted
State | hover, disabled
:::

Simple naming rules that prevent pain later:

1. Use lowercase words and one separator style. Dots in JSON become dashes in CSS, such as `--color-text-muted`.
2. Name by **purpose**, not by looks, when the token is used in components. `color.text.danger` survives a redesign. `color.text.red` does not.
3. Use a scale for sizes. Numbers (`space.2`, `space.4`) or T-shirt sizes (`sm`, `md`, `lg`) are both fine. Pick one style per category and keep it.
4. Do not put the value in the name. `space.16px` becomes a lie the day the value changes.

:::warn Tokens named after their value
Names like `blue-button-bg` or `gray-text` look helpful, but they break in dark mode. In a dark theme the "gray text" may be almost white and the "blue button" may use another shade. The name now says something false, and people stop trusting the system. Keep value names (such as `color.rose.600`) for the raw palette only, and give components names that describe a job.
:::

:::interview What is a design token, and how is it different from a CSS variable?
A design token is a named design decision stored as platform-neutral data: a name, a value, a type and often a description. A CSS variable is one possible output of a token on the web platform. The token `color.action.primary` can become `--color-action-primary` in CSS, a constant in a Kotlin file and a colour in Swift. So a token is the idea and the source of truth, and a CSS variable is one way to deliver it. Another difference is meaning: a token has a type and a place in a hierarchy, while a CSS variable is just a string that the browser substitutes.
:::

:::revise
- A design token is a named design decision stored as data: name, value, type.
- Tokens replace hard-coded values, so a change happens in one place.
- The DTCG JSON format uses `$value`, `$type` and `$description`.
- An alias is a token that points to another token: `{color.rose.600}`.
- Name tokens by purpose, in a fixed word order: category, role, variant, state.
- One token file can generate CSS, TypeScript, Android and iOS code.
:::

# The three-tier token hierarchy

*Primitive tokens hold raw values, semantic tokens give them a meaning, and component tokens tie that meaning to one component.*

## Why it matters

Think of how a house is wired. The power line from the street brings raw electricity. The switchboard splits it into named circuits: "kitchen", "bedroom", "water heater". Each appliance then plugs into its own circuit. If you change the supply, you do it at the main line. If you want to cut power to the kitchen only, you use one switch. You never rewire each appliance.

A flat list of tokens is like wiring every appliance straight to the street. It works for a small house. In a big product you need the switchboard in the middle. The three tiers are that structure.

## The idea

:::flow Three tiers of tokens
Primitive | raw values: rose.600 = #e11d48
Semantic | meaning: action.primary = rose.600
Component | one part: button.bg = action.primary
:::

| Tier | Also called | Answers the question | Example |
|---|---|---|---|
| 1. Primitive | Base, global, core, reference | What values exist? | `color.rose.600` |
| 2. Semantic | Alias, system, purpose | What is this value for? | `color.action.primary` |
| 3. Component | Scoped, component-specific | Where exactly is it used? | `button.primary.background` |

Different teams use different words for the same tiers, so learn the idea and not just one name.

## Tier 1: primitive tokens

**Primitive tokens** are the full menu of raw values your brand allows. They have no opinion about where they are used. Their names describe what they are: a colour family and a step.

```json
{
  "color": {
    "$type": "color",
    "white": { "$value": "#ffffff" },
    "rose": {
      "50":  { "$value": "#fff1f2" },
      "400": { "$value": "#fb7185" },
      "500": { "$value": "#f43f5e" },
      "600": { "$value": "#e11d48" },
      "700": { "$value": "#be123c" }
    },
    "slate": {
      "50":  { "$value": "#f8fafc" },
      "200": { "$value": "#e2e8f0" },
      "500": { "$value": "#64748b" },
      "800": { "$value": "#1e293b" },
      "900": { "$value": "#0f172a" }
    }
  }
}
```

Primitives are the only tier where raw values such as hex codes should appear. Components should never use them directly.

## Tier 2: semantic tokens

**Semantic** means "about meaning". A semantic token names a job in the interface and points to a primitive that does that job today.

```json
{
  "color": {
    "$type": "color",
    "surface": {
      "default": { "$value": "{color.white}" },
      "subtle":  { "$value": "{color.slate.50}" }
    },
    "text": {
      "default": { "$value": "{color.slate.900}" },
      "muted":   { "$value": "{color.slate.500}" },
      "on-action": { "$value": "{color.white}" }
    },
    "border": {
      "default": { "$value": "{color.slate.200}" }
    },
    "action": {
      "primary": { "$value": "{color.rose.600}" },
      "primary-hover": { "$value": "{color.rose.700}" }
    }
  }
}
```

This tier is where **theming** happens. A theme is a different set of answers to the same questions. In a dark theme the question "what is the default surface?" still exists, but the answer changes.

```json
{
  "color": {
    "$type": "color",
    "surface": {
      "default": { "$value": "{color.slate.900}" },
      "subtle":  { "$value": "{color.slate.800}" }
    },
    "text": {
      "default": { "$value": "{color.slate.50}" },
      "muted":   { "$value": "{color.slate.400}" },
      "on-action": { "$value": "{color.slate.900}" }
    },
    "action": {
      "primary": { "$value": "{color.rose.400}" },
      "primary-hover": { "$value": "{color.rose.300}" }
    }
  }
}
```

The token names are exactly the same in both files. Only the values differ. A component that uses `color.surface.default` works in both themes without knowing that themes exist.

:::note
The dark file above also needs `rose.300` and `slate.400` in the primitive file. A real primitive palette has every step from 50 to 900 or 950. The earlier sample was shortened to fit the page.
:::

## Tier 3: component tokens

**Component tokens** belong to one component. They point to semantic tokens and give that component its own "knobs".

```json
{
  "button": {
    "primary": {
      "background": {
        "$value": "{color.action.primary}", "$type": "color"
      },
      "background-hover": {
        "$value": "{color.action.primary-hover}", "$type": "color"
      },
      "text": {
        "$value": "{color.text.on-action}", "$type": "color"
      }
    },
    "radius": { "$value": "{radius.md}", "$type": "dimension" },
    "padding-x": { "$value": "{space.4}", "$type": "dimension" }
  }
}
```

Why add this tier at all? It lets you change one component without touching the others. Suppose a second brand wants pill-shaped buttons but normal cards. You change `button.radius` only. Without the component tier you would have to change `radius.md`, and every card and input would change too.

## Dry run: one value through all tiers

:::example Following a button colour in light and dark theme
The Button component asks for `button.primary.background`.

| Step | Light theme | Dark theme |
|---|---|---|
| Component token | `{color.action.primary}` | `{color.action.primary}` |
| Semantic token | `{color.rose.600}` | `{color.rose.400}` |
| Primitive token | `#e11d48` | `#fb7185` |

The first row is identical in both themes. The switch happens in the middle row, at the semantic tier. The component never changes. This is the whole point of the hierarchy.
:::

:::warn Skipping the semantic tier
Beginners often write `button.primary.background = {color.rose.600}`, straight from component to primitive. It looks shorter. But now dark mode cannot change the button without editing the button's tokens, and the same shortcut repeated in 30 components means 30 edits per theme. Always go through a semantic token so that one theme file controls everything.
:::

:::interview Why do we need semantic tokens? Is a good colour palette not enough?
A palette only tells me which colours exist. It does not tell me which one to use for body text, for a border or for a danger message, so every developer picks a slightly different step. Semantic tokens record that choice once, for example `color.text.muted` points to `slate.500`. The second reason is theming. In dark mode, text is light and surfaces are dark, so a component that uses `slate.900` directly would be wrong. If it uses `color.text.default`, the theme only swaps what that name points to, and no component code changes. So primitives give the options, and semantic tokens give the decisions.
:::

:::revise
- Primitive tokens: raw values such as `color.rose.600`. The only place for hex codes.
- Semantic tokens: meaning such as `color.action.primary`. They point to primitives.
- Component tokens: one component, such as `button.primary.background`. They point to semantic tokens.
- Themes change the values of semantic tokens. Names never change.
- Never skip the semantic tier, and never use raw values in components.
- Start with two tiers if the team is small. Add component tokens when a real need appears.
:::

# Colour systems, scales and contrast

*How to build a colour palette step by step, and how to prove with numbers that text on it can be read.*

## Why it matters

A paint shop does not sell "blue". It sells a shade card: one colour family printed from very light to very dark, each strip with a code. When you need a lighter wall and a darker door, you pick two strips from the same card and they match.

A colour system gives your product the same shade card. It also answers a question that matters even more: can people actually read the text? Many people have low vision or colour blindness, and everybody struggles with a phone screen in sunlight. Contrast rules protect all of them, and they can be checked with simple maths.

## Colour scales

A **colour scale** is one colour family in ordered steps from light to dark. A common convention numbers the steps from 50 (lightest) to 900 or 950 (darkest). The numbers have no unit. They are only labels, in the same way as shirt sizes.

Here is the example palette used in this handbook. The last column is the contrast ratio of each step against pure white. You will learn to calculate it below.

| Step | Rose | Slate (neutral) | Rose on white | Slate on white |
|---|---|---|---|---|
| 50 | `#fff1f2` | `#f8fafc` | 1.10 | 1.05 |
| 100 | `#ffe4e6` | `#f1f5f9` | 1.20 | 1.10 |
| 200 | `#fecdd3` | `#e2e8f0` | 1.41 | 1.23 |
| 300 | `#fda4af` | `#cbd5e1` | 1.89 | 1.48 |
| 400 | `#fb7185` | `#94a3b8` | 2.69 | 2.56 |
| 500 | `#f43f5e` | `#64748b` | 3.67 | 4.76 |
| 600 | `#e11d48` | `#475569` | 4.70 | 7.58 |
| 700 | `#be123c` | `#334155` | 6.29 | 10.35 |
| 800 | `#9f1239` | `#1e293b` | 8.02 | 14.63 |
| 900 | `#881337` | `#0f172a` | 9.57 | 17.85 |

A typical way to use the steps in a light theme:

| Steps | Typical job |
|---|---|
| 50 to 100 | Page and card backgrounds, subtle tints |
| 200 to 300 | Borders, dividers, disabled backgrounds |
| 400 to 500 | Icons, placeholder text, decorative accents |
| 600 to 700 | Solid buttons, links, text on light backgrounds |
| 800 to 900 | Headings and body text |

:::warn Colour alone is not a message
Some users cannot tell red from green. If an error is shown only by a red border, they may not see it. Always add a second signal: an icon, a text message, or a label. WCAG calls this rule "Use of Color". A good habit is to check your screen in greyscale. If the meaning is still clear, you are safe.
:::

:::note
Colours can be written as hex (`#e11d48`), RGB, HSL or the newer **OKLCH** format, for example `oklch(0.586 0.253 17.6)`. OKLCH is designed so that equal lightness numbers look equally bright to people, which makes it well suited for building even scales. Tailwind CSS v4 writes its default palette in it. Hex values are used in this handbook because they are easy to compare.
:::

## Contrast ratio: what it is

The **contrast ratio** is a number that says how different two colours are in brightness. It goes from 1:1 (the same colour, invisible) to 21:1 (pure black on pure white).

The rules come from **WCAG**, the Web Content Accessibility Guidelines published by the W3C. The current version is WCAG 2.2. It has three levels: A (minimum), AA (the level most laws and companies aim for) and AAA (the strictest).

| What you are checking | AA | AAA |
|---|---|---|
| Normal text | 4.5 : 1 | 7 : 1 |
| Large text | 3 : 1 | 4.5 : 1 |
| UI parts and meaningful graphics | 3 : 1 | (no AAA rule) |

- **Large text** means at least 24px, or at least about 18.66px if it is bold. (WCAG writes this as 18pt, or 14pt bold.)
- **UI parts** means things you need to see to use the page: the border of an input, the outline of a checkbox, a focus ring, an icon that carries meaning.
- Text in a **disabled** control, pure decoration and logos are exempt from the contrast rule.

## Contrast ratio: how to compute it

The calculation has three steps. You will rarely do it by hand, but doing it once removes all the mystery.

:::flow Computing a contrast ratio
Hex to RGB | three numbers, 0 to 255
Linearise | undo the screen's gamma curve
Luminance | weighted sum of R, G, B
Ratio | (lighter + 0.05) / (darker + 0.05)
:::

**Relative luminance** is the brightness of a colour on a scale from 0 (black) to 1 (white), as the human eye sees it. The eye is most sensitive to green and least to blue, which is why the three channels get different weights.

```javascript
// Step 1: "#e11d48" -> [225, 29, 72]
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);       // needs 6 hex digits
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Step 2: one channel from 0..255 to linear light 0..1
function linear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

// Step 3: weighted sum. Green counts most, blue least.
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Step 4: lighter colour on top, so the result is 1 or more
function contrast(hexA, hexB) {
  const a = luminance(hexA);
  const b = luminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

console.log(contrast("#ffffff", "#e11d48").toFixed(2));   // 4.70
```

:::note
The WCAG text writes the threshold in step 2 as `0.03928`. The sRGB standard uses `0.04045`, and newer guidance recommends that value. For 8-bit colours such as hex codes, both give the same result, so do not worry if you see either number.
:::

:::example Dry run: white text on rose 600
Background `#e11d48`, text `#ffffff`.

| Channel | 0 to 255 | Divided by 255 | Linear value | Weight | Product |
|---|---|---|---|---|---|
| Red | 225 | 0.8824 | 0.7529 | 0.2126 | 0.1601 |
| Green | 29 | 0.1137 | 0.0123 | 0.7152 | 0.0088 |
| Blue | 72 | 0.2824 | 0.0648 | 0.0722 | 0.0047 |

Luminance of rose 600 = 0.1601 + 0.0088 + 0.0047 = about 0.1735. Luminance of white is 1.

Ratio = (1 + 0.05) / (0.1735 + 0.05) = 1.05 / 0.2235 = about **4.70**.

Result: 4.70 is above 4.5, so white normal text on rose 600 passes AA. It does not reach 7, so it fails AAA for normal text, but it passes AAA for large text (4.5).
:::

## Reading the palette with contrast in mind

Use the table from the start of this chapter and the thresholds together.

| Pair | Ratio | Normal text AA | Large text or UI |
|---|---|---|---|
| White on rose 500 | 3.67 | Fail | Pass |
| White on rose 600 | 4.70 | Pass | Pass |
| White on rose 700 | 6.29 | Pass | Pass |
| Slate 500 on white | 4.76 | Pass | Pass |
| Slate 400 on white | 2.56 | Fail | Fail |
| Slate 200 on white (border) | 1.23 | Not text | Fail for 3:1 |

Three practical lessons come out of this small table.

1. Rose 500 looks like a fine button colour, but white text on it fails AA. Rose 600 is the first safe step. This is why the semantic token `color.action.primary` points to 600.
2. Slate 400 is tempting for "muted" text because it looks elegant. It fails. The lightest safe grey for normal text on white in this palette is slate 500.
3. A very light border such as slate 200 does not reach 3:1. That is acceptable for a decorative divider. For the border of an input, which people need to see to find the field, choose a darker step or add another clear signal such as a visible label and background.

## Contrast in dark mode

Dark mode is not "invert the colours". You pick again from the same scales, usually lighter steps for text and action colours.

| Pair on slate 900 (`#0f172a`) | Ratio | Normal text AA |
|---|---|---|
| Slate 50 text | 17.06 | Pass |
| Slate 400 text | 6.96 | Pass |
| Slate 500 text | 3.75 | Fail |
| Rose 600 as a link colour | 3.80 | Fail |
| Rose 400 as a link colour | 6.63 | Pass |
| Slate 900 text on a rose 400 button | 6.63 | Pass |

This explains the dark theme file in the previous chapter: muted text moved from slate 500 to slate 400, the primary action moved from rose 600 to rose 400, and text on the action became dark.

:::tip
Write the tested pairs into your documentation as rules, for example "`text.on-action` is only for use on `action.primary`". A contrast ratio belongs to a pair of colours, never to a single colour.
:::

## Checking contrast in daily work

| Where | How |
|---|---|
| Browser DevTools | Click a colour swatch in the Styles panel. Chrome and Firefox show the ratio and AA or AAA marks |
| Figma | Use a contrast checker plugin, or the contrast information in the colour picker in recent versions |
| Code | Run the `contrast()` function above in a unit test over your token pairs |
| Automated tests | axe (chapter 14) reports text with too little contrast |

:::warn Things automatic checkers miss
A tool can only compare two flat colours. It cannot judge text on top of a photo or a gradient, text with reduced opacity over changing backgrounds, or hover and focus states it never triggers. Check those by eye and, when in doubt, put a solid background behind the text.
:::

:::interview What contrast ratio does WCAG AA require, and how is the ratio calculated?
AA requires at least 4.5:1 for normal text and 3:1 for large text, where large means 24px or about 18.66px bold. It also requires 3:1 for user interface components and meaningful graphics, such as input borders and focus indicators. AAA raises text to 7:1 and 4.5:1. The ratio is `(L1 + 0.05) / (L2 + 0.05)`, where L1 is the relative luminance of the lighter colour and L2 of the darker one. Relative luminance is found by converting each sRGB channel to linear light and adding them with the weights 0.2126 for red, 0.7152 for green and 0.0722 for blue. The result runs from 1:1 to 21:1.
:::

:::revise
- A colour scale is one family in ordered steps, usually 50 (light) to 900 (dark).
- Contrast ratio runs from 1:1 to 21:1 and always belongs to a pair of colours.
- AA: 4.5:1 normal text, 3:1 large text, 3:1 UI parts. AAA: 7:1 and 4.5:1.
- Formula: `(L_lighter + 0.05) / (L_darker + 0.05)` with luminance `0.2126R + 0.7152G + 0.0722B` on linear values.
- Never use colour as the only signal. Add text or an icon.
- Dark mode means choosing new steps from the scales, not inverting.
:::

# Typography, spacing and sizing scales

*A small fixed set of text sizes, gaps and dimensions that makes every screen feel like it was drawn on the same grid.*

## Why it matters

A tailor does not cut a shirt in any random size. Shirts come in 38, 40, 42, 44. Fewer choices make the work faster, and every shirt still fits someone well.

Interfaces work the same way. If a developer may type any number, you get `13px`, `15px`, `17px` and `18px` text on the same page, and gaps of `7px`, `9px` and `11px`. Each choice is harmless alone. Together they make the page look shaky. A **scale** is a short list of allowed values. You pick from the list and never type a new number.

## Units first: px, rem and em

| Unit | Meaning | Use it for |
|---|---|---|
| `px` | A fixed CSS pixel | Borders, shadows, tiny details |
| `rem` | Relative to the root font size (16px by default) | Font sizes, spacing, most sizes |
| `em` | Relative to the font size of the current element | Padding that should grow with the text |
| `ch` | About the width of the character 0 | Line length of paragraphs |
| `%`, `vw` | Relative to the parent or the viewport width | Layout widths, fluid sizes |

Users can change the default font size in their browser settings, for example from 16px to 20px, because they see better with bigger text. A size written in `rem` follows that setting. A size written in `px` ignores it.

:::warn Font sizes in px
`font-size: 14px` stays 14px even when the user has asked their browser for larger text. Write `font-size: 0.875rem` and the text grows with their setting. Designers think in pixels, and that is fine. The token pipeline should convert pixel values to `rem` for the web (divide by 16), as chapter 8 shows.
:::

## The typography scale

A **type scale** is the list of font sizes in the system. One classic way to build it is a **modular scale**: start from a base size and multiply by the same ratio for each step up.

:::example Building a scale with ratio 1.25
Base 16px, ratio 1.25. Each step is the previous step times 1.25.

| Step | Calculation | Exact | Rounded |
|---|---|---|---|
| base | 16 | 16px | 16px |
| +1 | 16 x 1.25 | 20px | 20px |
| +2 | 20 x 1.25 | 25px | 24px |
| +3 | 25 x 1.25 | 31.25px | 30px |
| +4 | 31.25 x 1.25 | 39.06px | 36px |
| +5 | 39.06 x 1.25 | 48.83px | 48px |

Real systems round the result to friendly numbers. The ratio is a starting point, not a law. Going down from the base gives 14px and 12px for small text.
:::

A complete type scale stores more than sizes. Each step has a matching **line height** (the vertical distance from one line of text to the next).

| Token | Size | Line height | Typical use |
|---|---|---|---|
| `text.xs` | 0.75rem (12px) | 1.5 | Captions, badges |
| `text.sm` | 0.875rem (14px) | 1.5 | Helper text, table cells |
| `text.base` | 1rem (16px) | 1.5 | Body text |
| `text.lg` | 1.25rem (20px) | 1.4 | Lead paragraph, card title |
| `text.xl` | 1.5rem (24px) | 1.3 | Section heading |
| `text.2xl` | 1.875rem (30px) | 1.25 | Page heading |
| `text.3xl` | 2.25rem (36px) | 1.2 | Hero heading |

Rules of thumb that hold in almost every product:

- Body text is at least 16px, with a line height around 1.5.
- Big headings need a smaller line height (1.1 to 1.3), or the lines look far apart.
- Write line height **without a unit** (`1.5`, not `24px`). A unitless value multiplies the element's own font size, so it stays correct when the size changes.
- Keep paragraphs between about 45 and 75 characters per line. `max-width: 65ch` does this in one line of CSS.
- Two or three font weights are enough: regular (400), medium or semibold (500 or 600), bold (700).

## Fluid type with clamp()

A hero heading that is 36px on a laptop is too big on a small phone. You can write two sizes with a media query, or you can let the size grow smoothly with the screen. The CSS function `clamp(min, preferred, max)` returns the preferred value but never goes below `min` or above `max`.

```css
h1 {
  /* never below 1.5rem, never above 2.25rem, fluid in between */
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
}
```

:::example Dry run of the clamp
`1vw` is 1% of the viewport width. With a 16px root, `1.2rem` is 19.2px.

| Viewport width | 1.2rem + 1.5vw | Result after clamp |
|---|---|---|
| 320px | 19.2 + 4.8 = 24px | 24px (the minimum, 1.5rem) |
| 768px | 19.2 + 11.52 = 30.72px | 30.72px |
| 1120px | 19.2 + 16.8 = 36px | 36px (the maximum, 2.25rem) |
| 1440px | 19.2 + 21.6 = 40.8px | 36px (held at the maximum) |

Notice the `rem` part inside the middle value. Because of it, the text still grows when the user raises their browser font size. A value made only of `vw` would not.
:::

## The spacing scale

**Spacing** is the empty room inside and between elements: padding, margin and gap. Most systems build spacing on a **base unit** of 4px. Every allowed gap is a multiple of 4.

| Token | Value | rem | Typical use |
|---|---|---|---|
| `space.1` | 4px | 0.25rem | Gap between an icon and its label |
| `space.2` | 8px | 0.5rem | Padding of small controls |
| `space.3` | 12px | 0.75rem | Vertical padding of a button |
| `space.4` | 16px | 1rem | Default padding, gap between fields |
| `space.6` | 24px | 1.5rem | Card padding |
| `space.8` | 32px | 2rem | Gap between groups |
| `space.12` | 48px | 3rem | Gap between page sections |
| `space.16` | 64px | 4rem | Large page margins |

The name tells you the value: multiply the step by 4. `space.6` is 6 x 4 = 24px. The steps get further apart as they grow, because the eye does not notice the difference between 60px and 64px, but it clearly sees 4px against 8px.

Spacing also carries meaning. Things that belong together sit close. Things that are separate sit far apart. This is called the **proximity** principle.

:::flow Spacing shows grouping
Icon and label | 4 to 8px
Label and its input | 8px
One field to the next | 16px
One form group to the next | 32px
One page section to the next | 48 to 64px
:::

## Sizing, radius, borders and elevation

The same idea applies to every other repeated number.

| Scale | Example tokens | Notes |
|---|---|---|
| Control height | `size.control.sm` 32px, `md` 40px, `lg` 48px | Buttons and inputs share it, so they line up in a row |
| Icon size | 16px, 20px, 24px | Match the text size next to the icon |
| Radius | `radius.sm` 4px, `md` 8px, `lg` 12px, `full` 9999px | `full` makes pills and circles |
| Border width | 1px, 2px | 2px is common for focus rings |
| Elevation | `shadow.sm`, `shadow.md`, `shadow.lg` | Higher layers get bigger, softer shadows |
| Breakpoints | 640px, 768px, 1024px, 1280px | Widths where the layout changes |
| Layer order | `z.dropdown`, `z.modal`, `z.toast` | Named `z-index` values end the "9999 war" |

:::warn Off-scale values
"The design looks better with 14px here" is how a scale dies. One exception becomes ten. If a value is really needed in several places, add it to the scale as a proper step so everybody can use it. If it is needed once, question it. In code reviews, any raw pixel number in a component is worth a comment.
:::

:::interview What is the difference between rem, em and px, and which do you use for a design system?
`px` is a fixed CSS pixel. `rem` is relative to the root font size, which is 16px by default but can be changed by the user. `em` is relative to the font size of the current element, so it compounds when elements are nested. For a design system I use `rem` for font sizes and spacing, so the whole interface scales when a user increases their default font size. I keep `px` for things that should not scale, such as a 1px border. I use `em` only when a size must follow the local text size, for example the padding of a badge that appears at several font sizes.
:::

:::revise
- A scale is a short list of allowed values. Pick from it and never invent a number.
- Use `rem` for font sizes and spacing so the UI follows the user's font setting.
- Type scale: base 16px, a ratio such as 1.25, rounded to friendly sizes, each with a line height.
- Body line height about 1.5 and unitless. Line length about 45 to 75 characters.
- Spacing scale on a 4px base: `space.4` is 16px. Close means related, far means separate.
- Control heights, radius, shadows, breakpoints and z-index are scales too.
:::

# Figma variables, collections and modes

*Variables are how Figma stores design tokens: named values that can change with a mode such as light or dark.*

## Why it matters

So far the tokens lived in JSON files. But designers do not work in JSON. They work in Figma. If the Figma file uses its own colours and the code uses the token file, the two will drift apart within weeks.

**Figma variables** close this gap. A variable in Figma is a token that designers can apply to a layer. Think of a spreadsheet: each row is a name, and each column holds the value for one situation. Change the cell and every layer that uses the name updates.

## The idea

A **variable** is a named, reusable value in Figma. There are four types.

| Variable type | Stores | Can be applied to |
|---|---|---|
| Color | A solid colour | Fills, strokes, shadow colours |
| Number | A number | Spacing, padding, radius, width, height, font size, stroke width |
| String | Text | Text content, font family, font style |
| Boolean | True or false | Layer visibility, boolean component properties |

A **collection** is a group of variables that share the same set of modes. A **mode** is one column of values for that collection. Variables are created and edited in the variables panel, which opens from the Local variables section when nothing is selected on the canvas.

Here is a semantic colour collection, shown the way Figma shows it: one row per variable, one column per mode.

| Variable name | Light mode | Dark mode |
|---|---|---|
| `color/surface/default` | `white` | `slate/900` |
| `color/text/default` | `slate/900` | `slate/50` |
| `color/text/muted` | `slate/500` | `slate/400` |
| `color/action/primary` | `rose/600` | `rose/400` |
| `color/text/on-action` | `white` | `slate/900` |

Two things in this table should feel familiar.

- The slash in a name creates **groups**, just like folders. `color/text/muted` is the Figma spelling of the token `color.text.muted`.
- The values are not hex codes. They point to other variables. Figma calls this an **alias**. It is the same idea as `{color.slate.500}` in the JSON format.

## A collection structure that mirrors the tiers

Use one collection per tier. This is the most common setup and it maps directly to chapter 3.

| Collection | Modes | Contains | Used by designers? |
|---|---|---|---|
| Primitives | One (often called Value) | Raw palette, raw numbers | No, hidden from the pickers |
| Theme (semantic) | Light, Dark | Aliases to primitives | Yes, for everything |
| Brand (optional) | Brand A, Brand B | Brand palette aliases | Indirectly, through Theme |
| Layout (optional) | Mobile, Desktop or Compact, Comfortable | Spacing and sizes that change | Yes |

:::flow How an alias chain resolves in Figma
Layer fill | uses color/action/primary
Theme collection | Dark mode says brand/400
Brand collection | Brand B mode says indigo/400
Primitives | indigo/400 is a hex value
:::

## How modes are applied

You do not switch the mode of the whole file. You set a mode on a **layer**: a page, a section, a frame or a single component instance. Everything inside it follows, unless a child sets its own mode. The default setting is **Auto**, which means "use whatever my parent uses".

This works exactly like inheritance in CSS, which you will use in chapter 9.

| In Figma | In CSS |
|---|---|
| Set the Theme collection of a frame to Dark | Add `data-theme="dark"` to an element |
| Children with Auto follow the frame | Children inherit the custom properties |
| A nested frame set to Light overrides it | A nested `data-theme="light"` overrides it |

:::example One design, four results
You draw one sign-in card. It uses only semantic variables. Then you place four copies in four frames.

| Frame | Theme mode | Brand mode | Button colour resolves to |
|---|---|---|---|
| 1 | Light | Brand A | `rose/600` |
| 2 | Dark | Brand A | `rose/400` |
| 3 | Light | Brand B | `indigo/600` |
| 4 | Dark | Brand B | `indigo/400` |

You designed the card once. The four looks come only from the modes set on the frames. If a layer inside the card used a raw hex code, it would stay the same in all four frames, and you would spot the mistake immediately. This is a useful review trick.
:::

## Multi-brand with a brand collection

For two brands, the primitive collection holds both palettes (`rose/...` and `indigo/...`). The Brand collection has generic names and one mode per brand.

| Brand variable | Brand A mode | Brand B mode |
|---|---|---|
| `brand/400` | `rose/400` | `indigo/400` |
| `brand/600` | `rose/600` | `indigo/600` |
| `brand/700` | `rose/700` | `indigo/700` |

The Theme collection then points to the brand names instead of a fixed palette: `color/action/primary` is `brand/600` in Light and `brand/400` in Dark. Now two independent switches exist, theme and brand, and they combine without any extra work.

## Scoping, hiding and code syntax

Three small settings on each variable make a big difference in a team.

- **Scoping** limits where a variable is offered. You can say that `radius/md` appears only in the corner radius field, and `color/text/muted` only for text fills. Designers then see a short, relevant list and cannot pick a text colour for a border by accident.
- **Hide from publishing** keeps a variable out of the lists in other files. Hide the whole Primitives collection so that designers pick semantic variables only. The primitives still work behind the aliases.
- **Code syntax** lets you store the code name of each variable, for example `var(--color-text-muted)` for the web. Developers see this name when they inspect a layer in Dev Mode, so nobody has to guess the mapping.

Add a **description** to semantic variables as well. "Use for secondary text such as hints and timestamps" answers a question before it is asked.

## Variables and styles

Figma also has **styles**, which are older than variables. They are still needed.

| | Variables | Styles |
|---|---|---|
| Holds | One raw value per mode | A group of properties |
| Good for | Colours, numbers, strings, booleans | Text styles, shadows, gradients, layout grids |
| Modes | Yes | No, but a style can use variables that have modes |
| Aliasing | A variable can point to a variable | A style can use variables inside it |

A practical split: use variables for every single value, and use text styles and effect styles for the composite tokens, built from variables. A text style "Heading/Large" can take its font size and line height from Number variables.

:::warn Plan limits on modes
The number of modes you can add to one collection depends on your Figma plan. On the free Starter plan a collection can have only one mode, so a real Light and Dark setup with modes needs a paid plan. Higher plans allow more modes per collection. These limits have changed more than once, so check the current Figma pricing page before you design your collection structure. On a free plan you can still learn everything in this chapter by using one mode and a second collection for practice.
:::

:::warn Applying primitives directly to layers
If a designer fills a card with `slate/50` instead of `color/surface/subtle`, the card looks correct in light mode and stays light in dark mode. It is the Figma version of skipping the semantic tier. Prevent it with the tools above: hide primitives from publishing and scope them so they do not appear in the fill picker.
:::

:::interview How would you set up light and dark themes in Figma using variables?
I would create two collections. The first is Primitives, with one mode, holding the raw colour scales. I would hide it from publishing so designers do not use it directly. The second is a Theme collection with two modes, Light and Dark. Its variables have semantic names such as `color/surface/default` and `color/text/muted`, and each mode holds an alias to a primitive. Components use only the Theme variables. To preview dark mode, I set the Theme mode of a frame to Dark and everything inside follows. I would also set scoping so text colours only appear for text, and fill in the code syntax field so developers see the CSS variable name in Dev Mode. One note: several modes per collection need a paid plan.
:::

:::revise
- A Figma variable is a design token: Color, Number, String or Boolean.
- A collection groups variables. A mode is one column of values, such as Light or Dark.
- Use one collection per tier: Primitives (one mode), Theme (Light, Dark), optional Brand and Layout.
- Modes are set on a frame or page and inherited by children, like CSS inheritance.
- Hide and scope primitives so that designers use only semantic variables.
- Styles are still used for text styles, shadows and gradients. Modes per collection depend on the plan.
:::

# Figma components, variants and auto layout

*Components are reusable design parts, variants are their options, and auto layout is how they stretch and shrink like real CSS.*

## Why it matters

A rubber stamp saves you from drawing the same seal a hundred times. Better still, imagine a magic stamp: when you fix the original, every print already on paper fixes itself. That is a Figma component.

For a developer, Figma components matter for another reason. A well-built Figma component is a clear specification of the React component you must write: its props, its states and its layout rules. If you can read one, you can build the other.

## Main components and instances

A **main component** is the original. An **instance** is a linked copy placed in a design. Changing the main component updates all its instances.

An instance can change some things locally, such as its text or a colour. This is called an **override**. Overrides survive when the main component is updated.

:::warn Detaching instances
"Detach instance" turns a linked copy into plain layers. It feels like freedom, but that copy will never receive updates again, and it will not match the coded component. If the component cannot do what you need, that is feedback for the design system: ask for a new property or variant. Detach only for quick experiments.
:::

## Component properties

A component exposes its options as **properties**. There are four kinds.

| Property type | What it controls | Example |
|---|---|---|
| Variant | A choice from a list | `variant`: primary, secondary, ghost |
| Boolean | Show or hide something | `hasIcon`: true or false |
| Instance swap | Which nested component is used | `icon`: any icon from the icon set |
| Text | The content of a text layer | `label`: "Save changes" |

A **component set** is a group of variants of one component, shown inside a dashed border in Figma. Each variant is one combination of the variant properties.

These properties map almost one to one to React props. This table is worth remembering.

| Figma property | React prop | Example |
|---|---|---|
| Variant `variant` | A string union prop | `variant="primary"` |
| Variant `size` | A string union prop | `size="md"` |
| Boolean `disabled` | A boolean prop | `disabled` |
| Instance swap `icon` | A prop that takes an element | `icon={<SaveIcon />}` |
| Text `label` | `children` | `<Button>Save</Button>` |

:::tip
Use the same property names and the same option names in Figma and in code. If Figma says `variant = primary` and the code says `kind="main"`, every handoff needs a translation, and translations cause bugs.
:::

## The variant explosion

Variant properties multiply.

:::example Counting variants
A Button has these options.

| Property | Options | Count |
|---|---|---|
| `variant` | primary, secondary, ghost, danger | 4 |
| `size` | sm, md, lg | 3 |
| `state` | default, hover, focus, disabled, loading | 5 |
| icon | none, left, right | 3 |

As pure variants: 4 x 3 x 5 x 3 = **180** separate drawings to create and maintain.

Now make the icon a Boolean plus an Instance swap property. It no longer multiplies: 4 x 3 x 5 = **60**. This is why you should use Boolean, Text and Instance swap properties whenever a difference does not need its own drawing.
:::

Interaction states such as hover and focus are usually kept as variants, because the developer must see exactly how each state looks. In code they will not be props. They will be CSS states, as chapter 12 explains.

## Auto layout is flexbox

**Auto layout** makes a frame arrange its children automatically, in a row or a column, with a gap and padding. If the text gets longer, the button grows. If you delete an item, the rest closes up. It follows the same model as CSS flexbox, so the translation to code is direct.

| Auto layout setting | CSS |
|---|---|
| Direction: horizontal or vertical | `flex-direction: row` or `column` |
| Gap between items | `gap` |
| Padding | `padding` |
| Alignment grid (9 positions) | `justify-content` and `align-items` |
| Gap set to Auto | `justify-content: space-between` |
| Wrap | `flex-wrap: wrap` |
| Ignore auto layout (absolute position) | `position: absolute` |

Recent Figma versions also offer a grid flow for auto layout, which maps to CSS grid in the same spirit.

### Hug, Fill and Fixed

Every layer inside auto layout has a resizing rule for width and one for height. These three words confuse beginners the most, so here they are side by side.

| Rule | Meaning | Closest CSS |
|---|---|---|
| Hug contents | Be as big as my children need | `width: fit-content` (the default of an inline-flex box) |
| Fill container | Take the free space of my parent | `flex: 1` on the main axis, `align-self: stretch` on the other |
| Fixed | Stay at this exact number | `width: 240px` |

You can also set a minimum and maximum width or height, which map to `min-width` and `max-width`.

## Reading a Figma button as code

Here is a Button described in words, the way you would read it in the layers panel and the design panel.

```text
Button (component set: variant, size, state)
  auto layout: horizontal, gap = space/2, align = center
  padding: horizontal = space/4, vertical = space/3
  width: Hug, height: Fixed = size/control-height
  fill: color/action/primary   radius: radius/md
    Icon   (instance swap, visible = hasIcon, 20 x 20)
    Label  (text property, style = Label/Medium,
            fill = color/text/on-action)
```

And the CSS that says the same thing:

```css
.button {
  display: inline-flex;                 /* horizontal auto layout, Hug */
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  height: var(--size-control-md);       /* Fixed height: 40px */
  border-radius: var(--radius-md);
  background: var(--color-action-primary);
  color: var(--color-text-on-action);
  font: 600 0.875rem/1 var(--font-family-sans);
}
```

Every number in the CSS is a token, because every number in the Figma component is a variable. That is the test of a healthy system: nothing is typed by hand on either side.

## From component to shared library

- **Naming.** Slashes create groups in the assets panel: `Button`, `Form/Input`, `Form/Select`. Name layers too. "Frame 427" tells a developer nothing.
- **Description and links.** A component can carry a description and a link to its documentation page.
- **Publishing.** A file can be published as a **library**. Other files turn the library on and use its components and variables. When you publish an update, other files see a notice and can review the changes before accepting them. Team libraries need a paid plan.
- **Dev Mode.** A view for developers that shows sizes, variables and code hints for the selected layer. It is a paid feature in most cases.
- **Code Connect.** A Figma feature that shows your real component code in Dev Mode instead of generated CSS, by linking a Figma component to its code. It is available on some paid plans only.

:::warn A component that is only a picture
A button drawn with a fixed-width rectangle and a text layer placed on top by hand looks fine until someone changes the label to a longer word. Then the text overflows. Components without auto layout cannot be trusted by designers, and they tell developers nothing about padding or behaviour. Build every component with auto layout from the first day.
:::

:::interview How do Figma auto layout settings map to CSS?
Auto layout follows the flexbox model. Horizontal or vertical direction is `flex-direction`. The gap is `gap` and the padding is `padding`. The alignment control maps to `justify-content` and `align-items`, and an Auto gap is `space-between`. For sizing, Hug contents means the element is as large as its content, like `fit-content`. Fill container means it takes the remaining space, like `flex: 1` along the main axis or `align-self: stretch` across it. Fixed is an explicit width or height. Wrap is `flex-wrap`, and a child set to ignore auto layout is like `position: absolute`.
:::

:::revise
- A main component is the original. Instances are linked copies that receive updates.
- Four property types: Variant, Boolean, Instance swap, Text. They map to React props.
- Variants multiply. Use Boolean, Text and Instance swap properties to keep the count down.
- Auto layout is flexbox: direction, gap, padding, alignment, wrap.
- Hug is fit-content, Fill is flex 1 or stretch, Fixed is an exact size.
- Bind every value to a variable and use the same names in Figma and in code.
:::

# Exporting tokens and transforming them with Style Dictionary

*How token values leave Figma as JSON, and how one build step turns that JSON into CSS, TypeScript and anything else you need.*

## Why it matters

A newspaper is written once and printed in many cities. Nobody retypes it in each city. A press takes the same text and prints it in the local format.

Tokens need the same press. Designers change a colour in Figma. Without automation, a developer must notice, open the CSS file and copy the value by hand. People forget, mistype and skip values. With a pipeline, the change travels on its own and arrives as a pull request that someone only has to review.

:::flow The token pipeline
Figma variables | designers edit
Export | plugin or REST API
tokens/*.json | stored in Git
Style Dictionary | build step
CSS, TS, more | platform files
:::

## Getting tokens out of Figma

There are three realistic routes. They differ in cost and effort.

| Route | How it works | Plan needed | Good for |
|---|---|---|---|
| Tokens Studio plugin | A Figma plugin that manages tokens and syncs JSON to a Git repository | Works on free Figma. The plugin has free and paid tiers | Most small and medium teams |
| Figma REST API (variables endpoints) | A script calls the API and reads all variables | Figma Enterprise plan | Large teams with automation |
| Your own or a community plugin | A plugin reads variables through the Plugin API and exports JSON | Works on any plan | Teams that want full control without Enterprise |

:::warn The variables REST API is an Enterprise feature
The REST endpoints that read and write variables are available only for files in an Enterprise organisation, and the access token needs the variables scope. Many tutorials do not mention this, and students lose hours on a "403 Forbidden" error. If you are on a free or Professional plan, use a plugin route. Plugins can read variables on every plan, because they run inside the Figma file itself.
:::

### Route 1: Tokens Studio

**Tokens Studio** (earlier called Figma Tokens) is a popular Figma plugin for design tokens. In short:

- Tokens are organised in **token sets**, such as `primitive`, `semantic/light`, `semantic/dark`. Each set becomes one JSON file.
- The plugin can **sync** with a Git provider such as GitHub. Designers press push, and a commit or pull request with the changed JSON appears in the repository.
- It can create and update Figma variables and styles from the tokens, and import existing variables.
- The basic features are free. Some advanced features belong to its paid plan, and the split changes over time, so check its current pricing.

Tokens Studio JSON has a few features of its own (for example maths in values). The package `@tokens-studio/sd-transforms` teaches Style Dictionary to understand them.

### Route 2: the REST API

If your organisation is on Enterprise, a script can read the variables directly.

```bash
# FILE_KEY is the part of the Figma file URL after /design/
# FIGMA_TOKEN is a personal access token with the variables read scope
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/variables/local" \
  -o figma-variables.json
```

The answer contains two maps: `variableCollections` (each collection with its modes, such as Light with mode id `1:0` and Dark with `1:1`) and `variables` (each variable with one value per mode). Here is one variable, shortened.

```json
{
  "meta": {
    "variables": {
      "VariableID:5:10": {
        "name": "color/action/primary",
        "resolvedType": "COLOR",
        "variableCollectionId": "VariableCollectionId:1:2",
        "valuesByMode": {
          "1:0": { "type": "VARIABLE_ALIAS", "id": "VariableID:2:7" },
          "1:1": { "type": "VARIABLE_ALIAS", "id": "VariableID:2:5" }
        }
      }
    }
  }
}
```

Two details need care when you convert this to token JSON. A raw colour comes as an object with `r`, `g`, `b` and `a` between 0 and 1, not as a hex code. An alias comes as the **id** of another variable, which you must turn into a name.

```javascript
// Turn one Figma value into a DTCG "$value"
function toHex({ r, g, b }) {
  const part = (x) =>
    Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;      // alpha ignored here
}

function toTokenValue(value, variables) {
  if (value?.type === "VARIABLE_ALIAS") {
    const target = variables[value.id];          // look up by id
    return `{${target.name.replaceAll("/", ".")}}`;
  }
  if (typeof value === "object") return toHex(value);   // raw colour
  return value;                                  // number, string, boolean
}

const vars = {
  "VariableID:2:7": { name: "color/rose/600" },
};
const alias = { type: "VARIABLE_ALIAS", id: "VariableID:2:7" };

console.log(toTokenValue(alias, vars));          // {color.rose.600}
console.log(toTokenValue({ r: 1, g: 1, b: 1, a: 1 }, vars)); // #ffffff
```

A full script loops over every variable and every mode and writes one JSON file per mode. The idea is exactly the function above.

## Style Dictionary: the press

**Style Dictionary** is an open source build tool for design tokens. It reads token JSON, resolves aliases, converts values for each platform and writes the output files. The description below matches version 4 and later, which use modern JavaScript modules.

```bash
npm install --save-dev style-dictionary
```

Three words explain how it works.

| Word | Meaning | Example |
|---|---|---|
| Transform | Changes one token's name or value | `16px` becomes `1rem`. The path becomes `color-rose-600` |
| Format | Writes all tokens into one file | A `:root { ... }` block of CSS variables |
| Platform | A named output with its transforms and files | `css`, `js`, `android` |

A **transform group** is a ready-made list of transforms for a platform, such as `css` or `js`.

The examples below assume this layout: `tokens/primitive/` for raw values, `tokens/semantic/` for the light theme, `tokens/themes/dark.json` for the values that change in dark, and a `build/` folder for generated files.

### The config

```javascript
// sd.config.mjs
export default {
  source: ["tokens/primitive/**/*.json", "tokens/semantic/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",          // kebab-case names, CSS values
      transforms: ["size/pxToRem"],   // extra step: 16px -> 1rem
      buildPath: "build/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: { outputReferences: true },   // keep var() links
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "build/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        {
          destination: "tokens.d.ts",
          format: "typescript/es6-declarations",
        },
      ],
    },
  },
};
```

```bash
npx style-dictionary build --config sd.config.mjs
```

### The output

With the primitive and semantic files from chapter 3 (shortened), the CSS platform writes this.

```css
/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  --color-white: #ffffff;
  --color-rose-400: #fb7185;
  --color-rose-600: #e11d48; /** Main brand rose */
  --color-slate-900: #0f172a;
  --space-4: 1rem;
  --color-action-primary: var(--color-rose-600);
  --color-surface-default: var(--color-white);
}
```

:::example What happened to one token
Follow `color.action.primary` through the build.

| Stage | Result |
|---|---|
| Read | Path `color`, `action`, `primary`. Value `{color.rose.600}` |
| Resolve alias | The value becomes `#e11d48` |
| Name transform | The name becomes `color-action-primary` |
| Format `css/variables` | The line `--color-action-primary: ...;` is written |
| Option `outputReferences` | The value is written as `var(--color-rose-600)` and not as the hex code |

The option `outputReferences: true` keeps the alias alive in CSS. Without it you get `--color-action-primary: #e11d48;`. Both are correct. Keeping the reference makes the CSS easier to read and debug. The JavaScript platform writes resolved constants such as `ColorActionPrimary = "#e11d48"`.
:::

### Building the dark theme

The dark file has the same token names as the light semantic file, so they cannot be loaded together. A simple approach is a second, small config. It uses `include` for the primitives (needed to resolve aliases) and `source` for the dark values.

```javascript
// sd.dark.mjs
export default {
  include: ["tokens/primitive/**/*.json"],   // for references only
  source: ["tokens/themes/dark.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/",
      files: [
        {
          destination: "tokens.dark.css",
          format: "css/variables",
          filter: (token) => token.isSource,   // skip the primitives
          options: {
            selector: '[data-theme="dark"]',   // not :root
            outputReferences: true,
          },
        },
      ],
    },
  },
};
```

```css
/* build/tokens.dark.css */
[data-theme="dark"] {
  --color-action-primary: var(--color-rose-400);
  --color-surface-default: var(--color-slate-900);
}
```

Style Dictionary prints a warning here that "filtered out token references were found". It is telling you that the file points to variables it does not define itself. That is intended, because `tokens.css` defines them and both files are loaded together.

Put both builds behind one npm script and run it in **CI** (continuous integration: a server that runs your scripts on every pull request). A token change can affect the whole product, so a person should review the diff of the JSON and the generated CSS before it ships.

:::warn Editing generated files
Never fix a value directly in `build/tokens.css`. The next build overwrites it and your fix disappears without any error. Change the source: the Figma variable or the JSON in `tokens/`. Many teams do not even commit the `build/` folder. They generate it during the package build.
:::

:::interview How do design tokens get from Figma into code in an automated way?
The values are defined as Figma variables. They are exported as JSON, either with a plugin such as Tokens Studio that syncs to a Git repository, or with a script that calls the Figma REST API variables endpoints, which need an Enterprise plan. The JSON is committed, ideally in the DTCG format with `$value` and `$type`. A build tool, usually Style Dictionary, then reads the JSON, resolves aliases, applies transforms such as converting pixels to rem and names to kebab case, and writes platform files like CSS custom properties and TypeScript constants. This runs in CI, and the result is published as a versioned package. The key idea is one source of truth and no hand copying.
:::

:::revise
- Export routes: Tokens Studio plugin, the Figma REST API (Enterprise only), or your own plugin.
- Figma returns colours as `r g b a` from 0 to 1 and aliases as variable ids. Convert both.
- Style Dictionary: transforms change single tokens, formats write files, platforms group them.
- `outputReferences: true` keeps aliases as `var(--...)` in the CSS output.
- Build the dark theme as a second file with a `[data-theme="dark"]` selector.
- Never edit generated files. Change the source and rebuild in CI.
:::

# CSS custom properties, theming and dark mode

*CSS variables are how tokens live in the browser, and redefining them on one element is all it takes to switch a theme.*

## Why it matters

A theatre uses the same stage and the same actors for a day scene and a night scene. Only the lights change. Nobody rebuilds the set.

Theming on the web should work the same way. The components are the actors. The CSS custom properties are the lights. To switch to dark mode you should not load a second stylesheet full of rewritten components. You change the values of a few variables and every component follows.

## The idea

A **CSS custom property**, often called a CSS variable, is a property whose name starts with two dashes. You define it on an element and read it with the `var()` function.

```css
:root {
  --color-action-primary: #e11d48;    /* define */
  --radius-md: 0.5rem;
}

.button {
  background: var(--color-action-primary);   /* use */
  border-radius: var(--radius-md);
  /* a fallback is used when the variable is not defined */
  padding: var(--button-padding, 0.75rem 1rem);
}
```

`:root` is the top element of the page (the `html` element), so variables defined there are available everywhere.

Custom properties have three behaviours that make them perfect for tokens.

| Behaviour | What it means | Why it helps |
|---|---|---|
| They inherit | Children get the value of their parent | Define once at the top, use anywhere |
| They follow the cascade | A more specific or later rule wins | A theme can redefine them for part of the page |
| They resolve at run time | The browser substitutes the value when it paints | Themes switch without rebuilding CSS |

A variable in a preprocessor such as Sass is replaced at build time and is gone in the browser. A custom property stays alive in the browser, and that is why it can change with a class, an attribute or a media query.

## Theming by redefining semantic variables

Load the primitives once. Then give each theme its own values for the semantic names.

```css
/* Primitives: never change with the theme */
:root {
  --color-white: #ffffff;
  --color-slate-50: #f8fafc;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-900: #0f172a;
  --color-rose-400: #fb7185;
  --color-rose-600: #e11d48;
}

/* Semantic: light theme is the default */
:root {
  --color-surface-default: var(--color-white);
  --color-text-default: var(--color-slate-900);
  --color-text-muted: var(--color-slate-500);
  --color-action-primary: var(--color-rose-600);
  --color-text-on-action: var(--color-white);
}

/* Semantic: dark theme redefines the same names */
[data-theme="dark"] {
  --color-surface-default: var(--color-slate-900);
  --color-text-default: var(--color-slate-50);
  --color-text-muted: var(--color-slate-400);
  --color-action-primary: var(--color-rose-400);
  --color-text-on-action: var(--color-slate-900);
}
```

Components use only the semantic names and never mention a theme.

```css
.card {
  background: var(--color-surface-default);
  color: var(--color-text-default);
}

.card .hint {
  color: var(--color-text-muted);
}
```

:::example Dry run: how the browser finds a colour
The page has `data-theme="dark"` on the `html` element. The browser paints `.card .hint`.

| Step | What the browser does | Result |
|---|---|---|
| 1 | Reads `color: var(--color-text-muted)` | Needs the variable |
| 2 | Looks on `.hint`, then on its parents | Finds it on `html` |
| 3 | Two rules define it there: `:root` and `[data-theme="dark"]` | Same specificity, so the later rule wins |
| 4 | Value is `var(--color-slate-400)` | Needs another variable |
| 5 | Finds `--color-slate-400` on `:root` | `#94a3b8` |

Remove the attribute and step 3 has only one rule, so the answer becomes slate 500. No component CSS was touched.
:::

:::warn Order matters
`:root` and `[data-theme="dark"]` have the same specificity (one pseudo-class against one attribute selector). When specificity is equal, the rule that comes **later** in the CSS wins. So the dark file must be loaded after the default file. If dark mode "does nothing", check the order of your imports first.
:::

## Themes can be nested

Because variables inherit, a theme can apply to only a part of the page. Put `data-theme="dark"` on a sidebar and only the sidebar turns dark. For a light island inside a dark page, also write the light values under a `[data-theme="light"]` selector, not only under `:root`.

## Respecting the system setting

Operating systems have a light or dark setting. The browser exposes it through the media feature `prefers-color-scheme`. A good theme system has three choices: light, dark, and "follow the system".

```css
/* Follow the system, unless the user chose a theme explicitly */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-surface-default: var(--color-slate-900);
    --color-text-default: var(--color-slate-50);
    --color-text-muted: var(--color-slate-400);
    --color-action-primary: var(--color-rose-400);
    --color-text-on-action: var(--color-slate-900);
  }
}
```

This repeats the dark values once. A build tool can generate both blocks from the same token file, so you do not maintain the copy by hand.

### Tell the browser too: color-scheme

Your variables style your own components. But the browser draws some things itself: scrollbars, the default look of form controls, the date picker. The `color-scheme` property tells the browser which scheme to use for those.

```css
:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
```

Without it, a dark page can show a bright white scrollbar.

## A theme switcher in JavaScript

The switcher has two jobs: set the attribute and remember the choice.

```javascript
// theme.js
const KEY = "theme";                       // "light" | "dark" | "system"

export function applyTheme(choice) {
  const root = document.documentElement;   // the <html> element
  if (choice === "system") {
    root.removeAttribute("data-theme");    // let the media query decide
  } else {
    root.setAttribute("data-theme", choice);
  }
}

export function setTheme(choice) {
  localStorage.setItem(KEY, choice);       // remember for next visit
  applyTheme(choice);
}

export function getSavedTheme() {
  return localStorage.getItem(KEY) ?? "system";
}
```

### Avoiding the flash of the wrong theme

If the theme is applied after the page has rendered, a user in dark mode sees a white page for a moment. To prevent this, run a tiny script in the `head`, before the body is painted.

```html
<head>
  <script>
    // Runs before first paint. Keep it tiny and dependency-free.
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  </script>
  <link rel="stylesheet" href="/tokens.css" />
</head>
```

If nothing is saved, no attribute is set, and the `prefers-color-scheme` media query takes over. No flash in either case.

## Multi-brand uses the same trick

A brand is just another attribute that redefines variables. Under `[data-brand="neel"]` you redefine brand variables such as `--brand-600`, and the theme layer points to them: `--color-action-primary: var(--brand-600)`. This mirrors the Brand and Theme collections in Figma from chapter 6. Set both attributes on the same element, usually `html`, so the two layers are resolved together.

:::interview How would you implement dark mode in a web application?
I would define all colours as CSS custom properties with semantic names, such as `--color-surface-default` and `--color-text-default`, and make every component use only those. The light values go on `:root`. The dark values go under a selector such as `[data-theme="dark"]`, which redefines the same variable names. For the default I respect the system setting with `prefers-color-scheme`, and I let the user override it with a toggle that sets the attribute on the `html` element and saves the choice in `localStorage`. To avoid a flash of the wrong theme, a small inline script in the `head` applies the saved choice before first paint. I also set `color-scheme` so native controls and scrollbars match, and I re-check contrast for the dark values.
:::

:::revise
- A custom property is defined as `--name: value` and read with `var(--name, fallback)`.
- Custom properties inherit, follow the cascade and resolve at run time.
- Theming: redefine the semantic variables under `[data-theme="dark"]`. Components do not change.
- Equal specificity means the later rule wins, so load theme overrides after the defaults.
- Respect `prefers-color-scheme`, set `color-scheme`, and save the user's choice.
- Apply the saved theme in a small `head` script to avoid a flash of the wrong theme.
:::

# Tailwind CSS v4: the theme as CSS variables

*Tailwind v4 reads your theme from CSS itself, so design tokens become utility classes with a few lines inside @theme.*

## Why it matters

You now have tokens as CSS variables. You could write every component in plain CSS with `var(...)`. Many teams prefer **Tailwind CSS**, a framework where you style elements with small single-purpose classes called **utility classes**, such as `p-4` for padding or `text-sm` for small text.

Think of a box of Lego bricks. Tailwind's default box has bricks in its own colours and sizes. A design system needs the bricks in **your** colours and sizes. In Tailwind v4 you do this in CSS, with a block called `@theme`. In version 3 the theme lived in a JavaScript file named `tailwind.config.js`. Version 4 moved it into CSS and builds everything on CSS variables, which fits a token pipeline very well.

## Setup with Vite

```bash
npm install tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/styles.css: one import replaces the old three @tailwind lines */
@import "tailwindcss";
```

Tailwind v4 scans your source files for class names by itself. There is no `content` list to configure in the common case.

## The idea: theme variables create utilities

Inside `@theme`, a CSS variable is not only a variable. Its **name** tells Tailwind which utility classes to create. The first part of the name is called the **namespace**.

```css
@import "tailwindcss";

@theme {
  --color-brand-600: #e11d48;     /* bg-brand-600, text-brand-600, ... */
  --font-sans: "Inter", system-ui, sans-serif;   /* font-sans */
  --radius-md: 0.5rem;            /* rounded-md */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);        /* ease-out */
}
```

| Namespace | Utilities it creates | Example class |
|---|---|---|
| `--color-*` | Background, text, border, ring, fill and more | `bg-brand-600` |
| `--font-*` | Font family | `font-sans` |
| `--text-*` | Font size | `text-sm` |
| `--font-weight-*` | Font weight | `font-semibold` |
| `--spacing` | Padding, margin, gap, width, height | `p-4`, `gap-2`, `h-10` |
| `--radius-*` | Border radius | `rounded-md` |
| `--shadow-*` | Box shadow | `shadow-md` |
| `--breakpoint-*` | Responsive variants | `md:flex` |
| `--ease-*`, `--animate-*` | Easing and animations | `ease-out` |

Tailwind also writes these theme variables to `:root` in the final CSS. So `var(--color-brand-600)` works in your own CSS too.

### Spacing is one number

Tailwind v4 derives the whole spacing scale from one variable, `--spacing`, which is `0.25rem` (4px) by default. The class `p-4` means "4 times the spacing unit".

:::example Dry run: what p-4 becomes
| Class | Generated CSS | Computed value |
|---|---|---|
| `p-4` | `padding: calc(var(--spacing) * 4)` | 4 x 0.25rem = 1rem = 16px |
| `gap-2` | `gap: calc(var(--spacing) * 2)` | 0.5rem = 8px |
| `h-10` | `height: calc(var(--spacing) * 10)` | 2.5rem = 40px |

This is the same 4px grid as the `space` tokens in chapter 5: `space.4` is 16px and so is `p-4`. The scales line up, so designers and developers use the same step numbers.
:::

## Connecting your semantic tokens

The goal: classes such as `bg-surface` and `text-fg-muted` that follow the theme automatically. The token CSS files from chapter 8 are imported first. Then `@theme` maps them to Tailwind names.

```css
/* src/styles.css */
@import "tailwindcss";
@import "./tokens/tokens.css";        /* :root { --color-... } */
@import "./tokens/tokens.dark.css";   /* [data-theme="dark"] { ... } */

@theme {
  --color-*: initial;     /* remove Tailwind's default colour palette */
  --color-overlay: rgb(15 23 42 / 0.6);   /* dim layer behind dialogs */
}

@theme inline {
  --color-surface: var(--color-surface-default);
  --color-subtle: var(--color-surface-subtle);
  --color-fg: var(--color-text-default);
  --color-fg-muted: var(--color-text-muted);
  --color-border: var(--color-border-default);
  --color-primary: var(--color-action-primary);
  --color-primary-hover: var(--color-action-primary-hover);
  --color-on-primary: var(--color-text-on-action);
  --color-ring: var(--color-focus-ring);
}
```

Three points in this file are important.

**`--color-*: initial` clears the defaults.** Tailwind ships a large default palette, including its own `rose` and `slate`. Clearing the namespace removes those utilities (even `bg-black` and `bg-white`), so developers can only use the colours of your system. It also avoids a name clash with the primitive variables in `tokens.css`.

**The Tailwind names are shorter than the token names.** `bg-surface` reads better than `bg-surface-default`. Keep the two sets of names different. A line such as `--color-x: var(--color-x)` would point a variable at itself, which is invalid.

**`@theme inline` makes the utility use your variable directly.** Compare what Tailwind generates.

| Written with | CSS generated for `bg-surface` |
|---|---|
| `@theme` | `background-color: var(--color-surface)` |
| `@theme inline` | `background-color: var(--color-surface-default)` |

With plain `@theme`, Tailwind defines `--color-surface: var(--color-surface-default)` once on `:root`. That value is resolved at the root element. A nested element with `data-theme="dark"` would still receive the root's light colour. With `inline`, the utility reads `--color-surface-default` at the element where the class is used, so nested themes work. Rule of thumb: when a theme variable points to another variable, use `@theme inline`.

## Using the classes

```jsx
export function PlanCard({ name, price }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-fg">{name}</h3>
      <p className="mt-1 text-sm text-fg-muted">{price} per month</p>
      <button
        className="mt-4 h-10 rounded-md bg-primary px-4 text-sm
                   font-semibold text-on-primary hover:bg-primary-hover"
      >
        Choose plan
      </button>
    </article>
  );
}
```

There is no `dark:` class anywhere. The card turns dark when an ancestor has `data-theme="dark"`, because the variables behind the classes change. This is the benefit of semantic tokens: the theme logic lives in one CSS file, not in every component.

## The dark variant, when you still need it

Sometimes one element needs a real difference in dark mode, such as a different image or a border that exists only in dark. Tailwind's `dark:` variant follows the system setting by default. To make it follow your attribute, redefine it.

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Use `dark:` for exceptions only. If you write `bg-white dark:bg-slate-900` on every element, you have rebuilt the theme by hand in every file.

:::warn Arbitrary values bypass the system
Tailwind lets you write any value in square brackets, such as `bg-[#e11d48]` or `p-[13px]`. It is useful for a true one-off, like a position taken from a design. In a design system it is also the easiest way to bring hard-coded values back. If you see the same arbitrary value twice, it should become a token. Many teams add a lint rule or a review habit for this.
:::

## Version 3 and version 4 side by side

| Topic | Tailwind v3 | Tailwind v4 |
|---|---|---|
| Where the theme lives | `tailwind.config.js` | `@theme` in CSS |
| Entry in CSS | Three `@tailwind` directives | `@import "tailwindcss"` |
| Theme values in the browser | Only if you add variables yourself | Every theme value is a CSS variable |
| Default colours | Hex and rgb | OKLCH |
| Custom dark selector | `darkMode` option in the config | `@custom-variant dark (...)` |

:::note
Tailwind v4 uses modern CSS features, so it targets recent browsers (roughly Safari 16.4, Chrome 111 and Firefox 128 or newer). If your product must support older browsers, check this before choosing v4.
:::

:::interview How do you connect a design token system to Tailwind CSS v4?
In v4 the theme is defined in CSS with the `@theme` directive. Each variable in a known namespace creates utilities, for example `--color-primary` creates `bg-primary` and `text-primary`. I import the generated token CSS, which defines my semantic custom properties for light and dark, and then map them inside `@theme inline`, for example `--color-surface: var(--color-surface-default)`. I use `inline` because the theme variable references another variable, and I want the utility to resolve it at the element, so that nested themes work. I also clear the default palette with `--color-*: initial` so only system colours are available. Components then use semantic classes and need no `dark:` variants, because switching `data-theme` changes the underlying variables.
:::

:::revise
- Tailwind v4 is configured in CSS: `@import "tailwindcss"` and `@theme { ... }`.
- A theme variable's namespace creates utilities: `--color-*`, `--text-*`, `--radius-*`, `--font-*`.
- `--spacing` is 0.25rem, so `p-4` is 1rem. It matches a 4px spacing scale.
- Map semantic tokens in `@theme inline` so utilities follow nested themes.
- `--color-*: initial` removes the default palette. Only your tokens remain.
- Semantic classes need no `dark:`. Keep that variant for rare exceptions.
:::

# Accessible React components with Radix UI

*Let Radix handle the hard behaviour (focus, keyboard, ARIA) and put your own tokens and variants on top.*

## Why it matters

When a tailor stitches a kurta, they do not weave the cloth. Weaving is a different, difficult craft. They buy good cloth and spend their effort on the cut and the fit.

A dialog looks easy: a box in the middle of the screen. But a correct dialog must move keyboard focus inside, keep it there, close on the Escape key, tell screen readers what it is, block the page behind it, and return focus to the button that opened it. Getting all of this right, in every browser and with every screen reader, takes a long time. This behaviour is the cloth.

**Radix UI Primitives** is an open source library of React components that have all this behaviour and **no styling**. Such libraries are called **headless** or unstyled. You bring the look: your tokens, your classes, your variants.

:::flow Who does what
Radix primitive | behaviour, keyboard, ARIA
Your tokens | colour, space, radius
Your variants | primary, sm, md, lg
Your component | Button, Dialog, Tabs
:::

## Setup

```bash
npm install @radix-ui/react-slot @radix-ui/react-dialog \
  @radix-ui/react-tabs class-variance-authority clsx tailwind-merge
```

Here `cva` (class-variance-authority) maps variant props to class names, `clsx` joins class names and skips false values, and `tailwind-merge` resolves conflicts so that `px-4 px-6` becomes `px-6`. Radix also offers a single `radix-ui` package with all primitives.

One small helper is used by every component.

```javascript
// src/lib/cn.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn("px-4", isBig && "px-6", className) -> one clean class string
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

## Button: variants with cva

Radix has no Button primitive, because the browser's own `button` element is already accessible. So the Button is your own component: a native `button`, a table of variants, and one small Radix helper called Slot.

```jsx
// src/components/Button.jsx
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

export const buttonStyles = cva(
  // base classes: every button gets these
  "inline-flex items-center justify-center gap-2 rounded-md " +
    "font-semibold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-ring " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary:
          "border border-border bg-surface text-fg hover:bg-subtle",
        ghost: "text-fg hover:bg-subtle",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);
```

`cva` returns a function. You call it with the chosen variants and it returns the class string.

```jsx
export function Button({
  variant,
  size,
  asChild = false,
  className,
  type = "button",          // avoid submitting forms by accident
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}
```

:::example Dry run: which classes does a button get?
For `<Button variant="secondary" size="sm">Edit</Button>`:

| Step | Result |
|---|---|
| Base classes | `inline-flex items-center ... rounded-md font-semibold ...` |
| `variant: secondary` | `border border-border bg-surface text-fg hover:bg-subtle` |
| `size: sm` | `h-8 px-3 text-sm` |
| `cn(...)` with no extra `className` | All three joined into one string |

For `<Button>Save</Button>` no variant is passed, so `defaultVariants` gives `primary` and `md`. If the caller adds `className="px-8"`, `tailwind-merge` drops `px-4` and keeps `px-8`.
:::

The variant names are the same as the Figma component properties from chapter 7. In TypeScript, the `VariantProps` helper of `cva` gives you the matching prop types for free.

### What asChild and Slot do

Sometimes a link must look like a button, for example "Go to pricing". A link must stay an `a` element so that it works with the keyboard, the browser history and "open in new tab". `asChild` solves this. Instead of rendering its own `button`, the component passes its props and classes to the child you give it.

```jsx
<Button asChild variant="secondary">
  <a href="/pricing">See pricing</a>
</Button>
```

The result in the page is one `a` element with all the button classes. No `button` is rendered. `Slot` is the Radix helper that merges the props onto the child. All Radix parts accept `asChild` in the same way.

:::note
In React 19, `ref` is a normal prop, so `{...props}` forwards it. In React 18 and earlier you would wrap the component in `forwardRef`. Forwarding the ref matters, because Radix needs a reference to your button when it is used as a trigger.
:::

## Dialog: behaviour from Radix

A **dialog** (also called a modal) is a window that opens on top of the page and must be handled before the user continues. Radix builds it from small parts that you compose.

| Part | Job |
|---|---|
| `Dialog.Root` | Holds the open or closed state |
| `Dialog.Trigger` | The button that opens the dialog |
| `Dialog.Portal` | Renders the dialog at the end of `body`, above everything |
| `Dialog.Overlay` | The dim layer over the page |
| `Dialog.Content` | The dialog box. Gets `role="dialog"` |
| `Dialog.Title` | The accessible name. Required |
| `Dialog.Description` | Extra text that screen readers announce |
| `Dialog.Close` | A button that closes the dialog |

```jsx
// src/components/Dialog.jsx
import * as RadixDialog from "@radix-ui/react-dialog";
import { Button } from "./Button";

export function Dialog({ trigger, title, description, children }) {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-overlay" />
        <RadixDialog.Content
          className="fixed top-1/2 left-1/2 w-[min(90vw,28rem)]
                     -translate-x-1/2 -translate-y-1/2 rounded-lg
                     bg-surface p-6 text-fg shadow-lg"
        >
          <RadixDialog.Title className="text-lg font-semibold">
            {title}
          </RadixDialog.Title>
          <RadixDialog.Description className="mt-2 text-sm text-fg-muted">
            {description}
          </RadixDialog.Description>
          <div className="mt-6">{children}</div>
          <RadixDialog.Close asChild>
            <Button variant="ghost" className="mt-4">Cancel</Button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
```

Usage is short, and the product developer cannot forget the accessibility parts, because they are inside the component.

```jsx
<Dialog
  trigger={<Button variant="secondary">Rename project</Button>}
  title="Rename project"
  description="The new name is visible to everyone in your team."
>
  <RenameForm />
</Dialog>
```

You wrote no state, no key handlers and no ARIA attributes. Here is what Radix does for you.

| User action | What happens |
|---|---|
| Clicks the trigger, or presses Enter or Space on it | Dialog opens. Focus moves inside |
| Presses Tab or Shift+Tab | Focus cycles inside the dialog and cannot leave it |
| Presses Escape, or clicks the overlay | Dialog closes |
| Dialog closes | Focus returns to the trigger |
| Uses a screen reader | Hears the role "dialog", the title and the description. The page behind is hidden from it |

To control the dialog from your own state, for example to close it after a form is saved, pass `open` and `onOpenChange` to `Dialog.Root`.

:::warn Leaving out the title
Every dialog needs a name, or a screen reader user only hears "dialog" and does not know what opened. Radix prints a console warning when `Dialog.Title` is missing. If the design really has no visible title, keep the title and hide it visually with a "visually hidden" style. Do not delete it.
:::

:::tip
For a destructive confirmation such as "Delete account?", use the Radix **Alert Dialog** primitive. It does not close when the user clicks outside, so nobody confirms or dismisses a dangerous action by accident.
:::

## Tabs: styling with data attributes

**Tabs** show one panel at a time from a set. Radix adds the roles, the selection state and the arrow key navigation.

```jsx
// src/components/Tabs.jsx
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "../lib/cn";

export const Tabs = RadixTabs.Root;
export const TabsContent = RadixTabs.Content;

export function TabsList({ className, ...props }) {
  return (
    <RadixTabs.List
      className={cn("flex gap-1 border-b border-border", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "-mb-px border-b-2 border-transparent px-4 py-2 text-sm",
        "text-fg-muted hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-ring",
        "data-[state=active]:border-primary data-[state=active]:text-fg",
        className
      )}
      {...props}
    />
  );
}
```

```jsx
<Tabs defaultValue="profile">
  <TabsList aria-label="Account settings">
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
    <TabsTrigger value="team">Team</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">Profile form goes here.</TabsContent>
  <TabsContent value="billing">Invoices go here.</TabsContent>
  <TabsContent value="team">Team members go here.</TabsContent>
</Tabs>
```

Radix does not add class names for states. It sets **data attributes** on the elements, and you style those. The active tab has `data-state="active"`, and the Tailwind class `data-[state=active]:border-primary` applies only then.

| Attribute | Appears on | Values |
|---|---|---|
| `data-state` | Tabs trigger and content | `active`, `inactive` |
| `data-state` | Dialog overlay and content | `open`, `closed` |
| `data-disabled` | Any disabled part | present or absent |
| `data-orientation` | Tabs parts | `horizontal`, `vertical` |

In plain CSS the same selector is `[data-state="active"]`.

## Wrap once, use everywhere

Product developers should import from your package, not from Radix directly. Then the styling, the defaults and the accessibility decisions live in one place, and you can change or even replace the primitive later without touching product code.

:::warn Breaking asChild with a component that drops props
`asChild` works by passing props (such as `onClick`, `aria-expanded` and `ref`) to the child. If the child is your own component and it does not spread those props onto its DOM element, the trigger silently stops working. Any component used as an `asChild` child must accept `...props` and pass them, together with the ref, to its root element. The Button above does this.
:::

:::interview What is a headless component library, and why would a design system use one?
A headless library provides the behaviour and accessibility of components without any visual styling. Radix Primitives is an example: its Dialog handles the focus trap, the Escape key, ARIA roles and returning focus, but ships no CSS. A design system uses it because that behaviour is hard to build correctly and is the same for every brand, while the look must be fully our own. We wrap each primitive once, apply our tokens and variants, and expose a simple API. The trade-off is that we must write and maintain all the styling ourselves, which a fully styled library would give for free.
:::

:::interview What does the asChild prop do in Radix?
By default a Radix part renders its own DOM element, for example `Dialog.Trigger` renders a `button`. With `asChild`, it renders no element of its own. It merges its props, event handlers and ref onto the single child I pass. This lets me use my own Button as the trigger, or make a link look like a button, without nested elements such as a button inside a button. The requirement is that the child forwards props and the ref to its DOM node.
:::

:::revise
- Radix Primitives are headless: behaviour and accessibility without styles.
- Button is a native `button` plus `cva` variants. Variant names match the Figma properties.
- `asChild` merges props onto your child element through `Slot`. The child must spread props.
- Dialog parts: Root, Trigger, Portal, Overlay, Content, Title, Description, Close.
- Radix manages focus, Escape, roles and state. `Dialog.Title` is required.
- Style states with data attributes such as `data-[state=active]`.
:::

# Interaction states, target size and motion

*A component is not one picture: it is a set of states, and each state must be visible, reachable and calm.*

## Why it matters

Press a lift button. It lights up, so you know the lift has heard you. A switch clicks. A door handle moves. Physical things answer when you touch them. If the lift button stayed dark, you would press it five times.

On a screen, the answer must be designed. Each state tells the user something: "you can click me", "the keyboard is here", "I am working", "I am not available". A design system defines every state once, so that all components answer in the same way.

## The states of an interactive element

| State | When | CSS hook | Tells the user |
|---|---|---|---|
| Default | Nothing is happening | (none) | This is clickable |
| Hover | A mouse pointer is over it | `:hover` | You are pointing at me |
| Focus | It has keyboard focus | `:focus-visible` | The keyboard is here |
| Active | It is being pressed | `:active` | I felt the press |
| Disabled | It cannot be used now | `:disabled`, `[aria-disabled="true"]` | Not available |
| Loading | Work is in progress | `[aria-busy="true"]` | Please wait |
| Selected | It is the chosen item | `[aria-selected="true"]`, `[data-state]` | I am the current one |
| Invalid | The value has an error | `[aria-invalid="true"]` | Fix this field |

States need tokens too. Usually they are semantic tokens next to the base token: `color.action.primary`, `color.action.primary-hover`, `color.action.primary-active`.

```css
.button {
  background: var(--color-action-primary);
  transition: background-color var(--duration-fast) var(--ease-out);
}

/* only on devices that really have hover, not on touch screens */
@media (hover: hover) {
  .button:hover {
    background: var(--color-action-primary-hover);
  }
}

.button:active {
  background: var(--color-action-primary-active);
}
```

On a touch screen there is no pointer hovering, and a tapped element can get "stuck" in its hover style. The media query `(hover: hover)` prevents that. Tailwind v4 applies its `hover:` variant in this way by default.

## Focus: the most important state

**Focus** marks the element that will receive keyboard input. A keyboard user moves it with the Tab key. The **focus indicator**, usually a ring, is their cursor. Without it they are lost, like using a mouse with an invisible pointer.

There are two pseudo-classes, and the difference matters.

| Selector | Matches |
|---|---|
| `:focus` | Any time the element has focus, also after a mouse click |
| `:focus-visible` | Only when the browser decides a focus indicator is needed, mainly keyboard use |

With `:focus-visible`, mouse users do not see a ring after every click, and keyboard users always see one. Designers and users are both happy.

```css
:root {
  --color-focus-ring: var(--color-rose-600);
}
[data-theme="dark"] {
  --color-focus-ring: var(--color-rose-400);
}

.button:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;       /* a gap, so the ring is clear of the button */
}
```

:::warn Never remove the outline without a replacement
`outline: none` (or the Tailwind class `outline-none`) with nothing in its place is one of the most common accessibility bugs on the web. The page looks cleaner and becomes unusable with a keyboard. If the default ring does not fit the brand, restyle it. Do not remove it.
:::

A good focus ring follows these rules. Several come from WCAG 2.2.

- It is at least 2px thick and has a contrast of at least 3:1 against the colours next to it.
- It is drawn with `outline`, not only with `box-shadow`. In Windows high contrast mode (the `forced-colors` media feature), shadows are removed but outlines stay.
- `outline-offset` separates it from the element, so it is visible on a button of the same colour.
- The focused element is not hidden behind a sticky header or a cookie banner. WCAG 2.2 added this as "Focus Not Obscured". The CSS property `scroll-padding-top` on the scrolling container helps.

## Disabled: two ways, different behaviour

| | `disabled` attribute | `aria-disabled="true"` |
|---|---|---|
| Can receive keyboard focus | No | Yes |
| Click events fire | No | Yes, you must ignore them yourself |
| Announced as unavailable | Yes | Yes |
| Works on | Form controls and buttons | Any element |
| Use when | The control is really not relevant now | The user should still find it and learn why it is unavailable |

The native attribute is simple and safe. Its weakness is that the button disappears from the Tab order. A keyboard or screen reader user may never discover it, and a tooltip that explains "Fill in all fields first" can never be shown.

## Loading: busy but still there

A loading button must do four things: show that work is happening, block a second click, keep its place in the layout, and keep keyboard focus.

```jsx
// Button with a loading state (variant classes left out for focus)
export function Button({
  loading = false,
  disabled = false,
  onClick,
  children,
  ...props
}) {
  const blocked = loading || disabled;
  return (
    <button
      type="button"
      {...props}
      aria-disabled={blocked || undefined}   // stays focusable
      aria-busy={loading || undefined}
      onClick={blocked ? (event) => event.preventDefault() : onClick}
    >
      {loading && <Spinner aria-hidden="true" />}
      {children}
    </button>
  );
}
```

Why `aria-disabled` and not `disabled` here? If a focused button becomes `disabled`, it can no longer hold focus. For a keyboard user the focus position is lost in the middle of their task. With `aria-disabled` the focus stays, and the click handler blocks the action instead.

To use the same styles for both kinds of disabled, target the attribute as well: in Tailwind, `aria-disabled:opacity-50`, next to `disabled:opacity-50`.

:::example State check for one button
The user fills a form and presses Enter on the Save button.

| Moment | Attributes on the button | What the user notices |
|---|---|---|
| Before | none | Rose button, label "Save" |
| Focused by Tab | matches `:focus-visible` | Ring around the button |
| Pressed | `aria-busy="true"`, `aria-disabled="true"` | Spinner appears, the button fades, focus stays |
| Pressed again while loading | same | Nothing happens, no double save |
| Done | attributes removed | A status message "Saved" appears |

The width should not jump when the spinner appears. Reserve the space, or place the spinner over the label.
:::

## Target size

A **target** is the area that reacts to a click or a tap. Small targets are hard for everybody on a phone, and very hard for people with shaky hands.

| Guideline | Minimum size |
|---|---|
| WCAG 2.2 "Target Size (Minimum)", level AA | 24 by 24 CSS pixels, or enough spacing around a smaller target |
| WCAG 2.2 "Target Size (Enhanced)", level AAA | 44 by 44 CSS pixels |
| Apple's interface guidelines | About 44 by 44 points |
| Google's Material Design | About 48 by 48 dp |

The AA rule has exceptions, for example links inside a sentence. A sensible system default is a control height of 40px with a small size of 32px, and at least 44px for the main touch targets on mobile.

An icon can stay small while its target is big. Padding does it, or a pseudo-element that extends the clickable area.

```css
.icon-button {
  position: relative;
  width: 1.5rem;              /* the visible icon: 24px */
  height: 1.5rem;
}

.icon-button::after {
  content: "";
  position: absolute;
  inset: -0.625rem;           /* 10px more on each side: 44px target */
}
```

## Motion with a purpose

Motion is useful when it explains something: where a panel came from, that an action worked, that content is loading. Motion that only decorates gets tiring, and for some people it is worse than tiring. People with vestibular disorders (problems of the balance system) can feel dizzy or sick from large movement on screen.

Motion has tokens like everything else.

| Token | Value | Use |
|---|---|---|
| `duration.fast` | 150ms | Hover, colour change, small fades |
| `duration.base` | 250ms | Dialogs, dropdowns, tabs |
| `duration.slow` | 400ms | Large panels, page-level changes |
| `ease.out` | `cubic-bezier(0, 0, 0.2, 1)` | Things entering: fast start, soft landing |
| `ease.in` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving: they speed up and go |

The exact numbers are a design choice. Two rules are not. Small things move faster than big things. And an exit should be a little quicker than an entrance, because the user has already decided to move on.

:::tip
Animate `transform` and `opacity` when you can. The browser can usually handle them without recalculating the layout, so they stay smooth. Animating `width`, `height`, `top` or `margin` forces layout work on every frame.
:::

## Reduced motion

Operating systems have a setting called "Reduce motion". The browser reports it through the media feature `prefers-reduced-motion`. A design system must respect it in one central place.

:::flow Deciding what to do with an animation
Is it essential? | a progress bar: keep it
User asked to reduce? | prefers-reduced-motion
Large movement | replace with a fade
Small fade or colour | usually fine to keep
:::

"Reduce" does not mean "remove everything". A dialog that slides and scales can simply fade in. The user still sees that something appeared, without the movement.

```css
/* Default: slide up and fade */
@keyframes dialog-in {
  from { opacity: 0; transform: translateY(1rem); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.dialog-content[data-state="open"] {
  animation: dialog-in var(--duration-base) var(--ease-out);
}

/* Reduced: no movement, only a short fade */
@media (prefers-reduced-motion: reduce) {
  .dialog-content[data-state="open"] {
    animation: fade-in var(--duration-fast) linear;
  }
}
```

The simplest system-wide approach is to change the tokens. If every animation uses the duration tokens, one rule calms them all.

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 1ms;
    --duration-base: 1ms;
    --duration-slow: 1ms;
  }
}
```

A tiny value such as `1ms` is safer than `0ms`, because code that waits for an "animation end" event still receives it. In Tailwind, the variants `motion-safe:` and `motion-reduce:` apply classes for each case. In JavaScript, `window.matchMedia("(prefers-reduced-motion: reduce)").matches` reads the same setting.

:::warn Motion that never stops
Anything that moves, blinks or scrolls by itself for more than five seconds, next to other content, needs a way to pause or stop it. This is a level A rule in WCAG ("Pause, Stop, Hide"). Auto-playing carousels and looping background videos are the usual offenders. Also never flash content more than three times per second, because it can trigger seizures.
:::

:::interview What is the difference between the disabled attribute and aria-disabled?
The native `disabled` attribute makes a control fully inactive: it cannot be clicked, it does not receive focus and it leaves the Tab order. `aria-disabled="true"` only tells assistive technology that the control is unavailable. The element stays focusable and still fires events, so I must block the action in my handler and style it myself. I use `disabled` when the control is simply not relevant. I use `aria-disabled` when users should still be able to reach it, for example to read a tooltip about why it is unavailable, or for a loading button so that keyboard focus is not lost when it becomes busy.
:::

:::interview How do you handle users who prefer reduced motion?
I use the `prefers-reduced-motion` media feature. In the design system, all animations use duration and easing tokens, so I can reduce them centrally. For large movements such as slides, zooms and parallax, I replace the movement with a short fade or remove it. Small opacity and colour transitions can usually stay. Essential feedback such as a progress indicator is kept. In JavaScript-driven animation I check `matchMedia` for the same setting. I also make sure nothing important depends on the animation finishing.
:::

:::revise
- Design every state: default, hover, focus-visible, active, disabled, loading, selected, invalid.
- Focus ring: `:focus-visible`, a 2px `outline`, an offset, 3:1 contrast. Never remove it without a replacement.
- `disabled` removes focus and events. `aria-disabled` keeps focus, and you block the action yourself.
- Loading: `aria-busy`, block repeat clicks, keep the width and the focus.
- Target size: at least 24 by 24 CSS px for AA. Aim for about 44 on touch.
- Motion uses tokens. Respect `prefers-reduced-motion` by replacing movement with a fade.
:::

# Keyboard navigation, ARIA and focus management

*How people use an interface without a mouse or without sight, and what your components must do for them.*

## Why it matters

A public building has a ramp next to the stairs. The ramp is built for wheelchair users, but it also helps a parent with a pram, a traveller with a trolley bag and a delivery worker. Building it later is expensive. Building it with the stairs is cheap.

Keyboard and screen reader support is the ramp of an interface. Some people cannot use a mouse because of a motor disability. Blind users use a **screen reader**, a program that reads the interface aloud. Many developers and power users simply prefer the keyboard. If the design system's components work for all of them, every product built with it does too.

## The keyboard contract

Users expect the same keys to do the same things everywhere.

| Key | Expected action |
|---|---|
| Tab | Move to the next interactive element |
| Shift + Tab | Move to the previous one |
| Enter | Activate a link or button, submit a form |
| Space | Activate a button, toggle a checkbox |
| Arrow keys | Move inside one widget: tabs, radio group, menu, slider |
| Escape | Close the dialog, menu or popover |
| Home and End | Jump to the first or last item in a widget |

The basic rule from WCAG is short: everything that can be done with a mouse must be possible with the keyboard, and focus must never get stuck in a place the user cannot leave.

## Native elements first

HTML elements come with keyboard support and meaning built in. A `button` can be focused, reacts to Enter and Space, and announces itself as "button". A `div` does none of that.

```jsx
// Bad: looks like a button, works only with a mouse
<div className="btn" onClick={save}>Save</div>
```

To repair the `div` you would have to add `role="button"`, `tabIndex={0}` and a key handler for Enter and Space, and you would still miss details. One real element does all of it.

```jsx
// Good: one element does all of the above
<button type="button" className="btn" onClick={save}>Save</button>
```

| Need | Use this element |
|---|---|
| Do an action on this page | `button` |
| Go to another page or place | `a` with an `href` |
| Enter data | `input`, `select`, `textarea`, each with a `label` |
| Page structure | `header`, `nav`, `main`, `footer`, headings `h1` to `h6` |

The Tab key follows the order of elements in the HTML, so keep the HTML order the same as the visual order. `tabindex="0"` adds a custom element to the Tab order. `tabindex="-1"` makes an element focusable from code but skipped by Tab. Avoid positive values, because they break the natural order.

## ARIA basics

**ARIA** stands for Accessible Rich Internet Applications. It is a set of HTML attributes that describe an element to assistive technology when HTML alone cannot. It has three kinds of attributes.

| Kind | Answers | Examples |
|---|---|---|
| Role | What is this thing? | `role="dialog"`, `role="tab"`, `role="status"` |
| State | What is its condition right now? | `aria-expanded`, `aria-selected`, `aria-checked` |
| Property | What else should be known about it? | `aria-label`, `aria-describedby`, `aria-controls` |

The most important fact about ARIA: it changes only what assistive technology **hears**. It adds no behaviour. `role="button"` does not make a `div` focusable or clickable. This leads to the well-known first rule.

:::warn The first rule of ARIA
If a native HTML element already does the job, use it, and do not add ARIA to something else to imitate it. Wrong ARIA is worse than no ARIA, because it tells the user something false, for example "button" on a thing that does not react to the keyboard. Use ARIA to fill real gaps: custom widgets such as tabs and comboboxes, live updates, and extra labels.
:::

The attributes you will use most often:

| Attribute | Meaning | Typical use |
|---|---|---|
| `aria-label` | Gives a name as text | An icon-only button |
| `aria-labelledby` | Names the element using another element's text | A dialog named by its title |
| `aria-describedby` | Adds a longer description | An input and its error message |
| `aria-expanded` | Whether the controlled content is open | Menu button, accordion |
| `aria-current` | The current item in a set | The active page in navigation |
| `aria-hidden="true"` | Hide from assistive technology | Decorative icons |
| `aria-invalid` | The value has an error | Form fields |
| `aria-live` | Announce changes in this region | Toasts and status text |

### The accessible name

Every interactive element needs an **accessible name**: the text a screen reader announces for it. For a normal button it is the text inside. An icon-only button has no text, so it has no name unless you give it one.

```jsx
// Bad: announced only as "button"
<button type="button" onClick={onClose}>
  <CloseIcon />
</button>

// Good: announced as "Close, button"
<button type="button" aria-label="Close" onClick={onClose}>
  <CloseIcon aria-hidden="true" />
</button>
```

A design system can enforce this. Make the label a required prop of the IconButton component, and nobody can forget it.

### A form field done properly

```jsx
import { useId } from "react";

export function TextField({ label, error, hint, ...props }) {
  const id = useId();                    // unique, stable id
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && <p id={hintId}>{hint}</p>}
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}
```

The `label` is connected to the input with `htmlFor` and `id`. So a click on the label focuses the input, and a screen reader reads the label when the input gets focus. The hint and the error are connected with `aria-describedby`, so they are read after the label.

## Composite widgets and the roving tabindex

A tab list with eight tabs should not need eight presses of the Tab key to pass. The rule for **composite widgets** (one control made of several items, such as tabs, a radio group, a toolbar or a menu) is: the Tab key enters and leaves the widget, and the arrow keys move inside it.

The usual technique is called **roving tabindex**. Only one item has `tabindex="0"`. All the others have `tabindex="-1"`. When the user presses an arrow key, the `0` moves to the next item and that item receives focus.

This is what Radix Tabs renders for you. The ids are generated automatically and are shortened here.

```html
<div role="tablist" aria-label="Account settings">
  <button role="tab" id="t1" aria-selected="true"
          aria-controls="p1" tabindex="0">Profile</button>
  <button role="tab" id="t2" aria-selected="false"
          aria-controls="p2" tabindex="-1">Billing</button>
  <button role="tab" id="t3" aria-selected="false"
          aria-controls="p3" tabindex="-1">Team</button>
</div>
<div role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">
  Profile form goes here.
</div>
```

:::example Dry run: keys in the tab list
Focus starts on a link above the tabs. "Profile" is selected.

| Key pressed | Focus goes to | Selected tab |
|---|---|---|
| Tab | Profile tab | Profile |
| Right arrow | Billing tab | Billing |
| Right arrow | Team tab | Team |
| Right arrow | Profile tab (wraps around) | Profile |
| End | Team tab | Team |
| Tab | The Team panel, then content after it | Team |

One Tab press enters the widget, and one leaves it. Radix selects a tab as soon as it gets focus. This is the default, called automatic activation. If loading a panel is slow or costly, set `activationMode="manual"` on the root. Then the arrow keys only move focus, and Enter or Space selects.
:::

## Focus management

**Focus management** means moving focus with code when the interface changes in a way that the Tab order cannot follow. The guiding question is always: after this change, where does a keyboard user expect to be?

:::flow Focus during the life of a dialog
Trigger pressed | focus is on the button
Dialog opens | focus moves inside
Tab and Shift+Tab | focus stays trapped inside
Escape or Close | dialog closes
Focus returns | back on the trigger
:::

Radix does this for dialogs. You should still know the rules, for the cases where you choose the target yourself.

| Situation | Where focus should go |
|---|---|
| A dialog opens | The first field, or the least destructive button |
| A dialog closes | Back to the element that opened it |
| An item is deleted from a list | The next item, or the list heading if none are left |
| A new page loads in a single-page app | The main heading, or the top of the main content |
| A form is submitted with errors | The first invalid field, or an error summary |
| Content is added by "Load more" | The first new item |

Radix lets you adjust the defaults with event props on `Dialog.Content`. In `onOpenAutoFocus` you can call `event.preventDefault()` and focus your own target, for example the Cancel button of a delete confirmation.

For a heading that should receive focus after a route change, give it `tabIndex={-1}` and call `focus()` on it. It then takes focus from code but does not become an extra Tab stop.

:::warn Focus lost to nowhere
When the focused element is removed from the page, for example a "Delete" button inside the row it just deleted, focus falls back to the top of the document. A keyboard user must tab through the whole page again, and a screen reader user gets no feedback at all. Whenever your code removes or hides the element that has focus, move focus to a sensible place first.
:::

## Telling users about changes: live regions

A sighted user sees a toast message appear. A screen reader user does not, unless the page announces it. A **live region** is an element whose changes are read aloud automatically.

| Markup | Behaviour | Use for |
|---|---|---|
| `role="status"` | Polite: waits until the user is idle | "Saved", "3 results found" |
| `role="alert"` | Assertive: interrupts immediately | Errors that need attention now |

```jsx
import { useState } from "react";

export function SaveArea() {
  const [message, setMessage] = useState("");

  async function handleSave() {
    await saveProfile();
    setMessage("Profile saved");       // this text gets announced
  }

  return (
    <>
      <button type="button" onClick={handleSave}>Save</button>
      {/* The region is always in the page. Only its text changes. */}
      <p role="status">{message}</p>
    </>
  );
}
```

The region must already be in the page **before** its text changes. If you insert the region and the message in the same moment, some screen readers do not announce it.

## Test it yourself

No tool replaces five minutes with a keyboard.

| Check | How |
|---|---|
| Keyboard only | Put the mouse away. Tab through the page. Can you reach and use everything? Can you always see focus? |
| Screen reader on macOS | VoiceOver is built in. Toggle it with Command + F5 |
| Screen reader on Windows | NVDA is free. Narrator is built in |
| Screen reader on Android or iOS | TalkBack or VoiceOver, in the accessibility settings |
| Zoom | Zoom the browser to 200%. Is anything cut off or overlapping? |

:::interview What is the first rule of ARIA, and can you give an example?
The first rule is to use a native HTML element or attribute with the needed meaning and behaviour whenever one exists, and not to re-purpose another element with ARIA. For example, a clickable `div` with `role="button"` still needs `tabindex`, key handlers for Enter and Space, and disabled handling, while a real `button` has all of that built in. ARIA only changes what assistive technology announces. It does not add behaviour. So ARIA is for the gaps HTML does not cover, such as tabs, comboboxes and live regions.
:::

:::interview How should focus behave when a modal dialog opens and closes?
When it opens, focus must move into the dialog, normally to the first focusable element or to the safest action for a destructive dialog. While it is open, Tab and Shift+Tab cycle only through elements inside it, and the content behind is inert and hidden from screen readers. Escape closes it. When it closes, focus returns to the element that opened it, so the user continues where they were. The dialog also needs `role="dialog"` and an accessible name from its title. A primitive such as Radix Dialog implements all of this, and I only adjust the initial focus target when needed.
:::

:::revise
- Everything must work with the keyboard: Tab moves between controls, arrows move inside a widget, Escape closes.
- Use native elements first. A `button` gives focus, keys and a role for free.
- ARIA changes what is announced, not how things behave. Wrong ARIA is worse than none.
- Every control needs an accessible name. Icon buttons need `aria-label`.
- Manage focus on change: into the dialog, back to the trigger, to the next item after a delete.
- Announce updates with `role="status"` or `role="alert"`, in a region that already exists.
:::

# Documenting with Storybook and testing the system

*Storybook shows every component in every state, and automated tests make sure a change does not quietly break looks or accessibility.*

## Why it matters

A furniture showroom lets you see each sofa in each fabric before you buy. A factory checks each product before it leaves the gate. A design system needs both. Many teams depend on it, so one careless change to the Button can break fifty screens that you have never seen.

**Storybook** is the showroom: an open source tool that displays components in isolation, outside the product. Tests are the gate check. The two work together, because the states you document are exactly the states you want to test.

## Stories

A **story** is one component in one state, written as a small object. A story file sits next to the component.

```bash
npm create storybook@latest      # detects Vite and React, adds scripts
npm run storybook                # opens the showroom on localhost:6006
```

```jsx
// src/components/Button.stories.jsx
import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],                   // build a docs page from stories
  args: { children: "Save changes" },   // defaults for every story
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
};

export const Primary = {};                               // uses defaults
export const Secondary = { args: { variant: "secondary" } };
export const Loading = { args: { loading: true } };
```

**Args** are the props of a story. Storybook turns them into live controls, so a reader can change the variant and see the result. The `autodocs` tag generates a documentation page with a props table from the same file.

## A theme switch in the toolbar

Every story should be viewable in every theme. A **decorator** is a wrapper around each story. This one sets `data-theme` from a toolbar menu.

```jsx
// .storybook/preview.jsx
import "../src/styles.css";               // tokens + Tailwind

export default {
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => (
      <div
        data-theme={context.globals.theme}
        className="bg-surface p-6 text-fg"
      >
        <Story />
      </div>
    ),
  ],
};
```

## What good documentation contains

Stories show how a component looks. A docs page must also say when to use it.

| Section | Answers |
|---|---|
| Purpose | What is this for, in one or two sentences? |
| Live examples | The main variants, sizes and states |
| Props table | Each prop, its type and its default |
| Do and do not | "One primary button per view". "Do not use ghost for destructive actions" |
| Accessibility | Keyboard keys, required labels, focus behaviour |
| Tokens used | Which semantic or component tokens style it |
| Links | The Figma component and the source code |

## The kinds of tests

| Test type | What it catches | Tool |
|---|---|---|
| Token test | A text and background pair below the contrast limit | Vitest and the `contrast()` function |
| Unit and interaction | Wrong behaviour: clicks, keys, focus | Vitest with Testing Library, or Storybook play functions |
| Automated accessibility | Missing names, wrong ARIA, low contrast | axe |
| Visual regression | An unintended change in appearance | Playwright screenshots, or a hosted service |
| Manual | Everything tools cannot judge | Keyboard and a screen reader |

### Token test: contrast as a unit test

The function from chapter 4 can guard the palette for ever.

```javascript
// tokens/contrast.test.js
import { expect, test } from "vitest";
import { contrast } from "./contrast.js";

const pairs = [
  // name, foreground, background, minimum ratio
  ["text on surface (light)", "#0f172a", "#ffffff", 4.5],
  ["muted text on surface (light)", "#64748b", "#ffffff", 4.5],
  ["text on primary action (light)", "#ffffff", "#e11d48", 4.5],
  ["muted text on surface (dark)", "#94a3b8", "#0f172a", 4.5],
  ["text on primary action (dark)", "#0f172a", "#fb7185", 4.5],
];

test.each(pairs)("%s", (_name, fg, bg, min) => {
  expect(contrast(fg, bg)).toBeGreaterThanOrEqual(min);
});
```

If someone later changes muted text to slate 400 in the light theme, this test fails before the change is merged.

### Behaviour tests

For behaviour, **Testing Library** finds elements the way a user or a screen reader does: by role and name, for example `getByRole("button", { name: "Save" })`. So a passing test also proves that the role and the accessible name exist. A typical test renders a loading Button, clicks it, and expects that `onClick` was not called and that `aria-busy` is `"true"`.

### Interaction test inside a story

A **play function** runs after a story renders and acts like a user. The same story is then documentation and a test.

```jsx
// in Dialog.stories.jsx
// Storybook 9 and later. In version 8 import from "@storybook/test".
import { expect, userEvent, within } from "storybook/test";

export const OpenAndClose = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Rename project" });

    await userEvent.click(trigger);
    // the dialog is rendered in a portal, so search the whole body
    const dialog = await within(document.body).findByRole("dialog");
    await expect(dialog).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();      // focus came back
  },
};
```

### Automated accessibility with axe

**axe** is an open source accessibility testing engine. It inspects rendered HTML and reports rule violations. You can run it in three places.

| Where | Package | Notes |
|---|---|---|
| Storybook panel | `@storybook/addon-a11y` | Shows violations for the story you are viewing |
| Unit tests | `jest-axe` or `vitest-axe` | Fast, but the test DOM cannot check colour contrast |
| Real browser | `@axe-core/playwright` | Checks everything axe can, including contrast |

:::warn A green axe report does not mean "accessible"
Automated tools can detect only a part of all accessibility problems, the ones that can be decided by rules: a missing label, an invalid ARIA attribute, a measurable contrast failure. They cannot tell whether a label makes sense, whether the focus order is logical, or whether a screen reader user understands the flow. Treat axe as a safety net and keep the manual checks from chapter 13.
:::

### Visual regression testing

A **visual regression** is an unintended change in how something looks. The test takes a screenshot of each story and compares it with an approved earlier screenshot, called the **baseline**.

:::flow How a visual regression test works
Render story | in a real browser
Take screenshot | per theme
Compare to baseline | pixel by pixel
Difference found? | test fails, show the diff
Human decides | bug: fix it. Intended: update baseline
:::

Playwright can open each story directly through Storybook's `iframe.html` address. The story id comes from the title and the export name: `Components/Button` and `Primary` give `components-button--primary`.

```typescript
// tests/visual.spec.ts (baseURL in the Playwright config: Storybook)
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const stories = ["components-button--primary", "components-button--loading"];
const themes = ["light", "dark"];

for (const id of stories) {
  for (const theme of themes) {
    test(`${id} (${theme})`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`
      );
      const root = page.locator("#storybook-root");

      await expect(root).toHaveScreenshot(`${id}-${theme}.png`);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
```

```bash
npx playwright test                      # compare with the baselines
npx playwright test --update-snapshots   # accept intended changes
```

:::example Reading a failed visual test
A developer changes `radius.md` from 8px to 6px to fix one card.

| Story | Result | Meaning |
|---|---|---|
| Card, light and dark | Changed | Intended |
| Button, all variants | Changed | Not intended: buttons share `radius.md` |
| Input and Dialog | Changed | Not intended |
| Tabs | Same | Tabs do not use this token |

The diff shows that a "small fix" touched four components. The developer now has two honest choices: accept it as a system-wide change and tell the designers, or use a component token for the card only. Without the test, nobody would have noticed until a designer complained weeks later.
:::

:::warn Flaky screenshots
Screenshots differ between operating systems, because fonts are drawn differently. A baseline made on a Mac will fail on a Linux CI server. Create and compare baselines in the same environment, usually CI or a container image. Also wait for web fonts to load, and keep animations off during capture. Playwright's `toHaveScreenshot` disables CSS animations by default. Hosted services such as Chromatic handle the rendering environment for you, at a cost.
:::

:::interview What is visual regression testing and why is it useful for a design system?
It is automated comparison of screenshots. Each component state, usually each Storybook story in each theme, is rendered in a real browser and compared with an approved baseline image. If pixels differ, the test fails and shows the difference, and a person decides whether it is a bug or an intended change. It is very useful for a design system because tokens and base components are shared: a one-line change to a token can alter dozens of components, and unit tests do not look at appearance. The main difficulty is flakiness from fonts, animations and platform differences, so the screenshots must be made in a consistent environment.
:::

:::revise
- A story is one component in one state. Stories are docs and test cases at once.
- Add a theme toolbar with a decorator so every story is checked in light and dark.
- Docs need purpose, examples, props, do and do not, accessibility notes and tokens.
- Test layers: token contrast, behaviour, axe, visual regression, manual.
- Visual regression compares screenshots with a baseline, in a consistent environment.
- axe finds only rule-based problems. Keyboard and screen reader checks stay necessary.
:::

# Versioning, publishing and governance

*A design system is a product with customers: it needs versions, release notes and clear rules about who can change what.*

## Why it matters

When a school textbook gets a new edition, the cover says so, and teachers are told which chapters changed. Imagine the publisher silently changing pages in books that are already in classrooms. Nobody could trust the book.

Product teams are the customers of a design system. They need to know three things about every change: what changed, whether their code will break, and how to upgrade. Versioning, changelogs and governance answer these.

## Packaging the system

The components and the generated CSS are published as an **npm package**, a versioned bundle of code that other projects install. The file `package.json` describes it.

```json
{
  "name": "@gulab/ui",
  "version": "1.4.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

| Field | Meaning |
|---|---|
| `name` | The install name. `@gulab` is a **scope**, a namespace for an organisation |
| `exports` | The public entry points. Anything not listed cannot be imported |
| `files` | What is uploaded. Only the built `dist` folder, not sources and tests |
| `sideEffects` | Tells bundlers that CSS files must be kept, and that unused components can be dropped |
| `peerDependencies` | Packages the app must provide. React is a peer, so the app and the library share one copy |

Many teams publish two packages: `@gulab/tokens` (JSON and CSS variables, usable by any framework) and `@gulab/ui` (React components that depend on the tokens). A product app then imports `@gulab/ui/styles.css` once and the components it needs.

:::warn React as a normal dependency
If the library lists `react` under `dependencies`, an app can end up with two copies of React. Hooks then fail with confusing "invalid hook call" errors. React and React DOM belong in `peerDependencies`.
:::

## Semantic versioning

**Semantic versioning**, or semver, is a rule for version numbers with three parts: `MAJOR.MINOR.PATCH`.

| Part | Raise it when | Design system example |
|---|---|---|
| MAJOR (2.0.0) | A change can break existing users | Remove a prop, rename a token, change a default variant |
| MINOR (1.5.0) | You add something in a compatible way | A new component, a new `loading` prop, a new token |
| PATCH (1.4.1) | You fix a bug without changing the API | Fix the focus ring colour in dark mode |

Apps usually install with a caret range such as `^1.4.0`. It accepts any 1.x.y version from 1.4.0 upward and never 2.0.0. So minor and patch releases reach users automatically, and that is why they must never break anything.

:::example Which number changes?
The current version is 1.4.0.

| Change | New version | Reason |
|---|---|---|
| Fix: Tabs trigger had no focus ring | 1.4.1 | Bug fix |
| Add a `Tooltip` component | 1.5.0 | New and compatible |
| Add `size="xl"` to Button | 1.6.0 | New and compatible |
| Rename token `color.text.muted` to `color.text.subtle` | 2.0.0 | Old name stops working |
| Change the default Button variant from primary to secondary | 3.0.0 | Existing screens change |

The fourth row can be made non-breaking: add the new name and keep the old one as a deprecated alias. That is a minor release, and the removal waits for the next major.
:::

Visual changes are the grey area. A slightly darker border is usually a patch or a minor change. A new spacing in every component can break layouts, even though no API changed. When in doubt, treat it as the larger bump and write a clear note.

## Changelogs and Changesets

A **changelog** is a file that lists what changed in each version, written for the users of the package.

```text
## 1.5.0

### Added
- Tooltip: new component, built on the Radix Tooltip primitive.
- Button: `loading` prop shows a spinner and blocks repeated clicks.

### Fixed
- Tabs: the focus ring was not visible in the dark theme.

### Deprecated
- Button: `kind` prop. Use `variant`. It will be removed in 2.0.0.
```

**Changesets** is a popular open source tool that automates this. With each pull request, the author adds a small file that states the bump type and a summary.

```bash
npm install --save-dev @changesets/cli
npx changeset init         # once: creates the .changeset folder
npx changeset              # per change: asks patch, minor or major
npx changeset version      # release time: bumps versions, writes changelog
npx changeset publish      # publishes the new versions to npm
```

:::flow Release flow with Changesets
Pull request | code + a changeset file
Merge | changesets collect on main
Version step | bump + CHANGELOG.md
Publish | npm registry
Announce | notes to all teams
:::

## Publishing

```bash
npm run build              # tokens, then components, into dist/
npm pack --dry-run         # list exactly what would be uploaded
npm login
npm publish --access public          # needed for a public scoped package

# A test version that normal installs do not pick up
npm version 2.0.0-beta.0
npm publish --tag next               # install with: npm i @gulab/ui@next
```

Internal systems are usually published to a private registry instead, such as a private npm organisation or GitHub Packages. The steps are the same. Only the registry address and the login change. In real projects the publish step runs in CI, not from a laptop.

## Deprecation: removing things kindly

To **deprecate** something means to mark it as "still works, but will go away". Never remove an API without this stage.

:::flow The deprecation path
Add the replacement | minor release
Mark old as deprecated | docs + editor warning
Help teams migrate | guide or script
Remove the old API | next major release
:::

```typescript
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  /** @deprecated Use `variant`. Will be removed in 2.0.0. */
  kind?: "primary" | "secondary" | "ghost";
};
```

The `@deprecated` comment makes editors show the prop with a line through it. For tokens, keep the old name as an alias to the new one for one major version. Recent versions of the DTCG format also define a `$deprecated` field for this.

## Governance: who decides

**Governance** is the set of rules for how the system changes: who can propose, who reviews, who has the final word.

| Model | How it works | Strength | Risk |
|---|---|---|---|
| Centralised | One dedicated team builds everything | Consistent quality | Becomes a bottleneck |
| Federated | People from product teams build it together | Close to real needs | Nobody owns it fully |
| Hybrid | A small core team plus contributions from product teams | Balance of both | Needs a clear process |

Most growing systems end up hybrid. The core team owns quality and direction. Product teams contribute what they need.

### The contribution process

:::flow From idea to release
Propose | issue with the use case
Review | design + engineering together
Build | Figma component + code
Check | definition of done
Release | changeset + announcement
:::

A **definition of done** is a checklist that every component must pass before release. A typical one:

1. The Figma component uses variables only, with the same property names as the code.
2. The code uses tokens only. No raw colours or pixel values.
3. It works with the keyboard and a screen reader, and passes axe.
4. All states exist: hover, focus-visible, disabled, loading where relevant.
5. It is correct in every theme and respects reduced motion.
6. It has stories, a docs page and tests.
7. It has a changeset with a clear note.

:::warn The design system police
A system that only says "no" gets bypassed. Teams under deadline will copy the component and change it, and now there are two. Make the right way the easy way: fast reviews, a clear "how to contribute" page, office hours, and an honest answer when the system cannot yet do something. Track requests you decline. If the same request returns three times, the system has a gap.
:::

:::interview What counts as a breaking change in a design system, and how do you release one?
Anything that can break or visibly change a consumer's product without them changing their code: removing or renaming a component, prop or token, changing a default value, changing the rendered HTML structure that people style or test against, or a large visual change such as new spacing. I release it in a major version, and I avoid surprises. First I ship the replacement in a minor release and mark the old API as deprecated, with warnings and a migration guide, and a codemod script if the change is mechanical. After teams have had time to migrate, the next major version removes the old API, and the changelog lists every breaking change with before and after examples.
:::

:::revise
- Publish the system as versioned npm packages. React is a peer dependency.
- Semver: MAJOR breaks, MINOR adds, PATCH fixes. Renaming a token or prop is breaking.
- Changesets records each change and generates the version bump and the changelog.
- Deprecate first, give a migration path, remove in the next major.
- Governance models: centralised, federated, hybrid. Have a written contribution process.
- A definition of done keeps quality: tokens only, accessible, all states, themes, docs, tests.
:::

# Cheat sheet, interview questions and study plan

*Everything on a few pages for quick revision, plus practice questions and a four-week plan.*

## The whole pipeline

:::flow From decision to product
Figma variables | primitive + semantic
Token JSON | $value, $type, aliases
Style Dictionary | transforms + formats
CSS variables | :root and data-theme
Tailwind @theme | semantic utilities
React + Radix | variants, states, a11y
:::

## Tokens

| Tier | Example | Rule |
|---|---|---|
| Primitive | `color.rose.600` = `#e11d48` | The only place for raw values |
| Semantic | `color.action.primary` = `{color.rose.600}` | Themes change these values |
| Component | `button.primary.background` = `{color.action.primary}` | Optional. One component only |

| Figma | Token JSON | CSS | Tailwind v4 |
|---|---|---|---|
| Collection: Primitives | `tokens/primitive/*.json` | `:root { --color-rose-600 }` | Not exposed as utilities |
| Collection: Theme, mode Light | `tokens/semantic/*.json` | `:root { --color-text-muted }` | `text-fg-muted` |
| Collection: Theme, mode Dark | `tokens/themes/dark.json` | `[data-theme="dark"] { ... }` | Same class, new value |
| Alias | `{color.slate.500}` | `var(--color-slate-500)` | `@theme inline` mapping |

## Accessibility numbers

| Rule | Value |
|---|---|
| Normal text contrast, AA | 4.5 : 1 |
| Large text (24px, or 18.66px bold), AA | 3 : 1 |
| UI components, focus rings, meaningful icons, AA | 3 : 1 |
| Normal and large text, AAA | 7 : 1 and 4.5 : 1 |
| Target size, AA | 24 by 24 CSS px, or enough spacing |
| Target size, AAA | 44 by 44 CSS px |
| Contrast formula | `(L1 + 0.05) / (L2 + 0.05)` |
| Luminance | `0.2126 R + 0.7152 G + 0.0722 B`, on linear values |

WCAG 2.2 added several criteria to version 2.1. These are the ones a component library meets most often.

| New in WCAG 2.2 | Level | In one line |
|---|---|---|
| Focus Not Obscured (Minimum) | AA | The focused element is not fully hidden by sticky content |
| Focus Appearance | AAA | The focus indicator is large and clear enough |
| Dragging Movements | AA | Anything done by dragging also works with single clicks |
| Target Size (Minimum) | AA | Targets are at least 24 by 24 CSS px, with exceptions |
| Consistent Help | A | Help links sit in the same place on every page |
| Redundant Entry | A | Do not ask for the same information twice in one process |
| Accessible Authentication (Minimum) | AA | Login does not depend on a memory or puzzle test |

## Code you should be able to write from memory

```css
/* 1. Theming with custom properties */
:root { --color-surface-default: #ffffff; color-scheme: light; }
[data-theme="dark"] { --color-surface-default: #0f172a; color-scheme: dark; }

/* 2. Focus ring */
.button:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* 3. Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root { --duration-fast: 1ms; --duration-base: 1ms; }
}

/* 4. Tailwind v4 theme mapping */
@theme inline {
  --color-surface: var(--color-surface-default);
  --color-primary: var(--color-action-primary);
}
```

```bash
# The commands of the pipeline
npx style-dictionary build --config sd.config.mjs   # tokens -> CSS, JS
npm run storybook                                   # docs and stories
npx vitest run                                      # unit, contrast, axe
npx playwright test                                 # visual regression
npx changeset                                       # describe the change
npx changeset version && npx changeset publish      # release
```

## Keyboard and ARIA quick reference

| Component | Keys | Roles and attributes |
|---|---|---|
| Button | Enter, Space | Native `button`. `aria-busy`, `aria-disabled` for loading |
| Dialog | Tab cycles inside, Escape closes | `role="dialog"`, named by its title. Focus returns to the trigger |
| Tabs | Tab enters and leaves, arrows move, Home and End | `tablist`, `tab`, `tabpanel`, `aria-selected` |
| Icon button | Enter, Space | `aria-label` on the button, `aria-hidden` on the icon |
| Text field | Typing | `label` with `htmlFor`, `aria-describedby`, `aria-invalid` |
| Toast | None needed | `role="status"`, or `role="alert"` for errors |

## Mistakes that appear again and again

| Mistake | Fix |
|---|---|
| Raw hex codes in components | Use semantic tokens |
| Component token points to a primitive | Go through a semantic token |
| Token named after its value (`gray-text`) | Name the purpose (`color.text.muted`) |
| `outline: none` on focus | Style `:focus-visible` with an outline |
| A `div` with `onClick` | Use a `button` |
| Dialog without a title | Keep `Dialog.Title`. Hide it visually if needed |
| `dark:` classes on every element | Semantic tokens that change with `data-theme` |
| Editing generated CSS | Change the token source and rebuild |
| Breaking change in a minor release | Deprecate first, remove in a major |

:::warn Do not memorise tools, understand the flow
Tool names and versions change every year: plugins, build tools, even the token file format. Interviewers know this. What stays the same is the reasoning: one source of truth, three tiers, semantic names, generated outputs, accessible behaviour by default, and versioned releases. If you can explain why each step exists, you can learn any new tool in a day.
:::

## Interview questions with model answers

:::interview Walk me through how a colour change by a designer reaches production.
The designer changes a variable in Figma, for example the primitive behind `color.action.primary`. The change is exported as token JSON, through a plugin that opens a pull request or a script that reads the Figma API. In CI, Style Dictionary rebuilds the CSS variables and other platform files. The contrast tests and the visual regression tests run. The screenshots show every component that changed, so reviewers can confirm the effect is intended. After approval, a changeset marks the release type, a new package version is published with a changelog entry, and product apps receive it when they update the dependency. No one edits component code for a colour change.
:::

:::interview How would you add a second brand to an existing design system?
I would keep all component code and token names unchanged and add a new set of values. The new brand gets its own primitive palette. The semantic tokens are resolved per brand, for example through a brand layer where `brand.600` points to a different palette. In Figma this is a Brand collection with one mode per brand. In CSS it is a `data-brand` attribute that redefines the brand variables, combined freely with `data-theme`. Differences that are not colour, such as rounder buttons, go into component tokens that the brand overrides. Then I run the contrast tests and visual tests for the new brand in both themes, because a new palette can fail contrast where the old one passed.
:::

## More questions to practise

Try to answer each one aloud in under two minutes. The chapter in brackets has the material.

1. What problems does a design system solve, and when is it not worth building? (1)
2. What is an alias token? Resolve one through three tiers. (2, 3)
3. Why should token names describe purpose and not appearance? (2)
4. Calculate the contrast of white on a mid grey, step by step. (4)
5. Why is a unitless line height better than one in pixels? (5)
6. Explain collections and modes to a new designer. (6)
7. Map Hug, Fill and Fixed to CSS. (7)
8. Why can a free Figma plan not use the variables REST API, and what are the alternatives? (8)
9. Why does the order of `:root` and `[data-theme]` rules matter? (9)
10. What does `@theme inline` change in the generated CSS? (10)
11. What must a component do so that `asChild` works with it? (11)
12. Describe the states of a button and the CSS hook for each. (12)
13. Where should focus go after a dialog closes, and after a list item is deleted? (13)
14. What can axe not detect? (14)
15. Is changing a default prop value a breaking change? Why? (15)

## A four-week study plan

| Week | Focus | Chapters | Build this |
|---|---|---|---|
| 1 | Tokens and foundations | 1 to 5 | A token JSON with three tiers, and a contrast script that tests your pairs |
| 2 | Figma and the pipeline | 6 to 9 | Variables with Light and Dark, exported and built into CSS with Style Dictionary |
| 3 | Components | 10 to 13 | Button, Dialog and Tabs with Tailwind v4 and Radix, usable by keyboard |
| 4 | Quality and release | 14 to 16 | Storybook with a theme switch, axe and one visual test, a changelog |

A daily rhythm that works: about 45 minutes of reading, 45 minutes of building, and 10 minutes writing down what you learned in your own words. Building matters more than reading here. A design system is learned with the hands.

### A portfolio project

Build a tiny system and show the whole chain. This is far more convincing in an interview than a list of tool names.

1. Choose a brand colour and a neutral. Create two scales and check the contrast of the pairs you use.
2. Write primitive and semantic tokens in JSON, with a light and a dark theme.
3. Mirror them as Figma variables and build a Button component with auto layout.
4. Generate CSS variables with Style Dictionary and map them in Tailwind v4.
5. Build Button, Dialog and Tabs on Radix, with all the states.
6. Add Storybook with a theme switch, one play function and the accessibility addon.
7. Write a README that explains your token naming and your accessibility checks.

:::revise
- Pipeline: Figma variables, token JSON, Style Dictionary, CSS variables, Tailwind theme, React components.
- Three tiers: primitive values, semantic meaning, component scope. Themes change the semantic values.
- AA numbers: 4.5:1 text, 3:1 large text and UI parts, 24px targets.
- Native elements first, Radix for complex widgets, `:focus-visible` rings, reduced motion respected.
- Storybook documents, tests protect, semver and changelogs communicate.
- Understand why each step exists. Tools change, the reasoning stays.
:::
