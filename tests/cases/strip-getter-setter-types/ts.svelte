<script lang="ts">
    type Final = number;

    let value = $state<Final>(0);
</script>

<input bind:value={() => value?.toString(), (v) => value = parseInt(v ?? '0') as Final}/>