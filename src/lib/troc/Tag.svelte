<script lang="ts">
  import { onMount } from "svelte";
  import QrCode from "qrcode";

  import { renderAmount } from "$lib/utils";
  import type { TagInterface, Article } from "$lib/types";

  type TagData = Pick<Article, "_id" | "tagId" | "ref" | "name" | "price">;

  export let article: Partial<TagData>;
  export let currency: string = "";

  export let tag: TagInterface = {
    width: 80,
    height: 22,
    padding: 2,
    fontSize: 16,
    border: false,
    useTagPrinter: false,
    useScanner: false,
  };

  onMount(refresh);

  let qrcode = "";
  const defaultUrl = `Made with ❤️ by Peufo`;

  export async function refresh() {
    qrcode = await QrCode.toDataURL(article.tagId || defaultUrl, {
      type: "image/webp",
      margin: 0,
    });
  }
</script>

<div
  class="tag"
  class:border={tag.border}
  class:useTagPrinter={tag.useTagPrinter}
  style={`
    width: ${tag.width}mm;
    height: ${tag.height}mm;
    padding: ${tag.padding}mm;
    gap: ${tag.padding < 2 ? 2 : tag.padding}mm;
    font-size: ${tag.fontSize}px;
  `}
>
  {#if tag.useScanner}
    <img class="flex-shrink-0" src={qrcode} alt="Code QR de l'article" />
  {/if}

  <div class="data">
    <div class="name">
      {article.name}
    </div>

    <div class="ref-price">
      <b>
        # {article.ref}
      </b>
      <span>
        {renderAmount(article.price, currency)}
      </span>
    </div>
  </div>
</div>

<style lang="scss">
  .useTagPrinter:first-child {
    margin-top: -2mm;
  }

  .tag {
    color: black;
    background: white;
    display: flex;
  }

  .tag.useTagPrinter {
    page-break-after: always;
    overflow: hidden;
  }

  .tag.border {
    border: 2px solid #ccc;
    border-radius: 4px;
  }

  .data {
    flex-grow: 1;
    display: grid;
    grid-template-rows: 1fr auto;
    .name {
      overflow: hidden;
    }
  }

  .ref-price {
    display: flex;
    justify-content: space-between;
  }
</style>
