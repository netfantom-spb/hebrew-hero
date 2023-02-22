console.log('Loaded leumi.co.il');

import { SiteConfig } from "../../siteConfig";
import { Site } from "../../site"

const siteConfig: SiteConfig = {
    pages: [
        {
            rules: [
                {
                    $: ['#enter_your_account > div.includeLink > a'],
                    _: {
                        en: 'Enter',
                        ru: 'Войти'
                    }
                },
                {
                    $: ['#enter_create_account > div.includeLink > a'],
                    _: {
                        en: 'Open account',
                        ru: 'Открыть счет'
                    }
                }, 
                {
                    $: ['.inner_menu.iconMenu', 1000, 5],
                    r: [
                        {
                            $: ['li#header_talk_dropdown button.dropdown-toggle'],
                            _: {
                                en: 'Связаться с нами',
                                ru: 'Связаться'
                            },
                            s: [
                                ['font-size', '15px']
                            ]
                        },
                        {
                            $: ['li:nth-child(2) > a'],
                            _: {
                                en: 'Филиалы',
                                ru: 'Филиалы'
                            },
                            s: [
                                ['font-size', '15px']
                            ]
                        },
                        {
                            $: ['li:nth-child(1) > a'],
                            _: {
                                en: 'Доступность',
                                ru: 'Доступность'
                            },
                            s: [
                                ['font-size', '15px']
                            ]
                        }
                    ]
                    
                }
            ]
        }
    ]
}

new Site(siteConfig).run(window.location.href);