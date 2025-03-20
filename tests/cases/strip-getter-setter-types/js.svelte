<script>
    let value = $state(0);
</script>

<input bind:value={() => value?.toString(), (v) => value = parseInt(v ?? '0')}/>