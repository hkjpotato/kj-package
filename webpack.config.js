const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    libraryTarget: 'umd',
    library: 'kj-package',
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    // webpack3 behaviors on globalObject otherwise it will be default to 'window'
    // https://github.com/webpack/webpack/issues/6522#issuecomment-374760683
    globalObject: 'typeof self !== \'undefined\' ? self : this', 
  },
  externals: {
    react: 'React',
  },
};