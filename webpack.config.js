const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    libraryTarget: 'umd',
    library: 'kj-package',
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    react: 'React',
  },
};