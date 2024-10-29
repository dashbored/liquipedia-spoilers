"use strict";
;
class SpoilerHandler {
    constructor(imageSubstitute) {
        this.placeHolder = "******";
        this.imageSubstitute = imageSubstitute;
    }
    hideSpoilers(selector) {
        const images = Array.from(document.querySelectorAll(selector.imageSelector));
        images.forEach(img => {
            const parentElement = img.closest(selector.parentSelector);
            if (!parentElement)
                return;
            const textElement = parentElement.querySelector(selector.textSelector);
            if (!textElement)
                return;
            this.setupElementHandlers(img, textElement);
        });
    }
    setupElementHandlers(imgElement, textElement) {
        var _a;
        // Store original states
        imgElement.dataset.originalImageSource = imgElement.src;
        textElement.dataset.originalContent = ((_a = textElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        // Remove redirects
        this.removeRedirect(imgElement);
        this.removeRedirect(textElement);
        // Add click handlers
        const toggleHandler = () => this.toggleSpoiler(imgElement, textElement);
        imgElement.addEventListener("click", toggleHandler);
        textElement.addEventListener("click", toggleHandler);
        // Initial hide
        this.toggleSpoiler(imgElement, textElement, true);
    }
    toggleSpoiler(imgElement, textElement, forceHide = false) {
        const isCurrentlyHidden = imgElement.src === this.imageSubstitute;
        const shouldShow = !forceHide && isCurrentlyHidden;
        imgElement.src = shouldShow ? imgElement.dataset.originalImageSource || '' : this.imageSubstitute;
        textElement.textContent = shouldShow ? textElement.dataset.originalContent || '' : this.placeHolder;
    }
    removeRedirect(element) {
        var _a;
        if (element instanceof HTMLImageElement) {
            (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeAttribute("href");
        }
        else if (element instanceof HTMLSpanElement) {
            element.querySelectorAll("a").forEach(a => a.removeAttribute("href"));
        }
        else if (element instanceof HTMLAnchorElement) {
            element.removeAttribute("href");
        }
    }
}
// Initialize and use the spoiler handler
const spoilerHandler = new SpoilerHandler(browser.runtime.getURL("svg/eye-off.svg"));
// Group Stage - standings
spoilerHandler.hideSpoilers({
    imageSelector: ".grouptableslot .team-template-darkmode a img",
    parentSelector: ".grouptableslot",
    textSelector: ".grouptableslot .team-template-text a"
});
// // Playoffs
spoilerHandler.hideSpoilers({
    imageSelector: ".block-team .team-template-darkmode a img",
    parentSelector: ".block-team",
    textSelector: ".block-team span.name > a"
});
// Prize Pool
spoilerHandler.hideSpoilers({
    imageSelector: ".block-team .team-template-darkmode > img",
    parentSelector: ".block-team",
    textSelector: ".block-team span.name"
});
