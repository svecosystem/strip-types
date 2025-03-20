# sv-strip

A type stripper for Svelte.

```sh
pnpm install sv-strip
```

```ts
import { strip } from 'sv-strip';

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

By default `sv-strip` will remove leading and trailing whitespace when removing nodes. This will result in an output that is correctly formatted (with a small performance penalty).

If you are doing your own formatting you can disable this behavior with the `format` option like so:
```ts
const js = strip(ts, { format: false });
```

## Limitations

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