const _listeners = Symbol("_listeners");
const _initialize = Symbol("_initialize");
const _renderPromise = Symbol("_renderPromise");
const _renderResolve = Symbol("_renderResolve");
const _renderReject = Symbol("_renderReject");

export class BaseComponent extends HTMLElement {
    shadowRoot = null;
    mode = "closed";

    [_listeners] = [];
    [_initialize] = false;

    static get template(){
        return ""
    }

    constructor() {
        super();
        this[_renderPromise] = new Promise((resolve, reject) => {
            this[_renderResolve] = resolve;
            this[_renderReject] = reject;
        })
    }

    connectedCallback() {
        if (!this[_initialize]) {
            const shadowRoot = this.attachShadow({
                mode: this.mode
            });
            this.shadowRoot = shadowRoot;
            this[_initialize] = true;
            appendTemplate(this, this.shadowRoot, this.constructor.template);
            this.rendered();
            this[_renderResolve](shadowRoot)
        }
    }

    disconnectedCallback() {
        this[_listeners].forEach((remove) => remove());
        this[_listeners].length = 0;
    }

    attributeChangedCallback() {
        this[_renderPromise].then(() => {
            this.watch(...arguments)
        })
    }

    // render(shadowRoot) {

    // }

    rendered() {

    }

    watch() {

    }

    connect(node, ...args) {
        node.addEventListener(...args);
        this[_listeners].push(() => {
            node.removeEventListener(...args);
        })
    }

    emit(type, value) {
        const customEvent = new CustomEvent(type, {
                bubbles: false,
                cancelable: true,
                detail: {
                    value: value
                }
            }),
            handlerName = `on${type}`;

        let handler = typeof this[handlerName] === "function" ? this[handlerName] : this.getAttribute(handlerName);
        if (handler) {
            if (typeof handler === "string") {
                handler = new Function("event", handler)
            }
            handler.call(this, customEvent)
        }

        this.dispatchEvent(customEvent)
    }
}

const cached = new Map();
const template = document.createElement('div');
const slice = Array.prototype.slice;

function bindRef(nodes, scope) {
    nodes.forEach((node) => {
        const ref = node.getAttribute("ref");
        if (ref) {
            scope[ref] = node
        }
        node.children.length && bindRef(slice.call(node.children), scope)
    })
}

export function appendTemplate(scope, container, templateString) {
    let nodes;
    if (cached.has(templateString)) {
        nodes = cached.get(templateString)
    } else {
        template.innerHTML = templateString;
        nodes = slice.call(template.children);
        cached.set(templateString, nodes)
    }
    nodes = nodes.map(node => node.cloneNode(true));
    bindRef(nodes, scope);
    nodes.forEach(container.appendChild, container);
    return nodes
}