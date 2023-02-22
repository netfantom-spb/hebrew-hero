console.log('Loaded localhost.ts');

import _ from "lodash";

import { SiteConfig, PageConfig, RuleConfig, TargetConfig, ActionConfig, ActionConfigTextContent, ActionConfigValue, LocalizedTextConfig } from './localhost.config';
import siteConfig from "./localhost.config";

import { ExtensionConfiguration } from '../../properties'

// Types and classes for worker
class Site {
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
    }

    async run(url: string) {
        if (url.match(this.urlPattern)) {
            console.log('URL "%s" matches "%s"', url, this.urlPattern);
            return Promise.allSettled(
                this.rules.map(rule => rule.run())
            );
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

    constructor(ruleConfig: RuleConfig) {
        this.target = new Target(ruleConfig.target);
        if (ruleConfig.action) {
            this.action = ActionFactory.createAction(ruleConfig.action);
        }
        if (ruleConfig.rules && ruleConfig.rules.length > 0) {
            this.rules = ruleConfig.rules.map(rule => new Rule(rule));
        }
    }

    async run(parentElement?: Element): Promise<void> {
        return this.target.find(parentElement)
            .then(async target => {
                // single element
                if (target instanceof Element) {
                    // run action if defined
                    if (this.action) {
                        await this.action.run(target);
                    }
                    // run nested rules if exists
                    if (this.rules) {
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

                        // run nested rules if exists
                        if (this.rules) {
                            await Promise.allSettled(
                                this.rules.map(rule => rule.run(elem as Element))
                            );
                        }
                    });
                }
                else {
                    throw new Error('Unknown target type');
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

        const DefaultWaitConfig = {
            delay: 500,
            retry: 3
        },
            DefaultNowaitConfig = {
                delay: 0,
                retry: 1
            };

        if (_.isBoolean(targetConfig.wait)) {
            this.wait = targetConfig.wait ? DefaultWaitConfig : DefaultNowaitConfig;
        }
        else if (_.isObject(targetConfig.wait)) {
            this.wait = {
                delay: targetConfig.wait.delay,
                retry: targetConfig.wait.retry
            }
        }
        else {
            this.wait = DefaultNowaitConfig;
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
        if ('textContent' in element) {
            if (!('he' in this.value)) {
                this.value.he = element.getAttribute('value') || undefined;
            }
            element.setAttribute('value', this.value[ExtensionConfiguration.lang] || '');
        }
    }
}

new Site(siteConfig).run(window.location.href);
