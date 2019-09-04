module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'main-min.js'
  },
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'raw-loader'
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  }
};