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

type ActionConfig = any;


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
    public action: Action;

    constructor(ruleConfig: RuleConfig) {
        this.target = new Target(ruleConfig.target);
        this.action = new Action(ruleConfig.action);
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

class Action implements IAction {
    public textContent;
    
    constructor(actionConfig: ActionConfig) {
        this.textContent = actionConfig.textContent;
    }
}


const rulesConfig: RuleConfig[] = [
    {
        target: {
            selector: '.test-div.static',
            multiple: false
        },
        action: {
            textContent: 'This content have JUST changed by Hebrew-Hero'
        }
    },
    {
        target: {
            selector: '.test-div.static.multiple > span',
            multiple: true
        },
        action: {
            textContent: 'UPDATED'
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
            textContent: 'UPDATED'
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
            textContent: 'UPDATED'
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
            textContent: 'UPDATED'
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
        applyAction(target, rule.action);
    }
    else if (target instanceof NodeList) {
        (target as NodeList).forEach(elem => applyAction(elem, rule.action));
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

function applyAction(element: Element | Node, action: any) {
    if (action?.textContent) {
        element.textContent = action.textContent;
    }
}