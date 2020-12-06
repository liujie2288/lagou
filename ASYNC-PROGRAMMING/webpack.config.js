const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "none",
  stats: "none",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              "@babel/plugin-transform-runtime",
              "@babel/plugin-proposal-class-properties",
            ],
          },
        },
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};
