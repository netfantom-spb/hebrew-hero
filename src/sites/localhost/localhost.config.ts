import { Languages } from "../../languages"

// Types for site configs
export type SiteConfig = {
    pages: PageConfig[]
}

export type PageConfig = {
    url?: string,
    rules: RuleConfig[]
}


export type RuleConfig = {
    target: TargetConfig,
    action?: ActionConfig,
    rules?: RuleConfig[]
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
    [Property in Languages]?: string
}

const siteConfig: SiteConfig = {
    pages: [
        {
            rules: [
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
                },
                {
                    target: {
                        selector: '.container-for-nested-elements'
                    },
                    rules: [
                        {
                            target: {
                                selector: 'li:nth-child(1) > span.nested-element'
                            },
                            action: {
                                textContent: {
                                    en: 'UPDATED-1'
                                }
                            }
                        },
                        {
                            target: {
                                selector: 'li:nth-child(2) > span.nested-element'
                            },
                            action: {
                                textContent: {
                                    en: 'UPDATED-2'
                                }
                            }
                        }
                    ]
                },
                {
                    target: {
                        selector: '.container-for-input > input.input'
                    },
                    action: {
                        value: {
                            en: 'UPDATED'
                        }
                    }
                }
            ]
        }
    ]

}

export default siteConfig