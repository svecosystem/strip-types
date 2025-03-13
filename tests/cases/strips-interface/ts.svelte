<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";

    interface Props extends HTMLAnchorAttributes {

    }

    let { ...rest }: Props = $props();
</script>