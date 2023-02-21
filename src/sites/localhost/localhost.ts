console.log('Loaded localhost.ts');


const rules = [
    {
        target: {
            selector: '.test-div.static',
            multiple: false,
            wait: false
        },
        action: {
            textContent: 'This content have JUST changed by Hebrew-Hero'
        }
    },
    {
        target: {
            selector: '.test-div.static.multiple > span',
            multiple: true,
            wait: false
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

rules.forEach(rule => proceedRule(rule));

async function proceedRule(rule: any) {
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

async function getTargets(target: any): Promise<Element | NodeList> {
    if (target?.multiple) {
        const elems = document.querySelectorAll(target.selector);
        if (elems.length == 0 && target.wait !== false && target.wait.retry > 0) {
            target.wait.retry--;
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getTargets(target));
                }, target.wait.delay)
            })
        }
        return elems;
    }
    else {
        const elem = document.querySelector(target.selector);

        if (elem === null) {
            if (target.wait !== false && target.wait.retry > 0) {
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