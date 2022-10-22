<script lang="ts" context="module">
  export type EventDescription = {
    title: string
    detail?: string
    time: string | number | Date
  }
</script>

<script lang="ts">
  export let events: EventDescription[]

  const intl = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
</script>

<div class="timeline">
  {#each events as { title, detail, time }}
    <div>
      <div class="time text-caption">
        {intl.format(new Date(time))}
      </div>
      <div class="decorator">
        <div class="dot" />
        <div class="line" />
      </div>
      <div class="content">
        <b>{title}</b>
        <p class="text-caption">{detail}</p>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .timeline > div {
    display: flex;
  }

  .time,
  .content {
    padding: 6px 16px;
  }

  .time {
    text-align: right;
    min-width: 180px;
  }
  .content {
    flex-grow: 1;
  }

  .decorator {
    padding: 6px 0px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;

    & > .dot {
      flex-shrink: 0;
      width: 12px;
      height: 12px;
      background-color: var(--theme-text-disabled);
      border-radius: 50%;
      margin-top: 5px;
    }

    & > .line {
      width: 2px;
      height: 100%;
      background-color: var(--theme-dividers);
      border-radius: 1px;
    }
  }
</style>
