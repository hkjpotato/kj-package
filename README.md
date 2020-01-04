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

v1.0.5 - v1.0.6
Now we install react as devDepency locally. We can run `npm run start` to develope it.
Again, consumer won't install react automatically.

Up till now, consumer is using our source code directly in `index.js`. Let's add webpack to bundle it.

This starts become tricky. Our bundle code will contains React! (check the dist/main.js)

If we keep our `main` as `index.js`, consumer wont get React from us.
If we change our `main` to `dist/main.js`, when they install, they will load react code from our local dist.

We dont want to ship the local React to consumer!

Can we uninstall local React and wish webpack ignore it? No. When webpack run, it __PARSE__ the source code and notice you are requiring React.
Also, we still want to develop it locally, it is our devDependencies!
