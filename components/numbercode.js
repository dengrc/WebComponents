import {
    BaseComponent
} from "./WebComponents.js";

const _focusIndex = Symbol("focusIndex"),
    _value = Symbol("value"),
    _preLi = Symbol("preLi"),
    _updateCode = Symbol("_updateCode"),
    _setFocusIndex = Symbol("_setFocusIndex");

class HTMLNumberCodeElement extends BaseComponent {
    // [_value] = "";
    // [_preLi] = null;
    // [_focusIndex] = 0;

    static get template() {
        return `
        <style>
        :host{
            display:block;
        }
        input{
            width: 1px;
            height: 1px;
            border: none;
            outline: none;
            opacity: 0.01;
            position: absolute;
        }
        ol{
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            justify-content: space-between;
        }
        li{
            width: 2.6em;
            height: 2.6em;
            text-align: center;
            line-height: 2.6;
            border: 1px solid #aaa;
        }
        .on{
            border-color:#03a9f4;
        }
        </style>
        <input type="tel" ref="inputNode">
        <ol ref="listNode"></ol>
        `
    }

    static get observedAttributes() {
        return ['value', 'length']
    }

    get value() {
        return this[_value];
    }

    set value(value) {
        this[_value] = value;
        this[_updateCode]();
    }

    get length() {
        return parseInt(this.inputNode.getAttribute("maxlength"))
    }

    set length(value) {
        this.inputNode.setAttribute("maxlength", value);
        this.setAttribute("length", value);
        this[_updateCode]();
    }

    constructor() {
        super();
        this[_value] = "";
        this[_preLi] = null;
        this[_focusIndex] = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        this.connect(this.inputNode, "input", (e) => {
            const val = e.target.value.trim();
            e.target.value = "";
            if (/^\d+$/.test(val)) {
                const index = this[_focusIndex];
                this.value = this.value.substr(0, index) + val + this.value.substr(index + val.length);
                if (this.value.length === this.length) {
                    this.emit("complete", this.value);
                }
                this[_setFocusIndex](index + 1)
            }
        });

        this.connect(this.inputNode, "keyup", (e) => {
            if (e.keyCode === 8) {
                this.value = this.value.substr(0, this.value.length - 1);
                this[_setFocusIndex](this.value.length);
            } else if (e.keyCode === 13) {
                this.emit("dargend", this.value)
            }
        });

        let ignoreFocus = false;
        this.connect(this.inputNode, "focus", (e) => {
            !ignoreFocus && this[_setFocusIndex](this.value.length);
            ignoreFocus = false
        });

        this.connect(this.listNode, "click", (e) => {
            e.target.tagName === "LI" && this[_setFocusIndex](e.target.getAttribute("data-index"));
            ignoreFocus = true;
            this.inputNode.focus();
        });
    }

    watch(attr, oldValue, newValue) {
        if (oldValue !== newValue)
            this[attr] = newValue;
    }

    [_updateCode]() {
        if (this.length) {
            if (this.length === this.listNode.children.length) {
                [].forEach.call(this.listNode.children, (item, index) => {
                    item.textContent = this.value[index] || '';
                })
                return
            }
            this.listNode.innerHTML = Array.from(new Array(this.length), (item, index) => {
                return `<li data-index="${index}">${this.value[index]||''}</li>`;
            }).join("");
        }
    }

    [_setFocusIndex](index) {
        const children = this.listNode.children;
        index = Math.min(children.length - 1, index);
        const li = children[index];
        this[_focusIndex] = index;
        this[_preLi] && (this[_preLi].className = "");
        li.className = "on";
        this[_preLi] = li;
    }
}
window.HTMLNumberCodeElement = HTMLNumberCodeElement;
customElements.define("number-code", HTMLNumberCodeElement)