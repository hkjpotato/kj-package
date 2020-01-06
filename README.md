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
Actually, we cannot ask webpack to bundle if React is not available (unless external is set)

If we keep our `main` as `index.js`, consumer wont get React from us.
If we change our `main` to `dist/main.js`, when they install, they will load react code from our local dist.

We dont want to ship the local React to consumer!

Can we uninstall local React and wish webpack ignore it? No. When webpack run, it __PARSE__ the source code and notice you are requiring React.
Also, we still want to develop it locally, it is our devDependencies!

v1.0.7 - 1.0.8
One interesting thing is that if we use webpack to bundle the code, because React is bundled in the `main.js`. The consumer can use our package even without installing React.

Webpack totally changes the game: originally our source code is exposed directly, consumer will encounter
`const React = require('react')`
And it needs to resolve this commonJS require by itself.

Now, instead of consuming our source code, consumer uses our built code, which includes React inside. Besides, consumer won't see any commonJS require. Essentially, bundled code is just resolves the nodejs dependencies inside. 

That being said, even if we declare React as peer dependency, consumer still has no control of React used by the its depenecy (us).

The fact is, peerDependencies field only serves as a warning. You actual output is still determined by main and thus by webpack.

To remove React from the bundle, we need to declare React as externals. Also, if we define the output target as `umd`, the out put will be like

```javascript
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React")); // commonJS nodejs new spec
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);  // amd
	else if(typeof exports === 'object')
		exports["kj-package"] = factory(require("React")); // commonJS strict
	else
		root["kj-package"] = factory(root["React"]);  // define in global directly
})(window, function(__WEBPACK_EXTERNAL_MODULE_react__) {
```

Notice the current root is default to window, which means you can only run this code in browser. (window is the global object in browser, not nodejs).

note: peerDependencies is used by npm, external is used by webpack.
