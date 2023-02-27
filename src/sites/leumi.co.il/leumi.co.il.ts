console.log('Loaded leumi.co.il Hero');

import { SiteConfig } from "../../siteConfig";
import { Site } from "../../site"

const siteConfig: SiteConfig = {
    pages: [
        {
            url: 'www.leumi.co.il',
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
                    $: ['.inner_menu', 500, 5],
                    r: [
                        {
                            $: ['li#header_talk_dropdown button.dropdown-toggle'],
                            _: {
                                en: 'Связаться с нами',
                                ru: 'Связаться'
                            },
                            s: [
                                ['font-size', '15px']
                            ],
                            r: [
                                {
                                    $: ['.menu_dropdown.talk_menu.menuDisplay'],
                                    r: [
                                        {
                                            $: ['.iconsMenuLinks > ul > li:nth-child(1) div.relatedLinkPic'],
                                            _: {
                                                ru: 'Написать',
                                                en: 'Write'
                                            }
                                        },
                                        {
                                            $: ['.iconsMenuLinks > ul > li:nth-child(3) div.relatedLinkPic'],
                                            _: {
                                                ru: 'Позвонить',
                                                en: 'Call'
                                            }
                                        },
                                        {
                                            $: ['.iconsMenuLinks > ul > li:nth-child(4) div.relatedLinkPic'],
                                            _: {
                                                ru: 'Заказать звонок',
                                                en: 'Order a call'
                                            }
                                        },
                                        {
                                            $: ['.iconsMenuLinks > ul > li:nth-child(6) div.relatedLinkPic'],
                                            _: {
                                                ru: 'Записаться на прием',
                                                en: 'Appointment'
                                            }
                                        }
                                    ]
                                }
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

                },
                {
                    $: ['.menuCategory', 1000, 5],
                    r: [
                        {
                            $: ['li:nth-child(2) a'],
                            _: {
                                en: 'Business',
                                ru: 'Business'
                            }
                        },
                        {
                            $: ['li:nth-child(1) a'],
                            _: {
                                en: 'Private',
                                ru: 'Private'
                            }
                        }
                    ]
                }
            ]
        },
        {
            url: 'hb2.bankleumi.co.il',
            rules: [
                {
                    $: ['h2.text-heading'],
                    _: {
                        ru: 'Вход',
                        en: 'Login'
                    }
                },
                {
                    $: ['input[aria-describedby="user_rules"][type="text"] ~ label', 2000,20],
                    _: {
                        ru: 'Имя пользователя',
                        en: 'User name'
                    }
                },
                {
                    $: ['input[aria-describedby="password_rules"][type="password"] ~ label', 2000, 20],
                    _: {
                        ru: 'Пароль',
                        en: 'Password'
                    }
                },
                {
                    target: {
                        selector: 'button[type="submit"]',
                    },
                    action: {
                        textContent: {
                            ru: 'Войти',
                            en: 'Login'
                        }
                    }
                },
                {
                    $: ["div[data-cy='cookies-banner']"],
                    r: [
                        {
                            $: ['div.text-xl', 500, 3],
                            _: {
                                ru: 'Сайт использует файлы cookie, чтобы предоставить вам лучший опыт просмотра, а также для статистических, характеристических и маркетинговых целей.',
                                en: 'Сайт использует файлы cookie, чтобы предоставить вам лучший опыт просмотра, а также для статистических, характеристических и маркетинговых целей.'
                            }
                        }
                    ]
                },
                {
                    $: ["div.shrink > button > span.d-none.d-sm-block"],
                    _: {
                        ru: 'Закрыть',
                        en: 'Close'
                    }
                },
                {
                    $: ['a[name="cookiesClick"]'],
                    _: {
                        ru: 'тут',
                        en: 'here'
                    },
                    r: [
                        {
                            $: ['']
                        }
                    ]
                }

                
//Для получения информации о файлах cookie и обновленной политике конфиденциальности нажмите здесь.
            ]
        }
    ]
}

new Site(siteConfig).run(location.href);