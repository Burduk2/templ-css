
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function TemplCSS(str, isFile=true) {
    const cssCode = isFile ? fs.readFileSync(path.join(__dirname, str), 'utf8') : str;

    function matchSelectorsAndProperties(css) {
        const placeholders = [];
        const commentsRegex = /\/\*[\s\S]*?\*\//g;
        const stringsRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;

        let placeholderIndex = 0;

        const cleanCSS = css.replace(commentsRegex, '')
        .replace(stringsRegex, (match) => {
            const placeholder = `__STRING_PLACEHOLDER_${placeholderIndex++}__`;
            placeholders.push({ placeholder, value: match });
            return placeholder;
        });

        // Match selectors and properties
        const selectorsAndPropsRegex = /([^{}]+)\{([^{}]+)\}/g;
        let match;
        const results = [];

        function replacePlaceholders(str, placeholders) {
            let result = str;
            placeholders.forEach(({ placeholder, value }) => {
                result = result.replace(new RegExp(placeholder, 'g'), value);
            });
            return result;
        }

        while ((match = selectorsAndPropsRegex.exec(cleanCSS)) !== null) {
            results.push({
                selector: replacePlaceholders(match[1].trim(), placeholders),
                properties: replacePlaceholders(match[2].trim(), placeholders)
            });
        }

        return results;
    }

    function addElement(element, selector) {
        const dom = new JSDOM(htmlOutput);
        const window = dom.window;

        if (selector === '') {
            window.document.innerHTML += element
        } else {
            window.document.querySelector(selector).innerHTML += element;
        }
        htmlOutput = window.document.documentElement.outerHTML;
    }      

    const selectorsAndProps = matchSelectorsAndProperties(cssCode);
    let htmlOutput;
    let globalStyleElement = '';

    selectorsAndProps.forEach(match => {
        let selector = match.selector;
        let props = match.properties;

        let attrs;
        try { 
            attrs = props.match(/-attr:\s*([^;]+);/)[1];
            props = props.replace(props.match(/-attr:\s*([^;]+);/)[0], '').trim();
        } 
        catch { throw new Error('TC: An element must include an -attr property') }
        
        let elementHtml = '';
        if (props.match(/-html:\s*([^;]+);/)) {
            elementHtml = props.match(/-html:\s*([^;]+);/)[1].slice(1).slice(0, -1);
            props = props.replace(props.match(/-html:\s*([^;]+);/)[0], '').trim();
        }

        globalStyleElement += `${selector} {${props}}`;
        
        selector = selector.split(/\s+/)
        const tag = selector.pop();
        const element = `<${tag} ${attrs}>${elementHtml}</${tag}>`;

        selector = selector.join(' ');
        addElement(element, selector);
    });

    globalStyleElement = `<style>${globalStyleElement}</style>`
    addElement(globalStyleElement, 'html head');

    return '<!DOCTYPE html>' + htmlOutput;

}

module.exports = TemplCSS;