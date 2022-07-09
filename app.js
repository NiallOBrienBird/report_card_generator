const handle = document.getElementById('inputfile');
const container = document.querySelectorAll('.container');
const output = document.querySelector('.output');
const ROLL_HANDLE = document.querySelector('.roll');
const WORD_COUNT_HANDLER = document.querySelector('.word-count');

let snippit = document.querySelectorAll('.snippit');
let arrows = document.querySelectorAll('.arrow');
let checkbox;

const LEVEL_HANDLE = document.querySelector('.level');
const NAME_HANDLE = document.querySelector('.name');
const TRACK_HANDLE = document.querySelector('.track');


let name = '';
let level = '';
let track = '';
let next_level = '';
let next_track = '';

NAME_HANDLE.addEventListener('change', ()=> {
    name = NAME_HANDLE.value;
    display();
})

LEVEL_HANDLE.addEventListener('change', ()=> {
    let next_index = LEVEL_HANDLE.selectedIndex + 1;

    if (next_index > LEVEL_HANDLE.length - 1) {
        next_level = LEVEL_HANDLE.length - 1;
    }

    level = LEVEL_HANDLE.value;
    next_level = LEVEL_HANDLE.item(next_index).value;

    display();
})

TRACK_HANDLE.addEventListener('change', ()=> {
    let index = TRACK_HANDLE.selectedIndex;

    track = TRACK_HANDLE.value;
    next_track = TRACK_HANDLE.selectedIndex == 0 ? 
        TRACK_HANDLE.item(1).value:
        TRACK_HANDLE.item(0).value;

    display();
})

ROLL_HANDLE.addEventListener('click', (e) => {
    if (e.target.classList.contains('rolling')) return;

    e.target.classList.add('rolling');

    for (var i = 0; i < snippit.length; i++) {
        let x =  randomInt(snippit[i].length - 1);
        snippit[i].selectedIndex =x;
        console.log(x);
    }

    e.target.textContent = getFace();
    setTimeout(() => { e.target.textContent = getFace() }, 200);
    setTimeout(() => { e.target.textContent = getFace() }, 400);
    setTimeout(()=> {
        e.target.textContent = getFace();
        e.target.classList.remove('rolling')
    }, 500)

    display();
})

function randomInt (max) {
    return Math.floor(Math.random() * max)
}

function getFace() {
    let face = randomInt(5);

    switch(face) {
        case 0:
            return '⚀'
        case 1:
            return '⚁'
        case 2:
            return '⚂'
        case 3:
            return '⚃'
        case 4:
            return '⚄'
        case 5:
            return '⚅'
    }

    console.log(face)
}

handle.addEventListener('change', () => {          
    const fr =new FileReader();
    fr.readAsText(handle.files[0]); 
    fr.onload = () => {
        parseText(fr.result);
    }
})

output.addEventListener('mousedown', (e) => {
    if(output.textContent === 'Ouput here...' || output.textContent == '') return;
    navigator.clipboard.writeText(output.textContent)


    let floater = document.createElement('div');
    floater.innerHTML = `<div class="floater" style="top:${e.clientY-10}px; left:${e.clientX-0}px">+</div>`

    document.querySelector('body').appendChild(floater);
    
    setTimeout(() => {
        document.querySelector('body').removeChild(floater);
    }, 2000)

})

function display() {
    let output_text = '';
    
    for (let i = 0; i < snippit.length; i++) {
        if(!snippit[i].parentElement.querySelector(".check").checked) continue;
        output_text += " " + snippit[i].value;
    }
    
    output.textContent = output_text;
    replaceKeywords();  

    WORD_COUNT_HANDLER.textContent = `Word Count: ${wordCount(output_text)}`;
}

function wordCount(string_to_count) {
    words = string_to_count.split(' ');
    return words.length
}

class Selector {
    constructor(title, snippit) {
        this.title = title;
        this.snippit = snippit;
        this.checked = true;
    }
}

let menus = [];

function trim_lines(to_strip) {
    for (let i = 0; i < to_strip.length; i++) {
        to_strip[i] = to_strip[i].trim();
    }

    return to_strip
}

function parseText(to_parse) {
    const parsed = to_parse.split('#');

    for (let i = 0; i < parsed.length; i++) {
        let split = parsed[i].split('~');
        split.reverse();

        split = trim_lines(split);

        let title = split.pop();
        let snippit = split;
        if (snippit.length === 0) continue;

        snippit.reverse();
        let item = new Selector(title, snippit);

        if(title.includes("{inactive}")) {
            item.checked = false;
            item.title.textContent = title.replaceAll("{inactive}", "").trim(); 
        }

        menus.push(item);
    }
    render(menus);
}

function render(items) {;
    container[0].innerHTML = "";

    for (let i = 0; i < items.length; i++) { 
        let parent = document.createElement('div');
        parent.setAttribute('id', i);
        parent.classList.add('draggable');

        parent.innerHTML = `
        <div class="arrows">
            <div class="up arrow">▲</div>
            <div class="down arrow">▼</div>
        </div>
        <h3>${items[i].title}</h3>
        <select class="snippit"></select>
        ${items[i].checked ? `<input type="checkbox" class="check" checked>` : `<input type="checkbox" class="check">` }
        `
        inner_snippit = parent.querySelector('.snippit');
        

        for (let j = 0; j < items[i].snippit.length; j++){
            inner_snippit.innerHTML += `<option value="${items[i].snippit[j]}">${items[i].snippit[j]} </option>\n`
        }
        container[0].appendChild(parent);

        if (!items[i].checked) parent.classList.add('inactive');
    }

    snippit = document.querySelectorAll('.snippit');
    arrows = document.querySelectorAll('.arrows');
    checkbox = document.querySelectorAll('.check');  
    
    for (let i = 0; i < snippit.length; i++) {
        snippit[i].addEventListener('change', () => {
            display();
        })
    }

    for (let i = 0; i < snippit.length; i++) {
        checkbox[i].addEventListener('change', (e) => {
            parent = e.target.parentNode;
            menus[parent.id].checked = !menus[parent.id].checked;
            menus[parent.id].checked ? parent.classList.remove('inactive') : parent.classList.add('inactive');
            console.log(menus[parent.id]);
            display();
        })
    }

    for (let i = 0; i < arrows.length; i++) {
        arrows[i].addEventListener('click', (e) => {
            let index = parseInt(e.target.parentElement.parentElement.id);
            let element = menus[index];

            menus.splice(i, 1);
            
            if (e.target.classList.contains('up')) {    
                if (index != 0) index--; 
            } else {
                if (index < menus.length) index++; 
            }
            
            menus.splice(index, 0, element)
            render(menus);
            display();
        })
    }
}

function replaceKeywords() {
    output.textContent = output.textContent.replaceAll('{name}', name)
                                           .replaceAll('{level}', level)
                                           .replaceAll('{track}', track)
                                           .replaceAll('{ntrack}', next_track)
                                           .replaceAll('{nlevel}', next_level);
}