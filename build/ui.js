export const UI = {
    createElement: (type, parent, id, classes, properties) => {
        const element = document.createElement(type);
        element.setAttribute("id", id);
        element.setAttribute("class", classes);
        if (properties != undefined) {
            if (properties.text != undefined) {
                element.innerText = properties.text;
            }
            if (properties.attributes != undefined) {
                for (var attribute in properties.attributes) {
                    var attributeValue = properties.attributes[attribute];
                    element.setAttribute(attribute, attributeValue);
                }
            }
            if (properties.styles != undefined) {
                for (var style in properties.styles) {
                    var styleValue = properties.styles[style];
                    element.style.setProperty(style, styleValue);
                }
            }
            if (properties.tags != undefined) {
                for (var tag in properties.tags) {
                    var tagValue = properties.tags[tag];
                    element.setAttribute(`data-${tag}`, tagValue);
                }
            }
            if (properties.listeners != undefined) {
                for (var listener in properties.listeners) {
                    var listenerValue = properties.listeners[listener];
                    element.addEventListener(listener, listenerValue);
                }
            }
        }
        if (parent == "document") {
            document.body.appendChild(element);
        }
        else {
            const parentElement = document.getElementById(parent);
            if (parentElement != undefined) {
                parentElement.appendChild(element);
            }
        }
    },
    toggleDropdown: (clickElement, dropdownElement, hideOnClick) => {
        const element = document.getElementById(dropdownElement);
        if (element != undefined) {
            if (!hideOnClick && clickElement.id != dropdownElement) {
                return;
            }
            element.classList.toggle("showDropdown");
        }
    },
    toggleTags: (tagName, camelTagName, tagValue, classToggle) => {
        const elements = document.querySelectorAll(`[data-${tagName}]`);
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var elementTagValue = element.dataset[camelTagName];
            if (elementTagValue == tagValue && !element.classList.contains(classToggle)) {
                element.classList.toggle(classToggle);
            }
            else if (elementTagValue != tagValue && element.classList.contains(classToggle)) {
                element.classList.toggle(classToggle);
            }
        }
    },
    createAnchor: (parent, child, name) => {
        var parentElement = document.getElementById(parent);
        var childElement = document.getElementById(child);
        if (parentElement != undefined && childElement != undefined) {
            parentElement.style.setProperty("anchor-name", `--${name}`);
            childElement.style.setProperty("position-anchor", `--${name}`);
        }
    },
    createDropdown: (parent, id, text, hideOnClick) => {
        const buttonID = `${id}Button`;
        UI.createElement("div", parent, buttonID, "defaultButton dropdownButton defaultText singleLineText", {
            text: text,
            listeners: {
                click: (e) => { UI.toggleDropdown(e.target, buttonID, hideOnClick); }
            }
        });
        const menuID = `${id}Menu`;
        UI.createElement("div", buttonID, menuID, "dropdownMenu");
        const dropdownID = `${id}Dropdown`;
        UI.createAnchor(buttonID, menuID, dropdownID);
    },
    createHoverMenu: (parent, id, text) => {
        const buttonID = `${id}HoverMenuButton`;
        UI.createElement("div", parent, buttonID, "defaultText singleLineText defaultButton hoverMenuButton", {
            text: text
        });
        const menuID = `${id}HoverMenu`;
        UI.createElement("div", buttonID, menuID, "hoverMenu");
        const hoverMenuID = `${id}HoverMenu`;
        UI.createAnchor(buttonID, menuID, hoverMenuID);
    },
    createCheckbox: (parent, id, label, labelPlacement, onChange) => {
        UI.createElement("label", parent, `${id}Label`, `defaultText checkboxContainer label${labelPlacement}`, {
            text: label,
            attributes: {
                for: id
            }
        });
        UI.createElement("input", `${id}Label`, id, "", {
            attributes: {
                type: "checkbox"
            },
            listeners: {
                change: onChange
            }
        });
    },
    addTagToElements: (tagName, tagValue, elements) => {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.setAttribute(`data-${tagName}`, tagValue);
        }
    },
    toggleClasses: (element, classes, toggleDirection) => {
        const HTMLElement = document.getElementById(element);
        if (HTMLElement != undefined) {
            switch (toggleDirection) {
                case "add":
                    HTMLElement.classList.add(...classes);
                    break;
                case "remove":
                    HTMLElement.classList.remove(...classes);
                    break;
                case "toggle":
                    for (var className of classes) {
                        HTMLElement.classList.toggle(className);
                    }
                    break;
            }
        }
    },
    updateStyles: (element, styles) => {
        const HTMLElement = document.getElementById(element);
        if (HTMLElement != undefined) {
            for (var style of styles) {
                HTMLElement.style.setProperty(style[0], style[1]);
            }
        }
    },
    editText: (id, text) => {
        var element = document.getElementById(id);
        if (element != undefined) {
            for (var node of element.childNodes) {
                if (node.nodeType == 3) {
                    node.nodeValue = text;
                }
            }
        }
    }
};
window.onclick = e => {
    const target = e.target;
    const parentDropdown = target.closest(".dropdownButton");
    const dropdowns = document.getElementsByClassName("dropdownButton");
    for (var dropdown of dropdowns) {
        if (dropdown != parentDropdown) {
            dropdown.classList.remove("showDropdown");
        }
    }
};
