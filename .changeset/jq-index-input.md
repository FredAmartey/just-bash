---
"just-bash": patch
---

Evaluate the index of `X[expr]` in `jq` against the input, as jq does, so `.foo[.bar]` and `$m[.]` look up the right key. Multiple indices now come out in jq's order.
