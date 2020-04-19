function debounce(callback, delay){
    let timer
    return () => {
        let args = arguments
        let context = this
        clearTimeout = timer
        timer = setTimeout(() => {
            callback.apply(context, args)
        }, delay)
    }
}

class Autogrow extends HTMLTextAreaElement {

    constructor() {
        super()
        this.autogrow = this.autogrow.bind(this)
        this.onResize = debounce(this.autogrow.bind(this), 300)
    }

    connectedCallback() {
        this.style.overflow = 'hidden'
        this.style.resize = 'none'
        this.style.boxSizing = 'border-box'
        this.autogrow()
        this.addEventListener('input', this.autogrow)
        window.addEventListener('resize', this.onResize)
    }

    disconnectCallback () {
        window.removeEventListener('resize', this.onResize)
    }

    autogrow() {
        this.style.height = 'auto'
        this.style.height = this.scrollHeight + 'px'
    }

}

customElements.define('textarea-autogrow', Autogrow, {extends: 'textarea'})