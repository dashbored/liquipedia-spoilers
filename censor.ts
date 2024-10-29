interface ImageAndTextSelector {
    imageSelector: string,
    parentSelector: string,
    textSelector: string
};


class SpoilerHandler {
    private readonly imageSubstitute: string;
    private readonly placeHolder = "******";

    constructor(imageSubstitute: string) {
        this.imageSubstitute = imageSubstitute;
    }

    public hideSpoilers(selector: ImageAndTextSelector): void {
        const images = Array.from(document.querySelectorAll(selector.imageSelector)) as HTMLImageElement[];

        images.forEach(img => {
            const parentElement = img.closest(selector.parentSelector);
            if(!parentElement) return;

            const textElement = parentElement.querySelector(selector.textSelector) as HTMLAnchorElement | HTMLSpanElement;
            if(!textElement) return;

            this.setupElementHandlers(img, textElement)
        });
    }

    private setupElementHandlers(imgElement: HTMLImageElement, textElement: HTMLAnchorElement | HTMLSpanElement): void {
        // Store original states
        imgElement.dataset.originalImageSource = imgElement.src;
        textElement.dataset.originalContent = textElement.textContent?.trim() || '';

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

    private toggleSpoiler(
        imgElement: HTMLImageElement, 
        textElement: HTMLAnchorElement | HTMLSpanElement, 
        forceHide: boolean = false
    ): void {
        const isCurrentlyHidden = imgElement.src === this.imageSubstitute;
        const shouldShow = !forceHide && isCurrentlyHidden;

        imgElement.src = shouldShow ? imgElement.dataset.originalImageSource || '' : this.imageSubstitute;
        textElement.textContent = shouldShow ? textElement.dataset.originalContent || '' : this.placeHolder;
    }

    private removeRedirect(element: HTMLElement): void {
        if (element instanceof HTMLImageElement) {
            element.parentElement?.removeAttribute("href");
        } else if (element instanceof HTMLSpanElement) {
            element.querySelectorAll("a").forEach(a => a.removeAttribute("href"));
        } else if (element instanceof HTMLAnchorElement) {
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