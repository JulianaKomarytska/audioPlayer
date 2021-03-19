let arr, a_ctx, analyzer, src, red, green, blue, el_arr, wrapper, logo, domLoop, path, gainNode, CurY;
let domInnerHeight;
const audio = document.querySelector('audio');

const CONST = {
    CIRCLE: 'circle',
    LINE: 'line',
    BEZIER: 'bezier',
}

const NS = {
    SVG: 'http://www.w3.org/2000/svg'
}
const CONFIG={
    type: CONST.BEZIER, // line
    lineColor: 'black',
    step: 5,
    withGradient: false
}

window.onclick = function () {
    if (!a_ctx){
        prep()
    }
    audio.paused ? (() => {
        audio.play()
        loop()
    })() : (() => {
        audio.pause();
    })();
}

document.onmousemove = updatePage;

function updatePage(e) {
    if (audio.paused) return;
    CurY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    let max = parseInt(gainNode.gain.maxValue);
    gainNode.gain.value = max  * (1 - CurY/domInnerHeight)
}

function renderByType(){
    switch (CONFIG.type) {
        case CONST.CIRCLE:
            getColorIndexes();
            domLoop = changeCircle;
            break;
        case CONST.LINE:
            generateDom();
            domLoop = changeLine;
            break;
        case CONST.BEZIER:
            renderSVG();
            domLoop = changeBezier
    }
}
function prep(){
    a_ctx = new AudioContext();
    analyzer = a_ctx.createAnalyser();
    src = a_ctx.createMediaElementSource(audio);
    gainNode = a_ctx.createGain();
    domInnerHeight = innerHeight;

    src.connect(analyzer);
    src.connect(gainNode);
    analyzer.connect(a_ctx.destination)
    gainNode.connect(a_ctx.destination)
    renderByType()

    loop()
}

function getColorIndexes(){
    logo = document.createElement('div')
    logo.className = 'logo';
    document.body.appendChild(logo);

    red = Math.random() * analyzer.frequencyBinCount | 0
    green = Math.random() * analyzer.frequencyBinCount | 0
    blue = Math.random() * analyzer.frequencyBinCount | 0
}

function generateDom(){
    el_arr = []
    wrapper = document.createElement('div')
    wrapper.className = 'wrapper';
    document.body.appendChild(wrapper)

    let frag = document.createDocumentFragment();
    for(let i=0, l=analyzer.frequencyBinCount; i< l; i++){
        let el = document.createElement('div')
        el_arr.push(el);
        frag.appendChild(el)
    }
    wrapper.appendChild(frag)
}
function renderSVG(){
    wrapper = document.createElementNS(NS.SVG,'svg')
    wrapper.style.width = `${innerWidth}px`;
    wrapper.style.height = `${innerHeight}px`;
    path = document.createElementNS(NS.SVG,'path')
    wrapper.appendChild(path)
    if (CONFIG.withGradient ){
        renderSvgGradient()
    }else{
        path.setAttribute('stroke', 'black')
        path.setAttribute('fill', 'transparent')
    }
    document.body.appendChild(wrapper)
}

function renderSvgGradient(){
    let defs = document.createElementNS(NS.SVG, 'defs'),
        gradient = document.createElementNS(NS.SVG, 'linearGradient'),
        id = 'gradient'
    gradient.setAttribute('id', id)
    gradient.setAttribute('x1', 0)
    gradient.setAttribute('x2', 0)
    gradient.setAttribute('y1', 1)
    gradient.setAttribute('y2', 0)
    for (let i = 1, l = 3; i <= l; i++){
        let stop = document.createElementNS(NS.SVG, 'stop');
        stop.setAttribute('offset', `${i/l}`)
        stop.setAttribute('stop-color', `rgb(${parseInt(255 - 255/i)}, ${parseInt(255 - 255/i)}, 200)`)
        gradient.appendChild(stop)
    }
    defs.appendChild(gradient)
    wrapper.appendChild(defs)
    path.setAttribute('stroke', 'transparent')
    path.setAttribute('fill', `url(#${id})`)


}

function changeBezier(){
    let y = CONFIG.step
    let c_count = 3,
        s_count = 2,
        mid_y = innerHeight/2,
        init_x = (innerWidth/2 - arr.length/ 2) | 0;
    let d = `M ${init_x} ${mid_y} C `


    for (let i = y; i <= arr.length; i +=y ){
        if (!c_count){
            s_count && (d += ' S ')
            s_count = !s_count
        }

        d +=` ${init_x + i} ${mid_y - arr[i]} ,`
        c_count && c_count--

        if (i + y >= arr.length) {
            d = d.slice(0, d.lastIndexOf('S') - 2)
        }

    }

    path.setAttribute('d', d)

}


function changeCircle() {
    logo.style.background=`rgb(${arr[red]}, ${arr[green]}, ${arr[blue]})`
    logo.style.height =`${arr[40]}px`
    logo.style.width =`${arr[40]}px`
}

function changeLine(){
    el_arr.forEach(function(item, index){
        item.style.height = `${arr[index]}px`
    })
}
function loop() {
    !audio.paused && requestAnimationFrame(loop);
    arr = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(arr)
    domLoop()
}



