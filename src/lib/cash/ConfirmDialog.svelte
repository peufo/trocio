<script lang="ts">
  import { Dialog, Button } from "$lib/material";
  import { tick } from "svelte";

  export let active = false;
  let message = "";
  let btnCancel: HTMLButtonElement;
  let btnConfirm: HTMLButtonElement;

  export async function confirm(msg: string): Promise<boolean> {
    message = msg;
    active = true;
    await tick();
    return new Promise((resolve) => {
      const clean = () => {
        btnCancel.removeEventListener("click", cancel);
        btnConfirm.removeEventListener("click", conf);
      };
      const cancel = () => {
        active = false;
        clean();
        resolve(false);
      };
      const conf = () => {
        active = false;
        clean();
        resolve(true);
      };
      btnCancel.addEventListener("click", cancel);
      btnConfirm.addEventListener("click", conf);
    });
  }
</script>

<Dialog
  bind:active
  class="pa-4"
  persistent
  overlay={{ index: 100 }}
  styleBox="z-index: 101;"
>
  <div class="text-h6">{message}</div>
  <div class="d-flex pt-4" style="gap: 0.5em; justify-content: flex-end;">
    <Button bind:button={btnCancel} type="submit flex-grow">Annuler</Button>
    <Button
      bind:button={btnConfirm}
      class="primary-color flex-grow"
      type="submit"
    >
      Confirmer
    </Button>
  </div>
</Dialog>
