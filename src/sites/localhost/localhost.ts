console.log('Loaded localhost.ts');

import _ from "lodash";

// Types for site configs
type RuleConfig = {
    target: TargetConfig,
    action: ActionConfig
}

type TargetConfig = {
    selector: string,
    multiple?: boolean,
    wait?: boolean | TargetWaitConfig
}

type TargetWaitConfig = {
    delay: number,
    retry: number
}

type ActionConfig = ActionConfigTextContent | ActionConfigValue;

type ActionConfigTextContent = {
    textContent: LocalizedTextConfig
}

type ActionConfigValue = {
    value: LocalizedTextConfig
}

type LocalizedTextConfig = {
    he?: string,
    ru?: string,
    en?: string
}


// Types and classes for worker

type IRule = {
    target: ITarget,
    action: IAction
}
type ITarget = {
    selector: string,
    multiple: boolean,
    wait: {
        delay: number,
        retry: number
    }
}

type IAction = any;

class Rule implements IRule {
    public target: Target;
    public action: Action | undefined;

    constructor(ruleConfig: RuleConfig) {
        this.target = new Target(ruleConfig.target);
        this.action = ActionFactory.createAction(ruleConfig.action);
    }
}

class Target implements ITarget {
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
    run(element: any): void { };
}

class ActionTextContent extends Action {
    public textContent: LocalizedTextConfig;

    constructor(actionConfig: ActionConfig) {
        super();
        this.textContent = (actionConfig as ActionConfigTextContent).textContent;
    }

    run(element: any) {
        if (!('he' in this.textContent)) {
            this.textContent.he = element.textContent
        }
        element.textContent = this.textContent.en;
    }
}

class ActionValue extends Action {
    public value: LocalizedTextConfig;

    constructor(actionConfig: ActionConfig) {
        super();
        this.value = (actionConfig as ActionConfigValue).value;
    }
}

const rulesConfig: RuleConfig[] = [
    {
        target: {
            selector: '.test-div.static',
            multiple: false
        },
        action: {
            textContent: {
                en: 'This content have JUST changed by Hebrew-Hero'
            }
        }
    },
    {
        target: {
            selector: '.test-div.static.multiple > span',
            multiple: true
        },
        action: {
            textContent: {
                en: 'UPDATED'
            }
        }
    },
    {
        target: {
            selector: '.dynamic-container-1 .update-target',
            multiple: false,
            wait: {
                delay: 2000,
                retry: 6
            }
        },
        action: {
            textContent: {
                en: 'UPDATED'
            }
        }
    },
    {
        target: {
            selector: '.dynamic-container-2 .update-target',
            multiple: true,
            wait: {
                delay: 1000,
                retry: 6
            }
        },
        action: {
            textContent: {
                en: 'UPDATED'
            }
        }
    },
    {
        target: {
            selector: '.dynamic-container-3 .update-target',
            multiple: false,
            wait: {
                delay: 500,
                retry: 3
            }
        },
        action: {
            textContent: {
                en: 'UPDATED'
            }
        }
    }
]


function normalizeConfig(rulesConfig: RuleConfig[]): Rule[] {
    return rulesConfig.map(ruleConfig => {
        return new Rule(ruleConfig);
    });
}

const rules = normalizeConfig(rulesConfig);
console.log(rules);


rules.forEach(rule => proceedRule(rule));

async function proceedRule(rule: Rule) {
    const target = await getTargets(rule.target);
    if (target instanceof Element) {
        if (rule.action) {
            applyAction(target, rule.action);
        }
    }
    else if (target instanceof NodeList) {
        if (rule.action) {
            (target as NodeList).forEach(elem => applyAction(elem, rule.action as Action));
        }
    }
    else {
        throw new Error('Unknown target type');
    }
}

async function getTargets(target: Target): Promise<Element | NodeList | null> {
    if (target?.multiple) {
        const elems = document.querySelectorAll(target.selector);
        if (elems.length == 0) {
            if (target.wait.retry > 0) {
                target.wait.retry--;
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(getTargets(target));
                    }, target.wait.delay)
                })
            }
            else {
                console.warn('Element not found %s', target.selector);
            }
        }
        return elems;
    }
    else {
        const elem = document.querySelector(target.selector);
        if (elem === null) {
            if (target.wait.retry > 0) {
                target.wait.retry--;
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(getTargets(target));
                    }, target.wait.delay)
                })
            }
            else {
                console.warn('Element not found %s', target.selector);
            }
        }
        return elem;
    }
}

function applyAction(element: Element | Node, action: Action) {
    action.run(element);
}