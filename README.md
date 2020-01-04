Note:

v1.0.3
add react as peerDependencies

add webpack as devDependencies

in current package: 
if peer, wont install.
if dev, will install and appear in node_modules.

in consumer package:
if peer, wont install, will warn.
if dev, wont install, won't warn.

as a result, react is missing in local, webpack is available

v1.0.4
For consumer, when they install our package. it appears in the node_modules as a normal node package (like consumer write a package itself locally and import from file)

So far, our `main` points to source code `index.js`

The consumer node will require it and encounter 'react' not found.

Consumer have to install React locally (so it gets rid of the warning peer dependency not found), so as to run our code

Notice when consumer install our package now, they got nothing but our simple code inside index.js.

no react, no webpack.

```javascript
const React = require('react');

console.log('hello package');

function hello() {
    console.log('hello');
}

function MyComp() {
    return React.createElement(
        'div',
        null,
        ['hello']
    )
}

module.exports.hello = hello;
module.exports.MyComp = MyComp;
```

Also notice locally now, we can't even run our code by `node index.js`, since we have only webpack locally(useless), not react.
