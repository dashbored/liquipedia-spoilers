interface ImageAndTextSelector {
    imageSelector: string,
    parentSelector: string,
    textSelector: string
};

interface RelatedElements {
    primary: string,    // the class selector of the primary object
    parent?: string,    // the common parent class selector
    related?: string[]   // related class selectors
}


class SpoilerHandler {
    private readonly imageSubstitute: string;
    private readonly placeHolderString = "******";
    private readonly placeHolderScore = 'X';

    constructor(imageSubstitute: string) {
        this.imageSubstitute = imageSubstitute;
    }

    public hideSpoilers(selector: RelatedElements): void {
        const elements = Array.from(document.querySelectorAll(selector.primary)) as Element[];
        
        elements.forEach(e => {
            const parentElement = e.closest(selector.parent ?? 'null'); // Not so nice passing a 'null' string, but I just want it to fail :D
            const related = selector.related
            ?.map(r => parentElement?.querySelector(r) ?? undefined)
            .filter((r): r is Element => r !== null);

            this.setupElementHandlers(e, related);
        });
    }

    private setupElementHandlers(
        primary: Element, 
        related: Element[] | undefined
    ): void {

        const toggleHandler = () => this.toggleSpoiler(primary, related);
        this.storeOriginalState(primary);
        this.removeRedirect(primary);
        primary.addEventListener("click", toggleHandler);
        if(related) {
            this.storeOriginalState(...related);
            this.removeRedirect(...related);
            related.forEach(r => {
                r.addEventListener("click", toggleHandler);
            });
        }

        // Initial hide
        this.toggleSpoiler(primary, related, true);
    }

    private storeOriginalState(...elements: Element[]) {
        elements.forEach(e => {
            if("dataset" in e && (e as HTMLElement).dataset.original !== undefined) {
                return;
            }
            if(e instanceof HTMLImageElement) {
                e.dataset.original = e.src;
            } else if (e instanceof HTMLSpanElement || e instanceof HTMLDivElement || e instanceof HTMLAnchorElement) {
                e.dataset.original = e.textContent?.trim() || '';
            }
        });
    }

    private removeRedirect(...elements: Element[]): void {
        elements.forEach(element => {
            if (element instanceof HTMLImageElement) {
                element.parentElement?.removeAttribute("href");
            } else if (element instanceof HTMLSpanElement) {
                element.querySelectorAll("a").forEach(a => a.removeAttribute("href"));
            } else if (element instanceof HTMLAnchorElement) {
                element.removeAttribute("href");
            } else if (element instanceof HTMLDivElement) {
                element.style.cursor = 'pointer';
            }
        });
    }

    private toggleSpoiler(
        primary: Element, 
        related: Element[] | undefined, 
        forceHide: boolean = false
    ): void {
        let isCurrentlyHidden: boolean;
        if(primary instanceof HTMLImageElement) {
            isCurrentlyHidden = primary.src === this.imageSubstitute;
        } else {
            isCurrentlyHidden = primary.textContent?.trim() === this.placeHolderScore;
        }

        const shouldShow = !forceHide && isCurrentlyHidden;
        if(primary instanceof HTMLImageElement) {
            primary.src = shouldShow ? primary.dataset.original || '' : this.imageSubstitute;
        } else if (primary instanceof HTMLSpanElement || primary instanceof HTMLAnchorElement){
            primary.textContent = shouldShow ? primary.dataset.original || '' : this.placeHolderString;
        } else if (primary instanceof HTMLDivElement) {
            primary.textContent = shouldShow ? primary.dataset.original || '' : this.placeHolderScore;
        }

        related?.forEach(r => {
            if(r instanceof HTMLSpanElement || r instanceof HTMLAnchorElement) {
                r.textContent = shouldShow ? r.dataset.original || '' : this.placeHolderString;
            } else if(r instanceof HTMLDivElement) {
                r.textContent = shouldShow ? r.dataset.original || '' : this.placeHolderScore;
            }
        })       
    }
}

// Initialize and use the spoiler handler
const spoilerHandler = new SpoilerHandler(browser.runtime.getURL("svg/eye-off.svg"));

// Group Stage - standings
spoilerHandler.hideSpoilers({
    primary: ".grouptableslot .team-template-darkmode a img",
    parent: ".grouptableslot",
    related: [".grouptableslot .team-template-text a"]
});

// Playoffs
spoilerHandler.hideSpoilers({
    primary: ".block-team .team-template-darkmode a img",
    parent: ".block-team",
    related: [".block-team span.name > a"]
});

// Prize Pool
spoilerHandler.hideSpoilers({
    primary: ".block-team .team-template-darkmode > img",
    parent: ".block-team",
    related: [".block-team span.name"]
});

// Score in tree
spoilerHandler.hideSpoilers({
    primary: ".brkts-opponent-entry-last .brkts-opponent-score-inner",
    parent: ".brkts-match",
    related: [".brkts-opponent-score-inner"]
});

// Score in details
spoilerHandler.hideSpoilers({
    primary: ".brkts-popup-header-opponent-score-left",
    parent: ".brkts-popup-header-dev",
    related: [".brkts-popup-header-opponent-score-right"]
});