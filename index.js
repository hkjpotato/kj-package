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
