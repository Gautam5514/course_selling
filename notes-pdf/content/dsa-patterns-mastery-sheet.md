---
title: DSA Mastery & Algorithm Patterns Cheatsheet
subtitle: Learn to recognise the pattern behind a coding problem, then solve it with a tested Python template and a clear dry run.
category: DSA
level: All Levels
accent: amber
tags: dsa, algorithms, dynamic-programming, graphs, patterns
highlights: Pattern Recognition | Reusable Templates | Step-by-Step Dry Runs | Graphs & DP | Master Cheat Sheet | Study Plan
tagline: Recognise the Pattern • Reuse the Template • Dry Run It • Graphs & DP
description: A pattern-first handbook for coding interviews. Each chapter covers one pattern family: the clues that tell you when to use it, a reusable Python template that was run and tested, and worked problems with step-by-step dry runs. It ends with a one-page master cheat sheet, a list of well-known classic problems to practise for each pattern, and a study plan.
---

# How to read a problem and pick a pattern

*Before you write code, read the clues: the constraints tell you how fast you must be, and the words tell you which pattern fits.*

## Why it matters

Think of a doctor. A good doctor does not try medicines one by one. The doctor listens to the symptoms, matches them to a known illness, and then uses the known treatment. Coding problems work the same way. The problem statement gives **symptoms** (clues). The **pattern** is the known illness. The **template** is the treatment.

A **pattern** is a way of solving that works for a whole family of problems. "Sliding window" is a pattern. "Longest substring without repeating characters" is only one problem that uses it. If you learn the pattern, you can solve problems you have never seen.

This book has one job: for every common pattern it teaches you **how to recognise it**, gives you **one template** you can reuse, and shows **dry runs** so you can see the template move. A **dry run** means running the code by hand on a small input, one step at a time, and writing down the values of the variables.

:::flow What to do with any new problem
Read | input, output, constraints
Brute force | simplest correct idea
Find the waste | what work is repeated?
Pick a pattern | use the clue tables
Template | adapt, then dry run
:::

## Step 1: let the constraints tell you the speed

Every problem tells you how big the input can be, for example `1 <= n <= 100000`. These lines are called **constraints**. Most students skip them. Do not. They tell you which time complexity will pass, and that removes half of the wrong ideas before you start.

**Time complexity** (written with Big-O, like `O(n)`) says how the number of steps grows when the input grows. As a rough rule of thumb, a program can do some tens of millions of simple steps in about a second. Python is slower than C++ or Java, so stay well below that when you can. So take the biggest `n`, put it into your Big-O, and see how many steps you get.

| Largest n | Complexity that works | Patterns that give it |
|---|---|---|
| up to about 10 | `O(n!)` | Permutations with backtracking |
| up to about 20 | `O(2^n)` | Subsets, backtracking, bitmasks |
| up to about 500 | `O(n³)` | Three loops, some interval DP |
| up to about 5,000 | `O(n²)` | Two loops, 2D DP on two strings |
| up to about 100,000 | `O(n log n)` | Sorting, heap, binary search |
| up to about 1,000,000 | `O(n)` | Two pointers, window, hashing |
| 1,000,000,000 or more | `O(log n)` or `O(1)` | Binary search, maths |

:::example Reading constraints
A problem says: "`n` is up to 100,000. Find the number of pairs with a given difference."

- Brute force checks every pair: `n²` = 10,000,000,000 steps. Far too slow.
- So two loops are not allowed. We need `O(n log n)` or `O(n)`.
- That points to sorting with two pointers, or to a hash map.

We have not solved anything yet, but we already know which ideas to drop.
:::

:::tip A small n is also a clue
If `n` is 20 or less, the problem setter is telling you that trying **every combination** is fine. Do not hunt for a clever `O(n)` trick. Think backtracking or bitmasks.
:::

Constraints give other clues too:

| Constraint | What it tells you |
|---|---|
| Values can be negative | A sum-based sliding window will not work. Think prefix sums. |
| Values are only 0 to 26 or lowercase letters | A count array of fixed size works, so space is `O(1)` |
| "The array is sorted" | Binary search or two pointers |
| "Do it in place" or "`O(1)` extra space" | Two pointers, swaps, or reversing |
| Edge weights are all equal | BFS is enough. Different weights need Dijkstra. |

## Step 2: listen to the signal words

Problem statements repeat the same phrases. Each phrase points to a pattern. This is the most important table in the book. The chapter number tells you where the template lives.

**Arrays and strings**

| Signal words in the problem | Pattern | Chapter |
|---|---|---|
| "pair", "triplet", sorted input, "palindrome" | Two pointers | 2 |
| "cycle", "middle of the list", "duplicate in 1..n" | Fast and slow pointers | 2 |
| "longest/shortest substring or subarray with ..." | Sliding window | 3 |
| "window of size k", "every k consecutive" | Fixed sliding window | 3 |
| "subarray sum equals k", "range sum" | Prefix sum with a hash map | 4 |
| "have we seen it", "count", "group", "first unique" | Hash map or set | 4 |
| sorted, "find position", "rotated sorted array" | Binary search on index | 5 |
| "minimum speed/capacity/days so that ..." | Binary search on the answer | 5 |
| "valid brackets", "undo", "nested", "evaluate" | Stack | 6 |
| "next greater", "next smaller", "span" | Monotonic stack | 6 |
| "maximum of each window" | Monotonic queue | 6 |

**Lists, trees, heaps, intervals and backtracking**

| Signal words in the problem | Pattern | Chapter |
|---|---|---|
| "reverse the list", "remove the n-th node" | Linked list tricks | 7 |
| "depth", "path", "subtree", "ancestor" | Tree DFS | 8 |
| "level by level", "right side view" | Tree BFS | 8 |
| "k largest", "k closest", "k most frequent" | Heap of size k | 9 |
| "merge k sorted", "median of a stream" | K-way merge, two heaps | 9 |
| "meetings", "overlap", "merge ranges" | Intervals, sort first | 10 |
| "all subsets", "all permutations", "generate every" | Backtracking | 11 |

**Graphs, dynamic programming and bits**

| Signal words in the problem | Pattern | Chapter |
|---|---|---|
| "islands", "connected", "fewest moves in a grid" | Graph BFS or DFS | 12 |
| "prerequisites", "order of tasks", "depends on" | Topological sort | 13 |
| "cheapest route", "weighted", "minimum time" | Dijkstra | 13 |
| "groups merge", "are they connected?" | Union-find | 13 |
| "how many ways", "minimum cost", "can we reach" | Dynamic programming | 14, 15 |
| "two strings", "subsequence", "edit" | 2D dynamic programming | 15 |
| "appears once", "power of two", "without extra space" | Bit manipulation | 16 |

## Step 3: ask what the brute force repeats

A **brute force** is the simplest correct solution, usually with nested loops. Always think of it first. Then ask one question: **what work is it doing again and again?** The answer names the pattern.

| The brute force repeats this | Replace it with |
|---|---|
| Searching the array for a value | A hash set or hash map lookup |
| Adding up the same range again | A prefix sum, or a sliding window |
| Checking pairs in a sorted array | Two pointers |
| Trying every possible answer value | Binary search on the answer |
| Looking back for a bigger or smaller item | A monotonic stack |
| Finding the smallest item again and again | A heap |
| Solving the same subproblem in recursion | Dynamic programming (a cache) |

Here is the idea on the most famous problem of all. Problem: return the indexes of two numbers that add up to `target`.

```python
def two_sum_brute(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):          # search for the partner
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

The inner loop is only a **search** for the partner value. A hash map does that search in one step.

```python
def two_sum(nums, target):
    seen = {}                              # value -> its index
    for i, x in enumerate(nums):
        need = target - x                  # the partner we are looking for
        if need in seen:                   # O(1) lookup replaces the loop
            return [seen[need], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9))          # [0, 1]
```

A hash map answers "have I seen this value?" in `O(1)`. So the time drops from `O(n²)` to `O(n)`, and we pay `O(n)` extra space for the map.

:::example Dry run of two_sum([3, 8, 5, 4], 9)

| i | x | need = 9 - x | need in seen? | seen after this step |
|---|---|---|---|---|
| 0 | 3 | 6 | no | {3: 0} |
| 1 | 8 | 1 | no | {3: 0, 8: 1} |
| 2 | 5 | 4 | no | {3: 0, 8: 1, 5: 2} |
| 3 | 4 | 5 | yes, at index 2 | stop |

The answer is `[2, 3]`. Each number was looked at only once.
:::

## Worked examples of picking a pattern

:::example Problem A: the conveyor belt
"Packages with given weights must be shipped in order within `d` days. Find the smallest ship capacity that makes this possible."

1. **Signal words:** "smallest ... that makes it possible". We are asked for a number, not for a position.
2. **Key check:** if capacity 15 works, then 16, 17 and every bigger capacity also work. The answers look like `no, no, no, yes, yes, yes`.
3. When the answers switch from "no" to "yes" only once, we can **binary search on the answer** and test each guess with a simple loop.

Pattern: binary search on the answer (Chapter 5).
:::

:::example Problem B: counting subarrays
"Count the subarrays whose sum is exactly `k`. Numbers can be negative."

1. **Signal words:** "subarray" and "sum". The first thought is sliding window.
2. **Constraint clue:** negative numbers. Adding an item may make the sum smaller, so we cannot know when to shrink. The window idea breaks.
3. A subarray sum is the difference of two prefix sums. So we store prefix sums in a hash map.

Pattern: prefix sum with a hash map (Chapter 4).
:::

:::warn Do not pick a pattern from one word
The word "subarray" does not always mean sliding window, and "minimum" does not always mean DP. Problem B shows this. Always check the **condition** that makes a pattern work: sliding window needs a one-way rule, binary search needs a "no then yes" order, greedy needs a proof or at least a tested example. Use the signal words to get a first guess, then check the guess on a small input.
:::

## When two patterns fit

Many problems can be solved in more than one way. Use this order to decide.

1. Pick the one that meets the constraints.
2. If both do, pick the one with less extra space.
3. If still equal, pick the one you can code without bugs. In an interview, simple and correct beats clever and broken.

| Choice | Pick the first when | Pick the second when |
|---|---|---|
| Hash map or sort + two pointers | Input order matters, need indexes | Need `O(1)` space, or need all unique pairs |
| BFS or DFS | Fewest steps, level by level | Any path, counting groups, recursion is natural |
| Greedy or DP | A local best choice is provably safe | Choices affect later choices |
| Heap or full sort | Only the top k is needed, or data keeps arriving | Everything is needed in order |
| Top-down or bottom-up DP | You are thinking in recursion | You need to save space or avoid deep recursion |

:::interview How do you decide which algorithm or pattern to use for a new problem?
"I start with the constraints, because the input size tells me the time complexity I need. For example, `n` up to 100,000 rules out two nested loops. Then I look at the input type and the signal words: sorted input suggests binary search or two pointers, 'longest subarray' suggests a sliding window, 'k largest' suggests a heap, 'how many ways' suggests dynamic programming. I describe the brute force and ask what work it repeats, because the pattern is usually the tool that removes that repeated work. Before I code, I check the condition the pattern needs on a small example, and I say the expected time and space complexity."
:::

:::revise
- Read the constraints first: the largest `n` tells you the complexity you need.
- `n` up to 20 allows `O(2^n)`. `n` up to 100,000 needs `O(n log n)` or better.
- Signal words give a first guess: "longest subarray" is a window, "k largest" is a heap.
- Ask what the brute force repeats, then pick the tool that removes it.
- Check the condition of the pattern before you trust it: one word is not proof.
- Negative numbers break a sum window. Use prefix sums with a hash map.
:::

# Two pointers

*Two indexes that move in a planned way, so one pass does the work of two nested loops.*

## Why it matters

Imagine a long row of books sorted by price. You want two books that cost exactly 500 rupees together. You could pick each book and compare it with every other book. That is slow. A smarter way: put one finger on the cheapest book and one on the costliest. If the total is too high, move the right finger to a cheaper book. If it is too low, move the left finger to a costlier book. You walk the row only once.

That is the **two pointers** pattern. A **pointer** here is just an index variable such as `left` or `right`. It has three common shapes:

| Shape | How the pointers move | Typical use |
|---|---|---|
| Opposite ends | One from the left, one from the right, towards each other | Pairs in sorted data, palindromes |
| Same direction | A slow "write" pointer and a fast "read" pointer | Remove or move items in place |
| Fast and slow | One moves 1 step, the other 2 steps | Middle of a list, cycle detection |

## How to recognise it

- The array or string is **sorted**, or sorting it does not hurt.
- You need a **pair or triplet** that meets a condition.
- You compare the **two ends**: palindrome, reverse, container, trapping water.
- You must change the array **in place** with `O(1)` extra space.
- A linked list or a number sequence may **loop back** on itself.

## Template 1: opposite ends

```python
def pair_with_sum(nums, target):      # nums must be sorted
    left, right = 0, len(nums) - 1
    while left < right:               # stop when the pointers meet
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1                 # need more: take a bigger number
        else:
            right -= 1                # need less: take a smaller number
    return []

print(pair_with_sum([1, 3, 4, 6, 8, 11], 10))   # [2, 3]  (4 + 6)
```

Time is `O(n)` because every step moves one pointer and they can move at most `n` times in total. Extra space is `O(1)`.

**Why is it safe to throw a number away?** Suppose the total is too small. `nums[right]` is the biggest partner still available. If even the biggest partner is not enough for `nums[left]`, then no partner will be. So `nums[left]` can never be in the answer and `left += 1` loses nothing. The same logic works for the other side.

:::example Dry run of pair_with_sum([1, 3, 4, 6, 8, 11], 10)

| left | right | total | Decision |
|---|---|---|---|
| 0 (1) | 5 (11) | 12 | too big, move `right` |
| 0 (1) | 4 (8) | 9 | too small, move `left` |
| 1 (3) | 4 (8) | 11 | too big, move `right` |
| 1 (3) | 3 (6) | 9 | too small, move `left` |
| 2 (4) | 3 (6) | 10 | found, return `[2, 3]` |

Five steps for six numbers. The brute force would check up to 15 pairs.
:::

### Worked problem: container with most water

Problem: `height[i]` is the height of a wall at position `i`. Pick two walls. The water they hold is `width * shorter wall`. Find the most water.

Start with the widest container. To do better with a smaller width, we need a taller short wall. So we always move the pointer at the **shorter** wall. Moving the taller wall can never help, because the shorter wall still limits the water and the width only gets smaller.

```python
def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        water = width * min(height[left], height[right])
        best = max(best, water)
        if height[left] < height[right]:
            left += 1                 # the short wall is the limit
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))    # 49
```

:::example Dry run of max_area([1, 8, 6, 2, 5, 4, 8, 3, 7])

| left | right | Walls | Water | Move |
|---|---|---|---|---|
| 0 | 8 | 1 and 7 | 8 x 1 = 8 | left (1 is shorter) |
| 1 | 8 | 8 and 7 | 7 x 7 = 49 | right (7 is shorter) |
| 1 | 7 | 8 and 3 | 6 x 3 = 18 | right |
| 1 | 6 | 8 and 8 | 5 x 8 = 40 | right (equal, either is fine) |
| 1 | 5 | 8 and 4 | 4 x 4 = 16 | right |

The best so far is 49, found at step 2. The remaining steps also move `right` and never beat 49. Time `O(n)`, space `O(1)`.
:::

## Template 2: same direction (read and write)

Think of packing a bag. One hand (`read`) picks up every item in order. The other hand (`write`) points to the next free place for an item you want to keep. Everything to the left of `write` is already correct.

Problem: move all zeros to the end and keep the order of the other numbers. Do it in place.

```python
def move_zeroes(nums):
    write = 0                         # next place for a non-zero number
    for read in range(len(nums)):
        if nums[read] != 0:           # this is an item we keep
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums

print(move_zeroes([0, 1, 0, 3, 12]))  # [1, 3, 12, 0, 0]
```

:::example Dry run of move_zeroes([0, 1, 0, 3, 12])

| read | nums[read] | Action | Array after | write |
|---|---|---|---|---|
| 0 | 0 | skip | [0, 1, 0, 3, 12] | 0 |
| 1 | 1 | swap with index 0 | [1, 0, 0, 3, 12] | 1 |
| 2 | 0 | skip | [1, 0, 0, 3, 12] | 1 |
| 3 | 3 | swap with index 1 | [1, 3, 0, 0, 12] | 2 |
| 4 | 12 | swap with index 2 | [1, 3, 12, 0, 0] | 3 |

Time `O(n)`, space `O(1)`. The same template solves "remove duplicates from a sorted array" and "remove all copies of a value": only the `if` condition changes.
:::

:::warn Wrong loop condition
For opposite-end pointers use `while left < right` when the two pointers must be on **different** items (a pair). Use `while left <= right` when a single middle item still needs to be handled (as in binary search). Mixing these up gives answers that use the same item twice, or miss the last item. Test your loop on an array of size 1 and size 2.
:::

## Template 3: fast and slow pointers

Two runners start together on a track. One runs twice as fast as the other. If the track is a straight road, the fast runner reaches the end and they never meet again. If the track is a **circle**, the fast runner comes around and catches the slow runner from behind. So "do they meet?" answers "is there a cycle?". This is called **Floyd's cycle detection**.

A **linked list** is a chain of nodes where each node stores a value and a link (`next`) to the following node. A **cycle** means some node's `next` points back to an earlier node, so walking the list never ends.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:         # fast needs two valid steps
        slow = slow.next              # 1 step
        fast = fast.next.next         # 2 steps
        if slow is fast:              # same node, not just same value
            return True
    return False                      # fast fell off the end: no cycle
```

The same two pointers find the **middle** of a list: when `fast` reaches the end, `slow` has covered half the distance.

```python
def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow                       # fast is at the end, slow is half way
```

Both run in `O(n)` time and `O(1)` space. A hash set of visited nodes also finds a cycle, but it costs `O(n)` space.

### Worked problem: where does the cycle start?

After the two pointers meet, put one pointer back at the head. Move both **one step at a time**. The node where they meet again is the start of the cycle.

```python
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:              # phase 1: they met inside the cycle
            p = head
            while p is not slow:      # phase 2: walk at the same speed
                p = p.next
                slow = slow.next
            return p
    return None
```

Why does it work? Say the head is `a` steps before the cycle start, and the meeting point is `b` steps into the cycle. Slow walked `a + b`. Fast walked twice that, `2(a + b)`, and the extra `a + b` steps were full laps of the cycle. So `a + b` is a multiple of the cycle length. A pointer that is `b` steps into the cycle and walks `a` more steps has walked `a + b` from the cycle start, which lands exactly on the cycle start. A pointer from the head also reaches it in `a` steps. So they meet there.

:::example Dry run of cycle_start
The list is `1 -> 2 -> 3 -> 4 -> 5` and node 5 links back to node 3.

| Step | slow | fast | Note |
|---|---|---|---|
| start | 1 | 1 | |
| 1 | 2 | 3 | |
| 2 | 3 | 5 | |
| 3 | 4 | 4 | fast went 5 -> 3 -> 4. They meet. |

Phase 2: `p` starts at node 1 and `slow` stays at node 4.

| Step | p | slow |
|---|---|---|
| 1 | 2 | 5 |
| 2 | 3 | 3 |

They meet at node 3. That is the start of the cycle.
:::

## Extensions you should know

| Problem type | Idea |
|---|---|
| Three numbers with a given sum | Sort, fix one number with a loop, two pointers on the rest: `O(n²)` |
| Is this string a palindrome? | Opposite ends, compare and move inwards |
| Remove the n-th node from the end | Two pointers with a fixed gap of `n` (Chapter 7) |
| Merge two sorted arrays | One pointer in each array, take the smaller item |
| Is `s` a subsequence of `t`? | One pointer in each string, move the `s` pointer only on a match |
| Sort an array of only 0s, 1s and 2s in one pass | Three pointers `low`, `mid`, `high` (the Dutch national flag problem) |
| Does a number process loop forever? (happy number) | Fast and slow on the values: any "next value from current value" rule acts like a linked list |

:::interview Why does the two-pointer method work only on sorted data for the pair-sum problem? What if the array is not sorted?
"The method depends on knowing which way to move. In a sorted array, moving `left` forward can only increase the sum and moving `right` back can only decrease it. That lets me throw away one number at every step and be sure it cannot be part of an answer. In an unsorted array I do not have that guarantee, so moving a pointer could skip the correct pair. If the array is not sorted I have two choices. I can sort it first, which costs `O(n log n)` and loses the original indexes. Or I can use a hash map, which is `O(n)` time and `O(n)` space and keeps the indexes. If the problem asks for indexes I use the hash map. If it asks for values, or for all unique pairs or triplets, sorting with two pointers is cleaner."
:::

:::revise
- Opposite ends: sorted data or compare-the-ends tasks. Move the pointer that can improve the answer.
- Same direction: `write` marks the next free place, `read` scans. In place, `O(1)` space.
- Fast and slow: 1 step and 2 steps. If they meet, there is a cycle.
- Cycle start: after the meeting, restart one pointer at the head and move both by 1.
- Every pointer only moves forward, so the total time is `O(n)`.
- Check your loop condition on arrays of size 1 and 2.
:::

# Sliding window

*Keep a moving range over the array, add what enters, remove what leaves, and never recount from zero.*

## Why it matters

Sit in a train and look out of the window. You see a few houses at a time. When the train moves a little, one new house comes into view and one old house goes out. You do not need to look at the whole city again. Only two things changed.

A **window** is a continuous part of an array or string, from index `left` to index `right`. The brute force looks at every possible window and recounts it from zero, which is `O(n²)` or worse. The **sliding window** pattern updates the previous result when one item enters and one item leaves. That makes it `O(n)`.

A **subarray** (or **substring** for text) is a continuous piece: the items must sit next to each other. Do not mix it up with a **subsequence**, which may skip items. Sliding window is only for continuous pieces.

## How to recognise it

- The problem talks about a **subarray** or **substring** (continuous).
- It asks for the **longest**, **shortest**, **maximum**, **minimum** or the **count** of such pieces.
- There is a rule about the window: "sum at most k", "at most k distinct characters", "no repeats", "contains all letters of t".
- Or the size is given: "every window of size k".
- **One-way rule:** growing the window pushes the rule in one direction only, and shrinking pushes it back. If numbers can be negative and the rule is about the sum, this fails.

| What the problem gives | Window type |
|---|---|
| A fixed length `k` | Fixed window |
| A rule, and asks for the longest piece | Variable window, shrink while **invalid** |
| A rule, and asks for the shortest piece | Variable window, shrink while **valid** |
| A rule, and asks how many pieces | Variable window, add `right - left + 1` each step |

## Template 1: fixed window

```text
for right in range(n):
    add nums[right] to the window
    if right >= k:
        remove nums[right - k] from the window     # it just left
    if right >= k - 1:
        the window [right - k + 1, right] is full: use it
```

### Worked problem: find all anagrams in a string

Two words are **anagrams** when they use the same letters the same number of times, like "listen" and "silent". Problem: return every start index in `s` where an anagram of `p` begins.

Every anagram of `p` has the same length as `p`. So the window size is fixed. Inside the window we keep a count of each letter and compare it with the count of `p`.

```python
from collections import Counter

def find_anagrams(s, p):
    k = len(p)
    need = Counter(p)                 # letter counts we want
    window = Counter()                # letter counts inside the window
    res = []
    for right, ch in enumerate(s):
        window[ch] += 1               # one letter enters
        if right >= k:
            old = s[right - k]        # one letter leaves
            window[old] -= 1
            if window[old] == 0:
                del window[old]       # keep the dict clean for ==
        if window == need:
            res.append(right - k + 1) # start index of this window
    return res

print(find_anagrams("cbaebabacd", "abc"))   # [0, 6]
```

`Counter` is a dict that counts things. A missing key reads as 0. Time is `O(n)`: comparing two counters costs at most 26 steps for lowercase letters, which is a constant. Space is `O(1)` for the same reason.

:::example Dry run of find_anagrams("cbaebabacd", "abc")

| right | Enters | Leaves | Window | Equal to need? |
|---|---|---|---|---|
| 2 | a | none | cba | yes, record 0 |
| 3 | e | c | bae | no |
| 4 | b | b | aeb | no |
| 5 | a | a | eba | no |
| 6 | b | e | bab | no |
| 7 | a | b | aba | no |
| 8 | c | a | bac | yes, record 6 |
| 9 | d | b | acd | no |

The answer is `[0, 6]`. For `right` 0 and 1 the window is not yet full, so nothing can match.
:::

## Template 2: variable window (expand and shrink)

This is the template to remember. `right` expands the window in the `for` loop. `left` shrinks it in the `while` loop.

```text
left = 0
for right in range(n):
    add nums[right] to the window            # expand
    while the window breaks the rule:
        remove nums[left] from the window    # shrink
        left += 1
    answer = max(answer, right - left + 1)   # window is valid here
```

:::flow One round of the variable window
Expand | right moves 1 step
Check | is the rule broken?
Shrink | move left until valid
Record | update the answer
:::

### Worked problem: longest run of 1s with at most k flips

Problem: `nums` has only 0s and 1s. You may flip at most `k` zeros to ones. Find the longest run of 1s you can get.

Say it another way: find the longest window that contains **at most k zeros**. That is a window rule.

```python
def longest_ones(nums, k):
    left = zeros = best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1                # expand: a zero entered
        while zeros > k:              # rule broken: too many zeros
            if nums[left] == 0:
                zeros -= 1
            left += 1                 # shrink from the left
        best = max(best, right - left + 1)
    return best

print(longest_ones([1, 1, 0, 0, 1, 1, 1, 0, 1, 1], 2))   # 7
```

:::example Dry run of longest_ones([1, 1, 0, 0, 1, 1, 1, 0, 1, 1], 2)

| right | zeros | left | Window size | best |
|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 1 |
| 2 | 1 | 0 | 3 | 3 |
| 3 | 2 | 0 | 4 | 4 |
| 6 | 2 | 0 | 7 | 7 |
| 7 | 3, then 2 | 3 | 5 | 7 |
| 9 | 2 | 3 | 7 | 7 |

Only the interesting rows are shown. At `right = 7` a third zero enters. `left` moves past index 2 (the first zero), so `zeros` is 2 again and `left` is 3. The answer is 7: indexes 0 to 6, with the zeros at 2 and 3 flipped.
:::

Time is `O(n)` and space is `O(1)`.

### Worked problem: longest substring without repeating characters

Here the rule is "no letter appears twice". A faster trick than shrinking one step at a time: remember the **last index** of every letter, and jump `left` directly past the earlier copy.

```python
def longest_unique(s):
    last = {}                         # letter -> last index where we saw it
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1       # jump past the earlier copy
        last[ch] = right
        best = max(best, right - left + 1)
    return best

print(longest_unique("abcabcbb"), longest_unique("abba"))   # 3 2
```

:::warn The left pointer must never move backwards
Look at the check `last[ch] >= left`. Without it, the string `"abba"` gives a wrong answer. At the second `a` (index 3), `last["a"]` is 0, but `left` is already 2. Setting `left = 1` would move the window **backwards** and bring the repeated `b` back in. An old copy that is already outside the window must be ignored. In every sliding window, `left` only moves forward.
:::

## Template 3: shortest window (shrink while valid)

For "shortest" or "minimum" questions the logic flips. We shrink while the window is **valid**, and we record the answer **inside** the `while` loop, because each shrink step gives a smaller valid window.

### Worked problem: minimum window substring

Problem: find the shortest part of `s` that contains every letter of `t` (with repeats). This is a well-known hard problem, but it is only the template with a smart counter.

`need[ch]` says how many more copies of `ch` the window still needs. It may go negative, which means the window has extra copies. `missing` is the total number of letters still needed. When `missing` is 0 the window is valid.

```python
from collections import Counter

def min_window(s, t):
    need = Counter(t)                 # letters still needed
    missing = len(t)                  # how many letters in total
    left = 0
    best = (float("inf"), 0, 0)       # (length, start, end)
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1              # ch was really needed
        need[ch] -= 1                 # may go negative: an extra copy
        while missing == 0:           # valid: try to make it shorter
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            need[s[left]] += 1        # give back the left letter
            if need[s[left]] > 0:
                missing += 1          # now we miss it: window invalid
            left += 1
    size, i, j = best
    return "" if size == float("inf") else s[i:j + 1]

print(min_window("ADOBECODEBANC", "ABC"))   # BANC
```

:::example Dry run of min_window("ADOBECODEBANC", "ABC")
The window first becomes valid at `right = 5`.

| right | Valid windows found while shrinking | Best so far |
|---|---|---|
| 5 | ADOBEC (0 to 5). Removing A makes it invalid. | ADOBEC, length 6 |
| 10 | DOBECODEBA, OBECODEBA, BECODEBA, ECODEBA, CODEBA | ADOBEC, length 6 |
| 12 | ODEBANC, DEBANC, EBANC, BANC | BANC, length 4 |

At `right = 10` the letter A comes back, and we can shrink five times until C leaves. The shortest of those, CODEBA, has length 6, which does not beat the best. At `right = 12` the letter C enters and we shrink down to BANC. The answer is `"BANC"`.
:::

Time is `O(n + m)` for lengths `n` and `m`: each index enters once and leaves at most once. Space is `O(1)` for a fixed alphabet.

:::tip Counting windows
To **count** the valid subarrays, add `right - left + 1` after the `while` loop. If the window `[left, right]` is valid, that is the number of valid subarrays that end at `right`. For "exactly k distinct values" the rule is not one-way, so use `exactly(k) = at_most(k) - at_most(k - 1)` and run the counting window twice.
:::

## Which state do I keep in the window?

| Rule in the problem | State to keep | Shrink when |
|---|---|---|
| Sum at most or at least a value (positive numbers) | A running sum | The sum crosses the limit |
| At most k distinct items | A count dict, use its length | `len(count) > k` |
| No repeated item | A set, or a last-index dict | The new item is already inside |
| At most k "bad" items | A counter of bad items | `bad > k` |
| Contains all letters of `t` | A `need` dict and `missing` | Shrink while `missing == 0` |

:::interview There is a while loop inside a for loop. Why is the sliding window O(n) and not O(n²)?
"I count how many times each pointer moves instead of counting loops. The `right` pointer moves forward exactly `n` times. The `left` pointer also only moves forward and can never pass `right`, so over the whole run it moves at most `n` times in total, not `n` times per step. Each item enters the window once and leaves at most once, so the total work is at most `2n` steps, which is `O(n)`. This kind of counting over the whole run is called amortised analysis."
:::

:::revise
- A window is a continuous range `[left, right]`. It works for subarrays and substrings only.
- Fixed window: one item enters, the item at `right - k` leaves.
- Longest: shrink while the window is invalid, record after the loop.
- Shortest: shrink while the window is valid, record inside the loop.
- Counting: add `right - left + 1` for every `right`.
- A sum window needs positive numbers. `left` never moves backwards.
:::

# Prefix sums and hashing

*Store what you have already seen, so a question about a range or a partner becomes one lookup.*

## Why it matters

A cricket scoreboard shows the **total** score after every over. Suppose you want the runs scored from over 11 to over 15. You do not add five overs one by one. You take the total after over 15 and subtract the total after over 10. One subtraction.

That running total is a **prefix sum**: `prefix[i]` is the sum of the first `i` items. With it, the sum of any range is one subtraction.

**Hashing** is the second half of this chapter. A **hash map** (`dict` in Python) stores key and value pairs and finds a key in `O(1)` time on average. A **hash set** (`set`) stores only keys. Together they answer "have I seen this before, and where?" instantly. The most powerful trick is to put **prefix sums inside a hash map**.

## How to recognise it

- Many questions about the **sum of a range** on the same array.
- "Count or find subarrays with **sum equal to k**", especially with **negative numbers**.
- "Equal number of 0s and 1s", "sum divisible by k": a balance that returns to an old value.
- "Find a pair", "find a duplicate", "group items", "count how often": plain hashing.
- The brute force has an inner loop that only **searches** or **re-adds**.

## Template 1: prefix sum array

```python
def build_prefix(nums):
    prefix = [0]                      # prefix[0] = sum of zero items
    for x in nums:
        prefix.append(prefix[-1] + x)
    return prefix                     # prefix[i] = sum of nums[0..i-1]

def range_sum(prefix, i, j):
    return prefix[j + 1] - prefix[i]  # sum of nums[i..j], both included

nums = [3, 1, 4, 1, 5, 9]
prefix = build_prefix(nums)           # [0, 3, 4, 8, 9, 14, 23]
print(range_sum(prefix, 1, 3))        # 6   (1 + 4 + 1)
```

Building costs `O(n)` time and space once. After that every range sum is `O(1)`.

:::tip Use one extra zero at the front
Making `prefix` one item longer than `nums`, with `prefix[0] = 0`, removes all special cases for ranges that start at index 0. The formula `prefix[j + 1] - prefix[i]` then works for every range.
:::

## Template 2: prefix sum with a hash map

Problem: count the subarrays whose sum is exactly `k`. Numbers may be negative.

The sum of the subarray from `i + 1` to `j` is `prefix[j] - prefix[i]`. We want this to be `k`. Rearranged: `prefix[i] = prefix[j] - k`. So while we walk the array and know the current prefix sum, we only need to ask: **how many earlier prefix sums were equal to `current - k`?** A hash map answers that in `O(1)`.

```python
def subarray_sum(nums, k):
    seen = {0: 1}                     # prefix sum -> how many times seen
    prefix = count = 0
    for x in nums:
        prefix += x
        count += seen.get(prefix - k, 0)     # earlier sums that fit
        seen[prefix] = seen.get(prefix, 0) + 1
    return count

print(subarray_sum([1, 2, 1, -1, 3], 3))     # 5
```

Time `O(n)`, space `O(n)`.

:::example Dry run of subarray_sum([1, 2, 1, -1, 3], 3)

| x | prefix | Look for prefix - 3 | Found | count |
|---|---|---|---|---|
| 1 | 1 | -2 | 0 times | 0 |
| 2 | 3 | 0 | 1 time | 1 |
| 1 | 4 | 1 | 1 time | 2 |
| -1 | 3 | 0 | 1 time | 3 |
| 3 | 6 | 3 | 2 times | 5 |

In the last row the prefix sum 3 was seen twice (after index 1 and after index 3), so two subarrays end here: `[1, -1, 3]` and `[3]`. The five subarrays are `[1, 2]`, `[2, 1]`, `[1, 2, 1, -1]`, `[1, -1, 3]` and `[3]`.
:::

:::warn Do not forget seen = {0: 1}
The entry `{0: 1}` stands for the empty prefix, before any item. Without it you miss every subarray that **starts at index 0**. In the dry run, the subarray `[1, 2]` is found only because the sum 0 is already in the map. Also add the current prefix to the map **after** you look up, not before. If you add first and `k` is 0, the code counts an empty subarray.
:::

### Worked problem: longest subarray with equal 0s and 1s

Trick: treat every 0 as `-1`. Then "equal 0s and 1s" means "sum is 0". A subarray has sum 0 when the prefix sum **before** it and the prefix sum **at its end** are the same. To make it longest, remember only the **first** index of each prefix sum.

```python
def find_max_length(nums):
    first = {0: -1}                   # balance -> first index it appeared
    balance = best = 0
    for i, x in enumerate(nums):
        balance += 1 if x == 1 else -1
        if balance in first:
            best = max(best, i - first[balance])   # same balance again
        else:
            first[balance] = i        # store only the first time
    return best

print(find_max_length([0, 1, 0, 0, 1, 1, 0]))   # 6
```

:::example Dry run of find_max_length([0, 1, 0, 0, 1, 1, 0])

| i | x | balance | Seen before at | best |
|---|---|---|---|---|
| 0 | 0 | -1 | new, store 0 | 0 |
| 1 | 1 | 0 | index -1 | 2 |
| 2 | 0 | -1 | index 0 | 2 |
| 3 | 0 | -2 | new, store 3 | 2 |
| 4 | 1 | -1 | index 0 | 4 |
| 5 | 1 | 0 | index -1 | 6 |
| 6 | 0 | -1 | index 0 | 6 |

At `i = 5` the balance is 0 again, the same as before the array started (index -1). So indexes 0 to 5 hold three 0s and three 1s. The answer is 6.
:::

The same idea solves a family of problems. Only the "key" stored in the map changes.

| Problem | Key in the hash map | Value |
|---|---|---|
| Count subarrays with sum k | Prefix sum | How many times seen |
| Longest subarray with sum k | Prefix sum | First index seen |
| Equal 0s and 1s | Balance (+1 and -1) | First index seen |
| Count subarrays with sum divisible by k | Prefix sum `% k` | How many times seen |

## Hashing patterns

Plain hashing, without prefix sums, has five shapes that come back again and again.

| Shape | Store this | Example problem |
|---|---|---|
| Complement | value -> index | Two numbers that add to a target |
| Frequency | item -> count | Most common item, anagram check |
| First or last index | item -> index | First unique character |
| Group by key | key -> list of items | Group anagrams (key = sorted word) |
| Membership | a set of items | Duplicates, longest consecutive run |

### Worked problem: longest consecutive sequence

Problem: find the length of the longest run of consecutive numbers such as 1, 2, 3, 4. The array is unsorted and the solution must be `O(n)`, so sorting is not allowed.

Put all numbers into a set. A number `x` is the **start** of a run only if `x - 1` is not in the set. Count upwards only from starts.

```python
def longest_consecutive(nums):
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue                  # not a start: skip it
        length = 1
        while x + length in values:   # walk the run upwards
            length += 1
        best = max(best, length)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))   # 4  (1, 2, 3, 4)
```

For `[100, 4, 200, 1, 3, 2]`, only 100, 200 and 1 are starts, because 99, 199 and 0 are missing. From 1 the walk finds 2, 3 and 4, so the answer is 4. The inner `while` loop runs only from starts, so every number is walked once. Total time is `O(n)`, space `O(n)`.

:::interview Sliding window and prefix sum with a hash map both solve subarray-sum problems. When do you use which?
"If all numbers are positive, or the rule is one-way in some other form, I use a sliding window. It needs `O(1)` extra space. If numbers can be negative, a bigger window does not always mean a bigger sum, so I cannot decide when to shrink and the window fails. Then I use prefix sums with a hash map: a subarray has sum `k` exactly when two prefix sums differ by `k`, so for each position I look up `prefix - k` in the map. That is `O(n)` time and `O(n)` space and it works with negatives and zeros. For counting I store how many times each prefix sum appeared. For the longest subarray I store the first index of each prefix sum."
:::

:::revise
- `prefix[i]` is the sum of the first `i` items. Range sum = `prefix[j + 1] - prefix[i]`.
- Subarray sum equals k: look up `prefix - k` in a hash map of earlier prefix sums.
- Start the map with `{0: 1}` for counting, or `{0: -1}` for lengths.
- Counting stores "how many times". Longest stores "first index".
- Turn "equal 0s and 1s" into "sum is 0" by treating 0 as -1.
- If the inner loop only searches for a value, replace it with a set or dict.
:::

# Binary search

*Cut the search space in half at every step, on a sorted array or on a range of possible answers.*

## Why it matters

Your friend thinks of a number between 1 and 100 and only says "higher" or "lower". You would not guess 1, 2, 3 and so on. You guess 50. If the answer is "higher", you guess 75. Each guess removes half of the numbers, so you need at most 7 guesses.

**Binary search** does exactly this. Each step throws away half of what is left, so the time is `O(log n)`. For one million items that is about 20 steps. The idea is simple, but the code is famous for small bugs: an infinite loop, or an answer that is off by one. This chapter gives you one template that avoids both.

## How to recognise it

- The input is **sorted**, or "rotated sorted", or sorted in some hidden way.
- You search for a position: "first", "last", "insert position", "smallest item that is at least x".
- The problem asks for the **minimum value that works** or the **maximum value that still works** (speed, capacity, days, distance).
- The constraints are huge (values up to 1,000,000,000), so even `O(n)` over the values is too slow.
- **Key check:** you can ask a yes or no question, and the answers look like `no, no, no, yes, yes, yes`. They switch only once. This property is called **monotonic**.

## The classic version

Use this only when you look for an exact value and stop when you find it.

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1         # the answer is inside [lo, hi]
    while lo <= hi:                   # one item left still needs a check
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1              # target is on the right
        else:
            hi = mid - 1              # target is on the left
    return -1

print(binary_search([2, 5, 8, 12, 16, 23], 16))   # 4
```

## The template: first true

Most binary search problems are not "find this exact value". They are "find the **first position where a condition becomes true**". Learn this one template and reuse it everywhere.

```python
def first_true(lo, hi, ok):
    """Smallest x in [lo, hi) where ok(x) is True. Returns hi if none."""
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid                  # mid may be the answer: keep it
        else:
            lo = mid + 1              # mid is not the answer: drop it
    return lo                         # lo == hi: the first True
```

`ok` is any function that returns `False, False, ..., True, True`. Time is `O(log n)` calls of `ok`. Space is `O(1)`.

**Why it never loops forever.** While `lo < hi`, the middle `(lo + hi) // 2` is always smaller than `hi`, because integer division rounds down. So `hi = mid` makes the range smaller, and `lo = mid + 1` also makes it smaller. The range shrinks at every step until `lo == hi`.

:::flow One step of first_true
Pick mid | (lo + hi) // 2
Ask ok(mid) | a yes or no question
Yes | hi = mid, keep mid
No | lo = mid + 1, drop mid
:::

### Worked problem: first and last position of a value

Problem: in a sorted array with repeats, return the first and last index of `target`, or `[-1, -1]`.

The first index is the first position where `nums[i] >= target`. This is called the **lower bound**. The last index is one step before the lower bound of `target + 1`.

```python
def lower_bound(nums, target):
    # first index whose value is >= target (len(nums) if there is none)
    return first_true(0, len(nums), lambda i: nums[i] >= target)

def search_range(nums, target):
    first = lower_bound(nums, target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]               # target is not in the array
    last = lower_bound(nums, target + 1) - 1
    return [first, last]

print(search_range([1, 3, 3, 3, 5, 8], 3))   # [1, 3]
```

:::example Dry run of lower_bound([1, 3, 3, 3, 5, 8], 3)

| lo | hi | mid | nums[mid] >= 3 ? | Action |
|---|---|---|---|---|
| 0 | 6 | 3 | 3: yes | hi = 3 |
| 0 | 3 | 1 | 3: yes | hi = 1 |
| 0 | 1 | 0 | 1: no | lo = 1 |
| 1 | 1 | | loop ends | return 1 |

At `mid = 3` we found a 3, but we did not stop. There may be another 3 on the left, so we keep `mid` and continue. For `target + 1 = 4` the same code returns 4, so the last index is `4 - 1 = 3`.
:::

### Worked problem: search in a rotated sorted array

A **rotated** sorted array is a sorted array cut at some point with the two parts swapped, such as `[4, 5, 6, 7, 0, 1, 2]`. The whole array is not sorted, but here is the key fact: **when you cut it at `mid`, at least one half is fully sorted.** Check if the target lies inside the sorted half. If yes, go there. If no, go to the other half.

```python
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:             # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                  # target is inside it
            else:
                lo = mid + 1
        else:                                 # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1                  # target is inside it
            else:
                hi = mid - 1
    return -1

print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))   # 4
```

:::example Dry run of search_rotated([4, 5, 6, 7, 0, 1, 2], 0)

| lo, hi | mid | Sorted half | Is 0 inside it? | Action |
|---|---|---|---|---|
| 0, 6 | 3 (value 7) | left: 4 to 7 | no | lo = 4 |
| 4, 6 | 5 (value 1) | left: 0 to 1 | yes | hi = 4 |
| 4, 4 | 4 (value 0) | | found | return 4 |
:::

## Binary search on the answer

This is the version that students miss most often. There is no sorted array in the problem. Instead, the **possible answers** form a range of numbers, and we binary search inside that range.

Use it when you can write a simple function `ok(x)` that says "is `x` good enough?", and when a bigger `x` only makes things easier (or only harder).

1. Find the smallest and largest possible answer. These are `lo` and `hi`.
2. Write `ok(x)`: a greedy loop that tests one guess in `O(n)`.
3. Run the template to find the first `x` where `ok(x)` is true.

### Worked problem: Koko eating bananas

Problem: there are piles of bananas. Koko eats at speed `k` bananas per hour, and one pile at a time. If a pile has fewer than `k` bananas, she finishes it and waits for the next hour. Find the smallest `k` so that she finishes all piles within `h` hours.

If speed 4 works, then speed 5 also works. So the answers are `no, no, no, yes, yes, ...`. The slowest useful speed is 1 and the fastest is the largest pile.

```python
def min_eating_speed(piles, h):
    def ok(speed):
        # hours for a pile = pile / speed, rounded up
        hours = sum((p + speed - 1) // speed for p in piles)
        return hours <= h
    lo, hi = 1, max(piles)            # max(piles) always works
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

print(min_eating_speed([3, 6, 7, 11], 8))    # 4
```

:::example Dry run of min_eating_speed([3, 6, 7, 11], 8)

| lo, hi | mid | Hours needed at speed mid | Within 8? | Action |
|---|---|---|---|---|
| 1, 11 | 6 | 1 + 1 + 2 + 2 = 6 | yes | hi = 6 |
| 1, 6 | 3 | 1 + 2 + 3 + 4 = 10 | no | lo = 4 |
| 4, 6 | 5 | 1 + 2 + 2 + 3 = 8 | yes | hi = 5 |
| 4, 5 | 4 | 1 + 2 + 2 + 3 = 8 | yes | hi = 4 |

Now `lo == hi == 4`. The answer is 4. Time is `O(n log m)` where `m` is the largest pile: about `log m` guesses, each tested with one `O(n)` loop. Space is `O(1)`.
:::

The trick `(p + speed - 1) // speed` is integer "divide and round up". It avoids floating point numbers.

### The mirror image: the largest value that still works

Sometimes the answers look like `yes, yes, yes, no, no`. Then we want the **last true**. Problem: place `k` cows in stalls at the given positions so that the smallest gap between two cows is as large as possible.

```python
def max_min_distance(positions, k):
    positions = sorted(positions)
    def ok(gap):                      # can we place k cows, gaps >= gap?
        count, last = 1, positions[0]
        for p in positions[1:]:
            if p - last >= gap:       # greedy: place as early as allowed
                count += 1
                last = p
        return count >= k
    lo, hi = 1, positions[-1] - positions[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2      # round UP for the last-true version
        if ok(mid):
            lo = mid                  # mid works: keep it, try bigger
        else:
            hi = mid - 1
    return lo

print(max_min_distance([1, 2, 8, 4, 9], 3))   # 3  (cows at 1, 4, 8)
```

:::warn The two infinite loop bugs
1. In the first-true template you write `hi = mid`. Then `mid` must round **down**: `(lo + hi) // 2`.
2. In the last-true version you write `lo = mid`. Then `mid` must round **up**: `(lo + hi + 1) // 2`.

Take `lo = 4, hi = 5`. With `lo = mid` and rounding down, `mid` is 4, so `lo` stays 4 and the loop never ends. Remember it as two fixed pairs: `hi = mid` with round down, `lo = mid` with round up. If you are unsure, test your loop by hand on a range of size 2.
:::

## Which version do I use?

| Question | Loop | Updates |
|---|---|---|
| Find an exact value | `while lo <= hi` | `lo = mid + 1`, `hi = mid - 1` |
| First position where a condition is true | `while lo < hi`, round down | `hi = mid`, `lo = mid + 1` |
| Last position where a condition is true | `while lo < hi`, round up | `lo = mid`, `hi = mid - 1` |
| Minimum answer that works | First true on the answer range | same as first true |
| Maximum answer that works | Last true on the answer range | same as last true |

:::interview What is "binary search on the answer"? Give an example and its complexity.
"Sometimes there is no sorted array, but the possible answers form a range and the feasibility is monotonic: if a value `x` works, every larger value also works. Then I binary search over the answer range and test each guess with a checking function. For example, to find the minimum ship capacity to deliver all packages in `d` days, the smallest possible answer is the heaviest package and the largest is the sum of all weights. For a guess, I simulate loading the ship greedily and count the days, which is `O(n)`. If the days are within `d`, I try a smaller capacity, otherwise a larger one. The total time is `O(n log S)` where `S` is the size of the answer range, and the space is `O(1)`."
:::

:::revise
- Binary search needs a monotonic question: the answers switch from no to yes only once.
- Template: `while lo < hi`, `mid = (lo + hi) // 2`, `hi = mid` if ok, else `lo = mid + 1`.
- `hi = mid` goes with rounding down. `lo = mid` goes with rounding up.
- Lower bound finds the first index with a value `>= target`. Do not stop at the first match.
- Rotated array: one half is always sorted. Check whether the target is inside it.
- "Minimum value that works": binary search the answer range with a greedy `ok` function.
:::

# Stack and monotonic stack and queue

*A stack remembers the most recent unfinished thing, and a monotonic stack finds the next bigger or smaller item for every position in one pass.*

## Why it matters

Think of a pile of plates in a canteen. You put a plate on top and you take a plate from the top. The last plate you put is the first one you take. This is a **stack**: last in, first out (**LIFO**). In Python a list is a stack: `append` pushes on top and `pop` removes from the top, both in `O(1)`.

A stack is the right tool whenever the **most recent** open item must be handled first: the last opened bracket must be closed first, the last action is undone first, the innermost function call returns first.

A **monotonic stack** is a stack whose values are always in sorted order (always increasing, or always decreasing). Before pushing a new item, we pop everything that breaks the order. It sounds like a small change, but it answers "what is the next greater item?" for all `n` items in `O(n)` total.

## How to recognise it

| Signal | Tool |
|---|---|
| Brackets, tags, nested structures, "valid" | Plain stack |
| "Evaluate the expression", "decode", "undo", "backspace" | Plain stack |
| "Next greater", "next smaller", "previous greater" | Monotonic stack |
| "How many days until a warmer day", "stock span" | Monotonic stack |
| "Largest rectangle", "trapped water" | Monotonic stack |
| "Maximum (or minimum) of every window of size k" | Monotonic queue |
| "Get the minimum of the stack in `O(1)`" | Push `(value, minimum so far)` pairs |

## Template 1: matching pairs

Problem: a string has the brackets `()[]{}`. Is it valid? Every opener must be closed by the same type, in the right order.

```python
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []                        # open brackets waiting for a partner
    for ch in s:
        if ch in pairs:               # a closing bracket
            if not stack or stack.pop() != pairs[ch]:
                return False          # nothing to match, or wrong type
        else:
            stack.append(ch)          # an opening bracket
    return not stack                  # leftovers mean unclosed brackets

print(is_valid("{[()]}"), is_valid("(]"), is_valid("(("))   # True False False
```

Time `O(n)`, space `O(n)`. There are three ways to fail: a closer with an empty stack, a closer of the wrong type, and openers left over at the end. Test all three.

## Template 2: monotonic stack (next greater item)

People stand in a queue and everyone looks to the right. Each person asks: "who is the first person taller than me?" A short person standing behind a tall person can never be the answer for anyone further left, so we can forget them. That is why the stack stays sorted.

The stack holds **indexes of items that are still waiting for their answer**. When a new item arrives, it is the answer for every waiting item that is smaller.

```python
def next_greater(nums):
    res = [-1] * len(nums)            # -1 means "no greater item"
    stack = []                        # indexes still waiting, values falling
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            j = stack.pop()           # x is the answer for index j
            res[j] = x
        stack.append(i)               # i now waits for its own answer
    return res

print(next_greater([2, 7, 3, 5, 4, 6, 8]))   # [7, 8, 5, 6, 6, 8, -1]
```

Time is `O(n)`: each index is pushed once and popped at most once. Space is `O(n)`.

| You want | Pop while the top is | Stack values are |
|---|---|---|
| Next greater item | smaller than the new item | decreasing |
| Next smaller item | greater than the new item | increasing |
| Previous greater item | smaller or equal: then the new top is the answer | decreasing |

### Worked problem: daily temperatures

Problem: for each day, how many days must you wait for a warmer day? Write 0 if there is none. It is "next greater" again, but we store the **distance** `i - j`.

```python
def daily_temperatures(temps):
    res = [0] * len(temps)
    stack = []                        # indexes of days waiting for warmth
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j            # days waited
        stack.append(i)
    return res

print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]
```

:::example Dry run of daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73])

| i | temp | Popped (answer) | Stack of indexes after |
|---|---|---|---|
| 0 | 73 | none | [0] |
| 1 | 74 | 0 (waits 1) | [1] |
| 2 | 75 | 1 (waits 1) | [2] |
| 3 | 71 | none | [2, 3] |
| 4 | 69 | none | [2, 3, 4] |
| 5 | 72 | 4 (waits 1), 3 (waits 2) | [2, 5] |
| 6 | 76 | 5 (waits 1), 2 (waits 4) | [6] |
| 7 | 73 | none | [6, 7] |

Indexes 6 and 7 are never popped, so their answer stays 0. The temperatures on the stack are always falling: for example 75, 71, 69 after `i = 4`.
:::

### Worked problem: largest rectangle in a histogram

Problem: bars of width 1 have the given heights. Find the area of the largest rectangle that fits inside the bars.

For each bar, imagine a rectangle with exactly that bar's height. It can stretch left and right until it meets a **shorter** bar. So we need the next smaller bar on both sides. An increasing stack gives both at the moment a bar is popped: the new bar is the first shorter bar on the right, and the item below it on the stack is the first shorter bar on the left.

```python
def largest_rectangle(heights):
    stack = []                        # indexes, heights increasing
    best = 0
    for i, h in enumerate(heights + [0]):   # the extra 0 empties the stack
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1     # first shorter on left
            width = i - left - 1
            best = max(best, height * width)
        stack.append(i)
    return best

print(largest_rectangle([2, 1, 5, 6, 2, 3]))    # 10
```

:::example Dry run of largest_rectangle([2, 1, 5, 6, 2, 3])

| i | h | Popped bars: height x width = area | Stack after | best |
|---|---|---|---|---|
| 0 | 2 | none | [0] | 0 |
| 1 | 1 | 2 x 1 = 2 | [1] | 2 |
| 2 | 5 | none | [1, 2] | 2 |
| 3 | 6 | none | [1, 2, 3] | 2 |
| 4 | 2 | 6 x 1 = 6, then 5 x 2 = 10 | [1, 4] | 10 |
| 5 | 3 | none | [1, 4, 5] | 10 |
| 6 | 0 | 3 x 1 = 3, 2 x 4 = 8, 1 x 6 = 6 | [6] | 10 |

Look at `i = 4`. The bar of height 5 (index 2) is popped. The stack top is now index 1, so `width = 4 - 1 - 1 = 2`. The rectangle covers the bars 5 and 6 with height 5: area 10. Time `O(n)`, space `O(n)`.
:::

:::warn Store indexes, not values
In almost every monotonic stack problem, push the **index** and read the value with `nums[stack[-1]]`. From an index you can get both the value and the distance. From a value you cannot get the position back. Also decide carefully between `<` and `<=` when there are equal values: test your code on an input like `[2, 2, 2]`.
:::

## Template 3: monotonic queue (maximum of every window)

Problem: return the maximum of every window of size `k`.

A **deque** (double-ended queue) lets you add and remove at both ends in `O(1)`. We keep indexes in the deque with **falling values**, so the front is always the maximum of the window. A new item removes all smaller items from the back, because they are older and smaller and can never be a maximum again.

```python
from collections import deque

def max_sliding_window(nums, k):
    dq = deque()                      # indexes, their values are falling
    res = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()                  # smaller and older: useless now
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()              # the front left the window
        if i >= k - 1:
            res.append(nums[dq[0]])   # front = maximum of this window
    return res

print(max_sliding_window([4, 2, 12, 3, 8, 1, 6], 3))   # [12, 12, 12, 8, 8]
```

:::example Dry run of max_sliding_window([4, 2, 12, 3, 8, 1, 6], 3)

| i | x | Values in the deque after | Output |
|---|---|---|---|
| 0 | 4 | 4 | |
| 1 | 2 | 4, 2 | |
| 2 | 12 | 12 | 12 |
| 3 | 3 | 12, 3 | 12 |
| 4 | 8 | 12, 8 | 12 |
| 5 | 1 | 8, 1 | 8 |
| 6 | 6 | 8, 6 | 8 |

At `i = 2` the 12 removes both 4 and 2. At `i = 5` the 12 (index 2) is outside the window `[3, 5]`, so it is removed from the front.
:::

Time is `O(n)` because each index enters and leaves the deque once. Space is `O(k)`.

:::interview How does a monotonic stack find the next greater element for every item in O(n)? There is a while loop inside the for loop.
"The stack keeps the indexes of items that have not found their next greater element yet, and their values are in decreasing order from bottom to top. When a new item comes, I pop every index whose value is smaller, because the new item is the first greater item to their right, and I record that. Then I push the new index. Although there is a `while` loop inside the `for` loop, each index is pushed exactly once and popped at most once, so the total number of stack operations is at most `2n`. That gives `O(n)` time and `O(n)` space. The brute force would scan to the right for every item, which is `O(n²)`."
:::

:::revise
- Stack is LIFO: use it when the most recent open item must be handled first.
- Brackets: push openers, pop and compare on closers, and the stack must be empty at the end.
- Monotonic stack: pop while the top breaks the order. The new item is the answer for each popped item.
- Next greater uses a decreasing stack. Next smaller uses an increasing stack.
- Store indexes, not values. Each index is pushed and popped once, so the time is `O(n)`.
- Window maximum: a deque with falling values, and the front is the maximum.
:::

# Linked list tricks

*Four small tricks (dummy node, reversal, gap pointers, fast and slow) solve almost every linked list problem.*

## Why it matters

A treasure hunt gives you one clue, and each clue tells you where the next clue is. You cannot jump to clue number 5. You must follow the chain. A **linked list** is the same: each **node** holds a value and a link called `next` to the following node. The first node is the **head**. The last node's `next` is `None`.

Linked list problems are rarely about clever algorithms. They are about **changing links in the right order without losing a part of the chain**. Four tricks cover almost all of them.

## How to recognise which trick

| Signal in the problem | Trick |
|---|---|
| The head itself may be removed or changed; building a new list | Dummy node |
| "Reverse the list", "reverse a part", "palindrome list" | Reversal with three pointers |
| "n-th node from the end" | Two pointers with a fixed gap |
| "Middle", "cycle", "split into halves" | Fast and slow pointers (Chapter 2) |
| "Reorder", "sort the list", "rearrange" | Combine: find middle, reverse, merge |

All examples use this node class and two small helpers to build and print lists.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

```python
def build_list(values):               # [1, 2, 3] -> 1 -> 2 -> 3
    dummy = tail = ListNode()
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def to_list(head):                    # 1 -> 2 -> 3 -> [1, 2, 3]
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
```

## Trick 1: the dummy node

When you build a list, the first node is a special case: there is no "previous node" to attach it to. A **dummy node** is a fake node placed before the real head. Now every real node has a previous node, and the special case is gone. At the end you return `dummy.next`.

Problem: merge two sorted lists into one sorted list.

```python
def merge_two_lists(a, b):
    dummy = tail = ListNode()         # tail = last node of the new list
    while a and b:
        if a.val <= b.val:
            tail.next = a             # attach the smaller node
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a or b                # attach what is left of one list
    return dummy.next

merged = merge_two_lists(build_list([1, 4, 7]), build_list([2, 3, 9]))
print(to_list(merged))                # [1, 2, 3, 4, 7, 9]
```

Time `O(n + m)`, extra space `O(1)`: we reuse the old nodes and only change links.

## Trick 2: reversal with three pointers

To reverse a list, walk through it and turn every arrow around. The danger: when you turn `cur.next` backwards, you lose the way forward. So save the next node **first**.

```python
def reverse_list(head):
    prev = None                       # the part that is already reversed
    cur = head
    while cur:
        nxt = cur.next                # 1. save the way forward
        cur.next = prev               # 2. turn the arrow around
        prev = cur                    # 3. move prev forward
        cur = nxt                     # 4. move cur forward
    return prev                       # prev is the new head

print(to_list(reverse_list(build_list([1, 2, 3]))))   # [3, 2, 1]
```

:::example Dry run of reverse_list on 1 -> 2 -> 3

| Step | cur | nxt saved | Arrow turned | Reversed part (from prev) |
|---|---|---|---|---|
| start | 1 | | | empty |
| 1 | 1 | 2 | 1 -> None | 1 |
| 2 | 2 | 3 | 2 -> 1 | 2 -> 1 |
| 3 | 3 | None | 3 -> 2 | 3 -> 2 -> 1 |

Now `cur` is `None`, the loop ends, and `prev` points to node 3, the new head. Time `O(n)`, space `O(1)`.
:::

:::warn The order of the four lines matters
If you write `cur.next = prev` before saving `cur.next`, the rest of the list is lost and nothing can reach it again. Always save first, then change the link, then move the pointers. When a linked list solution fails, draw three boxes on paper and follow the arrows line by line. Most bugs are a link changed one line too early.
:::

## Trick 3: two pointers with a fixed gap

Problem: remove the n-th node from the **end** of the list in one pass.

We do not know the length. Trick: move `fast` ahead by `n` nodes. Then move `fast` and `slow` together. When `fast` reaches the last node, `slow` is just **before** the node to remove. A dummy node handles the case where the head itself is removed.

```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n):                # open a gap of n nodes
        fast = fast.next
    while fast.next:                  # walk until fast is the last node
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next        # skip over the target node
    return dummy.next

print(to_list(remove_nth_from_end(build_list([1, 2, 3, 4, 5]), 2)))
# [1, 2, 3, 5]
```

:::example Dry run of remove_nth_from_end on 1 -> 2 -> 3 -> 4 -> 5 with n = 2
`D` is the dummy node in front of node 1.

| Moment | slow | fast |
|---|---|---|
| start | D | D |
| after opening the gap (2 steps) | D | 2 |
| walk 1 | 1 | 3 |
| walk 2 | 2 | 4 |
| walk 3 | 3 | 5 (last node, stop) |

`slow` is node 3. We set `3.next = 5`, so node 4 is skipped. If `n` were 5, `slow` would stay on `D` and the head would be removed correctly. That is why we start from the dummy.
:::

## Trick 4: combine the tricks

Harder problems are two or three tricks in a row. Problem: reorder `1 -> 2 -> 3 -> 4 -> 5` into `1 -> 5 -> 2 -> 4 -> 3` (first, last, second, second last, ...), in place.

:::flow Reorder a list
Find the middle | fast and slow
Cut in two halves | 1-2-3 and 4-5
Reverse the second | 5-4
Weave them | 1-5-2-4-3
:::

```python
def reorder_list(head):
    if not head or not head.next:
        return head
    slow = fast = head
    while fast.next and fast.next.next:   # slow ends on the middle node
        slow = slow.next
        fast = fast.next.next
    second = reverse_list(slow.next)      # reverse the second half
    slow.next = None                      # cut the list in two
    first = head
    while second:                         # weave: one from each half
        next1, next2 = first.next, second.next
        first.next = second
        second.next = next1
        first, second = next1, next2
    return head

print(to_list(reorder_list(build_list([1, 2, 3, 4, 5]))))  # [1, 5, 2, 4, 3]
```

Time `O(n)`, space `O(1)`. The same three steps (middle, reverse, compare or merge) also solve "is this linked list a palindrome?" and merge sort on a linked list.

:::interview How do you reverse a linked list? Can you also do it recursively, and which is better?
"Iteratively, I keep three pointers: `prev`, `cur` and `nxt`. For each node I save `cur.next`, point `cur.next` back to `prev`, and then move `prev` and `cur` one step forward. When `cur` becomes `None`, `prev` is the new head. That is `O(n)` time and `O(1)` space. Recursively, I reverse the rest of the list after the head, then make the second node point back to the head with `head.next.next = head` and set `head.next = None`. It is also `O(n)` time but uses `O(n)` space on the call stack, and a very long list can hit the recursion limit. So I prefer the iterative version and mention the recursive one as an alternative."
:::

:::revise
- A dummy node before the head removes special cases. Return `dummy.next`.
- Reverse: save `nxt`, turn the arrow, move `prev`, move `cur`. In that order.
- N-th from the end: open a gap of `n`, then move both pointers together.
- Middle and cycle: fast and slow pointers.
- Hard problems combine the tricks: find the middle, reverse a half, merge.
- Test an empty list, one node, two nodes, and a changed head.
:::

# Trees

*Almost every tree problem is one recursive question: what do I need from my left child and my right child?*

## Why it matters

A company has one CEO. The CEO has managers, and each manager has team members. That shape is a **tree**: one top node called the **root**, each node has **children**, and a node with no children is a **leaf**. In a **binary tree** each node has at most two children, `left` and `right`.

Trees are made for recursion. The left child of a node is itself the root of a smaller tree (a **subtree**). So if you can solve the problem for the two subtrees, you can combine their answers for the whole tree. You do not have to think about the whole tree at once. You only think about **one node**.

```text
        1            depth 0 (root)
       / \
      2   3          depth 1
     / \
    4   5            depth 2 (4, 5 and 3 are leaves)
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# the tree in the picture above
root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
```

## How to recognise which traversal

A **traversal** is a way to visit every node once. **DFS** (depth-first search) goes deep down one branch before the next. **BFS** (breadth-first search) visits the tree level by level.

| Signal in the problem | Use |
|---|---|
| Height, depth, diameter, "is it balanced", path sums | DFS, answers come **up** from the children |
| "Is it a valid BST", path from the root, limits | DFS, information goes **down** to the children |
| "Level by level", "right side view", "zigzag" | BFS with a queue |
| "Minimum depth", "nearest leaf" | BFS: stop at the first hit |
| "Sorted order" or "k-th smallest" in a BST | Inorder DFS |

## Template 1: the three DFS orders

The three orders differ only in **when** you handle the node itself: before, between or after its children.

```python
def dfs_orders(root):
    pre, ino, post = [], [], []
    def dfs(node):
        if not node:                  # base case: empty subtree
            return
        pre.append(node.val)          # preorder: node, left, right
        dfs(node.left)
        ino.append(node.val)          # inorder: left, node, right
        dfs(node.right)
        post.append(node.val)         # postorder: left, right, node
    dfs(root)
    return pre, ino, post

print(dfs_orders(root))
# ([1, 2, 4, 5, 3], [4, 2, 5, 1, 3], [4, 5, 2, 3, 1])
```

| Order | Sequence | Use it when |
|---|---|---|
| Preorder | node, left, right | The node passes information **down**. Copying a tree. |
| Inorder | left, node, right | A BST: it gives the values in sorted order |
| Postorder | left, right, node | The node needs answers **from its children** first |

Time is `O(n)` because each node is visited once. Space is `O(h)` for the call stack, where `h` is the height of the tree. A balanced tree has `h` about `log n`. A tree shaped like one long chain has `h = n`.

## Template 2: BFS level by level

BFS uses a **queue** (first in, first out). The trick for levels: at the start of each round, the queue holds exactly one full level. Read its size and pop that many nodes.

```python
from collections import deque

def level_order(root):
    if not root:
        return []
    levels = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):   # exactly the nodes of this level
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels

print(level_order(root))              # [[1], [2, 3], [4, 5]]
```

Time `O(n)`, space `O(w)` where `w` is the widest level. For the **right side view**, keep only the last value of each level. For **zigzag** order, reverse every second level.

## Template 3: what do I need from my children?

This is the most useful idea in the chapter. For any "compute something about the tree" problem, stand on one node and ask three questions.

:::flow The recursion template
Base case | empty node returns what?
Ask the children | left answer, right answer
Combine | use both at this node
Return | what my parent needs
:::

The simplest example is the **height** (maximum depth). An empty tree has height 0. My height is 1 (myself) plus the taller child.

```python
def max_depth(node):
    if not node:
        return 0                              # base case
    left = max_depth(node.left)               # ask the children
    right = max_depth(node.right)
    return 1 + max(left, right)               # combine and return

print(max_depth(root))                # 3
```

### Worked problem: diameter of a binary tree

Problem: find the longest path between any two nodes, counted in edges. The path does not have to pass through the root.

Stand on one node. The longest path that **bends at this node** goes down the left side and down the right side: `left height + right height` edges. But my parent does not need that number. My parent needs my **height**. So the function **returns one thing** (height) and **updates another** (the best diameter). This "return one, update another" shape is very common.

```python
def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        best = max(best, left + right)        # path that bends here
        return 1 + max(left, right)           # what the parent needs
    height(root)
    return best

print(diameter(root))                 # 3  (4 -> 2 -> 1 -> 3)
```

:::example Dry run of diameter on the tree above
Postorder: the children finish before their parent.

| Node | Heights of left, right | Path through it | Returns | best |
|---|---|---|---|---|
| 4 | 0, 0 | 0 | 1 | 0 |
| 5 | 0, 0 | 0 | 1 | 0 |
| 2 | 1, 1 | 2 | 2 | 2 |
| 3 | 0, 0 | 0 | 1 | 2 |
| 1 | 2, 1 | 3 | 3 | 3 |

The answer is 3 edges: the path `4 -> 2 -> 1 -> 3`.
:::

### Worked problem: validate a binary search tree

A **binary search tree (BST)** has one rule: for every node, **all** values in its left subtree are smaller and **all** values in its right subtree are bigger. Here information flows **down**: each node receives the range `(low, high)` in which its value must lie.

```python
def is_valid_bst(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False                          # outside the allowed range
    return (is_valid_bst(node.left, low, node.val) and    # left: smaller
            is_valid_bst(node.right, node.val, high))     # right: bigger

good = TreeNode(5, TreeNode(3), TreeNode(8, TreeNode(6), TreeNode(9)))
bad = TreeNode(5, TreeNode(3), TreeNode(8, TreeNode(4), TreeNode(9)))
print(is_valid_bst(good), is_valid_bst(bad))  # True False
```

:::warn Checking only the direct children is wrong
A common wrong solution checks `node.left.val < node.val < node.right.val` at every node. Look at the `bad` tree above: 4 is the left child of 8, and `4 < 8` is fine. But 4 sits in the **right subtree of 5**, so it must be bigger than 5. The rule is about whole subtrees, not only about children. Pass the allowed range down, or check that the inorder traversal is strictly increasing.
:::

Time `O(n)`, space `O(h)` for both worked problems.

:::interview When would you use BFS instead of DFS on a tree?
"Both visit every node once, so both are `O(n)` time. I choose by what the question needs. I use BFS when the answer is about levels or about the nearest node: level order output, the right side view, or the minimum depth, because BFS reaches the closest nodes first and can stop early. I use DFS when a node's answer depends on its subtrees, such as height, diameter, balanced check or path sums, because recursion returns the children's answers naturally. Memory is the other point: DFS uses space equal to the height of the tree, and BFS uses space equal to the widest level, which can be about half of all the nodes in a full tree."
:::

:::revise
- Think about one node only: base case, ask the children, combine, return.
- Preorder passes information down. Postorder collects answers from the children. Inorder of a BST is sorted.
- BFS with a queue: `for _ in range(len(queue))` handles exactly one level.
- Many problems return one value (height) and update another (best answer).
- BST rule is about whole subtrees: pass a `(low, high)` range down.
- Time `O(n)`. DFS space is the height, BFS space is the widest level.
:::

# Heaps: top-k, k-way merge and two heaps

*A heap hands you the smallest (or largest) item at once, which is all you need for "top k", "merge k" and "running median" problems.*

## Why it matters

In a hospital emergency room, patients are not treated in the order they arrive. The most serious case goes first. New patients keep coming, and the staff must always know who is next. Sorting the whole list again after every new patient would waste time.

A **heap** (also called a **priority queue**) solves exactly this. It gives you the smallest item in `O(1)`, and it adds or removes an item in `O(log n)`. It does not keep everything sorted. It only promises that the smallest item is on top, and that is why it is fast.

Python's `heapq` module turns a normal list into a **min-heap** (smallest on top). There is no max-heap, so to get the largest on top we push **negative** numbers.

| Operation | Code | Time |
|---|---|---|
| Add an item | `heapq.heappush(heap, x)` | `O(log n)` |
| Remove the smallest | `heapq.heappop(heap)` | `O(log n)` |
| Look at the smallest | `heap[0]` | `O(1)` |
| Turn a list into a heap | `heapq.heapify(nums)` | `O(n)` |

## How to recognise it

- The words "**k largest**", "**k smallest**", "**k closest**", "**k most frequent**", "k-th".
- You need the minimum or maximum **again and again** while items are added or removed.
- "**Merge k sorted** lists or arrays", or "smallest range covering k lists".
- "**Median**" of a stream of numbers, or of a sliding window.
- Scheduling: "always do the cheapest or earliest task next".

## Template 1: top-k with a heap of size k

To find the `k` **largest** items, keep a **min-heap** of size `k`. It holds the best `k` items seen so far, and its top is the weakest of them. When a new item comes, push it. If the heap now has more than `k` items, pop the smallest. What remains at the end is the top `k`.

```python
import heapq

def kth_largest(nums, k):
    heap = []                         # min-heap with the k largest so far
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)       # throw out the smallest of k + 1
    return heap[0]                    # weakest of the top k = k-th largest

print(kth_largest([3, 2, 1, 5, 6, 4], 2))    # 5
```

:::example Dry run of kth_largest([3, 2, 1, 5, 6, 4], 2)

| x | Heap after push | Popped | Heap after |
|---|---|---|---|
| 3 | 3 | | 3 |
| 2 | 2, 3 | | 2, 3 |
| 1 | 1, 2, 3 | 1 | 2, 3 |
| 5 | 2, 3, 5 | 2 | 3, 5 |
| 6 | 3, 5, 6 | 3 | 5, 6 |
| 4 | 4, 5, 6 | 4 | 5, 6 |

The heap ends with the two largest numbers, 5 and 6. Its top, 5, is the 2nd largest.
:::

Time is `O(n log k)` and space is `O(k)`. Sorting everything would be `O(n log n)` time and needs all the data at once.

:::warn Largest needs a MIN-heap
It feels backwards, so many people get it wrong. For the `k` **largest** items use a **min**-heap, because the item you want to throw out is the smallest of your current best `k`. For the `k` **smallest** items use a **max**-heap (push negatives) and throw out the largest.
:::

## Template 2: k-way merge

Problem: merge `k` sorted arrays into one sorted array.

The next smallest item overall must be the **front item of one of the arrays**. So keep one item from each array in a min-heap. Pop the smallest, add it to the output, and push the next item **from the same array**. The heap holds **tuples**: Python compares tuples by the first field, then the second, so the value goes first.

```python
import heapq

def merge_k_sorted(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:                       # (value, which list, which index)
            heapq.heappush(heap, (lst[0], i, 0))
    out = []
    while heap:
        value, i, j = heapq.heappop(heap)
        out.append(value)
        if j + 1 < len(lists[i]):     # that list still has items
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out

print(merge_k_sorted([[1, 4, 7], [2, 5], [3, 6, 9]]))
# [1, 2, 3, 4, 5, 6, 7, 9]
```

:::example Dry run of merge_k_sorted([[1, 4, 7], [2, 5], [3, 6, 9]])

| Popped | From list | Pushed next | Values in the heap after |
|---|---|---|---|
| 1 | 0 | 4 | 2, 3, 4 |
| 2 | 1 | 5 | 3, 4, 5 |
| 3 | 2 | 6 | 4, 5, 6 |
| 4 | 0 | 7 | 5, 6, 7 |
| 5 | 1 | nothing, list 1 is finished | 6, 7 |
| 6 | 2 | 9 | 7, 9 |
| 7 | 0 | nothing | 9 |
| 9 | 2 | nothing | empty |

The heap never holds more than `k = 3` items.
:::

With `n` items in total, time is `O(n log k)` and the heap uses `O(k)` space. The same idea merges `k` sorted linked lists: push `(node.val, i, node)`, where the list number `i` breaks ties so that Python never has to compare two nodes.

## Template 3: two heaps for the median

The **median** is the middle value of sorted data. For an even count it is the average of the two middle values. Problem: numbers arrive one by one, and after each one we may be asked for the median.

Cut the sorted data into two halves. We only ever need the **largest of the small half** and the **smallest of the large half**. That is one max-heap and one min-heap.

:::flow Two heaps around the middle
small half | max-heap, top = its largest
median | between the two tops
large half | min-heap, top = its smallest
:::

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.small = []               # max-heap (negatives): smaller half
        self.large = []               # min-heap: larger half

    def add_num(self, x):
        heapq.heappush(self.small, -x)                 # 1. into small
        biggest = -heapq.heappop(self.small)
        heapq.heappush(self.large, biggest)            # 2. its top moves up
        if len(self.large) > len(self.small):          # 3. rebalance
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def find_median(self):
        if len(self.small) > len(self.large):
            return -self.small[0]                      # odd count
        return (-self.small[0] + self.large[0]) / 2    # even count
```

Two rules are kept true after every `add_num`: every item in `small` is less than or equal to every item in `large`, and `small` has the same size as `large` or one more.

:::example Dry run of MedianFinder with 5, 15, 1, 3, 8

| Add | small half | large half | Median |
|---|---|---|---|
| 5 | 5 | empty | 5 |
| 15 | 5 | 15 | (5 + 15) / 2 = 10 |
| 1 | 1, 5 | 15 | 5 |
| 3 | 1, 3 | 5, 15 | (3 + 5) / 2 = 4 |
| 8 | 1, 3, 5 | 8, 15 | 5 |

Look at "add 3". It goes into `small` (1, 3, 5). The top of `small`, 5, moves to `large` (5, 15). The sizes are 2 and 2, so no rebalance is needed.
:::

`add_num` is `O(log n)` and `find_median` is `O(1)`. Space is `O(n)`.

:::interview To find the k largest elements, why use a heap when you can simply sort?
"Sorting works and costs `O(n log n)` time. A min-heap of size `k` costs `O(n log k)`, which is better when `k` is much smaller than `n`. I push each item and pop the smallest whenever the heap grows beyond `k`, so the heap always holds the `k` largest so far. The bigger advantages are memory and streaming: the heap needs only `O(k)` space, and it works when the data arrives one item at a time or is too large to hold in memory, because I can give the current top `k` at any moment. If `k` is close to `n`, or I need everything in order anyway, I would just sort."
:::

:::revise
- A heap gives the smallest item in `O(1)` and push or pop in `O(log n)`.
- Python has only a min-heap. Push negatives for a max-heap.
- K largest: min-heap of size `k`, pop when the size exceeds `k`. Time `O(n log k)`.
- K-way merge: one item per list in the heap, pop and push the next from the same list.
- Running median: a max-heap for the small half and a min-heap for the large half.
- Put tuples in the heap, with the priority first and a tie-breaker second.
:::

# Intervals and greedy

*Sort the intervals first, then make one simple safe choice at each step and never look back.*

## Why it matters

You manage one seminar hall. Many clubs send requests like "10:00 to 11:30" and "11:00 to 12:00". Which requests clash? How many can you accept? How many halls would you need for all of them? These are **interval** problems. An **interval** is a pair `[start, end]`.

Unsorted intervals look messy. Once you **sort** them, each interval only needs to be compared with the one just before it. So the first move is always the same: sort.

**Greedy** means: at every step take the choice that looks best right now, and never undo it. It is fast and simple, but it is only correct for some problems. Interval problems are the most common place where greedy really works.

## How to recognise it

- The input is a list of pairs: meetings, bookings, ranges, start and end times.
- The words "overlap", "merge", "insert", "conflict", "free time", "minimum rooms".
- "Maximum number of events you can attend", "minimum number to remove".
- For general greedy: "maximum" or "minimum" where one simple rule (earliest end, farthest reach, largest first) can be argued to be always safe.

Two intervals `a` and `b` **overlap** when each starts before the other ends: `a.start <= b.end and b.start <= a.end`. After sorting by start, the test is shorter: the next one overlaps the current one if `next.start <= current.end`.

| Problem type | Sort by | Then |
|---|---|---|
| Merge or insert intervals | Start | Extend the last interval, or begin a new one |
| Most non-overlapping, fewest removals | **End** | Keep an interval if it starts after the last kept end |
| Minimum rooms or platforms | Start | Min-heap of end times |

## Template 1: sort by start and merge

```python
def merge_intervals(intervals):
    merged = []
    for start, end in sorted(intervals):      # sorted by start
        if merged and start <= merged[-1][1]: # overlaps the last one
            merged[-1][1] = max(merged[-1][1], end)   # extend it
        else:
            merged.append([start, end])       # a gap: begin a new one
    return merged

print(merge_intervals([[8, 10], [1, 3], [15, 18], [2, 6], [9, 12]]))
# [[1, 6], [8, 12], [15, 18]]
```

:::example Dry run of merge_intervals
After sorting: `[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]`.

| Interval | Compare with last end | Action | merged |
|---|---|---|---|
| [1, 3] | no last | add | [1, 3] |
| [2, 6] | 2 <= 3 | extend to 6 | [1, 6] |
| [8, 10] | 8 > 6 | add | [1, 6], [8, 10] |
| [9, 12] | 9 <= 10 | extend to 12 | [1, 6], [8, 12] |
| [15, 18] | 15 > 12 | add | [1, 6], [8, 12], [15, 18] |
:::

Time is `O(n log n)` for the sort, then one `O(n)` pass. Space is `O(n)` for the output.

:::warn Use max when you extend
Write `max(merged[-1][1], end)`, not just `end`. Take `[1, 10]` and `[2, 3]`. The second interval lies fully inside the first. Setting the end to 3 would cut the merged interval short. Also ask the interviewer whether `[1, 2]` and `[2, 3]` count as overlapping. This decides between `<=` and `<`.
:::

## Template 2: sort by end and keep greedily

Problem: remove the fewest intervals so that the rest do not overlap. This is the same as: **keep as many** non-overlapping intervals as possible.

Greedy rule: always keep the interval that **ends earliest**. Why is it safe? The interval that ends first leaves the most free time for everything after it. If some best answer uses a different first interval, you can swap it for the earliest-ending one and nothing breaks, because it ends no later. This kind of reasoning is called an **exchange argument**, and it is how greedy rules are proved.

```python
def erase_overlap_intervals(intervals):
    kept = 0
    last_end = float("-inf")
    for start, end in sorted(intervals, key=lambda x: x[1]):  # by END
        if start >= last_end:         # does not clash with the last kept
            kept += 1
            last_end = end
    return len(intervals) - kept      # the rest must be removed

print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))   # 1
```

:::example Dry run of erase_overlap_intervals
Sorted by end: `[1, 2], [2, 3], [1, 3], [3, 4]`.

| Interval | start >= last_end ? | Action | last_end |
|---|---|---|---|
| [1, 2] | yes | keep | 2 |
| [2, 3] | 2 >= 2: yes | keep | 3 |
| [1, 3] | 1 >= 3: no | remove | 3 |
| [3, 4] | 3 >= 3: yes | keep | 4 |

Three are kept, so one is removed.
:::

## Template 3: how many rooms at the same time?

Problem: given meeting times, find the minimum number of rooms needed.

Handle meetings in order of start time. Keep a min-heap of the **end times of rooms in use**. The top is the room that becomes free first. If it is free before the new meeting starts, reuse it. If not, open a new room.

```python
import heapq

def min_meeting_rooms(intervals):
    ends = []                         # min-heap: end times of busy rooms
    for start, end in sorted(intervals):
        if ends and ends[0] <= start: # the earliest room is free again
            heapq.heapreplace(ends, end)      # reuse it: pop, then push
        else:
            heapq.heappush(ends, end)         # all busy: one more room
    return len(ends)

print(min_meeting_rooms([[0, 30], [5, 10], [15, 20]]))   # 2
```

For `[0, 30], [5, 10], [15, 20]`: the first meeting opens room 1 (ends at 30). The second starts at 5, and the earliest end is 30, so it needs room 2 (heap: 10, 30). The third starts at 15, and the earliest end is 10, so it reuses that room (heap: 20, 30). The answer is 2. Time `O(n log n)`, space `O(n)`.

## Greedy beyond intervals

Problem (jump game): `nums[i]` is the longest jump you can make from index `i`. Can you reach the last index?

Greedy idea: do not track every path. Track only the **farthest index reachable so far**.

```python
def can_jump(nums):
    reach = 0                         # farthest index we can get to
    for i, step in enumerate(nums):
        if i > reach:
            return False              # we cannot even stand on index i
        reach = max(reach, i + step)
    return True

print(can_jump([2, 3, 1, 1, 4]), can_jump([3, 2, 1, 0, 4]))   # True False
```

In the second input every route gets stuck on index 3, where the jump length is 0: `reach` stays 3 and index 4 is never reachable. Time `O(n)`, space `O(1)`.

:::warn Greedy is not always correct
Greedy fails when a choice that looks best now blocks a better total later. Example: make the amount 11 with coins 1, 5, 6 and 9, using the fewest coins. "Biggest coin first" takes 9 + 1 + 1, which is three coins. The best answer is 5 + 6, two coins. Before you trust a greedy rule, try to break it with a small tricky input, and try to explain why swapping any other choice for the greedy choice cannot hurt. If you cannot, use dynamic programming (Chapter 14).
:::

:::interview To select the maximum number of non-overlapping meetings, why sort by end time and not by start time or by duration?
"Choosing the meeting that ends earliest leaves the most room for the remaining meetings. I can justify it with an exchange argument: take any best schedule, and replace its first meeting with the one that ends earliest overall. That meeting ends no later, so it cannot clash with the rest of the schedule, and the count stays the same. Repeating this shows the greedy schedule is as good as any. Sorting by start time fails when an early meeting is very long and blocks many short ones. Sorting by duration fails when a short meeting sits across the border of two longer meetings that could both be taken. The algorithm is `O(n log n)` for sorting plus one pass."
:::

:::revise
- Always sort intervals first: by start to merge, by end to keep the most.
- After sorting by start, the next interval overlaps if `next.start <= current.end`.
- Extend with `max(current_end, new_end)`, because one interval may contain another.
- Earliest end first keeps the most non-overlapping intervals.
- Minimum rooms: sort by start and keep a min-heap of end times.
- Greedy needs a reason (exchange argument). Test it on a tricky small input.
:::

# Backtracking

*Build the answer one choice at a time, go deeper, and undo the choice when you come back.*

## Why it matters

You are inside a maze. At a junction you pick one path and walk. If it is a dead end, you walk **back** to the junction and try the next path. You do not start again from the entrance. This is **backtracking**: try a choice, explore everything that follows from it, then **undo** the choice and try the next one.

Backtracking is a clean way to write a brute force that tries **every** possibility. It becomes smart with **pruning**: stopping early on a path that can no longer lead to a valid answer, like turning around as soon as you see a wall.

## How to recognise it

- The problem says "**all**", "**every**", "generate", "list all possible".
- Subsets, permutations, combinations, partitions, arrangements.
- Puzzles with rules: N-Queens, Sudoku, word search in a grid.
- The input is **small**: `n` up to about 10 for permutations, about 20 for subsets.
- If the problem asks only for a **count** or a **best value**, think of DP first. If it wants the **actual list** of answers, it is backtracking.

## The template

Every backtracking solution has the same three lines inside a loop: **choose, explore, un-choose**.

```text
def backtrack(state):
    if state is a complete answer:
        save a COPY of the path
        return
    for each choice available now:
        if the choice breaks a rule: skip it       # pruning
        add the choice to the path                 # choose
        backtrack(next state)                      # explore
        remove the choice from the path            # un-choose
```

:::flow One step of backtracking
Choose | add to the path
Explore | recurse deeper
Un-choose | remove from the path
Next choice | loop continues
:::

The calls form a **decision tree**. Each level is one decision and each branch is one choice. Three questions define the whole solution:

| Question | Subsets | Permutations |
|---|---|---|
| What is a complete answer? | Every node of the tree | The path uses all items |
| What choices are left? | Items **after** the last chosen index | Any item that is **not used** yet |
| How do I avoid repeats? | Pass `start = i + 1` | Keep a `used` list |

## Template 1: subsets

A **subset** is any selection of items, where the order does not matter. `[1, 2]` and `[2, 1]` are the same subset. To avoid producing both, we only choose items to the **right** of the last one we took. That is the job of `start`.

```python
def subsets(nums):
    res, path = [], []
    def backtrack(start):
        res.append(path[:])           # every node is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])      # choose
            backtrack(i + 1)          # explore: only items after i
            path.pop()                # un-choose
    backtrack(0)
    return res

print(subsets([1, 2, 3]))
# [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
```

:::example Decision tree of subsets([1, 2, 3])

```text
[]
|-- [1]
|   |-- [1, 2]
|   |   `-- [1, 2, 3]
|   `-- [1, 3]
|-- [2]
|   `-- [2, 3]
`-- [3]
```

Read it top to bottom, exactly as the code runs. After `[1, 2, 3]` is saved, the code pops 3, then pops 2, and the loop moves on to choose 3: that gives `[1, 3]`. There are 8 nodes, which is `2^3`.
:::

Time is `O(n * 2^n)`: there are `2^n` subsets and copying each one costs up to `n`. Extra space is `O(n)` for the path and the recursion.

:::warn Save a copy, and always undo
1. Write `res.append(path[:])`, not `res.append(path)`. `path` is one single list that keeps changing. Without the copy, every saved answer points to the same list, and at the end they are all empty.
2. Every `append` needs its `pop` after the recursive call. If you `return` early between the two, the path stays dirty for the next branch.
:::

## Template 2: permutations

A **permutation** is an ordering. Here `[1, 2]` and `[2, 1]` are different. So at every level we may pick **any** item that is not used yet.

```python
def permute(nums):
    res, path = [], []
    used = [False] * len(nums)
    def backtrack():
        if len(path) == len(nums):    # complete: all items placed
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue              # already in the path
            used[i] = True
            path.append(nums[i])      # choose
            backtrack()               # explore
            path.pop()                # un-choose
            used[i] = False
    backtrack()
    return res

print(permute([1, 2, 3]))
# [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
```

There are `n!` permutations, so time is `O(n * n!)`. For `n = 10` that is already several million answers, which is why `n` is always small.

## Template 3: combinations with pruning

Problem (combination sum): find all combinations of the candidates that add up to `target`. A number may be used many times. All numbers are positive.

Two details matter. To **reuse** a number, recurse with `i` and not `i + 1`. To **prune**, sort the candidates first: as soon as one candidate is bigger than what remains, all later ones are bigger too, so we `break`.

```python
def combination_sum(candidates, target):
    candidates = sorted(candidates)   # sorting makes pruning possible
    res, path = [], []
    def backtrack(start, remaining):
        if remaining == 0:
            res.append(path[:])       # the path adds up to the target
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break                 # prune: later ones are even bigger
            path.append(c)            # choose
            backtrack(i, remaining - c)   # i, not i + 1: reuse allowed
            path.pop()                # un-choose
    backtrack(0, target)
    return res

print(combination_sum([2, 3, 6, 7], 7))   # [[2, 2, 3], [7]]
```

:::example Dry run of combination_sum([2, 3, 6, 7], 7)

| Path | Remaining | What happens |
|---|---|---|
| [2] | 5 | go deeper |
| [2, 2] | 3 | go deeper |
| [2, 2, 2] | 1 | 2 > 1: break, go back |
| [2, 2, 3] | 0 | **save**. Then 6 > 3: break, go back |
| [2, 3] | 2 | 3 > 2: break, go back. Then 6 > 5: break |
| [3] | 4 | go deeper |
| [3, 3] | 1 | 3 > 1: break, go back. Then 6 > 4: break |
| [6] | 1 | 6 > 1: break, go back |
| [7] | 0 | **save** |

Without pruning the tree would keep adding numbers until the sum passes 7 on every branch. The `break` cuts those branches at the first number that is too big.
:::

:::tip Duplicates in the input
If the input has repeated values, such as `[1, 2, 2]`, the plain template produces the same subset twice. Fix: sort the input, and inside the loop add `if i > start and nums[i] == nums[i - 1]: continue`. It skips an equal value at the **same level** of the tree. The check is `i > start`, not `i > 0`, because the first item of each level is always allowed.
:::

## Worked problem: N-Queens

Problem: place `n` queens on an `n x n` chess board so that no two attack each other. Count the ways. A queen attacks along its row, its column and both diagonals.

Place one queen per row, so rows never clash. For columns and diagonals, keep three sets. All squares on one diagonal share the same `row - col`. All squares on the other diagonal share the same `row + col`.

```python
def total_n_queens(n):
    cols, diag1, diag2 = set(), set(), set()
    def place(row):
        if row == n:
            return 1                  # all rows filled: one valid board
        count = 0
        for col in range(n):
            if col in cols or row - col in diag1 or row + col in diag2:
                continue              # prune: this square is attacked
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)      # choose
            count += place(row + 1)   # explore
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)   # un-choose
        return count
    return place(0)

print(total_n_queens(4), total_n_queens(8))   # 2 92
```

The pruning is what makes this fast. Trying every way to put 8 queens on 64 squares is billions of boards. With one queen per row and the three sets, most branches die in the first few rows.

## Costs to remember

| Problem | Number of answers | Time |
|---|---|---|
| Subsets of `n` items | `2^n` | `O(n * 2^n)` |
| Permutations of `n` items | `n!` | `O(n * n!)` |
| Combinations: choose `k` from `n` | `n! / (k! (n-k)!)` | that count times `k` |
| Puzzles (N-Queens, Sudoku) | depends on pruning | exponential in the worst case |

:::interview What is the difference between backtracking and plain recursion, and how do you make backtracking faster?
"Backtracking is recursion that builds a candidate answer step by step and undoes each step after exploring it, so one shared path can be reused for every branch. It explores a decision tree of all possibilities. The main way to speed it up is pruning: I check the rules before going deeper and skip a branch as soon as it cannot lead to a valid answer. For example, in combination sum I sort the candidates and break when a candidate is larger than the remaining target. Other tools are a good order of choices, sets for `O(1)` rule checks as in N-Queens, and skipping equal values at the same level to avoid duplicate answers. If the problem only needs a count or the best value and the subproblems overlap, I switch to dynamic programming."
:::

:::revise
- Three lines in a loop: choose, explore, un-choose.
- Subsets: pass `start = i + 1`. Permutations: use a `used` list. Reuse allowed: pass `i`.
- Save a copy with `path[:]`. Every `append` needs its `pop`.
- Prune early: sort the input and `break` when a choice is already too big.
- Duplicates in the input: sort, then skip `nums[i] == nums[i - 1]` when `i > start`.
- Subsets cost `O(n * 2^n)`, permutations `O(n * n!)`. The input must be small.
:::

# Graphs 1: BFS, DFS and grids

*A graph is things and the connections between them, and BFS and DFS are the two ways to walk through it.*

## Why it matters

A metro map has stations and lines between them. A social app has people and friendships. A course list has subjects and "you must finish this first" rules. All of these are **graphs**. A graph has **nodes** (also called vertices) and **edges** (connections).

- **Undirected** edge: works both ways, like a friendship.
- **Directed** edge: works one way, like "A follows B".
- **Connected component**: a group of nodes that can all reach each other.
- **Cycle**: a path that comes back to where it started.

Many problems do not say "graph" at all. A **grid** is a graph: each cell is a node and its neighbours are the cells up, down, left and right. Words that differ by one letter, or states of a puzzle, are graphs too.

## How to recognise it

| Signal in the problem | Use |
|---|---|
| "Shortest path", "fewest moves", every step costs the same | BFS |
| "Spreads every minute", "distance from the nearest ..." | BFS from many starts at once |
| "Number of islands", "provinces", "groups", "regions" | DFS or BFS from every unvisited node |
| "Is there a path", "can we reach" | DFS or BFS |
| "Is there a cycle" in a directed graph, "deadlock" | DFS with three colours |

## Storing a graph

Problems usually give a list of edges like `[[0, 1], [0, 2]]`. Turn it into an **adjacency list**: for each node, the list of its neighbours.

```python
from collections import deque

def build_graph(n, edges, directed=False):
    graph = {i: [] for i in range(n)}     # node -> list of neighbours
    for a, b in edges:
        graph[a].append(b)
        if not directed:
            graph[b].append(a)            # undirected: add both ways
    return graph
```

## Template 1: BFS for the fewest steps

Drop a stone in a pond. The wave reaches everything at distance 1 first, then distance 2, then 3. **BFS** moves the same way, using a queue. So the **first time** BFS reaches a node, it has found the shortest way there (when every edge costs the same).

```python
def bfs_distances(graph, start):
    dist = {start: 0}                 # also works as the visited set
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in graph[node]:
            if nxt not in dist:       # first visit = shortest distance
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist

edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [5, 6]]
graph = build_graph(7, edges)
print(bfs_distances(graph, 0))        # {0: 0, 1: 1, 2: 1, 3: 2, 4: 3}
```

:::example Dry run of bfs_distances from node 0

| Popped | Neighbours | Newly reached | Queue after |
|---|---|---|---|
| 0 | 1, 2 | 1 and 2 at distance 1 | 1, 2 |
| 1 | 0, 3 | 3 at distance 2 | 2, 3 |
| 2 | 0, 3 | none (3 is already known) | 3 |
| 3 | 1, 2, 4 | 4 at distance 3 | 4 |
| 4 | 3 | none | empty |

Nodes 5 and 6 are never reached. They are in a different connected component.
:::

Time is `O(V + E)` where `V` is the number of nodes and `E` the number of edges: each node enters the queue once and each edge is looked at a constant number of times. Space is `O(V)`.

:::warn Mark a node as visited when you add it to the queue
Mark it at the moment you **push**, not when you pop. If you wait until the pop, the same node can be pushed many times by different neighbours before it is handled. The answer may still be right, but the queue can grow very large and the solution becomes slow.
:::

## Template 2: DFS and connected components

**DFS** goes as deep as it can along one path and comes back only at a dead end. One DFS from a node visits its **whole component**. So to count components: loop over all nodes, and each time you find an unvisited node, count one and run a DFS from it.

```python
def count_components(n, edges):
    graph = build_graph(n, edges)
    seen = set()
    def dfs(node):
        seen.add(node)
        for nxt in graph[node]:
            if nxt not in seen:
                dfs(nxt)
    count = 0
    for node in range(n):
        if node not in seen:          # a node no earlier DFS could reach
            count += 1
            dfs(node)                 # mark its whole component
    return count

print(count_components(7, edges))     # 2   ({0,1,2,3,4} and {5,6})
```

Time `O(V + E)`, space `O(V)`.

## Template 3: grids

In a grid there is no adjacency list to build. The neighbours of `(r, c)` are found with four direction pairs, and each one must be checked against the border.

Problem (number of islands): `"1"` is land and `"0"` is water. Count the groups of land connected up, down, left or right. It is "count the components" on a grid. This version uses a stack instead of recursion, so a big grid cannot hit the recursion limit.

```python
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))     # down, up, right, left

def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1" or (r, c) in seen:
                continue
            count += 1                # new island: flood all of it
            stack = [(r, c)]
            seen.add((r, c))
            while stack:
                cr, cc = stack.pop()
                for dr, dc in DIRS:
                    nr, nc = cr + dr, cc + dc
                    if (0 <= nr < rows and 0 <= nc < cols
                            and grid[nr][nc] == "1"
                            and (nr, nc) not in seen):
                        seen.add((nr, nc))
                        stack.append((nr, nc))
    return count

print(num_islands(["11000", "11000", "00100", "00011"]))   # 3
```

Time and space are `O(rows * cols)`.

### Worked problem: rotting oranges (BFS from many starts)

Problem: `2` is a rotten orange, `1` is fresh, `0` is empty. Every minute a rotten orange rots its four neighbours. How many minutes until no fresh orange is left? Return -1 if that never happens.

All rotten oranges spread **at the same time**. So put **all of them** in the queue before starting. This is called **multi-source BFS**. Each round of the queue is one minute.

```python
def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))  # every rotten orange is a start
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        minutes += 1
        for _ in range(len(queue)):   # one full round = one minute
            r, c = queue.popleft()
            for dr, dc in DIRS:
                nr, nc = r + dr, c + dc
                if (0 <= nr < rows and 0 <= nc < cols
                        and grid[nr][nc] == 1):
                    grid[nr][nc] = 2  # rot it: this also marks it visited
                    fresh -= 1
                    queue.append((nr, nc))
    return minutes if fresh == 0 else -1

print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))   # 4
```

:::example Dry run of oranges_rotting
The grid, with the minute at which each cell rots (`R` = rotten at the start, `.` = empty):

```text
grid          rots at minute
2 1 1         R 1 2
1 1 0         1 2 .
0 1 1         . 3 4
```

| Minute | Cells that rot | fresh left |
|---|---|---|
| start | (0,0) is rotten | 6 |
| 1 | (0,1) and (1,0) | 4 |
| 2 | (0,2) and (1,1) | 2 |
| 3 | (2,1) | 1 |
| 4 | (2,2) | 0 |

`fresh` is 0 after minute 4, so the answer is 4.
:::

## Template 4: cycle detection with three colours

In a **directed** graph, a plain "visited" set is not enough to find a cycle. Reaching a visited node again may just mean there are two different roads to it. We need to know if the node is on the path we are walking **right now**. So each node gets one of three colours.

| Colour | Meaning |
|---|---|
| White | Not visited yet |
| Grey | Being explored: it is on the current DFS path |
| Black | Completely finished: everything below it is explored |

An edge to a **grey** node means we came back to our own path. That is a cycle. An edge to a **black** node is harmless.

```python
WHITE, GREY, BLACK = 0, 1, 2

def has_cycle_directed(n, edges):
    graph = build_graph(n, edges, directed=True)
    colour = [WHITE] * n
    def dfs(node):
        colour[node] = GREY           # entering: now on the current path
        for nxt in graph[node]:
            if colour[nxt] == GREY:
                return True           # back to our own path: a cycle
            if colour[nxt] == WHITE and dfs(nxt):
                return True
        colour[node] = BLACK          # leaving: fully explored
        return False
    return any(colour[i] == WHITE and dfs(i) for i in range(n))

print(has_cycle_directed(4, [[0, 1], [0, 2], [1, 3], [2, 3]]))   # False
print(has_cycle_directed(4, [[0, 1], [1, 2], [2, 3], [3, 1]]))   # True
```

:::example Dry run of graph A (no cycle)
The edges are `0 -> 1 -> 3` and `0 -> 2 -> 3`. Two roads lead to node 3.

| Step | Event | Grey nodes (current path) | Black nodes |
|---|---|---|---|
| 1 | enter 0, 1, 3 | 0, 1, 3 | none |
| 2 | 3 has no edges, finish 3, then 1 | 0 | 3, 1 |
| 3 | enter 2, edge 2 -> 3 | 0, 2 | 3, 1 |
| 4 | 3 is black: fine. Finish 2, then 0 | none | all |

No cycle. A plain visited set would wrongly shout "cycle" at step 3.
:::

:::example Dry run of graph B (cycle)
The edges are `0 -> 1 -> 2 -> 3 -> 1`. DFS enters 0, 1, 2, 3 and all four are grey. The edge `3 -> 1` points to a **grey** node, so there is a cycle: `1 -> 2 -> 3 -> 1`.
:::

Time `O(V + E)`, space `O(V)`.

:::note Cycles in an undirected graph
In an undirected graph every edge appears in both directions, so the neighbour you just came from is always "visited". Pass the **parent** into the DFS and ignore it. Any other visited neighbour means a cycle. Union-find (next chapter) is another easy way.
:::

:::interview Why does BFS give the shortest path in an unweighted graph, and why does DFS not?
"BFS explores in layers. It first visits every node one edge away from the start, then every node two edges away, and so on, because the queue is first in, first out. So the first time a node is reached, it is reached with the smallest possible number of edges. DFS follows one path as deep as it can, so it may reach a node through a long detour before it tries the short route. DFS can tell me that a path exists, but not that it is the shortest. Both are `O(V + E)`. If the edges have different weights, BFS no longer works and I use Dijkstra's algorithm."
:::

:::revise
- Build an adjacency list from the edge list. A grid is a graph with four neighbours per cell.
- BFS uses a queue and gives the fewest steps when all edges cost the same.
- Mark nodes visited when you push them, not when you pop them.
- Count components: start a DFS or BFS from every node that is still unvisited.
- Many starts spreading together: put them all in the queue first (multi-source BFS).
- Directed cycle: white, grey, black. An edge to a grey node is a cycle.
:::

# Graphs 2: topological sort, Dijkstra and union-find

*Three tools for three questions: in what order, at what cost, and in which group.*

## Why it matters

BFS and DFS answer "can I reach it?" and "in how many steps?". Real problems ask more.

- You must wear socks before shoes and a shirt before a tie. **In what order** can you get dressed? This is **topological sort**.
- A maps app knows that every road takes a different time. **What is the fastest route?** This is **Dijkstra's algorithm**.
- Friend requests keep getting accepted, and groups of friends merge. **Are these two people in the same group now?** This is **union-find**.

## How to recognise it

| Signal in the problem | Tool | Time |
|---|---|---|
| "Prerequisites", "depends on", "build order", "before" | Topological sort (Kahn) | `O(V + E)` |
| "Can all tasks be finished?" (a cycle check in a directed graph) | Topological sort (Kahn) | `O(V + E)` |
| "Cheapest", "fastest", "minimum cost path", edges with weights | Dijkstra | `O(E log V)` |
| "Connect", "merge groups", "same group?", edges arrive one by one | Union-find | almost `O(1)` per call |
| "Redundant edge", "cycle in an undirected graph", "minimum spanning tree" | Union-find | almost `O(1)` per call |

## Template 1: topological sort with Kahn's algorithm

A **topological order** lists the nodes of a directed graph so that every edge points **forward**: if there is an edge `a -> b`, then `a` comes before `b`. It exists only when the graph has **no cycle**. Such a graph is called a **DAG** (directed acyclic graph).

The **in-degree** of a node is the number of edges coming into it. For a course, it is the number of prerequisites not yet finished. Kahn's idea is what a student does naturally:

1. Take every course with in-degree 0 (nothing blocks it).
2. Finish it, and reduce the in-degree of every course that depended on it.
3. Any course that drops to 0 is now free. Add it to the queue.

```python
from collections import deque

def find_order(n, prerequisites):
    graph = {i: [] for i in range(n)}
    indegree = [0] * n
    for course, before in prerequisites:
        graph[before].append(course)  # edge: before -> course
        indegree[course] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)            # nothing blocks it: take it
        for nxt in graph[node]:
            indegree[nxt] -= 1        # one prerequisite less
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []   # [] means there is a cycle

pre = [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3], [2, 5]]
print(find_order(6, pre))             # [0, 5, 1, 2, 3, 4]
```

`[1, 0]` means "course 1 needs course 0 first". Time `O(V + E)`, space `O(V + E)`.

:::example Dry run of find_order(6, pre)
Edges: `0 -> 1`, `0 -> 2`, `1 -> 3`, `2 -> 3`, `3 -> 4`, `5 -> 2`. Starting in-degrees: course 0 and 5 have 0, course 1 has 1, course 2 has 2, course 3 has 2, course 4 has 1.

| Popped | In-degrees that drop | Queue after | order |
|---|---|---|---|
| 0 | 1 becomes 0, 2 becomes 1 | 5, 1 | 0 |
| 5 | 2 becomes 0 | 1, 2 | 0, 5 |
| 1 | 3 becomes 1 | 2 | 0, 5, 1 |
| 2 | 3 becomes 0 | 3 | 0, 5, 1, 2 |
| 3 | 4 becomes 0 | 4 | 0, 5, 1, 2, 3 |
| 4 | none | empty | 0, 5, 1, 2, 3, 4 |

All 6 courses are in the order, so there is no cycle.
:::

:::tip Kahn's algorithm is also a cycle detector
Nodes on a cycle wait for each other, so their in-degree never reaches 0 and they never enter the queue. If the order is shorter than `n`, the graph has a cycle. That is the full solution of "can you finish all courses?".
:::

## Template 2: Dijkstra's algorithm

When edges have different **weights** (cost, time, distance), the path with the fewest edges is not always the cheapest. BFS fails. **Dijkstra** fixes it with one change: instead of a plain queue, use a **min-heap** ordered by distance. Always expand the node that is **closest to the start** among those not finished.

Why is that safe? If all weights are zero or positive, the closest unfinished node cannot get any closer later, because every other route to it must pass through a node that is already farther away.

```python
import heapq

def dijkstra(n, edges, start):
    graph = {i: [] for i in range(n)}
    for u, v, w in edges:
        graph[u].append((v, w))       # directed edge u -> v with weight w
    dist = {start: 0}                 # best distance known so far
    heap = [(0, start)]               # (distance, node)
    while heap:
        d, node = heapq.heappop(heap) # closest unfinished node
        if d > dist[node]:
            continue                  # an old, worse entry: skip it
        for nxt, w in graph[node]:
            new_d = d + w
            if new_d < dist.get(nxt, float("inf")):
                dist[nxt] = new_d     # found a cheaper way to nxt
                heapq.heappush(heap, (new_d, nxt))
    return dist

roads = [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5)]
print(dijkstra(4, roads, 0))          # {0: 0, 1: 3, 2: 1, 3: 4}
```

:::example Dry run of dijkstra(4, roads, 0)

| Popped (dist, node) | Edges checked | Heap after | dist |
|---|---|---|---|
| (0, 0) | to 1: 4, to 2: 1 | (1, 2), (4, 1) | 1: 4, 2: 1 |
| (1, 2) | to 1: 1 + 2 = 3, better. To 3: 6 | (3, 1), (4, 1), (6, 3) | 1: 3, 3: 6 |
| (3, 1) | to 3: 3 + 1 = 4, better | (4, 1), (4, 3), (6, 3) | 3: 4 |
| (4, 1) | old entry: 4 > 3, skip | (4, 3), (6, 3) | |
| (4, 3) | no edges | (6, 3) | |
| (6, 3) | old entry: 6 > 4, skip | empty | |

The direct road `0 -> 1` costs 4, but going through node 2 costs only 3. The final distances are `{0: 0, 1: 3, 2: 1, 3: 4}`.
:::

The heap can hold several entries for the same node. We do not remove the old ones. We simply skip them when they come out. Time is `O(E log V)` because each edge may push one heap entry. Space is `O(V + E)`.

:::warn Dijkstra does not work with negative weights
Dijkstra assumes that once a node comes out of the heap, its distance is final. A negative edge found later could make it cheaper, and the algorithm would never notice. With negative weights use the Bellman-Ford algorithm. Also remember: if all weights are equal, plain BFS is simpler and faster.
:::

| Graph | Shortest path tool | Time |
|---|---|---|
| No weights, or all weights equal | BFS | `O(V + E)` |
| Weights zero or positive | Dijkstra with a heap | `O(E log V)` |
| Some negative weights | Bellman-Ford | `O(V * E)` |
| Directed graph without cycles | Topological order, then relax edges | `O(V + E)` |

## Template 3: union-find

**Union-find** (also called **disjoint set union**, DSU) keeps track of groups. It has only two operations:

- `find(x)`: which group is `x` in? It returns the group's **leader** (root).
- `union(a, b)`: merge the group of `a` with the group of `b`.

Every item points to a **parent**. Following parents leads to the leader, who points to itself. Two tricks keep these chains very short:

- **Path compression:** while finding the leader, make every node on the way point **directly** to the leader. The next `find` is one step.
- **Union by rank:** when merging, hang the **shorter** tree under the taller one, so trees do not grow tall. The **rank** is a rough measure of a tree's height.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))  # everyone is their own leader
        self.rank = [0] * n
        self.count = n                # number of groups

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False              # already in the same group
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra           # make ra the taller tree
        self.parent[rb] = ra          # union by rank: short under tall
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.count -= 1
        return True
```

With both tricks, each operation takes almost constant time. The exact bound is `O(α(n))`, where `α` is a function that grows so slowly that it stays below 5 for any input you will ever see. Space is `O(n)`.

:::example Dry run with 5 items (0 to 4)

| Call | Leaders found | What changes | parent list | Groups |
|---|---|---|---|---|
| start | | | [0, 1, 2, 3, 4] | 5 |
| union(0, 1) | 0 and 1 | 1 goes under 0, rank of 0 is 1 | [0, 0, 2, 3, 4] | 4 |
| union(2, 3) | 2 and 3 | 3 goes under 2, rank of 2 is 1 | [0, 0, 2, 2, 4] | 3 |
| union(1, 3) | 0 and 2 | 2 goes under 0, rank of 0 is 2 | [0, 0, 0, 2, 4] | 2 |
| union(0, 3) | 0 and 0 | same group: returns False | [0, 0, 0, 0, 4] | 2 |

In the last call, `find(3)` walks `3 -> 2 -> 0`. Path compression then makes 3 point straight to 0. That is why the parent list changes even though no merge happened.
:::

### Worked problem: the redundant connection

Problem: a graph started as a tree (connected, no cycle) with nodes `1..n`. One extra edge was added. Find it.

Add the edges one by one. If the two ends of an edge are **already in the same group**, this edge closes a cycle. `union` returns `False` exactly in that case.

```python
def find_redundant_connection(edges):
    uf = UnionFind(len(edges) + 1)    # nodes are numbered from 1
    for a, b in edges:
        if not uf.union(a, b):
            return [a, b]             # a and b were already connected
    return []

print(find_redundant_connection([[1, 2], [1, 3], [2, 3]]))   # [2, 3]
```

The same class counts connected components (read `uf.count` after all unions) and builds a minimum spanning tree with **Kruskal's algorithm**: sort the edges by weight and keep every edge whose `union` returns `True`.

:::interview What is the difference between BFS and Dijkstra's algorithm, and what is Dijkstra's time complexity?
"Both find shortest paths from one start node. BFS uses a normal queue and is correct only when every edge has the same cost, because then nodes come out of the queue in order of distance. Dijkstra handles different non-negative weights by using a min-heap ordered by the distance so far, so it always expands the closest unfinished node. When a node comes out with a distance larger than the best one I already recorded, I skip it as an old entry. With an adjacency list and a binary heap the time is `O(E log V)` and the space is `O(V + E)`. It is not correct with negative edge weights. For those I would use Bellman-Ford."
:::

:::revise
- Topological sort (Kahn): start with in-degree 0 nodes, remove them, and lower their neighbours' in-degrees.
- If the topological order has fewer than `n` nodes, the directed graph has a cycle.
- Dijkstra is BFS with a min-heap of `(distance, node)`. Skip old heap entries.
- Dijkstra needs weights that are zero or positive. Time `O(E log V)`.
- Union-find: `find` with path compression, `union` by rank, almost `O(1)` per call.
- `union` returning False means the two nodes were already connected: a cycle.
:::

# Dynamic programming 1: the method and 1D problems

*Write down what a subproblem means, how it depends on smaller ones, and fill a table: DP is a method, not a trick.*

## Why it matters

You are counting the notes in a thick bundle. Someone interrupts you. If you wrote "310 so far" on a slip of paper, you continue from 310. If you did not, you start again from zero. **Dynamic programming (DP)** is the habit of writing the slip: solve every small problem **once**, store the answer, and reuse it.

DP has a scary name, but every DP solution is built with the same five steps. Once you can do the steps on easy problems, the hard ones are the same steps with a bigger table.

## How to recognise it

- The question asks "**how many ways**", "**minimum** cost", "**maximum** value", "**longest**", or "**is it possible**".
- At each step you make a **choice** (take or skip, 1 step or 2 steps, which coin).
- The brute force is a recursion that solves the **same subproblem many times**. These are called **overlapping subproblems**.
- A greedy rule fails on some small example.
- The problem wants a count or a best value, not the list of all solutions (that would be backtracking).

## The five-step method

:::flow The five steps of every DP solution
State | what does dp[i] mean?
Choice | what can I do here?
Recurrence | dp[i] from smaller states
Base case | the smallest answers
Order | which way to fill, where the answer is
:::

1. **State.** Say in one sentence what `dp[i]` means. For example: "`dp[i]` is the number of ways to reach step `i`." This sentence is half of the solution.
2. **Choice.** List what you can do at one step. These become the options inside `min`, `max` or a sum.
3. **Recurrence.** Write `dp[i]` using smaller states. This is the formula.
4. **Base case.** Fill the smallest states by hand, where the formula cannot be used.
5. **Order.** Fill the table so that everything a state needs is already filled. Say which cell holds the final answer.

:::tip How to find the state
Write the brute-force recursion first. The **arguments that change** between calls are the state. One changing argument gives a 1D table. Two give a 2D table (next chapter).
:::

## Problem 1: climbing stairs

Problem: a staircase has `n` steps. You climb 1 or 2 steps at a time. In how many different ways can you reach the top?

| Step | Answer for this problem |
|---|---|
| State | `dp[i]` = number of ways to stand on step `i` |
| Choice | The last move was a 1-step or a 2-step |
| Recurrence | `dp[i] = dp[i - 1] + dp[i - 2]` |
| Base case | `dp[0] = 1` (do nothing), `dp[1] = 1` |
| Order | `i` from 2 up to `n`. The answer is `dp[n]` |

The same solution can be written in three ways. Learn to move between them.

```python
from functools import lru_cache

def climb_memo(n):                    # top-down: recursion + a cache
    @lru_cache(maxsize=None)          # remembers the answer for each i
    def ways(i):
        if i <= 1:
            return 1                  # base cases
        return ways(i - 1) + ways(i - 2)
    return ways(n)

def climb_table(n):                   # bottom-up: fill a table
    dp = [1] * (n + 1)                # dp[0] = dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

def climb_stairs(n):                  # bottom-up with O(1) space
    prev, cur = 1, 1                  # dp[i - 2], dp[i - 1]
    for _ in range(2, n + 1):
        prev, cur = cur, prev + cur   # only the last two are needed
    return cur

print(climb_memo(6), climb_table(6), climb_stairs(6))   # 13 13 13
```

:::example The table for n = 6

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| dp[i] | 1 | 1 | 2 | 3 | 5 | 8 | 13 |

`dp[4] = dp[3] + dp[2] = 3 + 2 = 5`. Each cell is the sum of the two cells on its left. Without the cache, the recursion would compute `ways(2)` five times for `n = 6`, and the waste grows very fast as `n` grows.
:::

**Memoization** (top-down) means caching the results of a recursive function. **Tabulation** (bottom-up) means filling a table with loops. All three versions take `O(n)` time. The first two use `O(n)` space and the last one `O(1)`.

## Problem 2: house robber

Problem: houses stand in a row, each with some money. You cannot rob two houses next to each other. What is the most you can take?

| Step | Answer for this problem |
|---|---|
| State | `dp[i]` = most money from the first `i` houses |
| Choice | Skip house `i`, or rob it |
| Recurrence | `dp[i] = max(dp[i - 1], dp[i - 2] + money of house i)` |
| Base case | `dp[0] = 0` (no houses) |
| Order | Left to right. The answer is the last cell |

If you rob house `i`, you cannot use house `i - 1`, so you add to the best of the houses before that: `dp[i - 2]`. Again only the last two cells are needed.

```python
def rob(nums):
    prev2, prev1 = 0, 0               # dp[i - 2], dp[i - 1]
    for money in nums:
        # skip this house (prev1) or rob it (prev2 + money)
        prev2, prev1 = prev1, max(prev1, prev2 + money)
    return prev1

print(rob([5, 1, 1, 5, 10, 2]))       # 16
```

:::example Dry run of rob([5, 1, 1, 5, 10, 2])

| House money | Skip it | Rob it | Best so far |
|---|---|---|---|
| 5 | 0 | 0 + 5 = 5 | 5 |
| 1 | 5 | 0 + 1 = 1 | 5 |
| 1 | 5 | 5 + 1 = 6 | 6 |
| 5 | 6 | 5 + 5 = 10 | 10 |
| 10 | 10 | 6 + 10 = 16 | 16 |
| 2 | 16 | 10 + 2 = 12 | 16 |

The answer is 16: rob the houses with 5, 1 and 10. "Rob it" always adds to the best from **two rows above**.
:::

Time `O(n)`, space `O(1)`.

## Problem 3: coin change

Problem: you have coins of some values and may use each as many times as you like. What is the smallest number of coins that adds up to `amount`? Return -1 if it is impossible.

| Step | Answer for this problem |
|---|---|
| State | `dp[a]` = fewest coins that make the amount `a` |
| Choice | Which coin `c` is the **last** coin used |
| Recurrence | `dp[a] = 1 + min(dp[a - c])` over all coins `c <= a` |
| Base case | `dp[0] = 0`. Everything else starts at infinity ("not possible yet") |
| Order | `a` from 1 up to `amount`. The answer is `dp[amount]` |

```python
def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount         # dp[0] = 0, the rest unknown
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:                # coin c can be the last coin
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1

print(coin_change([1, 2, 5], 11))     # 3   (5 + 5 + 1)
```

:::example The table for coin_change([1, 2, 5], 11)

| a | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dp[a] | 0 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 3 | 3 | 2 | 3 |

Take `a = 11`. The last coin can be 1, 2 or 5:

- last coin 1: `dp[10] + 1 = 3`
- last coin 2: `dp[9] + 1 = 4`
- last coin 5: `dp[6] + 1 = 3`

The smallest is 3, so `dp[11] = 3`.
:::

Time is `O(amount * number of coins)` and space is `O(amount)`.

:::warn Three classic DP bugs
1. **Wrong start value.** For a minimum, unknown cells must start at infinity, not 0. Otherwise `min` always picks the fake 0. For a maximum or a count, 0 is usually right.
2. **Missing base case.** `dp[0] = 0` here means "zero coins make amount zero". Without it, nothing can be built.
3. **Forgetting "impossible".** If `dp[amount]` is still infinity, no combination works. Return -1, do not return infinity.
:::

## Problem 4: longest increasing subsequence

A **subsequence** keeps the order of the items but may skip some. Problem: find the length of the longest subsequence in which every number is bigger than the one before it (LIS).

| Step | Answer for this problem |
|---|---|
| State | `dp[i]` = length of the longest increasing subsequence that **ends at index i** |
| Choice | Which earlier index `j` comes just before `i` |
| Recurrence | `dp[i] = 1 + max(dp[j])` over all `j < i` with `nums[j] < nums[i]` |
| Base case | Every `dp[i]` starts at 1 (the item alone) |
| Order | Left to right. The answer is the **largest** cell, not the last one |

```python
from bisect import bisect_left

def length_of_lis(nums):              # O(n^2) time, O(n) space
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:     # nums[i] can come after nums[j]
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)

def length_of_lis_fast(nums):         # O(n log n) time, O(n) space
    tails = []        # tails[k] = smallest end of a subsequence of size k+1
    for x in nums:
        i = bisect_left(tails, x)     # first tail that is >= x
        if i == len(tails):
            tails.append(x)           # x extends the longest one
        else:
            tails[i] = x              # x is a smaller, better tail
    return len(tails)

nums = [10, 9, 2, 5, 3, 7, 101, 18]
print(length_of_lis(nums), length_of_lis_fast(nums))    # 4 4
```

:::example The O(n²) table for [10, 9, 2, 5, 3, 7, 101, 18]

| nums[i] | 10 | 9 | 2 | 5 | 3 | 7 | 101 | 18 |
|---|---|---|---|---|---|---|---|---|
| dp[i] | 1 | 1 | 1 | 2 | 2 | 3 | 4 | 4 |

For 7, the smaller items before it are 2, 5 and 3, with `dp` values 1, 2 and 2. So `dp = 2 + 1 = 3`.
:::

:::example Dry run of the fast version

| x | Action | tails |
|---|---|---|
| 10 | append | 10 |
| 9 | replace 10 | 9 |
| 2 | replace 9 | 2 |
| 5 | append | 2, 5 |
| 3 | replace 5 | 2, 3 |
| 7 | append | 2, 3, 7 |
| 101 | append | 2, 3, 7, 101 |
| 18 | replace 101 | 2, 3, 7, 18 |

The length of `tails` is 4. One longest subsequence is `2, 3, 7, 18`.
:::

The fast version is binary search (Chapter 5) inside DP. A smaller tail is always better, because more numbers can be placed after it. `tails` is not always a real subsequence of the input, but its **length** is always correct.

:::interview What is the difference between memoization and tabulation? Which one do you prefer?
"Both are dynamic programming and both solve each subproblem once. Memoization is top-down: I write the natural recursion and cache each result, so only the states that are really needed get computed. It is the easiest to write from a brute-force solution, but it uses the call stack and can hit the recursion limit on large inputs. Tabulation is bottom-up: I fill a table with loops, starting from the base cases. It has no recursion overhead and makes space optimisation easy, for example keeping only the last two values. The cost is that I must work out the correct fill order myself. In an interview I usually start with the recursion and memoization to get the recurrence right, then convert it to a table if the interviewer asks for better space."
:::

:::revise
- Five steps: state, choice, recurrence, base case, order (and where the answer is).
- The state is the set of arguments that change in the brute-force recursion.
- Climbing stairs: `dp[i] = dp[i - 1] + dp[i - 2]`. House robber: `max(skip, rob + dp[i - 2])`.
- Coin change: `dp[a] = 1 + min(dp[a - c])`, start with infinity, `dp[0] = 0`.
- LIS: `dp[i]` ends at index `i`. The answer is the largest cell. `O(n log n)` with `tails`.
- If only the last one or two cells are used, keep variables instead of a table.
:::

# Dynamic programming 2: grids, strings and knapsack

*When two things change at once, the table gets two dimensions, and every cell is built from its neighbours.*

## Why it matters

Think of a spreadsheet. A cell holds a formula like "the cell above plus the cell on the left". Fill the first row and the first column by hand, then drag the formula across, and the whole sheet fills itself. **2D dynamic programming** is exactly this: a table where each cell is computed from a few neighbouring cells that are already filled.

The five steps from the last chapter stay the same. Only the state changes: it now has **two** numbers, such as "row and column", "position in string A and position in string B", or "item number and remaining capacity".

## How to recognise it

| Signal in the problem | State | Family |
|---|---|---|
| A grid, moving only right or down, count paths or find the cheapest | `dp[r][c]` = answer for reaching cell `(r, c)` | Grid DP |
| Two strings: common subsequence, edit, match | `dp[i][j]` = answer for the first `i` and first `j` characters | String DP |
| Items with weight and value, a capacity, each item once | `dp[i][c]` = best with the first `i` items and capacity `c` | 0/1 knapsack |
| Same, but an item can be used any number of times | `dp[c]` filled forwards | Unbounded knapsack |
| "Can we split into two equal parts", "reach this target sum" | `dp[s]` = is the sum `s` possible | Subset sum (0/1) |

## Grid DP

Problem (unique paths): a robot starts at the top-left cell of an `m x n` grid and may move only right or down. How many paths lead to the bottom-right cell?

- **State:** `dp[r][c]` = number of paths to cell `(r, c)`.
- **Choice:** the last move came from above or from the left.
- **Recurrence:** `dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`.
- **Base case:** the first row and the first column are all 1 (only one straight path).
- **Order:** row by row, left to right. The answer is the last cell.

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]  # first row and column stay 1
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # above + left
    return dp[m - 1][n - 1]

print(unique_paths(3, 4))             # 10
```

:::example The table for unique_paths(3, 4)

| | c = 0 | c = 1 | c = 2 | c = 3 |
|---|---|---|---|---|
| r = 0 | 1 | 1 | 1 | 1 |
| r = 1 | 1 | 2 | 3 | 4 |
| r = 2 | 1 | 3 | 6 | 10 |

The cell `(2, 2)` is `3 + 3 = 6`: three paths arrive from above and three from the left. The answer is the bottom-right cell, 10.
:::

The "cheapest path" version (minimum path sum) only swaps the sum for a minimum: `dp[r][c] = cost of the cell + min(above, left)`. Grid DP takes `O(m * n)` time and space.

## String DP: longest common subsequence

Problem: find the length of the longest subsequence that appears in both strings (LCS). For `"abcde"` and `"ace"` the answer is 3 (`"ace"`).

- **State:** `dp[i][j]` = LCS length of the first `i` characters of `a` and the first `j` characters of `b`.
- **Choice:** look at the last characters, `a[i - 1]` and `b[j - 1]`.
- **Recurrence:** if they are **equal**, use both: `dp[i - 1][j - 1] + 1`. If not, drop one of them and take the better result: `max(dp[i - 1][j], dp[i][j - 1])`.
- **Base case:** row 0 and column 0 are 0 (an empty string has nothing in common).

```python
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]     # extra row and column
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1    # match: diagonal + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

print(lcs("abcde", "ace"))            # 3
```

:::example The table for lcs("abcde", "ace")
Rows are the characters of `a`, columns are the characters of `b`. `""` is the empty prefix.

| | "" | a | c | e |
|---|---|---|---|---|
| "" | 0 | 0 | 0 | 0 |
| a | 0 | 1 | 1 | 1 |
| b | 0 | 1 | 1 | 1 |
| c | 0 | 1 | 2 | 2 |
| d | 0 | 1 | 2 | 2 |
| e | 0 | 1 | 2 | 3 |

- Row `c`, column `c`: the characters match. Take the diagonal cell (row `b`, column `a`), which is 1, and add 1. Result 2.
- Row `d`, column `e`: no match. Take the bigger of the cell above (2) and the cell on the left (2). Result 2.
- The answer is the bottom-right cell, 3.
:::

Time and space are `O(m * n)`.

:::warn The table is one bigger than the strings
`dp` has `m + 1` rows and `n + 1` columns, because row 0 and column 0 stand for the **empty prefix**. So `dp[i][j]` talks about the characters `a[i - 1]` and `b[j - 1]`. Mixing up `i` and `i - 1` is the most common bug in string DP. Write the meaning of `dp[i][j]` as a comment before you code.
:::

## String DP: edit distance

Problem: find the smallest number of operations to turn `word1` into `word2`. One operation inserts, deletes or replaces one character.

- **State:** `dp[i][j]` = operations to turn the first `i` characters of `word1` into the first `j` characters of `word2`.
- **Recurrence:** if the last characters match, nothing to do: `dp[i - 1][j - 1]`. If not, `1 +` the smallest of three choices.
- **Base case:** `dp[i][0] = i` (delete everything) and `dp[0][j] = j` (insert everything).

| Choice | Cell used | Meaning |
|---|---|---|
| Delete | `dp[i - 1][j]` (above) | Remove the last character of `word1` |
| Insert | `dp[i][j - 1]` (left) | Add the last character of `word2` |
| Replace | `dp[i - 1][j - 1]` (diagonal) | Change one character into the other |

```python
def edit_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                  # delete i characters
    for j in range(n + 1):
        dp[0][j] = j                  # insert j characters
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]          # match: free
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],     # delete
                                   dp[i][j - 1],     # insert
                                   dp[i - 1][j - 1]) # replace
    return dp[m][n]

print(edit_distance("horse", "ros"))  # 3
```

:::example The table for edit_distance("horse", "ros")

| | "" | r | o | s |
|---|---|---|---|---|
| "" | 0 | 1 | 2 | 3 |
| h | 1 | 1 | 2 | 3 |
| o | 2 | 2 | 1 | 2 |
| r | 3 | 2 | 2 | 2 |
| s | 4 | 3 | 3 | 2 |
| e | 5 | 4 | 4 | 3 |

- Row `h`, column `r`: no match. `1 + min(1, 1, 0) = 1`, using the diagonal: replace `h` with `r`.
- Row `o`, column `o`: match. Copy the diagonal cell: 1.
- Row `e`, column `s`: no match. `1 + min(2, 4, 3) = 3`, using the cell above: delete `e`.

The answer is 3: `horse -> rorse` (replace), `rorse -> rose` (delete), `rose -> ros` (delete).
:::

Time and space are `O(m * n)`.

## 0/1 knapsack

Problem: you have a bag that carries at most `capacity` kilograms and a list of items, each with a weight and a value. Each item can be taken **once or not at all** (that is the "0/1"). Find the largest total value.

- **State:** `dp[i][c]` = best value using the first `i` items with capacity `c`.
- **Choice:** skip item `i`, or take it (if it fits).
- **Recurrence:** `dp[i][c] = max(dp[i - 1][c], dp[i - 1][c - w] + v)`.
- **Base case:** row 0 is all 0 (no items, no value).

:::example The table for weights [1, 3, 4, 5], values [1, 4, 5, 7], capacity 7
Each row adds one item. Columns are the capacity `c`.

| Items used | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| none | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| + (w 1, v 1) | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| + (w 3, v 4) | 0 | 1 | 1 | 4 | 5 | 5 | 5 | 5 |
| + (w 4, v 5) | 0 | 1 | 1 | 4 | 5 | 6 | 6 | 9 |
| + (w 5, v 7) | 0 | 1 | 1 | 4 | 5 | 7 | 8 | 9 |

Look at row 3 (item with weight 4, value 5), column 7. Skip it: the cell above is 5. Take it: go to the row above at column `7 - 4 = 3`, which is 4, and add 5 to get 9. The bigger is 9. The answer is the bottom-right cell, 9: the items with weights 3 and 4.
:::

Every cell needs only the **row above**. So one row is enough, if we fill it in the right direction.

```python
def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)         # dp[c] = best value with capacity c
    for w, v in zip(weights, values): # one item at a time
        for c in range(capacity, w - 1, -1):     # BACKWARDS
            dp[c] = max(dp[c], dp[c - w] + v)    # skip, or take
    return dp[capacity]

print(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))   # 9
```

Time `O(n * capacity)`, space `O(capacity)`.

The same shape answers yes or no questions. Take "can the array be split into two parts with the same sum?". The target is half of the total, `dp[s]` is a boolean that says "can some items add up to `s`?", and the update is `dp[s] = dp[s] or dp[s - x]`, again with the loop running backwards.

## Unbounded knapsack

Now each item may be used **any number of times**. Problem (coin change 2): in how many ways can the coins make `amount`? The order of coins does not matter: `2 + 1` and `1 + 2` are one way.

```python
def count_ways(amount, coins):
    dp = [1] + [0] * amount           # one way to make 0: use no coins
    for coin in coins:                # one coin type at a time
        for a in range(coin, amount + 1):        # FORWARDS
            dp[a] += dp[a - coin]     # ways that use this coin again
    return dp[amount]

print(count_ways(5, [1, 2, 5]))       # 4
```

:::example The row after each coin, for amount 5 and coins [1, 2, 5]

| After coin | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| start | 1 | 0 | 0 | 0 | 0 | 0 |
| 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 2 | 1 | 1 | 2 | 2 | 3 | 3 |
| 5 | 1 | 1 | 2 | 2 | 3 | 4 |

With coin 2, the cell for amount 4 becomes `1 + dp[2] = 1 + 2 = 3`. The value `dp[2]` was **already updated in this same row**, and that is how coin 2 gets used twice. The four ways are `5`, `2 + 2 + 1`, `2 + 1 + 1 + 1` and `1 + 1 + 1 + 1 + 1`.
:::

:::warn Backwards for 0/1, forwards for unbounded
This one detail decides whether the code is right.

- **Backwards** (`capacity` down to `w`): `dp[c - w]` still holds the value from the **previous item**, so each item is used at most once.
- **Forwards** (`w` up to `capacity`): `dp[c - w]` was already updated for the **current item**, so the item can be used again and again.

Also note the loop order in `count_ways`: coins outside, amounts inside. That counts each combination once. With amounts outside and coins inside, you would count `1 + 2` and `2 + 1` as two different ways.
:::

## Space optimisation

A table cell usually reads only a few nearby cells. If so, you do not need to keep the whole table.

| The cell reads | Keep | Example |
|---|---|---|
| The last 1 or 2 cells of a 1D table | Two variables | Climbing stairs, house robber |
| Only the row above | Two rows, or one row | LCS, edit distance, grid paths |
| The row above, at the same or a smaller column | One row, filled backwards | 0/1 knapsack |
| The same row, at a smaller column | One row, filled forwards | Unbounded knapsack |

Here is LCS with two rows instead of the full table.

```python
def lcs_two_rows(a, b):
    prev = [0] * (len(b) + 1)         # the row above
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)      # the row being filled
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = max(prev[j], cur[j - 1])
        prev = cur                    # the new row becomes "above"
    return prev[-1]

print(lcs_two_rows("abcde", "ace"))   # 3
```

Space drops from `O(m * n)` to `O(n)`. The time stays `O(m * n)`.

:::tip Get it right first, then save space
Write the full 2D table first and check it on a small example. Reduce the space only after that, and only if needed. One thing is lost when you drop the table: you can no longer walk back through it to print the actual subsequence or the chosen items. If the problem asks for the solution itself and not only its length or value, keep the full table.
:::

:::interview In the 1D solution of the 0/1 knapsack, why must the capacity loop run backwards?
"The 1D array is the 2D table squeezed into one row. In the 2D version, `dp[i][c]` reads `dp[i - 1][c - w]`, which is a value from the previous row, before the current item was considered. In one row, the cell `dp[c - w]` lies to the left of `dp[c]`. If I go from left to right, `dp[c - w]` has already been updated with the current item, so using it would put the same item into the bag twice. Going from right to left, the cells on the left still hold the previous row's values, so each item is used at most once. If the item can be used without limit, as in coin change, I go left to right on purpose."
:::

:::revise
- Two things change, so the state has two indexes: `dp[r][c]` or `dp[i][j]`.
- Grid: `dp[r][c]` comes from above and from the left.
- LCS: match gives diagonal + 1, no match gives `max(above, left)`.
- Edit distance: match copies the diagonal, else `1 + min(above, left, diagonal)`.
- String tables have one extra row and column for the empty prefix.
- 1D knapsack: loop backwards for 0/1, forwards for unbounded.
:::

# Bit manipulation and maths tricks

*A few facts about binary numbers and a few classic number tricks that turn some problems into one-liners.*

## Why it matters

A computer stores every number as a row of switches, each one on (1) or off (0). One switch is a **bit**. The number 13 is `1101` in binary: `8 + 4 + 0 + 1`. **Bit manipulation** means working on these switches directly. It is very fast, and for a few problem types it gives a solution with no extra memory at all.

This chapter is short. You need a handful of tricks, not a deep theory.

## How to recognise it

- "Every number appears twice except one", "find the missing number".
- "Without extra space", "in `O(1)` memory", and the data is whole numbers.
- "Power of two", "count the 1 bits", "binary representation".
- A small set (up to about 20 items) whose subsets you must go through.
- Maths signals: "greatest common divisor", "prime", "modulo 1,000,000,007", "x to the power n".

## The operators

```python
a, b = 12, 10                         # 1100 and 1010 in binary
print(a & b)      # 8   1000  AND: 1 only where both bits are 1
print(a | b)      # 14  1110  OR:  1 where at least one bit is 1
print(a ^ b)      # 6   0110  XOR: 1 where the bits are different
print(a << 1)     # 24  shift left by 1  = multiply by 2
print(a >> 2)     # 3   shift right by 2 = divide by 4, rounded down
print(bin(13))    # 0b1101

n, i = 13, 1                          # 1101, look at bit number 1
print((n >> i) & 1)     # 0   read bit i (bit 0 is the rightmost)
print(n | (1 << i))     # 15  switch bit i on   -> 1111
print(n & ~(1 << i))    # 13  switch bit i off  (it was already off)
print(n ^ (1 << i))     # 15  flip bit i
print(n & (n - 1))      # 12  remove the lowest 1 bit: 1101 -> 1100
print(n & -n)           # 1   keep only the lowest 1 bit
```

**XOR** is the star. Three facts make it useful: `x ^ x = 0`, `x ^ 0 = x`, and the order of XOR operations does not matter.

## Template 1: XOR cancels pairs

Problem (single number): every number appears twice except one. Find it in `O(n)` time and `O(1)` space.

XOR all the numbers together. Each pair cancels to 0, and only the single number is left.

```python
def single_number(nums):
    result = 0
    for x in nums:
        result ^= x                   # pairs cancel: x ^ x = 0
    return result

def missing_number(nums):             # nums has n of the numbers 0..n
    result = len(nums)
    for i, x in enumerate(nums):
        result ^= i ^ x               # every index meets its own value
    return result

print(single_number([4, 1, 2, 1, 2]), missing_number([3, 0, 1]))   # 4 2
```

:::example Dry run of single_number([4, 1, 2, 1, 2])

| x | x in binary | result after `result ^= x` |
|---|---|---|
| 4 | 100 | 100 (4) |
| 1 | 001 | 101 (5) |
| 2 | 010 | 111 (7) |
| 1 | 001 | 110 (6) |
| 2 | 010 | 100 (4) |

The two 1s cancelled each other and so did the two 2s. The answer is 4.
:::

## Template 2: remove the lowest 1 bit

`n & (n - 1)` switches off the lowest 1 bit of `n`. Subtracting 1 turns that bit into 0 and all the zeros after it into 1s, and the AND clears all of them.

```python
def count_ones(n):
    count = 0
    while n:
        n &= n - 1                    # remove one 1 bit per round
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0     # exactly one 1 bit

print(count_ones(13), is_power_of_two(16), is_power_of_two(12))
# 3 True False
```

For 13: `1101 -> 1100 -> 1000 -> 0`. Three rounds, so three 1 bits. The loop runs once per 1 bit, not once per bit.

:::warn Brackets around bit operations
In C, C++, Java and JavaScript, the comparison `==` is done **before** `&`, `|` and `^`. There, `n & 1 == 0` means `n & (1 == 0)`, which is a bug. Python does the `&` first, so the same line works in Python, but do not depend on a rule that changes between languages. Always write `(n & 1) == 0`. Shifts are also weaker than `+` and `-` in every one of these languages: `1 << n - 1` means `1 << (n - 1)`.
:::

## Template 3: a bitmask as a subset

A number with `n` bits can stand for a subset of `n` items: bit `i` is 1 if item `i` is chosen. Counting from 0 to `2^n - 1` walks through every subset without recursion.

```python
def subsets_bitmask(nums):
    n = len(nums)
    res = []
    for mask in range(1 << n):        # 0 .. 2^n - 1
        subset = [nums[i] for i in range(n) if (mask >> i) & 1]
        res.append(subset)
    return res

print(subsets_bitmask([1, 2, 3]))
# [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
```

Mask 5 is `101` in binary, so it picks items 0 and 2: `[1, 3]`. Time `O(n * 2^n)`.

## Maths tricks worth knowing

```python
def gcd(a, b):                        # greatest common divisor (Euclid)
    while b:
        a, b = b, a % b               # gcd(a, b) = gcd(b, a mod b)
    return a

def power(base, exp, mod):            # base^exp % mod in O(log exp)
    result = 1
    base %= mod
    while exp:
        if exp & 1:                   # this bit of exp is set
            result = result * base % mod
        base = base * base % mod      # square for the next bit
        exp >>= 1
    return result

def primes_up_to(n):                  # sieve of Eratosthenes
    is_prime = [True] * (n + 1)
    is_prime[0:2] = [False, False]
    for p in range(2, int(n ** 0.5) + 1):
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):
                is_prime[multiple] = False   # cross out multiples of p
    return [i for i in range(n + 1) if is_prime[i]]

print(gcd(48, 18), power(3, 13, 1000), primes_up_to(30))
# 6 323 [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

| Trick | Idea | Time |
|---|---|---|
| GCD (Euclid) | Replace `(a, b)` by `(b, a % b)` until `b` is 0 | `O(log n)` |
| Fast power | Square the base, halve the exponent | `O(log exp)` |
| Sieve | Cross out the multiples of every prime | `O(n log log n)` |
| Is `n` prime? | Try divisors only up to the square root of `n` | `O(√n)` |
| Sum of 1 to n | `n * (n + 1) // 2` | `O(1)` |

For `gcd(48, 18)` the pairs are `(48, 18) -> (18, 12) -> (12, 6) -> (6, 0)`, so the answer is 6. The least common multiple follows from it: `lcm(a, b) = a * b // gcd(a, b)`.

:::note Why answers are asked "modulo 1,000,000,007"
Counting problems can have huge answers. To keep numbers small, problems ask for the remainder after dividing by a large prime, usually `10**9 + 7`. Take `% mod` after every addition and multiplication. Python integers never overflow, but in Java and C++ a forgotten modulo silently gives wrong answers.
:::

:::interview Every element appears twice except one. How do you find it without extra space?
"I XOR all the numbers together. XOR has two useful properties: a number XOR itself is 0, and a number XOR 0 is the number itself. Because the order of XOR operations does not matter, every pair cancels to 0 and only the single element remains. This takes one pass, so `O(n)` time and `O(1)` space. A hash set or a count map would also work, but they need `O(n)` extra space, and sorting would need `O(n log n)` time."
:::

:::revise
- AND, OR, XOR and shifts work on single bits and cost `O(1)`.
- XOR cancels pairs: `x ^ x = 0` and `x ^ 0 = x`.
- `n & (n - 1)` removes the lowest 1 bit. A power of two has exactly one 1 bit.
- A bitmask from 0 to `2^n - 1` lists every subset of `n` items.
- Put brackets around bit operations when you compare the result.
- GCD with Euclid and fast power are both logarithmic. Take the modulo at every step.
:::

# Master cheat sheet, practice list and study plan

*Every pattern on one page, the classic problems to practise for each, and a plan to get through them.*

## Why it matters

You have now seen every pattern once. Reading is not the same as being able to do it. This chapter is the part you come back to: a table to revise all patterns in a few minutes, a list of well-known problems to practise each one, and a plan that spreads the work over six weeks.

## Pattern, signal, template, complexity

**Pointers and windows**

| Pattern | Signal | Core of the template | Time | Space |
|---|---|---|---|---|
| Two pointers, opposite ends | Sorted, pair, palindrome | Move the side that can improve the result | `O(n)` | `O(1)` |
| Two pointers, read and write | "In place", remove, move | `write` marks the next free place | `O(n)` | `O(1)` |
| Fast and slow | Cycle, middle | 1 step and 2 steps, do they meet? | `O(n)` | `O(1)` |
| Fixed window | "Size k" | Add the new item, remove item `right - k` | `O(n)` | `O(k)` |
| Variable window | Longest or shortest with a rule | Expand `right`, shrink `left` in a `while` | `O(n)` | `O(k)` |

**Hashing, searching and stacks**

| Pattern | Signal | Core of the template | Time | Space |
|---|---|---|---|---|
| Prefix sum + hash map | Subarray sum, negatives | Look up `prefix - k` among earlier sums | `O(n)` | `O(n)` |
| Hashing | Seen before, count, group | Dict or set lookup replaces a loop | `O(n)` | `O(n)` |
| Binary search | Sorted, "minimum that works" | `hi = mid` if ok, else `lo = mid + 1` | `O(log n)` | `O(1)` |
| Monotonic stack | Next greater or smaller | Pop while the top breaks the order | `O(n)` | `O(n)` |
| Monotonic queue | Maximum of each window | Deque with falling values | `O(n)` | `O(k)` |

**Linked lists, trees and heaps**

| Pattern | Signal | Core of the template | Time | Space |
|---|---|---|---|---|
| Dummy node | Head may change, merging | Build after `dummy`, return `dummy.next` | `O(n)` | `O(1)` |
| Reversal | Reverse all or a part | Save `nxt`, turn the arrow, move on | `O(n)` | `O(1)` |
| Tree DFS | Height, path, subtree | Base case, ask the children, combine | `O(n)` | `O(h)` |
| Tree BFS | Level by level | Queue, `for _ in range(len(queue))` | `O(n)` | `O(w)` |
| Top-k heap | K largest, k closest | Min-heap of size `k`, pop when bigger | `O(n log k)` | `O(k)` |
| K-way merge | K sorted lists | One item per list in a min-heap | `O(n log k)` | `O(k)` |
| Two heaps | Running median | Max-heap of small half, min-heap of large half | `O(log n)` per add | `O(n)` |

**Intervals, backtracking and graphs**

| Pattern | Signal | Core of the template | Time | Space |
|---|---|---|---|---|
| Merge intervals | Overlap, merge | Sort by start, extend the last one | `O(n log n)` | `O(n)` |
| Interval greedy | Most without overlap | Sort by end, keep if `start >= last_end` | `O(n log n)` | `O(1)` |
| Backtracking | All subsets, orders, puzzles | Choose, explore, un-choose, prune | `O(2^n)` or `O(n!)` | `O(n)` |
| BFS | Fewest steps, equal costs | Queue, mark visited on push | `O(V + E)` | `O(V)` |
| DFS | Components, reachability | Visit, recurse into unvisited neighbours | `O(V + E)` | `O(V)` |
| Three colours | Cycle in a directed graph | An edge to a grey node is a cycle | `O(V + E)` | `O(V)` |
| Topological sort | Prerequisites, order | Queue of in-degree 0 nodes (Kahn) | `O(V + E)` | `O(V + E)` |
| Dijkstra | Cheapest path, weights | Min-heap of `(dist, node)`, skip old entries | `O(E log V)` | `O(V + E)` |
| Union-find | Merge groups, connected? | `find` with compression, `union` by rank | almost `O(1)` | `O(n)` |

**Dynamic programming and bits**

| Pattern | Signal | Core of the template | Time | Space |
|---|---|---|---|---|
| 1D DP | Ways, min or max over choices | `dp[i]` from `dp[i - 1]`, `dp[i - 2]`, ... | `O(n)` and up | `O(n)` or `O(1)` |
| Grid DP | Move right or down | `dp[r][c]` from above and left | `O(m * n)` | `O(m * n)` |
| String DP | Two strings | Match: diagonal. Else: above, left | `O(m * n)` | `O(m * n)` |
| 0/1 knapsack | Each item once, capacity | One row, capacity loop backwards | `O(n * W)` | `O(W)` |
| Unbounded knapsack | Items reusable | One row, capacity loop forwards | `O(n * W)` | `O(W)` |
| XOR | Appears once, missing | XOR everything, pairs cancel | `O(n)` | `O(1)` |

Here `h` is the height of a tree, `w` its widest level, `V` and `E` the nodes and edges of a graph, and `W` the capacity.

## The five skeletons to know by heart

If you can write these five from memory, you can rebuild most of the others.

```text
SLIDING WINDOW                         BINARY SEARCH (first true)
left = 0                               while lo < hi:
for right in range(n):                     mid = (lo + hi) // 2
    add nums[right]                        if ok(mid):
    while window is invalid:                   hi = mid
        remove nums[left]                  else:
        left += 1                              lo = mid + 1
    update answer                      return lo
```

```text
BACKTRACKING                           BFS
def backtrack(start):                  queue = deque([start])
    if complete:                       seen = {start}
        save a copy; return            while queue:
    for i in range(start, n):              node = queue.popleft()
        choose i                           for nxt in graph[node]:
        backtrack(i + 1)                       if nxt not in seen:
        un-choose i                                seen.add(nxt)
                                                   queue.append(nxt)
```

```text
DYNAMIC PROGRAMMING
dp = table filled with the base cases
for each state, in an order where smaller states come first:
    dp[state] = best (or sum) over the choices of dp[smaller state]
return dp[final state]
```

## The decision path

:::flow From problem to pattern
Constraints | how fast must it be?
Input shape | array, tree, graph, pairs
Signal words | longest, k-th, ways, order
Check the condition | sorted? one-way rule?
Template | adapt, dry run, state Big-O
:::

A few quick questions settle most problems:

1. Is the input **sorted**, or can I sort it? Think binary search or two pointers.
2. Is it about a **continuous** subarray or substring? Think sliding window, or prefix sums if there are negative numbers.
3. Does it ask for the **top k** or the next smallest again and again? Think heap.
4. Does it ask for **all** solutions? Think backtracking. Only the **count** or the **best**? Think DP, or greedy if a simple rule can be argued.
5. Are there **connections** between things? It is a graph: BFS for fewest steps, topological sort for order, Dijkstra for weights, union-find for groups.

## Curated practice list

These are well-known classic problems, listed by the names they usually have on practice sites. Search the name to find the problem. Within each row they go roughly from easier to harder. Solve the first two of every row before you go deep into any single pattern.

**Arrays and strings**

| Pattern | Classic problems |
|---|---|
| Two pointers | Valid Palindrome, Two Sum II (Input Array Is Sorted), Move Zeroes, Sort Colors, 3Sum, Container With Most Water, Trapping Rain Water |
| Fast and slow | Middle of the Linked List, Linked List Cycle, Happy Number, Linked List Cycle II, Find the Duplicate Number |
| Sliding window | Maximum Average Subarray I, Longest Substring Without Repeating Characters, Max Consecutive Ones III, Find All Anagrams in a String, Minimum Size Subarray Sum, Longest Repeating Character Replacement, Minimum Window Substring |
| Prefix sums and hashing | Two Sum, Contains Duplicate, Group Anagrams, Product of Array Except Self, Subarray Sum Equals K, Contiguous Array, Longest Consecutive Sequence |

**Searching, stacks and lists**

| Pattern | Classic problems |
|---|---|
| Binary search | Binary Search, Search Insert Position, Find First and Last Position of Element in Sorted Array, Search in Rotated Sorted Array, Find Minimum in Rotated Sorted Array, Koko Eating Bananas, Capacity To Ship Packages Within D Days, Split Array Largest Sum |
| Stack and monotonic stack | Valid Parentheses, Min Stack, Evaluate Reverse Polish Notation, Next Greater Element I, Daily Temperatures, Sliding Window Maximum, Largest Rectangle in Histogram |
| Linked lists | Reverse Linked List, Merge Two Sorted Lists, Remove Nth Node From End of List, Palindrome Linked List, Reorder List, Add Two Numbers, Reverse Nodes in k-Group |

**Trees, heaps, intervals and backtracking**

| Pattern | Classic problems |
|---|---|
| Trees | Maximum Depth of Binary Tree, Invert Binary Tree, Diameter of Binary Tree, Binary Tree Level Order Traversal, Binary Tree Right Side View, Validate Binary Search Tree, Lowest Common Ancestor of a Binary Tree, Binary Tree Maximum Path Sum |
| Heaps | Kth Largest Element in an Array, Top K Frequent Elements, K Closest Points to Origin, Task Scheduler, Merge k Sorted Lists, Find Median from Data Stream |
| Intervals and greedy | Merge Intervals, Insert Interval, Non-overlapping Intervals, Meeting Rooms II, Jump Game, Jump Game II, Gas Station |
| Backtracking | Subsets, Permutations, Combination Sum, Subsets II, Generate Parentheses, Word Search, Palindrome Partitioning, N-Queens |

**Graphs, dynamic programming and bits**

| Pattern | Classic problems |
|---|---|
| Graphs 1 | Number of Islands, Max Area of Island, Number of Provinces, Rotting Oranges, Clone Graph, Pacific Atlantic Water Flow, Word Ladder |
| Graphs 2 | Course Schedule, Course Schedule II, Redundant Connection, Network Delay Time, Min Cost to Connect All Points, Cheapest Flights Within K Stops |
| DP, one dimension | Climbing Stairs, House Robber, Maximum Subarray, Coin Change, House Robber II, Longest Increasing Subsequence, Word Break, Decode Ways |
| DP, two dimensions | Unique Paths, Minimum Path Sum, Longest Common Subsequence, Partition Equal Subset Sum, Coin Change II, Target Sum, Edit Distance |
| Bits and maths | Single Number, Number of 1 Bits, Missing Number, Power of Two, Counting Bits, Count Primes, Pow(x, n) |

## How to practise one problem

:::flow The practice loop
Read | constraints and signals
Guess the pattern | before any hint
Solve with a timer | about 30 minutes
Dry run | one normal, one edge case
Note it | one line: signal and pattern
:::

- **Guess the pattern first.** Before you write anything, say which pattern you think it is and why. This is the skill interviews test, and it only grows if you practise it on purpose.
- **Use a timer.** Give an easy problem about 20 minutes and a medium one about 30 to 40. If you are still stuck, read only a hint or the idea, close it, and write the code yourself.
- **Dry run before you submit.** Trace your code on a small input by hand, as in this book. You will catch most off-by-one bugs.
- **Keep a one-line log.** For every problem write the signal and the pattern, for example: "longest window with at most k zeros: variable sliding window". Read the log before interviews.
- **Repeat.** If you needed help, solve the problem again after three days and again after two weeks, without looking. Solving it again later is the real proof that you learned it.

:::warn Three ways to waste your practice
1. **Memorising solutions.** A memorised answer breaks when the problem changes a little. Learn why the pattern fits.
2. **Reading solutions without typing.** Understanding a solution feels like progress, but it is not the same as producing one. Always close the solution and write the code yourself.
3. **Staying in the comfort zone.** Solving many easy array problems feels good. Graphs and DP feel bad at first, and that is exactly where the practice is needed.
:::

## A six-week study plan

The plan assumes about one and a half to two hours on most days. If you have less time, take two weeks for each row.

| Week | Chapters | Focus | Goal by the end |
|---|---|---|---|
| 1 | 1 to 4 | Reading problems, two pointers, sliding window, prefix sums and hashing | Write the window template from memory. Explain why `{0: 1}` is needed. |
| 2 | 5 to 7 | Binary search, stacks, linked lists | Write first-true binary search without an infinite loop. Reverse a list on paper. |
| 3 | 8 to 10 | Trees, heaps, intervals and greedy | Answer "what do I need from my children?" for a new tree problem. |
| 4 | 11 to 13 | Backtracking and graphs | Write BFS, Kahn's algorithm, Dijkstra and union-find without notes. |
| 5 | 14 to 16 | Dynamic programming and bits | Do the five steps and draw the table for a new DP problem. |
| 6 | 17 and revision | Mixed problems, mock interviews | Solve unseen problems with a timer while speaking aloud. |

A good daily routine:

1. **Revise (10 minutes).** Read the revision boxes of the chapters you finished, or your one-line log.
2. **Learn (30 minutes).** Read one section and type its template yourself. Do not copy and paste.
3. **Practise (45 to 60 minutes).** Solve two or three problems of that pattern.
4. **Repeat (15 minutes).** Solve one older problem again without looking.

In the last week, mix the patterns. Pick problems without knowing their topic, because in a real interview nobody tells you the pattern.

:::tip In the interview, say the pattern aloud
Tell the interviewer your reasoning: "The array is sorted and I need a pair, so I will try two pointers. That should be `O(n)` time and `O(1)` space." Even if your first guess is wrong, the interviewer can see how you think and can guide you. Silence gives them nothing to work with.
:::

:::interview You are stuck on a problem in the middle of an interview. What do you do?
"I do not stay silent. First I go back to a concrete small example and solve it by hand, watching what steps I take, because that often shows the pattern. I state the brute-force solution and its complexity so that there is at least a correct starting point. Then I ask what the brute force repeats and which tool removes that: a hash map for repeated searches, a prefix sum for repeated range sums, a heap for repeated minimums, a cache for repeated subproblems. I also check the constraints again, because the input size hints at the expected complexity, and I ask whether sorting the input would make things easier. I share these thoughts aloud, and if the interviewer gives a hint I take it and build on it."
:::

:::revise
- Revise with the four tables: pattern, signal, core of the template, complexity.
- Know five skeletons by heart: window, binary search, backtracking, BFS and DP.
- Decide with questions: sorted? continuous? top k? all solutions or one value? connections?
- Guess the pattern before you code, and dry run before you submit.
- Solve a problem again after a few days. That is the proof that you learned it.
- Mix the patterns in the final week and practise speaking while you solve.
:::
