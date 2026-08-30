<script lang="ts">
    let tooltipData: unknown = null;

    const config = tooltipData as Record<string, unknown> | null;

    const nested = (config as Record<string, unknown>) as unknown;
</script>

{#each [] as item}{(item as Record<string, unknown>).x}{/each}