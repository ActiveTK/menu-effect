/*!
 * menu-effect.js / 2024.12.18
 * Author: ActiveTK.
*/

window.menujs = window.menujs ?? {
    targets: [],
    triggers: [],
    updateTriggersAndTargets: function () {

        window.menujs.targets = document.querySelectorAll('[data-menueffect-target]');
        window.menujs.triggers = document.querySelectorAll('[data-menueffect-trigger]');

        for (const trigger_element of window.menujs.triggers) {
            trigger_element.onclick = function () {
                window.menujs.showMenu(trigger_element.dataset.menueffectTrigger);
            }
        }

    },
    showMenu: function (target) {

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const gridSize = Math.floor(viewportWidth / 15);
        const numCols = Math.floor(viewportWidth / gridSize);
        const numRows = Math.floor(viewportHeight / gridSize);

        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `display:grid;grid-template-columns:repeat(${numCols},1fr);grid-template-rows:repeat(${numRows},1fr);height:100vh;width:100vw;z-index:200;`;
        gridContainer.style.position = 'fixed';
        gridContainer.style.top = '0';
        gridContainer.style.left = '0';
        gridContainer.style.width = '100%';
        gridContainer.style.height = '100%';
        gridContainer.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";

        gridContainer.id = "__autogen_menu";

        let grid = [];
        for (let y = 0; y < numRows; y++) {
            grid[y] = [];
            for (let x = 0; x < numCols; x++) {
                const cell = document.createElement('div');
                cell.style.cssText = `background-color:#000;border:1px solid #111;box-sizing:border-box;opacity:0;transition:opacity .5s ease;clip-path:circle(75%);overflow:hidden;font-size:`+(gridSize - 8) + `px;color: #ffffff;`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                grid[y][x] = cell;
                gridContainer.appendChild(cell);
            }
        }
        document.body.appendChild(gridContainer);

        const userRawData = document.querySelectorAll('[data-menueffect-target=' + target + ']')[0];
        window.menujs.userData = {};
        try {
            window.menujs.userData = JSON.parse(userRawData.textContent);
        } catch (e) {
            throw "User Content in json format is only supported.";
        }

        for (let blockNumber in window.menujs.userData) {
            try {
                let blockType = window.menujs.userData[blockNumber]["type"];
                if (blockType == "text" || blockType == "link") {

                    let blockData = window.menujs.userData[blockNumber];

                    let x = blockData["position-x"];
                    let y = blockData["position-y"];
                    let height = blockData["height"];
                    let width = blockData["width"];
                    let content = blockData["content"];
                    let additional_style = blockData["style"];
                    let fontsize = blockData["fontsize"];

                    if (!x) x = 0; if (!y) y = 0;
                    if (!height) height = 1; if (!width) width = 1;
                    if (!content) content = ""; if (!fontsize) fontsize = 1;

                    if (!grid[y] || !grid[y][x])
                        continue;

                    if (additional_style)
                        grid[y][x].style.cssText += additional_style;

                    grid[y][x].style.cssText += "font-size: " + (gridSize * fontsize - 8) + "px !important;";

                    if (height != 1 || width != 1) {

                        grid[y][x].style.cssText +=
                            "grid-column: " + (x+1) + " / span " + width + ";" +
                            "grid-row: " + (y+1) + " / span " + height + ";";

                    }

                    if (blockType == "text")
                        grid[y][x].innerHTML = content;
                    else {

                        let src = blockData["href"];
                        if (!src) src = "#";

                        const atag = document.createElement('a');
                        atag.innerText = content;
                        atag.href = src;
                        atag.style.cssText = `color:#fff;text-decoration:none;position:relative;display:block;width:100%;height:100%;`;

                        grid[y][x].appendChild(atag);

                        const effect = document.createElement('div');
                        effect.style.cssText = `position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(77,255,171,.5) 0,hsla(0,0%,100%,0) 80%);border-radius:50%;pointer-events:none;opacity:0;transition:opacity .5s,transform .5s;transform:translate(-50%,-50%) scale(0);`;
                        grid[y][x].style.position = "relative";
                        grid[y][x].appendChild(effect);

                        grid[y][x].addEventListener('mousemove', function (e) {
                            const rect = this.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            effect.style.left = `${x}px`;
                            effect.style.top = `${y}px`;
                            effect.style.opacity = "1";
                            effect.style.transform = "translate(-50%, -50%) scale(1)";
                        });

                        grid[y][x].addEventListener('mouseout', function () {
                            effect.style.opacity = "0";
                            effect.style.transform = "translate(-50%, -50%) scale(0)";
                        });

                    }
                }

                else if (blockType == "div") {

                    let blockData = window.menujs.userData[blockNumber];

                    let x = blockData["position-x"];
                    let y = blockData["position-y"];
                    let height = blockData["height"];
                    let width = blockData["width"];

                    if (!x) x = 0; if (!y) y = 0;
                    if (!height) height = 1; if (!width) width = 1;

                    if (!grid[y] || !grid[y][x])
                        continue;

                    grid[y][x].style.cssText +=
                        "grid-column: " + (x+1) + " / span " + width + ";" +
                        "grid-row: " + (y+1) + " / span " + height + ";";

                }
                
                else if (blockType == "image") {

                    let blockData = window.menujs.userData[blockNumber];

                    let x = blockData["position-x"];
                    let y = blockData["position-y"];
                    let src = blockData["src"];
                    let title = blockData["title"];

                    if (!x) x = 0; if (!y) y = 0;
                    if (!title) title = "";
                    if (!src) throw "Parameter [src] is required.";

                    if (!grid[y] || !grid[y][x])
                        continue;

                    const image = document.createElement('img');
                    image.src = src;
                    image.title = title;
                    image.style.cssText = `max-width:100%;height:auto;`;
                    grid[y][x].appendChild(image);

                }

                else if (blockType == "close") {

                    let x = window.menujs.userData[blockNumber]["position-x"];
                    let y = window.menujs.userData[blockNumber]["position-y"];

                    if (!x) x = 14; if (!y) y = 0;

                    if (!grid[y] || !grid[y][x])
                        continue;

                    let block = grid[y][x];
                    block.style.color = "#bce2e8";
                    block.style.cssText +=`font-size: ` + (gridSize * 0.7 - 8) + `px !important;text-align:center;`;
                    block.innerHTML = "&#215;";
                    block.onclick = function () {
                        window.menujs.closeMenu();
                    }
                    block.addEventListener('mouseover', function () {
                        this.style.backgroundColor = "#0a5a66";
                        this.style.cursor = "pointer";
                    });
                    block.addEventListener('mouseout', function () {
                        this.style.backgroundColor = "#000000";
                        this.style.cursor = "default";
                    });

                } else {
                    throw "Unsupported type: " + blockType;
                }
            } catch (e) {
                throw "Processing error: " + e;
            }
        }

        const flatGrid = grid.flat();
        const shuffledCells = flatGrid.sort(() => 0.5 - Math.random());
        shuffledCells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.opacity = '1';
            }, index * 6);
        });

        window.__menu_grid = grid;
    },
    closeMenu: function () {

        const flatGrid = window.__menu_grid.flat();
        const shuffledCells = flatGrid.sort(() => 0.5 - Math.random());
        shuffledCells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.opacity = '0';
            }, index * 3);
        });
        
        setTimeout(function() {
            const elementToRemove = document.getElementById('__autogen_menu');
            if (elementToRemove) {
                elementToRemove.remove();
            }
        }, 1000);

    }
};
document.addEventListener("DOMContentLoaded", function () {

    window.menujs.updateTriggersAndTargets();

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

}, false);
