---
title: DSA Notes
subtitle: Data structures and algorithms for coding interviews, taught pattern by pattern with tested Python code.
category: DSA
level: All Levels
accent: amber
tags: dsa, algorithms, data-structures, interview, python
highlights: Big-O | Hashing & Two Pointers | Binary Search | Trees & Graphs | Dynamic Programming | Pattern Cheat Sheet
tagline: Big-O • Hashing • Two Pointers • Trees & Graphs • Dynamic Programming
description: Learn the core data structures and the problem-solving patterns behind most coding interview questions. Each topic is explained in plain language with tested Python code, dry runs, common mistakes and interview questions with model answers. The last chapter is a pattern-picking cheat sheet with an 8-week study plan.
---

# Big-O: how to measure code

*How to say how fast your code is, and how much memory it needs, without a stopwatch.*

## Why it matters

Imagine two ways to find a friend's name in a phone book with 1,000 pages. In the first way you read every page from the start. In the second way you open the book in the middle, see which half the name is in, and repeat. Both ways work. The second way is much faster, and the gap gets bigger when the book gets bigger.

In an interview, a working answer is only half of the job. The interviewer will almost always ask: "What is the time complexity?" Big-O is the language you use to answer.

## The idea

**Big-O** tells you how the amount of work grows when the input grows. It does not tell you the time in seconds, because seconds depend on the machine. We call the input size `n` (for example, the number of items in a list).

- **Time complexity** means how the number of steps grows with `n`.
- **Space complexity** means how the extra memory grows with `n`.

| Big-O | Name | Typical example | Steps for n = 1 million |
|---|---|---|---|
| `O(1)` | Constant | Read `arr[5]` | 1 |
| `O(log n)` | Logarithmic | Binary search | about 20 |
| `O(n)` | Linear | One loop | 1 million |
| `O(n log n)` | Linearithmic | Sorting | about 20 million |
| `O(n²)` | Quadratic | Loop inside a loop | 1 trillion |
| `O(2^n)` | Exponential | Try every subset | far too many |

## How to count

You do not need maths beyond counting loops. Use these four rules.

1. **Drop constants.** `O(2n)` and `O(n + 5)` are both `O(n)`. We care about the shape of the growth, not the exact count.
2. **Keep only the biggest term.** `O(n² + n)` is `O(n²)`. For large `n`, the small term does not matter.
3. **Loops one after another are added. Loops inside each other are multiplied.**
4. **Halving gives log.** If each step cuts the remaining work in half, the number of steps is `O(log n)`.

```python
def total(nums):                  # O(n) time, O(1) space
    s = 0
    for x in nums:                # one loop over n items
        s += x
    return s

def has_duplicate_slow(nums):     # O(n²) time, O(1) space
    n = len(nums)
    for i in range(n):            # n times
        for j in range(i + 1, n): # up to n times for each i
            if nums[i] == nums[j]:
                return True
    return False

def count_halvings(n):            # O(log n) time
    steps = 0
    while n > 1:
        n //= 2                   # the work is cut in half every step
        steps += 1
    return steps
```

:::example Count it yourself
`count_halvings(16)` goes 16, 8, 4, 2, 1. That is 4 steps, and `log2(16) = 4`. For 1,000,000 it takes only 19 steps. This is why `O(log n)` is so powerful.
:::

## Best, average and worst case

Think of looking for your keys in a row of 10 drawers. If you are lucky, they are in the first drawer. If you are unlucky, they are in the last one. Unless the interviewer says otherwise, Big-O talks about the **worst case**, because that is the promise you can keep for every input.

## Space complexity

Space complexity counts the **extra** memory your code creates. The input itself is usually not counted.

- A few variables: `O(1)`.
- A new list, set or dict that can hold `n` items: `O(n)`.
- Recursion uses memory too. Each call that has not finished yet sits on the **call stack** (the place where Python remembers unfinished function calls). A recursion that goes `n` levels deep uses `O(n)` space.

## The cost of common Python operations

Many slow solutions are slow because of one innocent-looking line. Learn this table well.

| Operation | Cost | Remark |
|---|---|---|
| `lst[i]`, `lst.append(x)`, `lst.pop()` | `O(1)` | `append` is amortized `O(1)` |
| `lst.insert(0, x)`, `lst.pop(0)` | `O(n)` | every item must shift |
| `x in lst`, `lst.index(x)` | `O(n)` | scans the list |
| `x in my_set`, `my_dict[key]` | `O(1)` average | uses hashing |
| `lst[a:b]`, `s[a:b]` | `O(b - a)` | a slice makes a copy |
| `sorted(lst)`, `lst.sort()` | `O(n log n)` | |
| `deque.popleft()`, `deque.append(x)` | `O(1)` | from `collections` |

:::warn Hidden loops
A line can hide a loop. `if x in lst` inside a `for` loop over `n` items is `O(n²)`, not `O(n)`. The same is true for slicing (`s[i:]`) and for building a string with `+=` inside a loop. Change the list to a `set`, and collect string pieces in a list and call `"".join(parts)` at the end.
:::

## Read the constraints

Problem statements give limits such as `1 <= n <= 100000`. This is a strong hint about the solution the author expects. As a very rough guide, plain Python can do around ten million simple steps in a second. The exact number depends on the machine.

| Size of n | Complexity that usually passes | Typical technique |
|---|---|---|
| up to about 20 | `O(2^n)` | Backtracking, all subsets |
| up to about 500 | `O(n³)` | Three nested loops, some DP |
| up to about 5,000 | `O(n²)` | Two nested loops, 2D DP |
| up to about 1,000,000 | `O(n)` or `O(n log n)` | Hashing, sorting, two pointers |
| 1,000,000,000 or more | `O(log n)` or `O(1)` | Binary search, maths |

:::interview What does "amortized O(1)" mean for list.append?
A Python list keeps some spare room at the end. Most appends just write into that spare room, which is `O(1)`. Sometimes the list is full, so Python makes a bigger block of memory and copies everything, which is `O(n)`. But this copy happens rarely, and each time the list grows by a fixed ratio. If you spread the cost of the rare copies over all the cheap appends, the average cost per append is still a constant. "Amortized" means "averaged over a long sequence of operations".
:::

:::interview Your code sorts the list and then runs one loop. What is the time complexity?
Sorting is `O(n log n)` and the loop is `O(n)`. Steps that run one after another are added: `O(n log n + n)`. We keep only the biggest term, so the answer is `O(n log n)`. Space depends on the sort: Python's sort can use up to `O(n)` extra memory.
:::

:::revise
- Big-O measures how work grows with the input size `n`, not seconds.
- Drop constants and keep the biggest term: `O(2n + 5)` is `O(n)`.
- Loops in sequence add, nested loops multiply, halving gives `O(log n)`.
- Space complexity counts extra memory, including the recursion call stack.
- `x in list` is `O(n)`, `x in set` is `O(1)` on average.
- Read the constraints: they hint at the complexity the problem expects.
:::

# Arrays and strings

*The most common interview topic: items in a row, each with a number called its index.*

## Why it matters

Almost every problem gives you an array or a string as input. Even tree and graph problems often store their data in arrays. If you are comfortable with indexes, loops and a few standard tricks, you already have the base for every other chapter.

## The idea

Think of a row of lockers in a school corridor. Each locker has a number painted on it, starting from 0. If you know the number, you walk straight to that locker. You do not have to open the others.

An **array** is exactly this: items stored side by side in memory, each with an **index** (its position number). In Python the array type is the `list`. It is a **dynamic array**, which means it grows on its own when you append.

| Operation | Cost | Why |
|---|---|---|
| Read or write `nums[i]` | `O(1)` | jump straight to the locker |
| Append or pop at the end | `O(1)` | nothing else moves |
| Insert or delete at the front or middle | `O(n)` | later items must shift |
| Search for a value (unsorted) | `O(n)` | must check one by one |

A **string** is a row of characters. In Python a string is **immutable**: you cannot change one character in place. Every "change" makes a new string.

```python
s = "hello"
# s[0] = "j"                  # TypeError: strings cannot be changed

chars = list(s)               # 1. turn it into a list of characters
chars[0] = "j"                # 2. change the list
s = "".join(chars)            # 3. join back into a string -> "jello"

parts = []
for i in range(3):
    parts.append(str(i))      # collect pieces in a list: O(1) each
result = "-".join(parts)      # one join at the end -> "0-1-2"
```

## Pattern 1: prefix sums

Suppose a shopkeeper writes the running total of sales at the end of each day. To know the sales from day 3 to day 7, they do not add five numbers. They take the total after day 7 and subtract the total after day 2.

A **prefix sum** array stores the running total. `prefix[i]` is the sum of the first `i` items. After one `O(n)` pass to build it, any range sum takes `O(1)`.

```python
def build_prefix(nums):
    prefix = [0]                        # sum of zero items is 0
    for x in nums:
        prefix.append(prefix[-1] + x)   # running total
    return prefix

def range_sum(prefix, i, j):
    # sum of nums[i..j], both ends included
    return prefix[j + 1] - prefix[i]

nums = [3, 1, 4, 1, 5]
prefix = build_prefix(nums)             # [0, 3, 4, 8, 9, 14]
print(range_sum(prefix, 1, 3))          # 1 + 4 + 1 = 6
```

The extra `0` at the start avoids a special case when the range starts at index 0.

## Pattern 2: Kadane's algorithm (maximum subarray)

A **subarray** is a continuous part of an array. The classic question: find the subarray with the largest sum.

The idea is simple. Walk from left to right and keep a running sum. If the running sum before the current item is negative, it only hurts you, so drop it and start fresh at the current item.

```python
def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)     # start fresh at x, or extend the run
        best = max(best, cur)     # remember the best sum seen so far
    return best
```

:::example Dry run of Kadane's algorithm
Input: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`. We start with `cur = best = -2`.

| x | cur = max(x, cur + x) | best |
|---|---|---|
| 1 | max(1, -1) = 1 | 1 |
| -3 | max(-3, -2) = -2 | 1 |
| 4 | max(4, 2) = 4 | 4 |
| -1 | max(-1, 3) = 3 | 4 |
| 2 | max(2, 5) = 5 | 5 |
| 1 | max(1, 6) = 6 | 6 |
| -5 | max(-5, 1) = 1 | 6 |
| 4 | max(4, 5) = 5 | 6 |

The answer is 6, from the subarray `[4, -1, 2, 1]`. Time `O(n)`, space `O(1)`.
:::

## Pattern 3: left pass and right pass

Some answers need information from both sides of each index. Make one pass from the left and one pass from the right.

Example: for each index, return the product of all other numbers, without using division.

```python
def product_except_self(nums):
    n = len(nums)
    res = [1] * n
    left = 1
    for i in range(n):               # res[i] = product of items before i
        res[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):   # multiply by product of items after i
        res[i] *= right
        right *= nums[i]
    return res

print(product_except_self([1, 2, 3, 4]))   # [24, 12, 8, 6]
```

## Pattern 4: reverse in place

"In place" means you change the input itself and use only `O(1)` extra memory. Swapping from both ends reverses a list in place. Three reversals rotate a list to the right by `k` steps.

```python
def rotate(nums, k):
    n = len(nums)
    k %= n                           # rotating n times changes nothing

    def reverse(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]   # swap the two ends
            i += 1
            j -= 1

    reverse(0, n - 1)                # reverse everything
    reverse(0, k - 1)                # fix the first k items
    reverse(k, n - 1)                # fix the rest

nums = [1, 2, 3, 4, 5]
rotate(nums, 2)
print(nums)                          # [4, 5, 1, 2, 3]
```

## 2D arrays (grids)

A grid is a list of rows. `grid[r][c]` is the cell in row `r` and column `c`. The number of rows is `len(grid)` and the number of columns is `len(grid[0])`.

:::warn The shared row trap
`grid = [[0] * 3] * 2` does not make two rows. It makes one row and points to it twice, so `grid[0][0] = 9` also changes `grid[1][0]`. Always build a grid with a loop: `grid = [[0] * 3 for _ in range(2)]`.
:::

:::tip
Useful Python tools for arrays: `enumerate(nums)` gives index and value together, `reversed(nums)` walks backwards, `zip(a, b)` walks two lists together, and `nums[::-1]` gives a reversed copy.
:::

:::interview Find the contiguous subarray with the largest sum. Can you do it in one pass?
"I will use Kadane's algorithm. I keep `cur`, the best sum of a subarray that ends at the current index, and `best`, the best sum seen anywhere. For each number `x`, the best subarray ending here is either `x` alone or the previous run plus `x`, so `cur = max(x, cur + x)`. Then I update `best`. This is one pass, `O(n)` time and `O(1)` space. An edge case is an array with only negative numbers. My code handles it because I start with the first item, not with 0."
:::

:::interview Why is building a string with += inside a loop slow?
Strings are immutable. `s += piece` may create a new string and copy all old characters each time. With `n` pieces the total copying can reach `O(n²)`. The safe way is to append the pieces to a list and call `"".join(parts)` once, which is `O(n)` in total.
:::

:::revise
- Array: read by index in `O(1)`, insert or delete in the middle in `O(n)`.
- Python strings are immutable: build with a list and `"".join(...)`.
- Prefix sums answer any range-sum question in `O(1)` after an `O(n)` build.
- Kadane: `cur = max(x, cur + x)` finds the maximum subarray in one pass.
- Two passes (left, then right) solve "everything except me" problems.
- Build grids with a loop, never with `[[0] * m] * n`.
:::

# Hashing: dict and set

*Trade a little memory for a lot of speed: find, count and group items in O(1) on average.*

## Why it matters

Hashing is the single most useful tool in interviews. Many brute-force answers use two nested loops because the inner loop searches for something. A hash table does that search in one step, so `O(n²)` becomes `O(n)`.

## The idea

Think of the cloakroom at a wedding hall. You hand over your bag and get a token with a number. Later you show the token and the helper walks straight to the right shelf. Nobody searches through all the bags.

A **hash table** works the same way. A **hash function** turns a key (such as a string) into a number. That number decides the **bucket** (the shelf) where the value is stored. To look up the key later, Python computes the same number again and goes straight to that bucket.

Python gives you two hash tables:

- `set`: stores keys only. Use it to answer "have I seen this before?"
- `dict`: stores key and value pairs. Use it to answer "what do I know about this key?"

| Operation | Average cost | Worst case |
|---|---|---|
| Add, look up, delete (`set` and `dict`) | `O(1)` | `O(n)` |
| Loop over all items | `O(n)` | `O(n)` |

The worst case happens when many keys land in the same bucket. This is called a **collision**. It is rare with Python's built-in types, so in interviews we say "`O(1)` on average".

```python
from collections import Counter, defaultdict

seen = set()
seen.add(5)
print(5 in seen)                    # True

count = {}
for ch in "banana":
    count[ch] = count.get(ch, 0) + 1    # get with a default of 0
print(count)                        # {'b': 1, 'a': 3, 'n': 2}

print(Counter("banana"))            # the same counting in one line

groups = defaultdict(list)          # a missing key starts as []
groups["fruit"].append("mango")
```

## Pattern 1: the seen set

Remember what you have passed. Example: does the list contain a duplicate?

```python
def has_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:               # O(1) lookup instead of a second loop
            return True
        seen.add(x)
    return False
```

## Pattern 2: complement lookup (Two Sum)

Problem: return the indexes of two numbers that add up to `target`.

For each number `x`, the partner we need is `target - x`. This partner is called the **complement**. Instead of searching for it with a second loop, we ask a dict that remembers every number we have already passed.

```python
def two_sum(nums, target):
    index_of = {}                         # value -> its index
    for i, x in enumerate(nums):
        need = target - x                 # the partner we are looking for
        if need in index_of:
            return [index_of[need], i]
        index_of[x] = i                   # store x only after the check
    return []
```

:::example Dry run of Two Sum
`nums = [2, 11, 7, 15]`, `target = 9`.

| i | x | need | index_of before | Action |
|---|---|---|---|---|
| 0 | 2 | 7 | empty | 7 not found, store 2 |
| 1 | 11 | -2 | 2 at 0 | -2 not found, store 11 |
| 2 | 7 | 2 | 2 at 0, 11 at 1 | 2 found at index 0 |

Return `[0, 2]`. One pass, `O(n)` time and `O(n)` space.
:::

## Pattern 3: frequency map

Count how often each item appears. Two words are **anagrams** if they use the same letters the same number of times, for example "listen" and "silent".

```python
def is_anagram(a, b):
    return Counter(a) == Counter(b)       # same letters, same counts

def first_unique_char(s):
    count = Counter(s)
    for i, ch in enumerate(s):
        if count[ch] == 1:                # appears exactly once
            return i
    return -1
```

## Pattern 4: grouping by a key

Give every item a "signature" and collect items with the same signature. For anagrams, the sorted letters are a good signature: "eat", "tea" and "ate" all become "aet".

```python
def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))          # same key for all anagrams
        groups[key].append(w)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

## Pattern 5: prefix sum plus hash map

Problem: count the subarrays whose sum is exactly `k`. The numbers can be negative.

Let `running` be the sum from the start up to the current index. A subarray that ends here has sum `k` if some earlier running sum was `running - k`. So we store how many times each running sum has appeared.

```python
def subarray_sum(nums, k):
    count = 0
    running = 0
    seen = {0: 1}                # the empty prefix has sum 0, seen once
    for x in nums:
        running += x
        count += seen.get(running - k, 0)   # earlier prefixes that fit
        seen[running] = seen.get(running, 0) + 1
    return count
```

:::example Dry run of subarray_sum
`nums = [1, 2, 3]`, `k = 3`.

| x | running | running - k | Found in seen | count |
|---|---|---|---|---|
| 1 | 1 | -2 | no | 0 |
| 2 | 3 | 0 | yes, once | 1 |
| 3 | 6 | 3 | yes, once | 2 |

The two subarrays are `[1, 2]` and `[3]`.
:::

## Pattern 6: a set for fast membership

Problem: find the length of the longest run of consecutive numbers (like 1, 2, 3, 4) in an unsorted list, in `O(n)`.

```python
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:            # x is the start of a run
            length = 1
            while x + length in s:    # walk the run upwards
                length += 1
            best = max(best, length)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))   # 4  (1, 2, 3, 4)
```

The `while` loop looks like a nested loop, but it only starts at the first number of each run. Every number is visited at most twice, so the total is `O(n)`.

:::warn Keys must be hashable
A dict key or set item must not be able to change. Numbers, strings and tuples work. Lists, sets and dicts do not: `seen.add([1, 2])` raises `TypeError`. Convert first: `seen.add(tuple([1, 2]))`. Also, do not add or remove keys while you loop over the same dict. Loop over `list(d)` if you must change it.
:::

:::interview How does a dict give O(1) lookup? What happens when two keys collide?
"A dict is a hash table. It runs a hash function on the key to get a number, and uses that number to choose a slot in an internal array. Looking up a key means computing the hash again and going straight to that slot, so the cost does not depend on how many items are stored. A collision is when two different keys map to the same slot. The table then stores the second key in another slot using a fixed probing rule, and during lookup it compares the actual keys to find the right one. When the table gets too full, it is resized to a bigger array. With a good hash function collisions are few, so lookup is `O(1)` on average and `O(n)` only in the worst case."
:::

:::interview Solve Two Sum. Then: what if the array is already sorted?
"For an unsorted array I use a dict from value to index. For each number I check if `target - x` is already in the dict. That is `O(n)` time and `O(n)` space. If the array is sorted I do not need the dict. I put one pointer at each end. If the sum is too small I move the left pointer right, and if it is too big I move the right pointer left. That is `O(n)` time and `O(1)` space."
:::

:::revise
- A `set` answers "have I seen it?", a `dict` answers "what do I know about it?"
- Add, look up and delete are `O(1)` on average, at the cost of `O(n)` memory.
- Complement lookup: for each `x`, check whether `target - x` was seen.
- `Counter` builds a frequency map, `defaultdict(list)` groups items by a key.
- Prefix sum plus dict counts subarrays with sum `k`, even with negatives.
- Keys must be hashable: use a tuple, not a list.
:::

# Two pointers and sliding window

*Two indexes that move through the array in a planned way, so a second loop is not needed.*

## Why it matters

Brute force for "find a pair" or "find the best subarray" checks every pair of positions, which is `O(n²)`. Two pointers and sliding window give `O(n)` because each pointer only moves forward and never goes back.

## Two pointers from both ends

Imagine two people who start at opposite ends of a corridor and walk towards each other. Together they cover the whole corridor once.

Use this when the array is **sorted**, or when you compare the two ends (palindromes).

```python
def pair_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        if s < target:
            left += 1          # need a bigger sum: move to a bigger number
        else:
            right -= 1         # need a smaller sum
    return []

def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():      # skip spaces and punctuation
            left += 1
        elif not s[right].isalnum():
            right -= 1
        elif s[left].lower() != s[right].lower():
            return False
        else:
            left += 1
            right -= 1
    return True
```

Why is it safe to move a pointer? In `pair_sum_sorted`, if the sum is too small, then `nums[left]` is too small even with the biggest remaining partner. So `nums[left]` can never be part of an answer and we can drop it forever.

:::example Dry run of pair_sum_sorted
`nums = [1, 3, 4, 6, 9]`, `target = 10`.

| left | right | Sum | Decision |
|---|---|---|---|
| 0 (1) | 4 (9) | 10 | found |

Now try `target = 9`: 1 + 9 = 10 is too big, so `right` moves to 6. 1 + 6 = 7 is too small, so `left` moves to 3. 3 + 6 = 9, found at indexes `[1, 3]`.
:::

## Two pointers in the same direction (read and write)

Think of cleaning a bookshelf. One hand reads every book from left to right. The other hand marks the spot where the next book you want to keep should go.

Problem: remove duplicates from a sorted array in place and return the new length.

```python
def remove_duplicates(nums):
    if not nums:
        return 0
    write = 1                           # next free place for a new value
    for read in range(1, len(nums)):
        if nums[read] != nums[read - 1]:    # a value we have not kept yet
            nums[write] = nums[read]
            write += 1
    return write                        # first `write` items are unique
```

## Sort first, then two pointers (3Sum)

Problem: find all unique triplets that add up to 0. Fix the first number with a loop, then find the other two with two pointers. Sorting costs `O(n log n)` and the search costs `O(n²)`, which is better than the `O(n³)` brute force.

```python
def three_sum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                    # skip a repeated first number
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                res.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                hi -= 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1             # skip a repeated second number
    return res

print(three_sum([-1, 0, 1, 2, -1, -4]))   # [[-1, -1, 2], [-1, 0, 1]]
```

## Sliding window

Imagine looking at a long train through a window frame that shows only a few coaches. When the train moves by one coach, one coach enters your view and one leaves. You do not need to look at the whole train again.

A **window** is a continuous part of the array between `left` and `right`. Instead of recomputing everything for each window, we update the result when one item enters and one item leaves.

### Fixed-size window

Problem: the largest sum of any `k` neighbours.

```python
def max_sum_k(nums, k):
    window = sum(nums[:k])              # the first window
    best = window
    for right in range(k, len(nums)):
        window += nums[right]           # one item enters on the right
        window -= nums[right - k]       # one item leaves on the left
        best = max(best, window)
    return best

print(max_sum_k([2, 1, 5, 1, 3, 2], 3))   # 9  (5 + 1 + 3)
```

### Variable-size window

The window grows on the right. When it breaks a rule, it shrinks from the left until the rule holds again. Almost every variable window problem fits this template:

```text
left = 0
for right in range(n):
    add nums[right] to the window
    while the window is not valid:
        remove nums[left] from the window
        left += 1
    update the answer with the window [left, right]
```

Problem: the longest substring without repeating characters.

```python
def longest_unique(s):
    seen = set()                        # characters inside the window
    left = best = 0
    for right, ch in enumerate(s):
        while ch in seen:               # rule broken: shrink from the left
            seen.remove(s[left])
            left += 1
        seen.add(ch)
        best = max(best, right - left + 1)
    return best
```

:::example Dry run of longest_unique on "pwwkew"

| right | ch | Action | Window | best |
|---|---|---|---|---|
| 0 | p | add | p | 1 |
| 1 | w | add | pw | 2 |
| 2 | w | remove p, remove w, add w | w | 2 |
| 3 | k | add | wk | 2 |
| 4 | e | add | wke | 3 |
| 5 | w | remove w, add w | kew | 3 |

The answer is 3.
:::

For a "shortest window" question, update the answer **inside** the `while` loop, while the window is still valid. Problem: the shortest subarray with sum at least `target` (all numbers positive).

```python
def min_subarray_len(target, nums):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:              # valid: try to make it shorter
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best

print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))   # 2  (4 + 3)
```

When the rule is about counts, keep a dict inside the window. Problem: the longest substring with at most `k` different characters.

```python
def longest_k_distinct(s, k):
    count = {}                          # char -> how many in the window
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while len(count) > k:           # too many different characters
            count[s[left]] -= 1
            if count[s[left]] == 0:
                del count[s[left]]      # remove keys that reach zero
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_k_distinct("eceba", 2))   # 3  ("ece")
```

## Which one do I use?

| Clue in the problem | Technique |
|---|---|
| Sorted array, find a pair or triplet | Pointers from both ends |
| Palindrome, reverse, compare ends | Pointers from both ends |
| Remove or move items in place | Read and write pointers |
| Subarray or substring of exact size k | Fixed window |
| Longest or shortest subarray with a rule | Variable window |

:::warn Sliding window needs a one-way rule
A variable window works only when adding an item can only push the window one way, and removing an item pushes it the other way. With positive numbers, adding always makes the sum bigger, so the sum window works. With **negative numbers** this breaks, because shrinking the window can make the sum bigger or smaller. For subarray sums with negative numbers use prefix sums with a dict (see the Hashing chapter).
:::

:::interview The sliding window code has a while loop inside a for loop. Why is it O(n) and not O(n²)?
"I count how many times each pointer moves, not how the loops are nested. `right` moves forward exactly `n` times. `left` also only moves forward and can never pass `right`, so it moves at most `n` times in total across the whole run. The total work is at most `2n` steps, which is `O(n)`. Each item enters the window once and leaves at most once."
:::

:::interview How would you solve 3Sum, and how do you avoid duplicate triplets?
"I sort the array first. Then I fix each number as the first of the triplet and use two pointers on the rest to find two numbers that add up to its negative. To avoid duplicates I skip a first number that is equal to the previous first number, and after I record a triplet I move the left pointer past equal values. Sorting is `O(n log n)` and the main part is `O(n²)`. Extra space is `O(1)` apart from the output and what the sort uses."
:::

:::revise
- Pointers from both ends need sorted data or a compare-the-ends task.
- Read and write pointers edit an array in place with `O(1)` extra space.
- Fixed window: add the item that enters, subtract the item that leaves.
- Variable window: grow on the right, shrink from the left while invalid.
- Each pointer moves forward only, so the total is `O(n)`.
- A sum window fails with negative numbers: use prefix sums and a dict.
:::

# Binary search

*Throw away half of the remaining options at every step, on sorted data or on a range of answers.*

## Why it matters

Binary search turns a search over one million items into about 20 steps. It also appears in a hidden form called "binary search on the answer", which is a favourite of interviewers because many candidates do not see it.

## The idea

Think of the number guessing game. A friend picks a number from 1 to 100 and only says "higher" or "lower". A smart player always guesses the middle: 50, then 75, then 62. Each guess removes half of the remaining numbers, so 7 guesses are always enough.

Binary search needs one thing: after looking at the middle item, you must be able to tell which half can be thrown away. A sorted array gives you that.

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1          # the search space is nums[lo..hi]
    while lo <= hi:                    # stop when the space is empty
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1               # target can only be on the right
        else:
            hi = mid - 1               # target can only be on the left
    return -1                          # not found
```

:::example Dry run of binary_search
`nums = [2, 5, 8, 12, 16, 23, 38]`, `target = 23`.

| lo | hi | mid | nums[mid] | Decision |
|---|---|---|---|---|
| 0 | 6 | 3 | 12 | too small, `lo = 4` |
| 4 | 6 | 5 | 23 | found, return 5 |

Seven items needed only two checks.
:::

## Finding a boundary (lower bound)

Often you do not want "any index of the target". You want the **first** position where something becomes true. For example: the first index whose value is greater than or equal to the target. This is called the **lower bound**.

```python
def lower_bound(nums, target):
    lo, hi = 0, len(nums)              # hi = len: the answer can be "end"
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1               # mid is too small: answer is right
        else:
            hi = mid                   # mid could be the answer: keep it
    return lo                          # first index with nums[i] >= target
```

Notice the three differences from the first template: `hi` starts at `len(nums)`, the loop is `lo < hi`, and we use `hi = mid` (not `mid - 1`) because `mid` itself may be the answer.

Python already has this in the `bisect` module. Use it in interviews unless you are asked to write it yourself.

```python
from bisect import bisect_left, bisect_right

def search_range(nums, target):
    # first and last position of target in a sorted list
    first = bisect_left(nums, target)        # first index with >= target
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    last = bisect_right(nums, target) - 1    # first index with > target
    return [first, last]

print(search_range([5, 7, 7, 8, 8, 10], 8))  # [3, 4]
```

## Binary search on the answer

Sometimes nothing is sorted, but the **answer** lies in a range, and you can quickly check whether a guess is good enough. If "too small" guesses always fail and "big enough" guesses always pass, the results look like this:

```text
guess:   1   2   3   4   5   6   7
works:   no  no  no  yes yes yes yes
                     ^ we want the first "yes"
```

That is a sorted pattern, so we can binary search on it.

Problem: there are piles of bananas, and you eat `speed` bananas per hour from one pile at a time. If a pile has fewer bananas than your speed, you finish it and wait for the next hour. Find the smallest speed that finishes all piles within `h` hours.

```python
def min_eating_speed(piles, h):
    def hours_needed(speed):
        # ceil(p / speed) for every pile, using integer maths
        return sum((p + speed - 1) // speed for p in piles)

    lo, hi = 1, max(piles)             # the answer is in this range
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(mid) <= h:
            hi = mid                   # works: try a smaller speed
        else:
            lo = mid + 1               # too slow: need a bigger speed
    return lo
```

:::example Dry run of min_eating_speed
`piles = [3, 6, 7, 11]`, `h = 8`. The range is 1 to 11.

| lo | hi | mid | Hours needed | Decision |
|---|---|---|---|---|
| 1 | 11 | 6 | 1 + 1 + 2 + 2 = 6 | works, `hi = 6` |
| 1 | 6 | 3 | 1 + 2 + 3 + 4 = 10 | too slow, `lo = 4` |
| 4 | 6 | 5 | 1 + 2 + 2 + 3 = 8 | works, `hi = 5` |
| 4 | 5 | 4 | 1 + 2 + 2 + 3 = 8 | works, `hi = 4` |

`lo == hi == 4`, so the answer is 4.
:::

:::flow Binary search on the answer
Find the range | smallest and largest possible answer
Write check(x) | can we do it with x?
Confirm one-way | no, no, yes, yes
Binary search | first x that passes
:::

The time is `O(n log m)`, where `n` is the number of piles and `m` is the size of the answer range. Words like "minimum speed", "smallest capacity", "least number of days" or "maximize the minimum" are strong hints for this pattern.

## Search in a rotated sorted array

A sorted array was rotated, for example `[4, 5, 6, 7, 0, 1, 2]`. The key fact: when you cut it at `mid`, at least one half is still fully sorted. Find out which half is sorted, check whether the target lies inside it, and keep the correct half.

```python
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:               # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                    # target is inside it
            else:
                lo = mid + 1
        else:                                   # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1                    # target is inside it
            else:
                hi = mid - 1
    return -1

print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))   # 4
```

This version assumes all values are different.

:::warn The infinite loop
With the `while lo < hi` template, never write `lo = mid`. When `lo` and `hi` are neighbours, `mid` equals `lo`, so `lo = mid` changes nothing and the loop runs forever. Use `lo = mid + 1` together with `hi = mid`. Before you finish, test your loop in your head on an array of size 1 and size 2.
:::

:::note
In languages with fixed-size integers such as Java or C++, `(lo + hi)` can overflow, so people write `lo + (hi - lo) // 2`. Python integers do not overflow, so `(lo + hi) // 2` is safe. It is still good to mention this in an interview.
:::

:::interview Why is binary search O(log n)?
Each step throws away half of the remaining items. Starting with `n` items we have `n`, `n/2`, `n/4` and so on, until one item is left. The number of times you can halve `n` before reaching 1 is `log2(n)`. For one million items that is about 20 steps. Space is `O(1)` for the loop version.
:::

:::interview When can you use binary search even though the input is not sorted?
"When the answer lies in a known range and I can write a check function that is one-way: if a value works, every bigger value also works (or every smaller one). Then the results of the check look like no, no, yes, yes, which is a sorted pattern. I binary search for the first yes. Examples are the minimum eating speed, the smallest ship capacity to deliver packages in D days, and splitting an array so that the largest part is as small as possible."
:::

:::revise
- Binary search needs a rule that tells you which half to throw away.
- Exact match: `while lo <= hi`, with `lo = mid + 1` and `hi = mid - 1`.
- Boundary: `while lo < hi`, with `lo = mid + 1` and `hi = mid`, return `lo`.
- `bisect_left` and `bisect_right` do boundary search for you.
- "Minimum value that works" means binary search on the answer.
- Rotated array: one half is always sorted, so decide using that half.
:::

# Linked lists

*A chain of small boxes where each box knows only where the next box is.*

## Why it matters

Linked lists test whether you can handle pointers carefully. The problems are short, but one wrong line loses half of your list. They are also the base for stacks, queues, hash table buckets and LRU caches.

## The idea

Think of a treasure hunt. Each clue tells you where the next clue is hidden. You cannot jump to the fifth clue directly. You must follow the chain from the first one.

A **linked list** is a chain of **nodes**. Each node stores a value and a **pointer** (a reference) to the next node. The first node is called the **head**. The last node points to `None`.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(values):               # helper: [1, 2, 3] -> 1 -> 2 -> 3
    dummy = ListNode()
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def to_list(head):                    # helper: 1 -> 2 -> 3 -> [1, 2, 3]
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
```

| Operation | Array (Python list) | Linked list |
|---|---|---|
| Read the item at index i | `O(1)` | `O(n)` |
| Insert or delete at the front | `O(n)` | `O(1)` |
| Insert or delete after a known node | `O(n)` | `O(1)` |
| Search for a value | `O(n)` | `O(n)` |

## Technique 1: reverse a linked list

This is the most asked linked list question. Walk through the list and turn each arrow around. You need three names: `prev` (the part already reversed), `cur` (the node you are working on) and `nxt` (a saved copy of the next node).

```python
def reverse_list(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next        # 1. save the next node before we lose it
        cur.next = prev       # 2. turn the arrow around
        prev = cur            # 3. move prev forward
        cur = nxt             # 4. move cur forward
    return prev               # prev is the new head
```

:::example Dry run of reverse_list on 1 -> 2 -> 3

| Step | prev | cur | List state |
|---|---|---|---|
| start | None | 1 | 1 -> 2 -> 3 |
| after node 1 | 1 | 2 | 1 -> None, then 2 -> 3 |
| after node 2 | 2 | 3 | 2 -> 1 -> None, then 3 |
| after node 3 | 3 | None | 3 -> 2 -> 1 -> None |

`cur` is `None`, so the loop ends and we return `prev`, which is node 3.
:::

## Technique 2: the dummy node

Many bugs come from special cases for the head ("what if the node to delete is the first one?"). A **dummy node** is a fake node placed before the head. Now every real node has a node before it, and the special cases disappear. At the end, return `dummy.next`.

Problem: merge two sorted linked lists into one sorted list.

```python
def merge_two_lists(a, b):
    dummy = ListNode()
    tail = dummy                      # last node of the merged list
    while a and b:
        if a.val <= b.val:
            tail.next = a             # take the smaller node
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a or b                # attach whatever is left
    return dummy.next
```

## Technique 3: fast and slow pointers

Imagine two runners on a track. One runs twice as fast as the other. When the fast runner reaches the finish line, the slow runner is at the halfway mark. And if the track is a circle, the fast runner will catch the slow runner from behind.

```python
def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next              # 1 step
        fast = fast.next.next         # 2 steps
    return slow                       # for even length: the second middle

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:              # they met: there must be a loop
            return True
    return False                      # fast reached the end: no loop
```

## Technique 4: a gap between two pointers

Problem: remove the n-th node from the end in one pass. Move the `fast` pointer `n` steps ahead first. Then move both pointers together. When `fast` reaches the last node, `slow` is just before the node to remove.

```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n):                # create a gap of n nodes
        fast = fast.next
    while fast.next:                  # move both until fast is last
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next        # skip the target node
    return dummy.next

head = build_list([1, 2, 3, 4, 5])
print(to_list(remove_nth_from_end(head, 2)))   # [1, 2, 3, 5]
```

The dummy node makes this work even when the node to remove is the head itself.

:::tip
Draw the nodes as boxes and arrows on paper before you write code. For each line that changes a `.next`, redraw one arrow. Most linked list bugs become obvious in the drawing.
:::

:::warn Losing the rest of the list
If you write `cur.next = prev` before saving `cur.next`, the rest of the list is gone, because nothing points to it any more. Always save the next node in a variable first. Also check for `None` before you read `.next`: the loop `while fast and fast.next` is written in that order on purpose.
:::

:::interview How do you detect a cycle in a linked list with O(1) extra space, and why does it work?
"I use two pointers that start at the head. The slow one moves one step and the fast one moves two steps. If there is no cycle, the fast pointer reaches `None` and I return false. If there is a cycle, both pointers end up inside it. From then on, the distance between them shrinks by exactly one node on every move, so it must reach zero and they meet. This is Floyd's cycle detection. Time is `O(n)` and space is `O(1)`. The simple alternative is a set of visited nodes, which is also `O(n)` time but needs `O(n)` space."
:::

:::interview Reverse a linked list. Can you do it both with a loop and with recursion?
"With a loop I keep `prev` and `cur`. For each node I save `cur.next`, point `cur.next` back to `prev`, then move both forward. At the end `prev` is the new head. That is `O(n)` time and `O(1)` space. With recursion, I reverse the rest of the list first, then make the next node point back to me with `head.next.next = head` and set `head.next = None`. The recursive version is also `O(n)` time but uses `O(n)` space for the call stack."
:::

:::revise
- A node holds a value and a pointer to the next node, and the last points to `None`.
- No index access: reaching the k-th node costs `O(k)`.
- Reverse with three names: save `nxt`, flip the arrow, move `prev` and `cur`.
- A dummy node before the head removes special cases.
- Fast and slow pointers find the middle and detect cycles in `O(1)` space.
- Always save `cur.next` before you overwrite it.
:::

# Stacks and queues

*Two simple containers that differ only in which item comes out first.*

## Why it matters

Stacks and queues are everywhere inside computers: the undo button, the browser back button, function calls, and print jobs waiting their turn. In interviews, a stack is the hidden key for bracket problems, "next greater element" problems and expression parsing. A queue is the engine of breadth-first search, which you will meet in the tree and graph chapters.

## The idea

A **stack** is like a pile of plates. You put a new plate on top and you take a plate from the top. The last plate you put is the first one you take. This rule is called **LIFO**: last in, first out.

A **queue** is like the line at a ticket counter. People join at the back and leave from the front. This rule is called **FIFO**: first in, first out.

```python
from collections import deque

stack = []
stack.append(1)          # push
stack.append(2)
top = stack[-1]          # peek at the top without removing -> 2
stack.pop()              # pop -> 2

queue = deque()
queue.append(1)          # join at the back
queue.append(2)
front = queue[0]         # peek at the front -> 1
queue.popleft()          # leave from the front -> 1
```

All of these operations are `O(1)`.

:::warn Do not use a list as a queue
`lst.pop(0)` removes the first item and then shifts every other item one place to the left. That is `O(n)` for each pop. Use `collections.deque` and its `popleft()`, which is `O(1)`.
:::

## Stack pattern: matching brackets

Problem: check whether brackets like `"{[()]}"` are balanced. The most recent open bracket must be closed first. "Most recent first" is exactly what a stack does.

```python
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:                       # a closing bracket
            if not stack or stack.pop() != pairs[ch]:
                return False                  # nothing to match, or wrong
        else:
            stack.append(ch)                  # an opening bracket
    return not stack                          # nothing may stay open
```

:::example Dry run of is_valid on "{[]}"

| ch | Action | Stack after |
|---|---|---|
| { | push | { |
| [ | push | { [ |
| ] | pop [ and it matches | { |
| } | pop { and it matches | empty |

The stack is empty at the end, so the string is valid. For `"(]"` the pop gives `(` but `]` needs `[`, so the answer is `False`.
:::

## Stack pattern: min stack

Problem: design a stack that can also return its smallest item in `O(1)`. The trick: next to every value, store the minimum of everything at or below it.

```python
class MinStack:
    def __init__(self):
        self.stack = []                  # holds pairs (value, min so far)

    def push(self, val):
        cur_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, cur_min))

    def pop(self):
        return self.stack.pop()[0]

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]         # the minimum is always on top
```

## Monotonic stack

Imagine people of different heights standing in a line, all looking to the right. Each person asks: "Who is the first person taller than me on my right?" A short person standing behind a tall person can never be anybody's answer, so we can forget about them.

A **monotonic stack** is a stack whose items always stay in sorted order (for example, always decreasing from bottom to top). Before pushing a new item, we pop everything that breaks the order. The moment an item is popped is the moment it finds its answer.

Problem: for each day, how many days do you wait until a warmer temperature?

```python
def daily_temperatures(temps):
    res = [0] * len(temps)
    stack = []                             # indexes still waiting
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()                # day j found a warmer day: i
            res[j] = i - j
        stack.append(i)
    return res                             # days left in the stack stay 0
```

:::example Dry run of daily_temperatures on [73, 74, 75, 71, 69, 72, 76]

| i | t | Popped (answer) | Stack of indexes after |
|---|---|---|---|
| 0 | 73 | none | 0 |
| 1 | 74 | 0 (waits 1) | 1 |
| 2 | 75 | 1 (waits 1) | 2 |
| 3 | 71 | none | 2, 3 |
| 4 | 69 | none | 2, 3, 4 |
| 5 | 72 | 4 (waits 1), 3 (waits 2) | 2, 5 |
| 6 | 76 | 5 (waits 1), 2 (waits 4) | 6 |

Result: `[1, 1, 4, 2, 1, 1, 0]`. Every index is pushed once and popped at most once, so the time is `O(n)`.
:::

The same shape solves "next greater element", "next smaller element", "stock span" and "largest rectangle in a histogram". Only the comparison sign and what you store change.

## Queue pattern: a queue from two stacks

Problem: build a queue using only stacks. Use one stack for incoming items and one for outgoing items. Pouring one stack into the other reverses the order, which turns LIFO into FIFO.

```python
class MyQueue:
    def __init__(self):
        self.inbox = []                  # new items are pushed here
        self.outbox = []                 # items leave from here

    def push(self, x):
        self.inbox.append(x)

    def _move(self):
        if not self.outbox:              # refill only when outbox is empty
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._move()
        return self.outbox.pop()

    def peek(self):
        self._move()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox
```

## Monotonic queue: sliding window maximum

Problem: return the maximum of every window of size `k`. Keep a deque of indexes whose values are decreasing. The front is always the maximum of the current window.

```python
def max_sliding_window(nums, k):
    dq = deque()                         # indexes, values are decreasing
    res = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()                     # smaller items can never be max
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()                 # the front has left the window
        if i >= k - 1:
            res.append(nums[dq[0]])      # the front is the window maximum
    return res

print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [3, 3, 5, 5, 6, 7]
```

:::interview How would you implement a queue using two stacks? What is the cost of each operation?
"I keep an inbox stack and an outbox stack. Push always goes to the inbox, which is `O(1)`. For pop or peek, if the outbox is empty I move every item from the inbox to the outbox. That reverses the order, so the oldest item ends up on top of the outbox. A single pop can cost `O(n)` when it triggers a move, but each item is moved from inbox to outbox only once in its life. So over many operations the cost per operation is amortized `O(1)`."
:::

:::interview What is a monotonic stack and when do you use it?
"It is a stack that I keep in sorted order, increasing or decreasing. Before I push a new item, I pop all items that would break the order. I use it when a problem asks, for every item, for the nearest greater or smaller item on one side, like next greater element or daily temperatures. The brute force is `O(n²)` because each item scans to the right. With the stack each item is pushed once and popped at most once, so the total is `O(n)` time and `O(n)` space."
:::

:::revise
- Stack: last in, first out. Use a `list` with `append` and `pop`.
- Queue: first in, first out. Use a `deque` with `append` and `popleft`.
- Never use `list.pop(0)` as a queue: it is `O(n)`.
- Matching or nested structure (brackets, undo) points to a stack.
- "Next greater or smaller item" points to a monotonic stack, `O(n)` total.
- Two stacks make a queue with amortized `O(1)` operations.
:::

# Recursion and backtracking

*Solve a big problem by solving a smaller copy of the same problem, and try every choice by going forward and stepping back.*

## Why it matters

Recursion is the natural way to work with trees, graphs and dynamic programming, which are the next chapters. Backtracking is recursion used to build all possible answers, such as all subsets, all orderings or all valid boards. If recursion feels uncomfortable now, spend extra time on this chapter. It pays back in every later one.

## The idea of recursion

Think of standing in a long line at a cinema. You want to know your position, but you cannot see the front. So you ask the person ahead of you, "What is your position?" They ask the person ahead of them, and so on. The first person in line says "I am number 1". Then each person adds one to the answer and passes it back.

**Recursion** is when a function calls itself on a smaller input. Every recursive function has two parts:

- **Base case**: the smallest input, where the answer is known directly (the first person in line).
- **Recursive case**: make the problem smaller, call yourself, and use the result.

```python
def factorial(n):
    if n <= 1:                       # base case: the answer is known
        return 1
    return n * factorial(n - 1)      # recursive case: a smaller problem

def power(x, n):                     # x to the power n, for n >= 0
    if n == 0:
        return 1
    half = power(x, n // 2)          # solve half the problem once
    if n % 2 == 0:
        return half * half
    return half * half * x
```

`factorial` makes `n` calls, so it is `O(n)` time. `power` halves `n` every time, so it is `O(log n)`.

:::example How the call stack grows and shrinks for factorial(4)
```text
factorial(4)  waits for factorial(3)
  factorial(3)  waits for factorial(2)
    factorial(2)  waits for factorial(1)
      factorial(1)  returns 1          (base case)
    factorial(2)  returns 2 * 1 = 2
  factorial(3)  returns 3 * 2 = 6
factorial(4)  returns 4 * 6 = 24
```
Each waiting call sits on the call stack. Four waiting calls means `O(n)` space.
:::

:::tip The leap of faith
When you write a recursive function, do not try to follow every call in your head. Trust that the call on the smaller input returns the correct answer. Then ask only: "How do I use that answer to solve my input?" Check the base case separately.
:::

## The idea of backtracking

Imagine walking in a maze. At each junction you pick one path. If it leads to a dead end, you walk back to the last junction and try the next path. You repeat this until you have tried everything.

**Backtracking** builds an answer one choice at a time. After exploring a choice fully, it **undoes** the choice and tries the next one. Every backtracking solution has the same three steps inside a loop:

```text
def backtrack(state):
    if state is a complete answer:
        save a copy of it
        return
    for choice in available choices:
        make the choice           # 1. choose
        backtrack(new state)      # 2. explore
        undo the choice           # 3. un-choose
```

## Subsets

Problem: return all subsets of a list of different numbers. For `[1, 2, 3]` there are 8 subsets, including the empty one.

```python
def subsets(nums):
    res = []
    path = []                          # the subset we are building

    def backtrack(start):
        res.append(path[:])            # every path is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])       # choose nums[i]
            backtrack(i + 1)           # explore: only later items allowed
            path.pop()                 # un-choose

    backtrack(0)
    return res

print(subsets([1, 2, 3]))
# [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
```

:::example The decision tree for subsets([1, 2, 3])
```text
[]
├── [1]
│   ├── [1, 2]
│   │   └── [1, 2, 3]
│   └── [1, 3]
├── [2]
│   └── [2, 3]
└── [3]
```
Every node of this tree is one saved subset. The `start` index makes sure we only add items that come later, so `[2, 1]` is never built and there are no duplicates.
:::

## Permutations

A **permutation** is an ordering. `[1, 2, 3]` has 6 orderings. Here every unused number is a valid choice at each step, so we track which numbers are already used.

```python
def permutations(nums):
    res = []
    path = []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):     # a full ordering is ready
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue               # already in the path
            used[i] = True
            path.append(nums[i])       # choose
            backtrack()                # explore
            path.pop()                 # un-choose
            used[i] = False

    backtrack()
    return res
```

## Combination sum, with pruning

Problem: find all combinations of candidates that add up to `target`. A number may be used many times. **Pruning** means cutting off a branch early when you already know it cannot lead to an answer.

```python
def combination_sum(candidates, target):
    candidates.sort()
    res = []
    path = []

    def backtrack(start, remain):
        if remain == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remain:
                break                  # prune: later ones are even bigger
            path.append(c)
            backtrack(i, remain - c)   # i, not i + 1: reuse is allowed
            path.pop()

    backtrack(0, target)
    return res

print(combination_sum([2, 3, 6, 7], 7))   # [[2, 2, 3], [7]]
```

## Generate parentheses

Problem: generate all valid strings with `n` pairs of brackets. Here the choices are limited by rules: you may add `(` if you still have some left, and you may add `)` only if it closes an open bracket.

```python
def generate_parentheses(n):
    res = []
    path = []

    def backtrack(open_count, close_count):
        if len(path) == 2 * n:
            res.append("".join(path))
            return
        if open_count < n:                 # an opening bracket is allowed
            path.append("(")
            backtrack(open_count + 1, close_count)
            path.pop()
        if close_count < open_count:       # only close what is open
            path.append(")")
            backtrack(open_count, close_count + 1)
            path.pop()

    backtrack(0, 0)
    return res

print(generate_parentheses(3))
# ['((()))', '(()())', '(())()', '()(())', '()()()']
```

## N-Queens: constraints with sets

Problem: place `n` queens on an `n x n` chess board so that no two attack each other. Count the ways. We place one queen per row. Sets remember which columns and diagonals are taken. On one diagonal, `row - col` is the same for every cell. On the other diagonal, `row + col` is the same.

```python
def total_n_queens(n):
    cols, diag1, diag2 = set(), set(), set()

    def place(r):
        if r == n:
            return 1                       # all rows filled: one solution
        count = 0
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue                   # this square is attacked
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            count += place(r + 1)
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)
        return count

    return place(0)

print(total_n_queens(4), total_n_queens(8))   # 2 92
```

| Problem type | Number of answers | Typical time |
|---|---|---|
| Subsets of n items | `2^n` | `O(n * 2^n)` |
| Permutations of n items | `n!` | `O(n * n!)` |
| Combinations with pruning | depends on input | exponential |

:::warn Save a copy, not the path itself
`res.append(path)` stores a reference to the same list that you keep changing. At the end, every entry in `res` shows the same empty list. Write `res.append(path[:])` to store a copy. The second classic mistake is forgetting the un-choose step (`path.pop()`), which leaves old choices in the path.
:::

:::note
Python stops a recursion that goes deeper than about 1,000 calls and raises `RecursionError`. For deep recursion (for example a linked list with 100,000 nodes) use a loop, or raise the limit with `sys.setrecursionlimit`.
:::

:::interview What is the time complexity of generating all subsets, and why?
"Each item has two options: it is in the subset or it is not. With `n` items that gives `2^n` subsets. For each subset I copy up to `n` items into the result, so the total time is `O(n * 2^n)`. The recursion depth is at most `n`, so the extra space, not counting the output, is `O(n)`. Because the output itself is exponential, no algorithm can be faster than this."
:::

:::interview What is the difference between recursion and backtracking?
"Recursion is the general technique of a function calling itself on a smaller input. Backtracking is one way to use recursion: I build a candidate answer step by step, and after exploring a choice I undo it so I can try the next one. It is a depth-first search over a tree of choices. The pattern is choose, explore, un-choose. Good backtracking also prunes, which means it stops a branch early as soon as it breaks a rule."
:::

:::revise
- Every recursion needs a base case and a step that makes the input smaller.
- Recursion depth costs memory on the call stack.
- Backtracking is choose, explore, un-choose, inside a loop over choices.
- Use a `start` index for subsets and combinations, a `used` list for orderings.
- Save `path[:]`, not `path`, and never forget `path.pop()`.
- Subsets cost `O(n * 2^n)`, permutations cost `O(n * n!)`.
:::

# Trees and binary search trees

*Data shaped like a family tree: one root at the top, and every node has children below it.*

## Why it matters

Trees appear in a large share of interview problems, and almost all of them are solved with two tools: depth-first search and breadth-first search. Once you know the two templates, most tree problems become small changes to the same code.

## The idea

Think of a family tree or the folders on your computer. One folder is at the top. It contains other folders, and those contain more folders. There is exactly one way to reach each folder from the top.

A **tree** is a set of nodes connected by links, with no loops. In a **binary tree**, every node has at most two children, called left and right.

| Term | Meaning |
|---|---|
| Root | The top node, which has no parent |
| Leaf | A node with no children |
| Depth of a node | Number of links from the root down to it |
| Height of a tree | Number of nodes on the longest path from root to a leaf |
| Subtree | A node together with everything below it |

```python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

#         4
#       /   \
#      2     6
#     / \   / \
#    1   3 5   7
root = TreeNode(4,
                TreeNode(2, TreeNode(1), TreeNode(3)),
                TreeNode(6, TreeNode(5), TreeNode(7)))
```

We will use this tree in the examples below.

## Depth-first search (DFS)

**DFS** goes as deep as possible down one branch before it comes back and tries the next branch. Recursion does this naturally. There are three orders, and they differ only in **when** you visit the node itself.

```python
def preorder(node, out):             # node, left, right
    if not node:
        return
    out.append(node.val)
    preorder(node.left, out)
    preorder(node.right, out)

def inorder(node, out):              # left, node, right
    if not node:
        return
    inorder(node.left, out)
    out.append(node.val)
    inorder(node.right, out)

def postorder(node, out):            # left, right, node
    if not node:
        return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.val)
```

| Order | Result on our tree | Typical use |
|---|---|---|
| Preorder | 4, 2, 1, 3, 6, 5, 7 | Copy or save a tree |
| Inorder | 1, 2, 3, 4, 5, 6, 7 | Sorted order of a BST |
| Postorder | 1, 3, 2, 5, 7, 6, 4 | Compute from children first, delete a tree |

## The recursive thinking pattern

For most tree problems, ask yourself one question: "If my left child and my right child already gave me their answers, how do I combine them?"

```python
def max_depth(node):
    if not node:
        return 0                               # an empty tree has height 0
    left = max_depth(node.left)                # answer from the left child
    right = max_depth(node.right)              # answer from the right child
    return 1 + max(left, right)                # combine, plus myself

def diameter(root):
    # the longest path between any two nodes, counted in links
    best = 0

    def height(node):
        nonlocal best
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        best = max(best, left + right)         # the path that bends here
        return 1 + max(left, right)

    height(root)
    return best
```

`diameter` shows a very common trick: the function **returns** one thing to its parent (the height) and **updates** a different thing on the side (the best path).

## Breadth-first search (BFS)

**BFS** visits the tree level by level, like reading a page line by line. It uses a queue: take a node from the front, and add its children at the back.

```python
def level_order(root):
    if not root:
        return []
    res = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):        # exactly the nodes of one level
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        res.append(level)
    return res

print(level_order(root))                   # [[4], [2, 6], [1, 3, 5, 7]]
```

:::example Dry run of level_order

| Queue at start of round | Level collected | Queue after |
|---|---|---|
| 4 | [4] | 2, 6 |
| 2, 6 | [2, 6] | 1, 3, 5, 7 |
| 1, 3, 5, 7 | [1, 3, 5, 7] | empty |

The inner `for` loop runs `len(queue)` times, which is the size of the current level measured before any children are added.
:::

| Use DFS when | Use BFS when |
|---|---|
| You need heights, paths or subtree answers | You need answers level by level |
| You combine answers from children | You need the shortest path or nearest node |
| Space `O(height)` is good enough | The tree is very deep but not very wide |

Both visit every node once, so both are `O(n)` time. DFS uses `O(h)` space for the call stack, where `h` is the height. BFS uses space equal to the widest level, which can be `O(n)`.

## Binary search trees (BST)

Think of a dictionary where, at every page you open, all earlier words are on the left and all later words are on the right. You always know which way to turn.

A **binary search tree** is a binary tree with one rule: for every node, all values in its left subtree are smaller, and all values in its right subtree are bigger. Our example tree is a BST. Two results follow from the rule:

- An inorder traversal gives the values in sorted order.
- Searching goes down one path only, so it costs `O(h)`.

```python
def bst_search(node, target):
    while node:
        if target == node.val:
            return node
        # smaller values live on the left, bigger ones on the right
        node = node.left if target < node.val else node.right
    return None

def bst_insert(node, val):
    if not node:
        return TreeNode(val)               # found the empty spot
    if val < node.val:
        node.left = bst_insert(node.left, val)
    else:
        node.right = bst_insert(node.right, val)
    return node
```

If the tree is **balanced** (left and right sides have similar heights), `h` is about `log n`, so search and insert are `O(log n)`. If you insert already sorted values into a plain BST, it becomes one long chain and `h` is `n`, so the cost becomes `O(n)`.

## Validate a BST

Each node must stay inside a range that comes from all its ancestors, not only from its parent. We pass the allowed range down the tree.

```python
def is_valid_bst(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):        # outside the allowed range
        return False
    return (is_valid_bst(node.left, low, node.val) and    # left: smaller
            is_valid_bst(node.right, node.val, high))     # right: bigger
```

:::warn Checking only the children is wrong
A common wrong answer checks only `node.left.val < node.val < node.right.val` at each node. This tree passes that check but is not a BST, because 6 sits in the left subtree of 5:
```text
      5
     / \
    3   8
     \
      6
```
Every node in the left subtree must be smaller than 5, not only the direct child. Pass a `(low, high)` range down, or check that the inorder traversal is strictly increasing.
:::

## Lowest common ancestor

The **lowest common ancestor** (LCA) of two nodes is the deepest node that has both of them below it (a node counts as below itself). In a family tree, it is the closest shared ancestor.

```python
def lowest_common_ancestor(node, p, q):
    # works for any binary tree; p and q are nodes that exist in it
    if not node or node is p or node is q:
        return node
    left = lowest_common_ancestor(node.left, p, q)
    right = lowest_common_ancestor(node.right, p, q)
    if left and right:
        return node                # p and q are on different sides
    return left or right           # both on one side, or not here at all

def lca_bst(node, p, q):
    # in a BST we can use the ordering and walk down one path
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left
        elif p.val > node.val and q.val > node.val:
            node = node.right
        else:
            return node            # the values split here
```

## DFS without recursion

An interviewer may ask for an iterative version. Use your own stack in place of the call stack. Here is inorder:

```python
def inorder_iterative(root):
    out, stack = [], []
    node = root
    while node or stack:
        while node:                    # go left as far as possible
            stack.append(node)
            node = node.left
        node = stack.pop()             # visit the node
        out.append(node.val)
        node = node.right              # then handle its right side
    return out
```

:::interview How do you check whether a binary tree is a valid BST?
"I use DFS and pass down the range of values each node is allowed to have. The root can be anything. When I go left, the current value becomes the new upper limit. When I go right, it becomes the new lower limit. If any node is outside its range, the tree is not a BST. I visit each node once, so the time is `O(n)` and the space is `O(h)` for the recursion. Another way is an inorder traversal while checking that each value is bigger than the previous one. I would also ask whether duplicate values are allowed, because that changes `<` to `<=`."
:::

:::interview When would you choose BFS over DFS on a tree?
"I choose BFS when the question is about levels or about the closest node: level order output, the right side view, the minimum depth, or the shortest path. BFS reaches nodes in order of distance from the root, so the first match is the nearest one. I choose DFS when I need to combine answers from subtrees, like height, diameter or path sums, because recursion gives me the children's answers directly. Both are `O(n)` time. DFS uses `O(h)` memory and BFS uses memory equal to the widest level."
:::

:::revise
- DFS goes deep with recursion, BFS goes level by level with a queue.
- Preorder: node first. Inorder: node in the middle. Postorder: node last.
- Tree recursion: get answers from left and right, then combine them.
- BST rule: all of the left subtree is smaller, all of the right is bigger.
- Inorder traversal of a BST gives sorted order.
- Validate a BST with a `(low, high)` range, not only the direct children.
:::

# Heaps and top-K problems

*A structure that always hands you the smallest (or largest) item quickly, without sorting everything.*

## Why it matters

Whenever a problem says "the k largest", "the k most frequent", "the closest k" or "the smallest so far", a heap is usually the right tool. Heaps also power Dijkstra's shortest path algorithm in the graph chapter.

## The idea

Think of the emergency room in a hospital. Patients are not treated in the order they arrive. The most serious case is always treated next. New patients keep arriving, and the staff must always know who is next, without sorting the whole waiting room again and again.

A **priority queue** is a queue where the item with the best priority leaves first. A **heap** is the usual way to build one. A **min-heap** is a binary tree where every parent is smaller than or equal to its children, so the smallest item is always at the root.

```text
        1            stored as the list [1, 3, 2, 7, 4, 5]
      /   \
     3     2         children of index i are at 2i + 1 and 2i + 2
    / \   /          parent of index i is at (i - 1) // 2
   7   4 5
```

The tree is stored in a plain list, with no node objects. When you push, the new item is placed at the end and "bubbles up" while it is smaller than its parent. When you pop, the last item moves to the root and "sinks down". The tree has about `log n` levels, so both cost `O(log n)`.

| Operation | Python | Cost |
|---|---|---|
| Look at the smallest | `heap[0]` | `O(1)` |
| Add an item | `heapq.heappush(heap, x)` | `O(log n)` |
| Remove the smallest | `heapq.heappop(heap)` | `O(log n)` |
| Turn a list into a heap | `heapq.heapify(lst)` | `O(n)` |

```python
import heapq

heap = []
for x in [5, 1, 8, 3]:
    heapq.heappush(heap, x)
print(heap[0])                  # 1: the smallest is always at index 0
print(heapq.heappop(heap))      # 1
print(heapq.heappop(heap))      # 3

# Python only has a min-heap. For a max-heap, store negative numbers.
max_heap = []
for x in [5, 1, 8, 3]:
    heapq.heappush(max_heap, -x)
print(-heapq.heappop(max_heap)) # 8: the largest
```

:::warn A heap is not a sorted list
Only `heap[0]` is guaranteed to be the smallest. The rest of the list is in "heap order", not sorted order. Do not read `heap[1]` and expect the second smallest, and do not loop over the heap expecting sorted output. To get items in order, pop them one by one.
:::

## Pattern 1: the k-th largest item

The trick sounds backwards at first: to find the k **largest** items, keep a **min**-heap of size `k`. The heap holds the best `k` items seen so far, and its root is the weakest of them. When a better item arrives, the weakest one is thrown out.

```python
def kth_largest(nums, k):
    heap = []                           # min-heap with the k largest so far
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)         # drop the smallest of the k + 1
    return heap[0]                      # weakest of the top k
```

:::example Dry run of kth_largest([3, 2, 1, 5, 6, 4], k = 2)

| x | After push | Popped | Kept in heap |
|---|---|---|---|
| 3 | 3 | none | 3 |
| 2 | 2, 3 | none | 2, 3 |
| 1 | 1, 2, 3 | 1 | 2, 3 |
| 5 | 2, 3, 5 | 2 | 3, 5 |
| 6 | 3, 5, 6 | 3 | 5, 6 |
| 4 | 4, 5, 6 | 4 | 5, 6 |

The root is 5, which is the 2nd largest. Time is `O(n log k)` and space is `O(k)`.
:::

## Pattern 2: top k frequent

Count first with a `Counter`, then keep a heap of size `k` ordered by count. We push tuples. Python compares tuples by their first item, so `(count, value)` is ordered by count.

```python
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    heap = []
    for value, freq in count.items():
        heapq.heappush(heap, (freq, value))     # ordered by frequency
        if len(heap) > k:
            heapq.heappop(heap)                 # drop the least frequent
    return [value for freq, value in heap]

print(sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2)))   # [1, 2]
```

## Pattern 3: merge k sorted lists

Imagine `k` queues of people, each already sorted by height. To build one sorted line, you only need to compare the people standing at the **front** of each queue. A heap holds those `k` front items.

```python
def merge_k_sorted(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))  # (value, list, index)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)           # smallest front item
        out.append(val)
        if j + 1 < len(lists[i]):                 # push its neighbour
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out

print(merge_k_sorted([[1, 4, 5], [1, 3, 4], [2, 6]]))
# [1, 1, 2, 3, 4, 4, 5, 6]
```

With `n` items in total, the time is `O(n log k)`, because the heap never holds more than `k` items.

:::tip Tuples and ties
When two tuples have the same first item, Python compares the second item. If the second item cannot be compared (for example a `ListNode` object), you get a `TypeError`. Put a unique number such as an index in the second position, like `(value, i, node)`. Then the comparison never reaches the object.
:::

## Pattern 4: two heaps for the median

The **median** is the middle value of sorted data. Problem: numbers arrive one by one, and you must report the median at any time.

Split the numbers into two halves. A max-heap holds the smaller half, so its top is the largest of the small numbers. A min-heap holds the larger half, so its top is the smallest of the large numbers. The median is at the tops.

```python
class MedianFinder:
    def __init__(self):
        self.small = []      # max-heap (negated values): the smaller half
        self.large = []      # min-heap: the larger half

    def add_num(self, num):
        heapq.heappush(self.small, -num)
        # move the largest of the small half over to the large half
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small):      # keep sizes balanced
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def find_median(self):
        if len(self.small) > len(self.large):
            return -self.small[0]                  # odd count
        return (-self.small[0] + self.large[0]) / 2
```

Adding a number is `O(log n)` and reading the median is `O(1)`.

## Heap, sort or something else?

| Need | Best choice | Cost |
|---|---|---|
| Everything in order, one time | Sort | `O(n log n)` |
| Only the top k of n items | Heap of size k | `O(n log k)` |
| Smallest item again and again while data changes | Heap | `O(log n)` per step |
| Is x present? | Set or dict | `O(1)` average |

:::note
Python also has shortcuts: `heapq.nlargest(k, nums)` and `heapq.nsmallest(k, nums)`. They are fine to mention, but the interviewer usually wants to see that you can do it with push and pop.
:::

:::interview Find the k-th largest element in an unsorted array. What are your options?
"The simplest way is to sort and take the item at index `n - k`, which is `O(n log n)`. A better way for small `k` is a min-heap of size `k`. I push each number and pop when the size goes above `k`. The heap then holds the `k` largest numbers and its root is the answer. That is `O(n log k)` time and `O(k)` space, and it also works when numbers arrive as a stream. A third option is quickselect, which is `O(n)` on average but `O(n²)` in the worst case."
:::

:::interview Why is a heap better than keeping a sorted list for a priority queue?
"With a sorted list, finding the place for a new item by binary search is `O(log n)`, but inserting it shifts the later items, which is `O(n)`. A heap does not keep everything sorted. It keeps only the weaker rule that each parent is smaller than its children. That is enough to know the minimum, and both push and pop only walk one path of the tree, which is `O(log n)`."
:::

:::revise
- A min-heap keeps the smallest item at `heap[0]`, with push and pop in `O(log n)`.
- `heapq` is a min-heap: store negative values to get a max-heap.
- Top k largest: a min-heap of size `k`, total `O(n log k)`.
- Merge k sorted lists: a heap with the front item of each list.
- Running median: a max-heap for the small half, a min-heap for the large half.
- A heap is not sorted: only the root is guaranteed.
:::

# Graphs: BFS and DFS

*Things and the connections between them: cities and roads, people and friendships, cells in a grid.*

## Why it matters

A graph is the most general data structure. Maps, social networks, course prerequisites and web links are all graphs. Many interview problems do not even use the word "graph". They talk about a grid, a word ladder or a set of accounts, and your first job is to see the graph hiding inside.

## The idea

Think of a road map. Cities are dots and roads are lines between them. You may ask: "Can I reach Jaipur from Pune?" or "What is the smallest number of roads I need to take?"

A **graph** is a set of **vertices** (also called nodes) and **edges** (connections between two nodes).

| Term | Meaning |
|---|---|
| Undirected | An edge works both ways, like a friendship |
| Directed | An edge has a direction, like following someone |
| Weighted | Each edge has a cost, like the length of a road |
| Neighbour | A node you can reach using one edge |
| Cycle | A path that returns to the node where it started |
| Connected component | A group of nodes that can all reach each other |

A tree is a special graph: connected and with no cycles. The big difference when you work with graphs is that there can be cycles, so you must remember which nodes you have already visited. If you forget, your code walks in circles forever.

## Storing a graph

The usual form is an **adjacency list**: a dict that maps each node to the list of its neighbours. Problems often give a list of edges, so the first step is to build the dict.

```python
from collections import defaultdict, deque

def build_graph(edges, directed=False):
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        if not directed:
            graph[b].append(a)       # an undirected edge works both ways
    return graph

edges = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4)]
graph = build_graph(edges)
# {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3]}
```

In all the costs below, `V` is the number of vertices and `E` is the number of edges. An adjacency list uses `O(V + E)` memory.

## Depth-first search

DFS follows one path as far as it can, then steps back and tries another. It is the same as tree DFS, plus a `visited` set.

```python
def dfs(graph, start):
    visited = set()
    order = []

    def visit(node):
        visited.add(node)                # mark before going deeper
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                visit(nxt)

    visit(start)
    return order

print(dfs(graph, 0))                     # [0, 1, 3, 2, 4]
```

## Breadth-first search

BFS explores in rings: first all nodes one edge away, then all nodes two edges away, and so on. Because of this, in an **unweighted** graph the first time BFS reaches a node is by a shortest path.

```python
def shortest_path_length(graph, start, goal):
    visited = {start}
    queue = deque([(start, 0)])          # (node, distance from start)
    while queue:
        node, dist = queue.popleft()
        if node == goal:
            return dist
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)         # mark when adding to the queue
                queue.append((nxt, dist + 1))
    return -1                            # goal cannot be reached

print(shortest_path_length(graph, 0, 4))   # 3  (0 -> 1 -> 3 -> 4)
```

:::example Dry run of BFS from node 0 to node 4

| Taken from queue | Distance | Added to queue | visited after |
|---|---|---|---|
| 0 | 0 | 1, 2 | 0, 1, 2 |
| 1 | 1 | 3 | 0, 1, 2, 3 |
| 2 | 1 | nothing (0 and 3 are visited) | 0, 1, 2, 3 |
| 3 | 2 | 4 | 0, 1, 2, 3, 4 |
| 4 | 3 | goal reached | |

The answer is 3. Both DFS and BFS look at every node and every edge at most a fixed number of times, so both cost `O(V + E)`.
:::

:::warn Mark visited when you add to the queue
If you mark a node only when you take it **out** of the queue, the same node can be added many times by different neighbours before its turn comes. The queue grows large and the code becomes very slow. Add the node to `visited` at the same moment you append it to the queue.
:::

## Grids are graphs

In a grid problem, every cell is a node and its neighbours are the cells up, down, left and right. You do not need to build an adjacency list. The four directions are your edges.

Problem: count the islands in a grid where `"1"` is land and `"0"` is water. Each island is one connected component. Scan every cell. When you find land that is not visited yet, you have found a new island, and a BFS marks all of its cells.

```python
def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1" or (r, c) in seen:
                continue
            count += 1                       # a new island starts here
            seen.add((r, c))
            queue = deque([(r, c)])
            while queue:                     # flood the whole island
                cr, cc = queue.popleft()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = cr + dr, cc + dc
                    if (0 <= nr < rows and 0 <= nc < cols
                            and grid[nr][nc] == "1"
                            and (nr, nc) not in seen):
                        seen.add((nr, nc))
                        queue.append((nr, nc))
    return count
```

Every cell enters the queue at most once, so the time is `O(rows * cols)`.

Problem: the shortest path in a grid from the top-left to the bottom-right cell, where `0` is free and `1` is a wall. "Shortest" and "every step costs the same" mean BFS.

```python
def shortest_grid_path(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return -1
    seen = {(0, 0)}
    queue = deque([(0, 0, 0)])               # (row, col, steps so far)
    while queue:
        r, c, steps = queue.popleft()
        if (r, c) == (rows - 1, cols - 1):
            return steps
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols
                    and grid[nr][nc] == 0 and (nr, nc) not in seen):
                seen.add((nr, nc))
                queue.append((nr, nc, steps + 1))
    return -1
```

:::tip Multi-source BFS
If the search starts from many cells at once (for example "all rotten oranges spread every minute"), put **all** the start cells in the queue before the loop begins. The BFS then expands from all of them together, and the distance of each cell is its distance to the nearest start.
:::

## Counting connected components

Problem: given `n` nodes numbered from 0 and a list of undirected edges, how many separate groups are there? Start a DFS from every node that is not visited yet. Each new start is one more group. This version uses a stack and a loop in place of recursion, so it is safe for very large graphs.

```python
def count_components(n, edges):
    graph = build_graph(edges)
    visited = set()
    count = 0
    for start in range(n):
        if start in visited:
            continue
        count += 1                       # a node no earlier search reached
        stack = [start]
        visited.add(start)
        while stack:                     # iterative DFS
            node = stack.pop()
            for nxt in graph[node]:
                if nxt not in visited:
                    visited.add(nxt)
                    stack.append(nxt)
    return count

print(count_components(5, [(0, 1), (1, 2), (3, 4)]))   # 2
```

## BFS or DFS?

| Question | Choice | Reason |
|---|---|---|
| Shortest path, all edges cost the same | BFS | reaches nodes in order of distance |
| Can I reach B from A? | Either | both visit everything reachable |
| Count groups, flood fill | Either | pick the one you write fastest |
| Explore all paths, detect cycles, ordering | DFS | follows one path to its end |

:::interview How would you count the number of islands in a grid? What is the complexity?
"I treat the grid as a graph where each land cell is a node connected to its four neighbours. I scan all cells. When I find a land cell that I have not visited, I add one to the count and run a BFS or DFS from it to mark the whole island as visited. Each cell is visited once, so the time is `O(rows * cols)`. The space is also `O(rows * cols)` in the worst case for the visited set and the queue. If I am allowed to change the input, I can overwrite visited land with water to avoid the extra set."
:::

:::interview Why does BFS find the shortest path in an unweighted graph, while DFS does not?
"BFS uses a queue, so it processes nodes in the order they were discovered. It finishes all nodes at distance 1 before any node at distance 2, and so on. So the first time it reaches a node, no shorter route can exist. DFS dives down one path and may reach the goal by a long route first. BFS is only correct for shortest paths when all edges have the same cost. With different weights I would use Dijkstra's algorithm."
:::

:::revise
- A graph is nodes plus edges. Store it as an adjacency list: `dict` of lists.
- Graphs can have cycles, so always keep a `visited` set.
- DFS uses recursion or a stack. BFS uses a queue. Both are `O(V + E)`.
- BFS gives the shortest path when every edge costs the same.
- A grid is a graph: cells are nodes and the 4 directions are edges.
- Mark a node as visited when you add it to the queue, not when you remove it.
:::

# Graphs: topological sort, Dijkstra and union-find

*Three classic tools for ordering tasks, finding cheapest paths and tracking connected groups.*

## Why it matters

BFS and DFS answer "can I reach it?" and "how many steps?". Real problems add more: tasks that depend on each other, roads with different lengths, and networks where connections are added over time. These three tools cover almost all of those questions at interview level.

## Topological sort

Think of getting dressed. Socks must come before shoes, and a shirt before a jacket. But socks and shirt can come in any order. A **topological order** is a list of all tasks in which every task appears after the tasks it depends on.

It exists only for a directed graph with no cycles (a **DAG**, directed acyclic graph). If A needs B and B needs A, no valid order exists.

**Kahn's algorithm** uses the **in-degree** of each node, which is the number of edges that point into it (the number of prerequisites not done yet). A node with in-degree 0 is ready to be done.

```python
from collections import deque

def topo_order(n, prerequisites):
    # prerequisites: pairs (a, b) meaning "b must be done before a"
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in prerequisites:
        graph[b].append(a)                 # edge from b to a
        indegree[a] += 1

    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()             # ready: nothing is blocking it
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1             # one prerequisite is now done
            if indegree[nxt] == 0:
                queue.append(nxt)

    return order if len(order) == n else []    # [] means there is a cycle
```

:::example Dry run of topo_order
4 courses with `prerequisites = [(1, 0), (2, 0), (3, 1), (3, 2)]`. Course 0 comes first, then 1 and 2, then 3. Starting in-degrees: `[0, 1, 1, 2]`.

| Taken from queue | In-degrees after | Queue after | Order so far |
|---|---|---|---|
| start | 0, 1, 1, 2 | 0 | empty |
| 0 | 0, 0, 0, 2 | 1, 2 | 0 |
| 1 | 0, 0, 0, 1 | 2 | 0, 1 |
| 2 | 0, 0, 0, 0 | 3 | 0, 1, 2 |
| 3 | 0, 0, 0, 0 | empty | 0, 1, 2, 3 |

All 4 courses are in the order, so there is no cycle. Time is `O(V + E)`.
:::

If the graph has a cycle, the nodes on the cycle never reach in-degree 0. They never enter the queue, so the order comes out shorter than `n`. That is how the same code detects a cycle in a directed graph.

## Dijkstra's algorithm

BFS finds the shortest path when every edge costs the same. But roads have different lengths. A route with three short roads can be better than a route with one very long road.

**Dijkstra's algorithm** finds the cheapest path from one start node to every other node when all edge weights are zero or positive. The idea is greedy: always process next the unfinished node with the smallest known distance. A min-heap gives us that node quickly.

```python
import heapq

def dijkstra(graph, start):
    # graph: {node: [(neighbour, weight), ...]}
    dist = {start: 0}
    heap = [(0, start)]                    # (distance so far, node)
    while heap:
        d, node = heapq.heappop(heap)      # closest unfinished node
        if d > dist.get(node, float("inf")):
            continue                       # an old, worse entry: skip it
        for nxt, w in graph.get(node, []):
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd             # found a cheaper way to nxt
                heapq.heappush(heap, (nd, nxt))
    return dist                            # only reachable nodes appear

roads = {
    "A": [("B", 4), ("C", 1)],
    "C": [("B", 2), ("D", 5)],
    "B": [("D", 1)],
    "D": [],
}
print(dijkstra(roads, "A"))    # {'A': 0, 'B': 3, 'C': 1, 'D': 4}
```

:::example Dry run of dijkstra from A

| Popped | Updates | dist after |
|---|---|---|
| (0, A) | B = 4, C = 1 | A 0, B 4, C 1 |
| (1, C) | B = 1 + 2 = 3, D = 1 + 5 = 6 | A 0, B 3, C 1, D 6 |
| (3, B) | D = 3 + 1 = 4 | A 0, B 3, C 1, D 4 |
| (4, B) | old entry, 4 > 3, skipped | no change |
| (4, D) | no neighbours | no change |
| (6, D) | old entry, 6 > 4, skipped | no change |

The direct road A to B costs 4, but going through C costs only 3.
:::

With a heap, the time is `O((V + E) log V)`.

:::warn Dijkstra and negative weights
Dijkstra assumes that once a node is popped with the smallest distance, no cheaper path to it can appear later. A negative edge breaks this promise, and the result can be wrong. For graphs with negative weights use the Bellman-Ford algorithm, which is slower at `O(V * E)`. Also do not forget the "old entry" check: without it the code is still correct but does a lot of useless work.
:::

## Union-find (disjoint set union)

Think of friend groups in a new college batch. At first everybody is alone. When two students become friends, their whole groups join into one. At any moment you may ask: "Are these two students in the same group?"

**Union-find** keeps track of groups that only ever merge. Each group has one **representative** (also called the root). It supports two operations:

- `find(x)`: return the representative of the group of `x`.
- `union(a, b)`: join the groups of `a` and `b`.

Two tricks make it very fast. **Path compression** makes every node on the way point straight to the root after a `find`. **Union by size** attaches the smaller group under the bigger one, so the chains stay short.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))       # everyone is their own root
        self.size = [1] * n
        self.count = n                     # number of separate groups

    def find(self, x):
        while self.parent[x] != x:
            # path compression: point x to its grandparent, then move up
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                   # already in the same group
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra                # make ra the bigger group
        self.parent[rb] = ra               # hang the smaller under it
        self.size[ra] += self.size[rb]
        self.count -= 1
        return True
```

With both tricks, each operation takes almost constant time. The exact bound is written `O(α(n))`, where `α` is the inverse Ackermann function, which stays below 5 for any input size you will ever meet.

Problem: in an undirected graph, find an edge that creates a cycle. If the two ends of a new edge are **already** in the same group, there was already a path between them, so this edge closes a cycle.

```python
def find_redundant_edge(n, edges):
    uf = UnionFind(n)
    for a, b in edges:
        if not uf.union(a, b):             # already connected
            return [a, b]
    return []

print(find_redundant_edge(4, [(0, 1), (1, 2), (2, 0), (2, 3)]))  # [2, 0]

uf = UnionFind(5)
for a, b in [(0, 1), (1, 2), (3, 4)]:
    uf.union(a, b)
print(uf.count)                            # 2 groups
print(uf.find(0) == uf.find(2))            # True: same group
```

Union-find is also the heart of **Kruskal's algorithm** for the minimum spanning tree (the cheapest set of edges that connects every node): sort the edges by weight and add each edge unless it would create a cycle.

## Which graph tool for which question?

| The question says | Tool | Time |
|---|---|---|
| Fewest steps, equal edge cost | BFS | `O(V + E)` |
| Cheapest path, weights 0 or more | Dijkstra | `O((V + E) log V)` |
| Cheapest path, negative weights | Bellman-Ford | `O(V * E)` |
| Order tasks with dependencies | Topological sort | `O(V + E)` |
| Groups that merge, "are they connected?" | Union-find | almost `O(1)` each |

:::flow Choosing a graph algorithm
Read the problem | what are nodes and edges?
Dependencies? | topological sort
Shortest path? | BFS or Dijkstra
Merging groups? | union-find
Otherwise | plain DFS or BFS
:::

:::interview There are n courses and a list of prerequisite pairs. Can you finish all courses?
"I model this as a directed graph with an edge from each prerequisite to the course that needs it. All courses can be finished only if this graph has no cycle. I use Kahn's algorithm. I compute the in-degree of every course and put all courses with in-degree 0 in a queue. I take a course from the queue, count it as done, and lower the in-degree of the courses that depend on it. Any course that drops to 0 joins the queue. At the end, if the number of processed courses equals `n`, the answer is yes. Otherwise some courses are stuck in a cycle. Time and space are `O(V + E)`."
:::

:::interview When would you use union-find and not DFS to check connectivity?
"If the graph is fixed and I ask once, DFS or BFS is simple and costs `O(V + E)`. Union-find is better when edges arrive one at a time and I must answer 'are these two connected?' between the additions. Running a new DFS for every question would be too slow, but union-find answers each one in almost constant time. It is also the natural choice for finding the edge that creates a cycle and for Kruskal's minimum spanning tree. Its limit is that it only supports merging. It cannot remove an edge."
:::

:::revise
- Topological sort orders tasks so that every prerequisite comes first.
- Kahn's algorithm: repeatedly take nodes with in-degree 0. A short result means a cycle.
- Dijkstra: pop the closest node from a min-heap and relax its edges.
- Dijkstra needs weights that are zero or positive.
- Union-find: `find` gives the group root, `union` merges two groups.
- Path compression plus union by size makes union-find almost `O(1)`.
:::

# Dynamic programming

*Solve each small problem once, remember the answer, and build the big answer from the small ones.*

## Why it matters

Dynamic programming, or DP, has a scary reputation, but it is a method, not magic. If you can write a recursive solution and notice that it solves the same small problems again and again, you are one step from DP. This chapter gives you a fixed set of questions to ask, so you never start from a blank page.

## The idea

Suppose someone asks you: "What is 1 + 1 + 1 + 1 + 1 + 1?" You count and say 6. Then they add one more "+ 1" and ask again. You answer 7 at once. You did not count again from the start, because you **remembered** the earlier answer.

**Dynamic programming** means: break a problem into smaller subproblems, solve each subproblem once, store its answer, and reuse it. It works when two things are true:

- **Overlapping subproblems**: the same small problem is needed many times.
- **Optimal substructure**: the best answer to the big problem can be built from the best answers to smaller problems.

Look at Fibonacci numbers, where each number is the sum of the two before it. The plain recursion calls itself twice at every level. `fib(5)` computes `fib(3)` two times and `fib(2)` three times, and the waste grows exponentially.

```python
from functools import lru_cache

def fib_slow(n):                     # O(2^n): repeats the same work
    if n < 2:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

@lru_cache(maxsize=None)             # remembers the result for each n
def fib_memo(n):                     # O(n): each n is solved once
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

def fib_table(n):                    # O(n) time, O(1) space
    a, b = 0, 1                      # fib(0), fib(1)
    for _ in range(n):
        a, b = b, a + b              # slide forward by one
    return a
```

These are the two styles of DP:

| Style | How | Good | Watch out |
|---|---|---|---|
| Top-down (memoization) | Recursion plus a cache | Close to the brute force, easy to write | Recursion depth limit |
| Bottom-up (tabulation) | Fill a table with loops | No recursion, easy to save space | You must find the right loop order |

**Memoization** simply means storing the result of a function call so the next call with the same input returns at once.

## The five questions

Use these for every DP problem. Write the answers down before you write code.

:::flow How to build a DP solution
State | what does dp[i] mean?
Choices | what can I do at step i?
Recurrence | dp[i] from smaller states
Base cases | smallest inputs
Order and answer | fill order, where the result is
:::

The **state** is the hardest part. A state is the set of values that fully describes a subproblem, such as "the first `i` items" or "amount `a`" or "position `(r, c)`". A good way to find it: write the brute-force recursion first. The arguments that change between calls are your state.

## 1D DP: climbing stairs

Problem: you climb a staircase with `n` steps. Each move is 1 or 2 steps. How many different ways are there?

- State: `ways[i]` = number of ways to reach step `i`.
- Choices: the last move was 1 step (from `i - 1`) or 2 steps (from `i - 2`).
- Recurrence: `ways[i] = ways[i - 1] + ways[i - 2]`.
- Base cases: `ways[0] = 1` (stand still), `ways[1] = 1`.

```python
def climb_stairs(n):
    prev, cur = 1, 1                 # ways[0], ways[1]
    for _ in range(2, n + 1):
        prev, cur = cur, prev + cur  # only the last two values are needed
    return cur

print(climb_stairs(5))               # 8
```

## 1D DP: house robber

Problem: houses in a row hold money. You cannot rob two neighbours. What is the most you can take?

- State: `best[i]` = most money from the first `i` houses.
- Choices for house `i`: skip it (keep `best[i - 1]`) or rob it (its money plus `best[i - 2]`).

```python
def rob(nums):
    skip_prev, best = 0, 0           # best[i - 2], best[i - 1]
    for money in nums:
        # either skip this house, or rob it on top of best[i - 2]
        skip_prev, best = best, max(best, skip_prev + money)
    return best
```

:::example Dry run of rob([2, 7, 9, 3, 1])

| House money | Skip it | Rob it | best |
|---|---|---|---|
| 2 | 0 | 0 + 2 = 2 | 2 |
| 7 | 2 | 0 + 7 = 7 | 7 |
| 9 | 7 | 2 + 9 = 11 | 11 |
| 3 | 11 | 7 + 3 = 10 | 11 |
| 1 | 11 | 11 + 1 = 12 | 12 |

The answer is 12: rob the houses with 2, 9 and 1.
:::

## Coin change (unbounded knapsack)

Problem: given coin values, find the fewest coins that make `amount`. Each coin can be used any number of times.

- State: `dp[a]` = fewest coins to make amount `a`.
- Choices: the last coin used is one of the coins `c`.
- Recurrence: `dp[a] = 1 + min(dp[a - c])` over all coins `c <= a`.
- Base case: `dp[0] = 0`.

```python
def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount            # dp[a] = fewest coins for a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1    # use coin c as the last coin
    return dp[amount] if dp[amount] != INF else -1
```

:::example Dry run of coin_change([1, 3, 4], 6)

| a | Options | dp[a] |
|---|---|---|
| 1 | dp[0] + 1 | 1 |
| 2 | dp[1] + 1 | 2 |
| 3 | dp[2] + 1, dp[0] + 1 | 1 |
| 4 | dp[3] + 1, dp[1] + 1, dp[0] + 1 | 1 |
| 5 | dp[4] + 1, dp[2] + 1, dp[1] + 1 | 2 |
| 6 | dp[5] + 1, dp[3] + 1, dp[2] + 1 | 2 |

The answer is 2 coins (3 + 3). Time is `O(amount * number of coins)`.
:::

:::warn Greedy does not work for coin change
"Always take the biggest coin" feels right, but look at the example above. Greedy takes 4, then 1, then 1, which is 3 coins. The best answer is 3 + 3, which is 2 coins. Greedy happens to work for some coin systems such as 1, 2, 5, 10, but not for all. When a problem asks for the best result over many combinations, test a greedy idea on a small tricky input before you trust it.
:::

## Longest increasing subsequence

A **subsequence** keeps the order of the items but may skip some. Problem: find the length of the longest subsequence in which every number is bigger than the one before.

- State: `dp[i]` = length of the longest increasing subsequence that **ends at** index `i`.
- Recurrence: look at every earlier `j` with `nums[j] < nums[i]`, and extend the best one.

```python
def length_of_lis(nums):
    dp = [1] * len(nums)                 # each item alone has length 1
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:        # nums[i] can follow nums[j]
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)

print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))   # 4  (2, 3, 7, 18)
```

This is `O(n²)`. Notice that the answer is `max(dp)`, not `dp[-1]`, because the best subsequence can end anywhere. A faster `O(n log n)` version keeps a sorted list `tails` and uses binary search:

```python
from bisect import bisect_left

def length_of_lis_fast(nums):
    tails = []       # tails[k] = smallest end of a subsequence of len k + 1
    for x in nums:
        pos = bisect_left(tails, x)
        if pos == len(tails):
            tails.append(x)          # x extends the longest one
        else:
            tails[pos] = x           # x is a smaller, better ending
    return len(tails)
```

## 2D DP: grid paths

When the subproblem needs two numbers to describe it, the table has two dimensions.

Problem: a robot starts at the top-left of an `m x n` grid and can only move right or down. How many different paths lead to the bottom-right?

- State: `dp[r][c]` = number of paths to cell `(r, c)`.
- Recurrence: `dp[r][c] = dp[r - 1][c] + dp[r][c - 1]` (come from above or from the left).
- Base cases: the first row and first column have exactly 1 path.

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]     # first row and column are 1
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]

print(unique_paths(3, 7))                # 28
```

## 2D DP: longest common subsequence

Problem: find the length of the longest subsequence that appears in both strings. For "ace" and "abcde" the answer is 3 ("ace").

- State: `dp[i][j]` = answer for the first `i` characters of `a` and the first `j` characters of `b`.
- Choices: if the last characters match, use them: `1 + dp[i - 1][j - 1]`. If not, drop one character from one side and take the better result.

```python
def longest_common_subsequence(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # row 0, col 0: empty
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:             # last characters match
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
```

:::example The DP table for a = "ace" and b = "abcde"
```text
          ""   a   b   c   d   e
    ""     0   0   0   0   0   0
    a      0   1   1   1   1   1
    c      0   1   1   2   2   2
    e      0   1   1   2   2   3
```
Read the cell in row "c" and column "c": the characters match, so it is the diagonal neighbour (1) plus 1, which is 2. The answer is the bottom-right cell: 3. Time and space are `O(m * n)`.
:::

The extra row and column of zeros stand for the empty string. They remove all the "what if `i - 1` is negative" checks.

## 2D DP: edit distance

Problem: find the fewest single-character operations (insert, delete or replace) that turn word `a` into word `b`. It has the same table shape as the previous problem, with three choices where before there were two.

```python
def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                     # delete all i characters
    for j in range(n + 1):
        dp[0][j] = j                     # insert all j characters
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]          # nothing to do
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],     # delete
                                   dp[i][j - 1],     # insert
                                   dp[i - 1][j - 1]) # replace
    return dp[m][n]

print(edit_distance("horse", "ros"))     # 3
```

## 0/1 knapsack

Think of packing a bag for a trek. The bag can carry a fixed weight. Each item has a weight and a value, and you either take an item or leave it. You cannot take half an item or take it twice. That is why it is called "0/1". What is the largest total value you can carry?

- State: `dp[w]` = best value with capacity `w`, using the items seen so far.
- Choices for each item: leave it (`dp[w]` stays) or take it (`dp[w - wt] + val`).

```python
def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)            # dp[w] = best value for weight w
    for wt, val in zip(weights, values):
        # go backwards so that each item is used at most once
        for w in range(capacity, wt - 1, -1):
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[capacity]

print(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))   # 9  (weights 3 and 4)
```

:::warn The loop direction decides the meaning
In the 1D knapsack table, looping `w` **backwards** means `dp[w - wt]` still holds the value from before this item, so the item is used at most once (0/1 knapsack). Looping **forwards** means `dp[w - wt]` may already include this item, so the item can be used many times (unbounded knapsack, like coin change). One wrong direction gives a wrong answer with no error message.
:::

Many problems are knapsack in disguise. "Can the array be split into two parts with equal sum?" is the same as "can I pick items that fill a bag of capacity `total / 2` exactly?"

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False                     # an odd total cannot be split
    target = total // 2
    dp = [True] + [False] * target       # dp[s]: can we make the sum s?
    for x in nums:
        for s in range(target, x - 1, -1):   # backwards: use x once
            dp[s] = dp[s] or dp[s - x]
    return dp[target]

print(can_partition([1, 5, 11, 5]))      # True  (11 and 1 + 5 + 5)
```

## Common DP families

| Family | State | Example problems |
|---|---|---|
| 1D line | `dp[i]`: answer for the first i items | Climbing stairs, house robber |
| Ends at i | `dp[i]`: best answer ending at index i | LIS, maximum subarray |
| Knapsack | `dp[w]`: best for capacity or sum w | Coin change, partition sum |
| Two strings | `dp[i][j]`: prefixes of both strings | LCS, edit distance |
| Grid | `dp[r][c]`: answer for cell (r, c) | Unique paths, minimum path sum |

:::interview How do you recognise a DP problem and find the state?
"I look for three signs. The problem asks for a count of ways, a minimum or maximum, or a yes or no answer over many combinations. At each step I make a choice. And the same situation can be reached in different ways, so subproblems repeat. To find the state, I write the brute-force recursion first. The parameters that change between calls, like the current index or the remaining amount, are the state. Then I add a cache to get the top-down solution. If needed I turn it into a table and reduce the space."
:::

:::interview Solve coin change. Why not a greedy approach?
"I define `dp[a]` as the fewest coins to make amount `a`, with `dp[0] = 0`. For each amount from 1 up to the target I try every coin as the last coin: `dp[a] = min(dp[a - c] + 1)`. If the target stays at infinity, I return -1. The time is `O(amount * coins)` and the space is `O(amount)`. Greedy, which always takes the largest coin, fails for coin sets like 1, 3, 4 with amount 6. It gives 4 + 1 + 1, but 3 + 3 is better. DP is safe because it checks every choice for the last coin."
:::

:::interview What is the difference between top-down and bottom-up DP?
"Top-down starts from the full problem and recurses into smaller ones, storing each result in a cache. It only solves the subproblems that are actually needed and it reads like the brute force. Bottom-up starts from the base cases and fills a table with loops until it reaches the answer. It has no recursion overhead and no depth limit, and it often allows a space saving because I can keep only the last row or the last two values. Both have the same time complexity in most problems."
:::

:::revise
- DP needs overlapping subproblems and optimal substructure.
- Five questions: state, choices, recurrence, base cases, order and answer.
- Find the state from the arguments of the brute-force recursion.
- Top-down is recursion plus a cache, bottom-up is a table plus loops.
- 0/1 knapsack loops capacity backwards, unbounded loops it forwards.
- Add an extra row and column for the empty prefix in string DP.
:::

# Greedy algorithms and intervals

*Take the best-looking choice at every step and never look back, when you can show that this is safe.*

## Why it matters

Greedy solutions are short and fast, often just a sort and one loop. The hard part is not the code. The hard part is knowing whether greedy is correct for the problem. Interval problems (meetings, bookings, time ranges) are the most common place where greedy works, and they appear very often in interviews.

## The idea

Imagine you are at a buffet with a small plate and you love sweets. At each counter you take your favourite item on that counter. You never go back to swap. If this simple rule gives the best possible plate, the problem is "greedy friendly".

A **greedy algorithm** builds the answer step by step. At each step it takes the choice that looks best right now, and it never changes an earlier choice. Compare this with DP, which checks every choice and keeps the best.

| | Greedy | Dynamic programming |
|---|---|---|
| At each step | Takes one choice | Tries all choices |
| Speed | Usually `O(n)` or `O(n log n)` | Usually `O(n²)` or `O(n * target)` |
| Correct | Only for some problems | Whenever the recurrence is right |

How do you know greedy is safe? The usual argument is the **exchange argument**: take any best answer that does not start with the greedy choice, and show that you can swap its first choice for the greedy one without making the answer worse. If that swap always works, the greedy choice is safe. In an interview, a short version of this argument plus a failed attempt to find a counterexample is normally enough.

## Jump game

Problem: `nums[i]` is the longest jump you can make from index `i`. Starting at index 0, can you reach the last index?

Greedy idea: you do not need to know **which** jumps you take. You only need the farthest index you can reach so far.

```python
def can_jump(nums):
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False                 # index i cannot be reached
        farthest = max(farthest, i + jump)
    return True

print(can_jump([2, 3, 1, 1, 4]))         # True
print(can_jump([3, 2, 1, 0, 4]))         # False: stuck at index 3
```

:::example Dry run of can_jump([3, 2, 1, 0, 4])

| i | jump | Reachable? | farthest after |
|---|---|---|---|
| 0 | 3 | yes | 3 |
| 1 | 2 | yes | 3 |
| 2 | 1 | yes | 3 |
| 3 | 0 | yes | 3 |
| 4 | 4 | no, 4 > 3 | return False |
:::

## Intervals

An **interval** is a range with a start and an end, like a meeting from 9 to 11. Two intervals **overlap** if one starts before the other ends. Almost every interval problem begins with the same move: **sort the intervals**. After sorting, you only need to compare each interval with the one just before it.

### Merge intervals

Problem: merge all overlapping intervals. Sort by start time. Then each interval either overlaps the last merged one (so extend it) or starts a new one.

```python
def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])           # sort by start time
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:    # overlaps the last one
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])          # a new separate interval
    return merged

print(merge_intervals([[8, 10], [1, 3], [2, 6], [15, 18]]))
# [[1, 6], [8, 10], [15, 18]]
```

:::example Dry run of merge_intervals
After sorting: `[1, 3], [2, 6], [8, 10], [15, 18]`.

| Interval | Compare with last merged | merged after |
|---|---|---|
| [1, 3] | nothing yet | [1, 3] |
| [2, 6] | 2 <= 3, overlap | [1, 6] |
| [8, 10] | 8 > 6, no overlap | [1, 6], [8, 10] |
| [15, 18] | 15 > 10, no overlap | [1, 6], [8, 10], [15, 18] |

Sorting costs `O(n log n)` and the loop costs `O(n)`.
:::

### Keep the most non-overlapping intervals

Problem: remove the fewest intervals so that none of the rest overlap. This is the same as keeping as many as possible, like fitting the most shows into one TV evening.

Greedy idea: always keep the interval that **ends earliest**. It leaves the most room for everything that comes after it. So here we sort by **end** time.

```python
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])           # sort by end time
    kept = 0
    last_end = float("-inf")
    for start, end in intervals:
        if start >= last_end:                    # fits after the last kept
            kept += 1
            last_end = end
    return len(intervals) - kept                 # the number to remove

print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))   # 1
```

Why is "earliest end" safe? Take any best answer. Its first interval ends at the same time as, or later than, the earliest-ending interval. Swap it for the earliest-ending one: nothing after it can now overlap, because we only freed up time. The answer is still valid and has the same size. This is the exchange argument in action.

### Minimum number of meeting rooms

Problem: given meeting times, find the smallest number of rooms so that no two meetings share a room at the same time.

Sort by start time. Keep a min-heap of the end times of meetings that are running. When a new meeting starts, check the meeting that ends earliest. If it has already ended, reuse its room. If not, open a new room.

```python
import heapq

def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])           # sort by start time
    rooms = []                                   # end times of busy rooms
    for start, end in intervals:
        if rooms and rooms[0] <= start:
            heapq.heappop(rooms)                 # that room is free now
        heapq.heappush(rooms, end)               # take a room until `end`
    return len(rooms)

print(min_meeting_rooms([[0, 30], [5, 10], [15, 20]]))   # 2
```

The size of the heap at the end equals the largest number of rooms ever in use at one time. Time is `O(n log n)`.

| Interval problem | Sort by | Then |
|---|---|---|
| Merge overlapping intervals | Start | Extend the last merged interval |
| Can one person attend all meetings? | Start | Check each start against the previous end |
| Keep the most non-overlapping | End | Keep it if it starts after the last kept end |
| Minimum rooms needed | Start | Min-heap of end times |

:::tip
Before coding an interval problem, ask the interviewer: "Do `[1, 2]` and `[2, 3]` count as overlapping?" The answer decides whether you write `<` or `<=`. In the code above, touching intervals are merged by `merge_intervals` but are not treated as a clash in the other two functions.
:::

:::warn Greedy needs a reason
A greedy rule that feels right can be wrong. For "keep the most intervals", choosing the **shortest** interval first or the **earliest start** first both sound sensible, and both fail on small examples. Earliest start fails on `[1, 10], [2, 3], [4, 5]`: it keeps only the long first interval, while the best answer keeps the other two. Always test your rule on a small tricky case, and be ready to explain why the rule is safe. If you cannot, think about DP.
:::

:::interview Merge all overlapping intervals. What is the complexity and why do you sort?
"I sort the intervals by start time. Then I go through them once and keep a result list. If the current interval starts before or at the end of the last interval in the result, they overlap, so I extend that end to the larger of the two ends. Otherwise I append the current interval as a new one. Sorting matters because afterwards any interval that overlaps the current group must come next in the list, so one comparison with the last merged interval is enough. The time is `O(n log n)` for the sort and the space is `O(n)` for the output."
:::

:::interview How do you decide between greedy and dynamic programming?
"I first try to find a simple local rule and test it on small tricky inputs. If I can find a counterexample, greedy is out and I move to DP, where I try every choice at each step and store results. If I cannot break the rule, I try to justify it with an exchange argument: I show that any best answer can be changed to use the greedy choice without getting worse. Sorting-based problems such as interval scheduling often allow greedy. Problems where a choice now changes what is possible later in a complex way, such as coin change with arbitrary coins or 0/1 knapsack, need DP."
:::

:::revise
- Greedy takes the best local choice and never goes back.
- It is correct only when you can argue that the local choice is safe.
- Jump game: track the farthest index you can reach.
- Interval problems almost always start with a sort.
- Merge intervals: sort by start. Keep the most intervals: sort by end.
- Meeting rooms: sort by start and keep a min-heap of end times.
:::

# How to pick the pattern

*A cheat sheet that maps the clues in a problem to the right technique, plus a study plan.*

## Why it matters

In an interview nobody tells you "this is a sliding window problem". The real skill is reading a new problem and recognising which of the patterns from this book fits. The good news is that problems give clues: in the input type, in the words of the question and in the constraints. This chapter collects those clues in one place.

## A method for any new problem

Do not jump into code. Follow the same steps every time, and say them aloud so the interviewer can follow your thinking.

:::flow Six steps in an interview
Understand | repeat the problem, ask questions
Examples | small case and edge cases
Brute force | say it and its Big-O
Optimize | find the pattern
Code | clean, with good names
Test | dry run and state complexity
:::

1. **Understand.** Repeat the problem in your own words. Ask about the input size, empty input, duplicates, negative numbers and whether the input is sorted.
2. **Examples.** Work through one normal example by hand, then one edge case.
3. **Brute force.** Describe the simplest correct solution and its complexity. Do not code it unless asked. It shows that you understand the problem and gives you a base to improve.
4. **Optimize.** Ask: what work does the brute force repeat? Which pattern removes that repeated work? Use the tables below.
5. **Code.** Write clean code and explain while you type.
6. **Test.** Dry run your code on your small example. Then state the time and space complexity.

## Clue to pattern table

| Clue in the problem | Pattern to try first | Chapter |
|---|---|---|
| "Have I seen it?", count, group, find a pair | Hash set or dict | 3 |
| Sum of a range, many range questions | Prefix sums | 2 |
| Sorted array, pair or triplet with a sum | Two pointers | 4 |
| Longest or shortest subarray or substring | Sliding window | 4 |
| Sorted input, or "minimum value that works" | Binary search | 5 |
| Reverse, middle, cycle in a linked list | Fast and slow pointers, dummy node | 6 |
| Brackets, nesting, undo, "most recent" | Stack | 7 |
| Next greater or next smaller item | Monotonic stack | 7 |
| All subsets, orderings, combinations | Backtracking | 8 |
| Tree height, path, subtree answer | DFS with recursion | 9 |
| Tree level by level, nearest node | BFS with a queue | 9 |
| Top k, k-th largest, running median | Heap | 10 |
| Grid, islands, connected groups | Graph DFS or BFS | 11 |
| Fewest steps, every move costs the same | BFS | 11 |
| Tasks with prerequisites | Topological sort | 12 |
| Cheapest path with different edge costs | Dijkstra | 12 |
| Groups that merge over time | Union-find | 12 |
| Count the ways, best value over many choices | Dynamic programming | 13 |
| Meetings, ranges, schedules | Sort, then greedy | 14 |

## Clues from the input type

| Input | Think about |
|---|---|
| Unsorted array | Hashing first. Would sorting help? |
| Sorted array | Binary search or two pointers |
| String | Sliding window, frequency map, two pointers, string DP |
| Linked list | Dummy node, fast and slow pointers |
| Binary tree | DFS for most questions, BFS for levels |
| Grid | BFS or DFS on cells, or 2D DP if you only move right and down |
| List of pairs (edges) | Build a graph, then pick a graph tool |
| List of ranges | Sort by start or end |

## Clues from the question words

| The question asks for | Think about |
|---|---|
| "All possible ..." or "generate every ..." | Backtracking |
| "How many ways ..." | DP (or maths) |
| "Minimum" or "maximum" over choices | DP or greedy, sometimes binary search on the answer |
| "Shortest path" | BFS (equal costs) or Dijkstra (weights) |
| "k largest", "k closest", "k most frequent" | Heap of size k |
| "Is it possible to ..." | DFS or BFS for reachability, DP for combinations |
| "In place" or "`O(1)` extra space" | Two pointers, swaps, reversal |

Remember the constraint table from the first chapter as well. If `n` is up to 20, exponential backtracking is expected. If `n` is around a million, you need `O(n)` or `O(n log n)`.

## Data structure cheat sheet

| Structure | Strength | Key costs |
|---|---|---|
| List (array) | Index access, append at the end | Read `O(1)`, insert in the middle `O(n)` |
| Dict and set | Find, count, group | `O(1)` average |
| Deque | Add and remove at both ends | `O(1)` |
| Heap | Smallest or largest item quickly | Push and pop `O(log n)`, peek `O(1)` |
| Linked list | Insert and delete at a known node | `O(1)`, but search is `O(n)` |
| Balanced BST | Sorted order with fast updates | `O(log n)` |
| Union-find | Merge groups, check connection | almost `O(1)` |

## Algorithm cost cheat sheet

| Algorithm | Time | Extra space |
|---|---|---|
| Binary search | `O(log n)` | `O(1)` |
| Sorting (Python `sort`) | `O(n log n)` | up to `O(n)` |
| Two pointers, sliding window | `O(n)` | `O(1)` or window size |
| Tree or graph DFS and BFS | `O(V + E)` | `O(V)` |
| Topological sort | `O(V + E)` | `O(V)` |
| Dijkstra with a heap | `O((V + E) log V)` | `O(V + E)` |
| Subsets, permutations | `O(n * 2^n)`, `O(n * n!)` | `O(n)` plus output |
| DP | states times choices per state | number of states |

## When you are stuck

Getting stuck is normal. What matters is having a list of things to try.

- Solve a smaller example by hand and watch what **you** do. Your brain often uses the right pattern without naming it.
- Ask: "Would it be easier if the input were sorted?" Sorting costs only `O(n log n)`.
- Ask: "What does my brute force compute again and again?" Then store it in a dict, a prefix array or a DP table.
- Try a different data structure for the same idea: a heap in place of repeated sorting, a set in place of a list.
- Think backwards from the complexity you need. If you need `O(n log n)`, then sorting, a heap or binary search is probably involved.

:::warn Do not memorize solutions
Memorizing the code of hundreds of problems does not work. A small change in the question and the memorized answer no longer fits. Learn the **pattern** and the reason it works, then practise recognising it in new problems. If you needed the solution for a problem, come back after a few days and solve it again without looking. Being able to solve it again later is the real test.
:::

## An 8-week study plan

This plan assumes about one to two hours a day. If you have less time, stretch each week to two. The order follows this book, because later topics use earlier ones.

| Week | Topics | Goal by the end of the week |
|---|---|---|
| 1 | Big-O, arrays and strings, hashing | State the complexity of any loop, use dict and set without thinking |
| 2 | Two pointers, sliding window, binary search | Write the window and binary search templates from memory |
| 3 | Linked lists, stacks and queues | Reverse a list and use a monotonic stack |
| 4 | Recursion, backtracking, trees | Write DFS, BFS and the backtracking template |
| 5 | Heaps, graphs with BFS and DFS | Solve top-k and grid problems |
| 6 | Topological sort, Dijkstra, union-find, greedy | Choose the right graph tool, solve interval problems |
| 7 | Dynamic programming | Answer the five questions for a new DP problem |
| 8 | Mixed revision and mock interviews | Solve unseen problems with a timer, speaking aloud |

How to use each week:

- Read the chapter and type every code example yourself. Do not copy and paste.
- Solve practice problems on the topic, starting with easy ones. A few problems that you fully understand are worth more than many that you only half follow.
- Set a time limit for each problem. If you are stuck after a fair attempt, read a hint or a solution, understand it, close it, and write the code on your own.
- Keep a small notebook. For every problem write one line: the clue and the pattern. Read it before interviews.
- Once a week, solve again two or three old problems that gave you trouble.

:::tip Talk while you solve
In an interview, silence is your enemy. The interviewer cannot give credit for thoughts they cannot hear. Practise speaking while you solve, even when you are alone: "The brute force is two loops, that is `O(n²)`. The inner loop is searching for a value, so a dict could make it `O(n)`." This habit also helps the interviewer give you a hint at the right moment.
:::

:::interview You are given a problem you have never seen. How do you approach it?
"First I make sure I understand it. I repeat the problem, ask about input size and edge cases, and work through a small example by hand. Then I describe a brute-force solution and its complexity, so we have a correct starting point. Next I look for the repeated work in the brute force and for clues: is the input sorted, is it asking for a subarray, a top k, a shortest path, a count of ways? That points me to a pattern such as hashing, two pointers, a heap, BFS or DP. I explain the plan before I code, write clean code while talking, and then dry run it on my example and on an edge case. I finish by stating the time and space complexity and any trade-offs."
:::

:::interview Your solution works but the interviewer asks, "Can you do better?" What do you do?
"I first state the current time and space complexity, then look for the bottleneck, which is the slowest part. I ask whether that part repeats work that I could store, whether a better data structure would make one operation cheaper, for example a set for lookups or a heap for the minimum, and whether sorting or binary search could remove a loop. I also consider trading memory for speed, or the reverse if memory is the concern. If I believe the solution is already optimal, I say why, for example that every element must be read at least once, so `O(n)` is a lower limit."
:::

:::revise
- Follow six steps: understand, examples, brute force, optimize, code, test.
- Look for clues in the input type, the question words and the constraints.
- Find what the brute force repeats, then pick the pattern that removes it.
- Sorted input suggests binary search or two pointers. "Top k" suggests a heap.
- "Count the ways" or "best over many choices" suggests DP.
- Learn patterns, not solutions, and solve hard problems again after a few days.
:::
