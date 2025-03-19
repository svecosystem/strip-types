<script lang="ts" module>
    export type One = number;
    type Two = number;
    type Three = number;
    type Four = number;
    const FIVE = 5;

    export type { Two };
    export { type Three };
    export { type Four, FIVE };
</script>