export default function autoPatch(node: HTMLElement, { params } = {}) {
  function handleInput(event: InputEvent) {
    const { type = '', name = '' } = event.target
    console.log(type, name)
  }
  function handleClick(event) {
    console.log('click', event.target.type)
  }
  node.addEventListener('input', handleInput)
  node.addEventListener('input', handleClick)
  return {
    update() {
      console.log(node)
    },
    destroy() {
      node.removeEventListener('change', handleInput)
      node.removeEventListener('change', handleClick)
      return
    },
  }
}
