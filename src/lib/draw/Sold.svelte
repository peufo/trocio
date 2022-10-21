<script>
  import { faUserAlt, faChild } from '@fortawesome/free-solid-svg-icons'

  const RECT = {
    width: 120,
    height: 46,
    rx: 6,
    ry: 6,
    fill: 'none',
    'stroke-width': 2,
  }
  const TEXT = {
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
  }

  const rects = [
    { x: 240, y: 24, text: 'Proposé', color: '#f2f2f2' },
    { x: 240, y: 161, text: 'Validé', color: '#e3fcff' },
    { x: 240, y: 297, text: 'Vendu', color: '#d9ffe0' },
    { x: 120, y: 90, text: 'Refusé', color: '#ffe6e6' },
    { x: 120, y: 225, text: 'Rendu', color: '#fff4e3' },
  ]
</script>

<div class="container">
  <svg width="400" height="322" viewBox="0 0 400 322">
    <defs>
      <!-- Définit une pointe de flèche -->
      <marker
        id="arrow"
        viewBox="0 0 12 12"
        refX="0"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        style="overflow: visible;"
        orient="auto-start-reverse"
      >
        <path
          d="M 0 0 L 10 5 L 0 10 z"
          stroke-linejoin="round"
          style="animation: none; stroke-dasharray: none;"
        />
      </marker>
    </defs>

    <!-- Rectangles info -->
    {#each rects as rect}
      <rect
        x={rect.x - RECT.width / 2}
        y={rect.y - RECT.height / 2}
        stroke={rect.color}
        {...RECT}
      />
      <text x={rect.x} y={rect.y} {...TEXT}>{rect.text}</text>
    {/each}

    <!-- Icons -->
    <path
      d={typeof faUserAlt.icon[4] === 'string' ? faUserAlt.icon[4] : ''}
      class="icon-provider"
    />
    <path
      d={typeof faChild.icon[4] === 'string' ? faChild.icon[4] : ''}
      class="icon-buyer"
    />

    <!-- Provider - Proposé -->
    <line x1="50" y1="23" x2="170" y2="23" marker-end="url(#arrow)" />

    <!-- Proposé - Validé -->
    <line x1="240" y1="47" x2="240" y2="128" marker-end="url(#arrow)" />

    <!-- Validé - Vendu -->
    <line x1="240" y1="185" x2="240" y2="264" marker-end="url(#arrow)" />

    <!-- Vendu - client-->
    <line x1="300" y1="300" x2="335" y2="300" marker-end="url(#arrow)" />

    <!-- Proposé - Refusé -->
    <path
      d="M 240 47 L 240 56 Q 240 90 206 90 L 190 90"
      marker-end="url(#arrow)"
      class="opacity"
    />

    <!-- Validé - Rendu -->
    <path
      d="M 240 185 L 240 189 Q 240 225 206 225 L 190 225"
      marker-end="url(#arrow)"
      class="opacity"
    />

    <!-- Refusé - Provider -->
    <path
      d="M 120 112 L 120 122 Q 120 156 86 156 L 59 156 Q 25 156 25 122 L 25 62"
      marker-end="url(#arrow)"
      class="opacity"
    />

    <!-- Rendu - Provider -->
    <path d="M 120 198 L 120 180 Q 120 156 86 156" class="opacity" />
  </svg>
</div>

<style>
  .container {
    min-height: 322px;
    max-width: 400px;
    margin: auto;
    position: relative;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  .icon-provider,
  .icon-buyer {
    fill: none;
    stroke: #888;
    stroke-width: 20;
  }

  .icon-provider {
    transform: translate(1.3%, 1%) scale(0.08);
  }

  .icon-buyer {
    transform: translate(89%, calc(100% - 45px)) scale(0.08);
  }

  .opacity {
    opacity: 0.4;
  }

  line,
  path:not(.icon-provider):not(.icon-buyer) {
    fill: none;
    stroke: #888;
    stroke-width: 2;
    stroke-dasharray: 6;
    animation: dash 0.8s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -12;
    }
  }
</style>
