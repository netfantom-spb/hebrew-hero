// Types for site configs
export type RuleConfig = {
    target: TargetConfig,
    action: ActionConfig
}

export type TargetConfig = {
    selector: string,
    multiple?: boolean,
    wait?: boolean | TargetWaitConfig
}

export type TargetWaitConfig = {
    delay: number,
    retry: number
}

export type ActionConfig = ActionConfigTextContent | ActionConfigValue;

export type ActionConfigTextContent = {
    textContent: LocalizedTextConfig
}

export type ActionConfigValue = {
    value: LocalizedTextConfig
}

export type LocalizedTextConfig = {
    he?: string,
    ru?: string,
    en?: string
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

export default rulesConfig