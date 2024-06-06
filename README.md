# So i created a CSS templating language


```bash 
# run this command to use it 
npm i templcss
```

### TemplCSS exports one function - TemplCSS()
It is used to turn your CSS templates to actual HTML code.
Example usage:

```js
const TemplCSS = require('TemplCSS');

const htmlCode = TemplCSS('/path/to/my/cssTemplate.css');

res.send(htmlCode);
```

### So what are CSS Templates?
Basically, you are writing styles for elements, like in normal css, but for each query selector, a corresponding html element is automatically created.

Example:
```css
html {
    -attr: lang="en" data-other-attr;
    scroll-behaviour: smooth;
    /* other styles */
}
```

In this example, it seems like we are just giving styles to &lt;html> element, that's true, but we are also creating that element at the same time.
This is what the end html code will look like:
```html
<style>
    html {
        scroll-behaviour: smooth;
    }
</style>
```

```html
<html lang="en" data-other-attr></html>
```

**NOTE:** your must give `-attr` property to every selector.


Other example:
```css
    html {
        -attr: lang="en"
    }

    html head { -attr: _ }

    html body {
        -attr: _;
        background-color: #000;
    }

    html body h1 {
        -attr: class="title";
        -html: "Hello World!";
        font-size: 40px;
    }
```

**NOTE:** here another special attribute is used - `-html`. It directly affects element's innerHTML.

This example will produce the following HTML code:
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <style>
            html body {
                background-color: #000;
            }

            html body h1 {
                font-size: 40px;
            }
        </style>
    </head>
    <body>
        <h1 class="title">Hello World!</h1>
    </body>
</html>
```