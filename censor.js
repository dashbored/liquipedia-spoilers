
function hideSpoilers({imageAndTextSelector, imageSubstitute}) {
    const images = Array.from(document.querySelectorAll(imageAndTextSelector.imageSelector));

    const groups = [];
    images.forEach(img => {
        const parentElement = img.closest(imageAndTextSelector.parentSelector);
        const textElement = parentElement.querySelector(imageAndTextSelector.textSelector);
        const group = {elements:[img, textElement], originalImageSource: img.src};
        groups.push(group);
    });

    groups.forEach(group => {
        group.elements.forEach(el => {
            removeRedirect(el);
            el.addEventListener("click", () => {
                swapSpoiler(group.elements, group.originalImageSource, imageSubstitute)
            });
        })
    });
}
function swapSpoiler(elements, originalImageSource, imageSubstitute) {
    elements.forEach( (el) => {   
        if(el.tagName.toLowerCase() === "img") {
            if(el.src === imageSubstitute) {
                el.src = originalImageSource;
            } else {
                el.src = imageSubstitute;
            }
        } else if(el.tagName.toLowerCase() === "a" || el.tagName.toLowerCase() === "span") {
            if(el.style.opacity == "0") {
                el.style.opacity = "1";
            } else {
                el.style.opacity = "0";
            }
        }
    }
    )
}

function removeRedirect(element) {
    if(element.tagName.toLowerCase() === "img") {
        element.parentElement.removeAttribute("href");
    } else {
        element.removeAttribute("href");
    }
}

// Prize Pool
hideSpoilers({
    imageAndTextSelector:{
        imageSelector: ".block-team .team-template-darkmode a img",
        parentSelector: ".block-team",
        textSelector: ".block-team .name a"
    },
    imageSubstitute: browser.runtime.getURL("svg/eye-off.svg")
});

// Group Stage - standings
hideSpoilers({
    imageAndTextSelector:{
        imageSelector: ".grouptableslot .team-template-darkmode a img",
        parentSelector: ".grouptableslot",
        textSelector: ".grouptableslot .team-template-text a"
    },
    imageSubstitute: browser.runtime.getURL("svg/eye-off.svg")
});

// Playoffs
hideSpoilers({
    imageAndTextSelector:{
        imageSelector: ".block-team .team-template-darkmode img",
        parentSelector: ".block-team",
        textSelector: ".block-team .name"
    },
    imageSubstitute: browser.runtime.getURL("svg/eye-off.svg")
});