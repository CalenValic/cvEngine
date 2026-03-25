type uiProperties = {
    text?: string,
    attributes?: Record<string, string>,
    styles?: Record<string, string>,
    tags?: Record<string, string>,
    listeners?: Record<string, EventListenerOrEventListenerObject>
}

export const UI = {
    createElement: (type: keyof HTMLElementTagNameMap, parent: string, id: string, classes: string, properties?: uiProperties) => {
        const element = document.createElement(type)

        element.setAttribute("id", id)
        element.setAttribute("class", classes)

        if (properties != undefined) {
            if (properties.text != undefined) {
                element.innerText = properties.text
            }

            if (properties.attributes != undefined) {
                for (var attribute in properties.attributes) {
                    var attributeValue = properties.attributes[attribute]
                    element.setAttribute(attribute, attributeValue)
                }
            }

            if (properties.styles != undefined) {
                for (var style in properties.styles) {
                    var styleValue = properties.styles[style]
                    element.style.setProperty(style, styleValue)
                }
            }

            if (properties.tags != undefined) {
                for (var tag in properties.tags) {
                    var tagValue = properties.tags[tag]
                    element.setAttribute(`data-${tag}`, tagValue)
                }
            }

            if (properties.listeners != undefined) {
                for (var listener in properties.listeners) {
                    var listenerValue = properties.listeners[listener]
                    element.addEventListener(listener, listenerValue)
                }
            }
        }

        if (parent == "document") {
            document.body.appendChild(element)
        } else {
            const parentElement = document.getElementById(parent)
            if (parentElement != undefined) {
                parentElement.appendChild(element)
            }
        }
    },
    toggleDropdown: (clickElement: HTMLElement, dropdownElement: string, hideOnClick: boolean) => {
        const element = document.getElementById(dropdownElement)
        if (element != undefined) {
            if (!hideOnClick && clickElement.id != dropdownElement) {return}
            element.classList.toggle("showDropdown")
        }
    },
    toggleTags: (tagName: string, camelTagName: string, tagValue: string, classToggle: string) => {
        const elements = document.querySelectorAll(`[data-${tagName}]`)
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i] as HTMLElement
            var elementTagValue = element.dataset[camelTagName]
            if (elementTagValue == tagValue && !element.classList.contains(classToggle)) {
                element.classList.toggle(classToggle)
            } else if (elementTagValue != tagValue && element.classList.contains(classToggle)) {
                element.classList.toggle(classToggle)
            }
        }
    },
    createAnchor: (parent: string, child: string, name: string) => {
        var parentElement = document.getElementById(parent)
        var childElement = document.getElementById(child)
        if (parentElement != undefined && childElement != undefined) {
            parentElement.style.setProperty("anchor-name", `--${name}`)
            childElement.style.setProperty("position-anchor", `--${name}`)
        }
    },
    createDropdown: (parent: string, id: string, text: string, hideOnClick: boolean) => {
        const buttonID = `${id}Button`
        UI.createElement("div", parent, buttonID, "defaultButton dropdownButton defaultText singleLineText", {
            text: text,
            listeners: {
                click: (e) => {UI.toggleDropdown(e.target as HTMLElement, buttonID, hideOnClick)}
            }
        })

        const menuID = `${id}Menu`
        UI.createElement("div", buttonID, menuID, "dropdownMenu")

        const dropdownID = `${id}Dropdown`
        UI.createAnchor(buttonID, menuID, dropdownID)
    },
    createHoverMenu: (parent: string, id: string, text: string) => {
        const buttonID = `${id}HoverMenuButton`
        UI.createElement("div", parent, buttonID, "defaultText singleLineText defaultButton hoverMenuButton", {
            text: text
        })

        const menuID = `${id}HoverMenu`
        UI.createElement("div", buttonID, menuID, "hoverMenu")

        const hoverMenuID = `${id}HoverMenu`
        UI.createAnchor(buttonID, menuID, hoverMenuID)
    },
    createCheckbox: (parent: string, id: string, label: string, labelPlacement: "before" | "after", onChange: (e: Event) => void) => {
        UI.createElement("label", parent, `${id}Label`, `defaultText checkboxContainer label${labelPlacement}`, {
            text: label,
            attributes: {
                for: id
            }
        })

        UI.createElement("input", `${id}Label`, id, "", {
            attributes: {
                type: "checkbox"
            },
            listeners: {
                change: onChange
            }
        })
    },
    addTagToElements: (tagName: string, tagValue: string, elements: HTMLElement[]) => {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i]
            element.setAttribute(`data-${tagName}`, tagValue)
        }
    },
    toggleClasses: (element: string, classes: string[], toggleDirection: "add" | "remove" | "toggle") => {
        const HTMLElement = document.getElementById(element)
        if (HTMLElement != undefined) {
            switch (toggleDirection) {
                case "add":
                    HTMLElement.classList.add(...classes)
                break
                case "remove":
                    HTMLElement.classList.remove(...classes)
                break
                case "toggle":
                    for (var className of classes) {
                        HTMLElement.classList.toggle(className)
                    }
                break
            }
        }
    },
    updateStyles: (element: string, styles: Array<[string, string]>) => {
        const HTMLElement = document.getElementById(element)
        if (HTMLElement != undefined) {
            for (var style of styles) {
                HTMLElement.style.setProperty(style[0], style[1])
            }
        }
    },
    editText: (id: string, text: string) => {
        var element = document.getElementById(id)
        if (element != undefined) {
            for (var node of element.childNodes) {
                if (node.nodeType == 3) {
                    node.nodeValue = text
                }
            }
        }
    }
}

window.onclick = e => {
    const target = e.target as HTMLElement

    const parentDropdown = target.closest(".dropdownButton")
    const dropdowns = document.getElementsByClassName("dropdownButton")
    for (var dropdown of dropdowns) {
        if (dropdown != parentDropdown) {
            dropdown.classList.remove("showDropdown")
        }
    }
}