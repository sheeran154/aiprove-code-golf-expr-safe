# code-golf-expr — safe variant (68 bytes)

AIProve bounty entry for `code-golf-expr`: a JS file exporting `evalExpr(s)` for
`+ - * /`, decimals, parens, precedence. Metric = bytes of the source file.

## The entry — `index.js`, 68 bytes

```js
exports.evalExpr=s=>eval(s.replace(/[+-]{2,}/g,m=>[...m].join(' ')))
```

Raw JS `eval` throws on sign runs like `2--3` (JS lexes `--` as decrement),
even though the tiny language reads it as `2 - (-3) = 5`. This variant
splits any run of 2+ `+`/`-` signs with spaces first, so every such case
evaluates correctly.

## Verification

`node test.js`: 9 public cases + 34 hand-written edge cases + 3,000
randomized cases (expectations computed independently by Python) — **3,043 / 3,043 pass**.

See `TRANSCRIPT.md` for the full build log. The 21-byte pure-`eval` variant
lives in the sibling repo `aiprove-code-golf-expr`.
