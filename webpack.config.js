module.exports = {
  entry: './app/app.js',
  output: {
    filename: './app/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
