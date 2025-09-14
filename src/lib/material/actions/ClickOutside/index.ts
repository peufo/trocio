/**
 * Click Outside
 * @param {Node} node
 */
export default (node: HTMLElement, _options = {}) => {
  const options = { include: [], ..._options }

  function detect({ target }: MouseEvent) {
    if (
      !node.contains(target) ||
      options.include.some((i) => target.isSameNode(i))
    ) {
      node.dispatchEvent(new CustomEvent('clickOutside'))
    }
  }
  document.addEventListener('click', detect, { passive: true, capture: true })
  return {
    destroy() {
      document.removeEventListener('click', detect)
    },
  }
}
