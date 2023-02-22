import { Languages } from "./languages"

// Types for site configs
export type SiteConfig = {
    pages: PageConfig[]
}

export type PageConfig = {
    url?: string,
    rules: Array<RuleConfig | RuleShortConfig>
}


export type RuleConfig = {
    target: TargetConfig,
    action?: ActionConfig,
    rules?: RuleConfig[],
    style?: StyleConfig[]
}

export type RuleShortConfig = {
    $: [string, number?, number?, boolean?],
    _?: LocalizedTextConfig,
    r?: RuleShortConfig[],
    s?: StyleConfig[]
}

export type TargetConfig = {
    selector: string,
    multiple?: boolean,
    wait?: boolean | TargetWaitConfig,
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

export type StyleConfig = [string, string]