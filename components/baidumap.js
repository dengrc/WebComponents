import {
    BaseComponent
} from "./WebComponents.js";

const EVENTS = [
    "click",
    "dblclick",
    "rightclick",
    "rightdblclick",
    "maptypechange",
    "mousemove",
    "mouseover",
    "mouseout",
    "movestart",
    "moving",
    "moveend",
    "zoomstart",
    "zoomend",
    "addoverlay",
    "addcontrol",
    "removecontrol",
    "removeoverlay",
    "clearoverlays",
    "dragstart",
    "dragging",
    "dragend",
    "addtilelayer",
    "removetilelayer",
    "load",
    "resize",
    "hotspotclick",
    "hotspotover",
    "hotspotout",
    "tilesloaded",
    "touchstart",
    "touchmove",
    "touchend",
    "longpress"
];

const initMap = (() => {
    let _promise
    return () => {
        return _promise || (_promise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            const callback = 'map' + Math.random().toString().replace(".", "");
            window[callback] = () => {
                delete window[callback]
                resolve(BMap)
            };
            script.type = "text/javascript";
            script.onerror = reject;
            script.src = `https://api.map.baidu.com/api?v=2.0&ak=rUG1HZNUdrkMZ9a2ITEieIKs229ZeWEQ&callback=${callback}&s=1`;
            document.body.appendChild(script)
        }))
    }
})();

class HTMLBaiduMapElement extends BaseComponent {
    static get template() {
        return `
        <style>
       :host{
            display:block;
            overflow:hidden;
            position: relative;
            background:#f5f3f0;
        }
        .map-container{
            width:100%;
            height:100%;
        }
        .anchorBL a,.BMap_cpyCtrl{
            display:none;
        }
        </style>
        <div class="map-container" ref="_mapConiainer"></div>
        `
    }

    static get observedAttributes() {
        return ['lng', 'lat', 'zoom']
    }

    get lng() {
        return parseFloat(this.getAttribute("lng") || 0)
    }

    set lng(value) {
        this.setAttribute("lng", value)
    }

    get lat() {
        return parseFloat(this.getAttribute("lat") || 0)
    }

    set lat(value) {
        this.setAttribute("lat", value)
    }

    get zoom() {
        return parseInt(this.getAttribute("zoom") || 13)
    }

    set zoom(value) {
        this.setAttribute("zoom", value)
    }

    rendered() {
        this._loadMap(this._mapConiainer);
    }

    watch() {
        if (this.map) {
            this._centerAndZoom()
        }
    }

    async _loadMap(container) {
        const BMap = await initMap();
        const map = this.map = new BMap.Map(container);
        EVENTS.forEach((type) => {
            this.connect(map, type, (e) => {
                this.emit(type, e)
            })
        })
        this._centerAndZoom();
    }

    _centerAndZoom(lng = this.lng, lat = this.lat, zoom = this.zoom) {
        this.map && this.map.centerAndZoom(new BMap.Point(lng, lat), zoom);
    }
}
customElements.define("baidu-map", HTMLBaiduMapElement)