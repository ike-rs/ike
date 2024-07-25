# Contributing

Hey, thanks for contributing to Ike!

If you wish to add a new feature please discuss it in the github issues.

# Setup

1. Fork this repo

2. Create a new branch following this convention: `feat/{name}`

3. Install dependencies

```sh
bun install
```

In future we plan to make our own package manager

4. Bundle ts code

```sh
bun unbuild
```

This will output js files in ike/src/runtime/js

5. Build rust code

```sh
cargo build
```