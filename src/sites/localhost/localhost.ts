console.log('Loaded localhost.ts');

import _ from "lodash";

import { RuleConfig, TargetConfig, ActionConfig, ActionConfigTextContent, ActionConfigValue, LocalizedTextConfig } from './localhost.config';
import rulesConfig from "./localhost.config";


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

    async run(): Promise<void> {
        this.target.find().then(target => {
            if (target instanceof Element) {
                if (this.action) {
                    this.action.run(target);
                }
            }
            else if (target instanceof NodeList) {
                (target as NodeList).forEach(elem => {
                    if (this.action) {
                        this.action.run(elem)
                    }
                });
            }
            else {
                throw new Error('Unknown target type');
            }
        });
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

    async find(): Promise<Element | NodeList | null> {
        if (this.multiple) {
            const elems = document.querySelectorAll(this.selector);
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
            const elem = document.querySelector(this.selector);
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
    run(element: any): void { };
}

class ActionTextContent extends Action {
    public textContent: LocalizedTextConfig;

    constructor(actionConfig: ActionConfig) {
        super();
        this.textContent = (actionConfig as ActionConfigTextContent).textContent;
    }

    run(element: any) {
        console.log('Run Forest, run')
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




function normalizeConfig(rulesConfig: RuleConfig[]): Rule[] {
    return rulesConfig.map(ruleConfig => {
        return new Rule(ruleConfig);
    });
}

const rules = normalizeConfig(rulesConfig);
console.log(rules);

rules.forEach(rule => rule.run());
