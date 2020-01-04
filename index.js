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

console.log('package use this React', React);

module.exports.hello = hello;
module.exports.MyComp = MyComp;
