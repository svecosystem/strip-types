# @svecosystem/strip-types

[![npm version](https://flat.badgen.net/npm/v/@svecosystem/strip-types?color=pink)](https://npmjs.com/package/@svecosystem/strip-types)
[![npm downloads](https://flat.badgen.net/npm/dm/@svecosystem/strip-types?color=pink)](https://npmjs.com/package/@svecosystem/strip-types)
[![license](https://flat.badgen.net/github/license/svecosystem/strip-types?color=pink)](https://github.com/svecosystem/strip-types/blob/main/LICENSE)
[![](https://dcbadge.vercel.app/api/server/fdXy3Sk8Gq?style=flat)](https://discord.gg/fdXy3Sk8Gq)

A type stripper for Svelte.

```sh
pnpm install @svecosystem/strip-types
```

```ts
import { strip } from '@svecosystem/strip-types';

const ts = `<script lang="ts">
    let value = $state<string>('');
</script>`

const js = strip(ts);
```

**In**

```svelte
<script lang="ts">
    type Foo = number

    let value = $state<Foo>('');
</script>

<input bind:value/>
```

**Out**

```svelte
<script>
    let value = $state('');
</script>

<input bind:value/>
```

## Formatting

By default `@svecosystem/strip-types` will remove leading and trailing whitespace when removing nodes. This will result in an output that is correctly formatted (with a small performance penalty).

If you are doing your own formatting you can disable this behavior with the `format` option like so:
```ts
const js = strip(ts, { format: false });
```

### Empty Script Tags

Empty script tags can be created as a side effect of removing types or because there was an empty script tag just to enable TypeScript for the template.

In any case they serve no use in the output code and will be removed by default. You can disable this behavior with the `removeEmptyScripts` option like so:
```ts
const js = strip(ts, { removeEmptyScripts: false });
```

## Limitations

### Formatting

While `@svecosystem/strip-types` includes a `format` option it is not a formatter. It will do it's best to maintain the formatting of the original code when stripping types but it is still recommended to use your own formatter if possible.

### Unsupported Syntax

- ❌ Enums
```ts
enum Foo {
    Bar
}
```
- ❌ Constructor Parameter Properties
```ts
class Foo {
    // the access modifier (public) is not allowed
    constructor(public bar) {

    }
}
```

## Contributing

Install dependencies:

```sh
pnpm install
```

Run tests:

```sh
pnpm test
```

Add a changeset with your changes:
```sh
pnpm changeset
```

Finally before you commit your changes run:

```sh
pnpm format

pnpm check
```

### Tests

If you are contributing please make sure to include tests.

All the test cases can be found under `./tests/cases`.

Each case is a folder with 2 files a `ts.svelte` and a `js.svelte`. `js.svelte` should be the stripped version of the `ts.svelte`. If you don't provide `js.svelte` then `vitest` will expect `strip` to error.

**Example test case**
```
tests
└── cases
    ├── <your test name>
    │   ├── js.svelte
    │   └── ts.svelte
    └── ...
```

## License

Published under the [MIT](https://github.com/svecosystem/strip-types/blob/main/LICENSE) license.
Built by [Aidan Bleser](https://github.com/ieedan) and [community](https://github.com/svecosystem/strip-types/graphs/contributors).
<br><br>
<a href="https://github.com/svecosystem/strip-types/graphs/contributors">
<img src="https://contrib.rocks/image?repo=svecosystem/strip-types" />
</a>

## Community

Join the Discord server to ask questions, find collaborators, or just say hi!

<a href="https://discord.gg/fdXy3Sk8Gq" alt="Svecosystem Discord community">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://invidget.switchblade.xyz/fdXy3Sk8Gq">
  <img alt="Svecosystem Discord community" src="https://invidget.switchblade.xyz/fdXy3Sk8Gq?theme=light">
</picture>
</a>
