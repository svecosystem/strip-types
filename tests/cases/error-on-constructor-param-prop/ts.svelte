<script lang="ts">
    class Foo {
        bar: number = 0;

        constructor(public some: string) {
            
        }
    }

    const thing = new Foo("hi");

    thing.some;
</script>