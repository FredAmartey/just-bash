---
"just-bash": patch
---

Bundle the patched `smol-toml` 1.9.0.

The Node bundle inlines `smol-toml`, so a consumer can't pick up its fix through its own lockfile. Only a just-bash release carries it.
