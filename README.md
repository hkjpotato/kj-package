Note:
kj-package is a mock shared library used by `kj-parent`. `kj-parent` can be shared by some other package `X`. Thus:
`X` depends on `kj-parent` depends on `kj-package`

A POC on how it will work is available at:
https://codepen.io/pen?&editable=true&editors=0010

In this POC:
Client side: React and ReactDOM is available in global namespace of browser. The bundle for `kj-package` is loaded, then the bundle of `kj-parent` is loaded.

- kj-package: https://github.com/hkjpotato/kj-package.git
- kj-parent: https://github.com/hkjpotato/kj-parent.git

Server side: `kj-package` is used by `kj-parent` as a commonJS library, it is excluded from the bundle of `kj-parent`.

# STEP BY STEP reproduce


## v1.0.3
add react as peerDependencies, not available in node_modules
add webpack as devDependencies, available in node_modules

in current package (`kj-package`): 
if peer, wont install.
if dev, will install and appear in node_modules.

in consumer package (`kj-parent`):
if peer, wont install, will warn.
if dev, wont install, won't warn.

## v1.0.4
For consumer, when they install our package. it appears in the node_modules as a normal node package (like consumer write a package itself locally and import from file)

So far, our `main` points to __source code__ `index.js`

The consumer node will require it and encounter `react` not found.

Consumer have to install React locally (so it gets rid of the warning peer dependency not found), so as to run our code

Notice when consumer install our package now, they got nothing but our simple __source code__ inside `index.js`.

```javascript
const React = require('react');
//...
function MyComp() {
    return React.createElement(
        'div',
        null,
        ['hello']
    )
}
//...
module.exports.MyComp = MyComp;
```

Also notice locally now, we can't even run our code by `node index.js` locally since we haven't installed `react`.

## v1.0.5 - v1.0.6
Now we install `react` as `devDepency` locally. We can run `npm run start` to __develope it__.

Again, consumer won't install react automatically.

Up till now, consumer is using our source code directly in `index.js`. Let's add webpack to bundle it.

This starts become tricky. Our bundle code will contains React! (check the `dist/main.js`).

Actually, webpack will fail to bundle if React is not installed locally (unless external is set), since webpack will parse `index.js` and encouter `require('react')`.

If we keep our `main` as `index.js`, consumer wont get React from us.

If we change our `main` to `dist/main.js`, when they install, they will load `react` code from our local dist.

__We dont want to ship the local React to consumer!__

## v1.0.7 - 1.0.8
One interesting thing is that if we use the current webpack config to bundle the code, because React is bundled together. The consumer can use our package even without installing React.

Webpack totally changes the game: originally our source code is exposed directly, consumer will encounter `const React = require('react')`
And it needs to resolve this commonJS __require__ by itself.

Now, instead of consuming our source code, consumer uses our bundled(built) code, which includes React inside. Behind the scene, webpack resolve the commonJS `require` as a normal function `__webpack_require__`.

That being said, even if we declare React as peer dependency, consumer (`kj-parent`) still has no control of React used by the its depenecy (`kj-package`).

The fact is, `peerDependencies` field only serves as a __warning__. You actual output is still determined by `dist/main` from  __webpack__.

To remove React from the bundle, we need to declare React as `externals`. Also, if we define the output target as `umd`, the out put will be like

```javascript
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React")); // route #1: commonJS nodejs new spec
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);  // route #2: amd
	else if(typeof exports === 'object')
		exports["kj-package"] = factory(require("React")); // route #3: commonJS strict
	else
		root["kj-package"] = factory(root["React"]);  // route #4: define in global directly
})(window, function(__WEBPACK_EXTERNAL_MODULE_react__) {
```

Notice the current `root` is default to `window`, which means you can only run this code in browser. (window is the `global object` in browser).

__note: peerDependencies is used by npm, external is used by webpack.__

## v1.0.9

We need to sepecify the globalObject in webpack output, otherwise in webpack 4 it will defaults to 'window'.

```javascript
    // webpack3 behaviors on globalObject otherwise it will be default to 'window'
    // https://github.com/webpack/webpack/issues/6522#issuecomment-374760683
    globalObject: 'typeof self !== \'undefined\' ? self : this',
```

Important: __How our bundle file will be used is important and extremely tricky!__

__Load in browser directly__:

In local development, or used by static website to load dist/main.js directly. Then 4th route from the `webpackUniversalModuleDefinition` will be triggered.

__Import as node pacakage by consumer__:

It will be imported as a normal node modules and first route will be triggered. Server rendering will be the same case.

No matter how, our bundled code will normally be used as __route #1 commonJS modules__, or __route #4 browser assets__.

For `kj-package` itself

| environment | webpack output| Description |
| --- | --- | --- |
| client side   | route #4 | load as an asset in browser in local development|
| server side rendering | route #1    |   used by a separate nodejs server, as a commonJS package |

`kj-package` used by `kj-parent`

| environment | webpack output| Description |
| --- | --- | --- |
| client side   | route #4 | loaded as a dependency assets for `kj-parent`, like the POC demo |
| server side dev | route #1      | used by `kj-parent` as a commonJS package  |

In both cases above, `kj-package` can be declared as `externals` for `kj-parent`, which means it is not bundled in the output of `kj-parent`

__Tricky case__. If

 - `kj-package` exports basic widgets,
 - and `kj-parent` exports complex widgets based on `kj-package`.
 - And there is a standalone nodejs server that will import `kj-parent` to do server rendering.

To use `kj-parent` as an __out of box__ widget library, should we bundle `kj-package` together with `kj-parent`?

__Addition : webpack output Bundled by webpack of consumer__:
Bundle happened on Server side. When webpack encounters a bundled file (e.g. `dist/main`), what I find currently (might be wrong) is:
The current output is wrapped inside the above `webpackUniversalModuleDefinition` __IIFE)), the IIFE will be executed during the __bundle time__ to determine the output.
