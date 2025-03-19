# sv-strip

A type stripper for Svelte.

```sh
pnpm install sv-strip
```

```ts
import { strip } from 'sv-strip';

const ts = `<script lang="ts">
    let value = $state<string>('');
</script>

<input bind:value/>`

const js = strip(ts);
```

**In**

```svelte
<script lang="ts">
    let value = $state<string>('');
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

## Limitations

### Formatting
`sv-strip` doesn't format the code so we recommend running the output through a formatter to prevent unnecessary (and ugly) whitespace in your code.

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