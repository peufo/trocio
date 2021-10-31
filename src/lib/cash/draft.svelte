<script>
  let tabs = [
    {
      ref: 'provide',
      label: 'Fourni',
      icon: 'fas fa-sign-in-alt',
      component: Provide,
    },
    {
      ref: 'recover',
      label: 'Récupère',
      icon: 'fas fa-sign-out-alt',
      component: Recover,
    },
    {
      ref: 'buy',
      label: 'Achète',
      icon: 'fas fa-shopping-basket',
      component: Buy,
      clientAnonymAutorised: true,
    },
    {
      ref: 'giveback',
      label: 'Retourne',
      icon: 'fas fa-undo',
      component: Giveback,
      clientAnonymAutorised: true,
    },
    {
      ref: 'resume',
      label: 'Aperçu',
      icon: 'far fa-eye',
      component: Resume,
      clientAnonymAutorised: true,
    },
  ]
</script>
