const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env, options) => {
  const LIBRARY_NAME = 'promjs';

  const plugins = [];
  let mode;
  let outputFile;

  if (options.mode === 'production') {
    plugins.push(new UglifyJsPlugin());
    outputFile = `${LIBRARY_NAME}.min.js`;
    mode = 'production';
  } else {
    outputFile = `${LIBRARY_NAME}.js`;
    mode = 'development';
  }
  return {
    entry: `${__dirname}/src/index.ts`,
    mode,
    output: {
      path: `${__dirname}/lib/browser`,
      filename: outputFile,
      library: LIBRARY_NAME,
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    module: {
      rules: [{
        test: /(\.ts)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        query: {
          plugins: ['lodash', '@babel/proposal-class-properties', '@babel/proposal-object-rest-spread'],
          presets: ['@babel/env']
        }
      }]
    },
    plugins
  };
};
