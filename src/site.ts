import { SiteConfig, PageConfig, RuleConfig, RuleShortConfig, TargetConfig, ActionConfig, ActionConfigTextContent, ActionConfigValue, LocalizedTextConfig, StyleConfig } from './siteConfig';

import { ExtensionConfiguration } from './properties'

// Types and classes for worker
export class Site {
    pages: Page[];

    constructor(siteConfig: SiteConfig) {
        this.pages = siteConfig.pages.map(pageConfig => new Page(pageConfig));
    }

    async run(url: string) {
        return Promise.allSettled(
            this.pages.map(page => page.run(url))
        );
    }
}

class Page {
    protected urlPattern: RegExp;
    protected rules: Rule[];

    constructor(pageConfig: PageConfig) {
        this.urlPattern = new RegExp(pageConfig.url || '.*');
        this.rules = pageConfig.rules.map(ruleConfig => new Rule(ruleConfig));
        console.debug(this.rules)
    }

    async run(url: string) {
        if (url.match(this.urlPattern)) {
            console.log('URL "%s" matches "%s"', url, this.urlPattern);

            let lastUrl: string = '';
            let timer: number | null = null;

            return new MutationObserver(() => {
                console.debug('Mutation observer event', location.href);
                if (lastUrl !== location.href) {
                    lastUrl = location.href;
                    console.debug('=>>>> Re-run rules');
                    if (timer) {
                        console.debug('!!!Found re-run timer, clearing it!!!')
                        clearTimeout(timer);
                        timer == null;
                    }
                    timer = setTimeout(() => {
                        timer = null;
                        return Promise.allSettled(
                            this.rules.map(rule => rule.run())
                        )
                    }, 1000
                    );
                }
            }).observe(document, { subtree: true, childList: true })


            // return Promise.allSettled(
            //     this.rules.map(rule => rule.run())
            // );
        }
        else {
            return;
        }
    }
}

class Rule {
    public target: Target;
    public action: Action | undefined;
    public rules: Rule[] | undefined;
    public style: Style | undefined;

    constructor(ruleConfig: RuleConfig | RuleShortConfig) {
        // short syntax
        if ('$' in ruleConfig) {
            this.target = new Target(
                {
                    selector: (ruleConfig as RuleShortConfig).$[0],
                    multiple: (ruleConfig as RuleShortConfig).$[3] ?? false,
                    wait: {
                        delay: (ruleConfig as RuleShortConfig).$[1] ?? 0,
                        retry: (ruleConfig as RuleShortConfig).$[2] ?? 1,
                    }
                }
            )
            if ('_' in ruleConfig) {
                this.action = ActionFactory.createAction(
                    {
                        textContent: (ruleConfig._ as LocalizedTextConfig)
                    }
                )
            }
            if ('r' in ruleConfig) {
                this.rules = (ruleConfig.r as RuleShortConfig[]).map(rule => new Rule(rule));
            }
            if ('s' in ruleConfig) {
                this.style = new Style(ruleConfig.s as StyleConfig[]);
            }
        }
        // full syntax
        else {
            this.target = new Target(ruleConfig.target);
            if (ruleConfig.action) {
                this.action = ActionFactory.createAction(ruleConfig.action);
            }
            if (ruleConfig.rules && ruleConfig.rules.length > 0) {
                this.rules = ruleConfig.rules.map(rule => new Rule(rule));
            }
            if (ruleConfig.style && ruleConfig.style.length > 0) {
                this.style = new Style(ruleConfig.style as StyleConfig[]);

            }
        }
    }

    async run(parentElement?: Element): Promise<void> {
        console.debug('Run rule', this.target, this.action)
        return this.target.find(parentElement)
            .then(async target => {
                console.debug('Target', target)
                // single element
                if (target instanceof Element) {
                    // run action if defined
                    if (this.action) {
                        await this.action.run(target);
                    }
                    // apply styles
                    if (this.style) {
                        this.style.appy(target);
                    }
                    // run nested rules if exists
                    if (this.rules) {
                        console.debug('Run nested rules', this.target, this.rules)
                        await Promise.allSettled(
                            this.rules.map(rule => rule.run(target))
                        )
                    }

                }
                // multiple elements
                else if (target instanceof NodeList) {
                    (target as NodeList).forEach(async elem => {
                        if (this.action) {
                            await this.action.run(elem as Element)
                        }
                        // apply styles
                        if (this.style) {
                            this.style.appy(elem as Element);
                        }
                        // run nested rules if exists
                        if (this.rules) {
                            await Promise.allSettled(
                                this.rules.map(rule => rule.run(elem as Element))
                            );
                        }
                    });
                }
                else {
                    //throw new Error('Unknown target type');
                }
            });
    }
}

class Target {
    public selector: string;
    public multiple: boolean;
    public wait: {
        delay: number,
        retry: number;
    }

    constructor(targetConfig: TargetConfig) {
        this.selector = targetConfig.selector;
        this.multiple = targetConfig.multiple ?? false;

        const DefaultWaitConfig =
        {
            delay: 500,
            retry: 3
        },
            DefaultNowaitConfig = {
                delay: 0,
                retry: 1
            };

        this.wait = DefaultNowaitConfig;
        if (targetConfig.wait === true) {
            this.wait = DefaultWaitConfig;
        }
        else if (typeof (targetConfig.wait) == 'object') {
            this.wait = {
                delay: targetConfig.wait.delay,
                retry: targetConfig.wait.retry
            }
        }
    }

    async find(parentElement?: Element): Promise<Element | NodeList | null> {
        const root = parentElement ?? document;
        if (this.multiple) {
            const elems = root.querySelectorAll(this.selector);
            if (elems.length == 0) {
                if (this.wait.retry > 0) {
                    this.wait.retry--;
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(this.find());
                        }, this.wait.delay)
                    })
                }
                else {
                    console.warn('Element not found %s', this.selector);
                }
            }
            return elems;
        }
        else {
            const elem = root.querySelector(this.selector);
            if (elem === null) {
                if (this.wait.retry > 0) {
                    this.wait.retry--;
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(this.find());
                        }, this.wait.delay)
                    })
                }
                else {
                    console.warn('Element not found %s', this.selector);
                }
            }
            return elem;
        }
    }
}

class ActionFactory {
    static createAction(actionConfig: ActionConfig): Action | undefined {
        if ('textContent' in actionConfig) {
            return new ActionTextContent(actionConfig);
        }
        else if ('value' in actionConfig) {
            return new ActionValue(actionConfig);
        }
        else {
            return undefined;
        }
    }
}

abstract class Action {
    async run(element: Element): Promise<void> { };
}

class ActionTextContent extends Action {
    public textContent: LocalizedTextConfig;

    constructor(actionConfig: ActionConfig) {
        super();
        this.textContent = (actionConfig as ActionConfigTextContent).textContent;
    }

    async run(element: Element): Promise<void> {
        if ('textContent' in element) {
            if (!('he' in this.textContent)) {
                this.textContent.he = element.textContent || '';
            }
            element.textContent = this.textContent[ExtensionConfiguration.lang] || '';
        }
    }
}

class ActionValue extends Action {
    public value: LocalizedTextConfig;

    constructor(actionConfig: ActionConfig) {
        super();
        this.value = (actionConfig as ActionConfigValue).value;
    }

    async run(element: Element): Promise<void> {
        if (element.hasAttribute('value')) {
            if (!('he' in this.value)) {
                this.value.he = element.getAttribute('value') || undefined;
            }
            element.setAttribute('value', this.value[ExtensionConfiguration.lang] || '');
        }
    }
}

class Style {
    private style: StyleConfig[];

    constructor(styleConfig: StyleConfig[]) {
        this.style = styleConfig.map(style => ([...style]));
    }

    appy(element: Element) {
        this.style.forEach(style => {
            const [name, value] = [...style];
            (element as HTMLElement).style.setProperty(name, value, 'important');
        })
    }
}