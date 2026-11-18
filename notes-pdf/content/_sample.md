---
title: Sample Notes
subtitle: A short sample that shows every building block of the notes format.
category: DSA
level: All Levels
accent: amber
tags: sample, demo
highlights: Arrays | Two Pointers | Big-O | Interview Questions
tagline: Arrays • Two Pointers • Big-O
description: A tiny sample used to test the PDF theme. It has two chapters and uses every block type once.
---

# Big-O in plain words

*How to say how fast your code is, without a stopwatch.*

Big-O tells you how the work grows when the input grows. It does **not** tell you the time in seconds. If the input becomes 10 times bigger, does the work become 10 times bigger, or 100 times?

## The common ones

| Big-O | Name | Example | 1 million items |
|---|---|---|---|
| `O(1)` | Constant | Read `arr[5]` | 1 step |
| `O(log n)` | Logarithmic | Binary search | about 20 steps |
| `O(n)` | Linear | One loop | 1 million steps |
| `O(n²)` | Quadratic | Loop inside a loop | 1 trillion steps |

:::tip
Count the loops. One loop over `n` items is `O(n)`. A loop inside a loop is usually `O(n²)`.
:::

```python
def has_pair(nums, target):
    seen = set()                 # O(1) lookups
    for x in nums:               # one pass -> O(n)
        if target - x in seen:
            return True
        seen.add(x)
    return False
```

:::warn
Do not forget space. A `set` with `n` items uses `O(n)` extra memory.
:::

:::flow How a request finds its answer
Input | array of n numbers
Loop once | O(n)
Hash set lookup | O(1)
Answer
:::

:::interview Why is binary search O(log n)?
Every step throws away half of the remaining items. You can only halve `n` about `log2(n)` times before one item is left.
:::

:::example Try it
For `nums = [2, 7, 11]` and `target = 9`: we see 2, then 7. `9 - 7 = 2` is in the set, so the answer is `True`.
:::

:::revise
- Big-O measures growth, not seconds.
- Drop constants: `O(2n)` is `O(n)`.
- A hash set turns many `O(n²)` problems into `O(n)`.
:::

# Two pointers

*Two indexes that walk through the array so you do not need a second loop.*

## When to use it

Use two pointers when the array is **sorted** or when you compare items from both ends.

```javascript
function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}
```

:::note
This is a note box. It holds extra detail that is useful but not required.
:::

:::revise
- Sorted input is a strong hint for two pointers.
- Move the pointer that can improve the answer.
:::
