const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const entries = require('./buildEntries.js');
const findHtmlPlugins = require('./findHtmlPlugins.js');

module.exports = {
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true,
    },
    plugins: [
        ...findHtmlPlugins(path.resolve(__dirname, 'src')),

        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),

        new WebpackObfuscator(
            {
                rotateStringArray: true,
                stringArray: true,
                stringArrayEncoding: ['base64'],
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.4,
            },
            ['scripts/mkb.js']
        ),

        new CopyWebpackPlugin({
            patterns: [
                {
                    from: '**/*',
                    context: path.resolve(__dirname, 'src'),
                    globOptions: {
                        ignore: ['**/*.js', '**/*.css', '**/index.html'],
                    },
                    to: '[path][name][ext]',
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin(),
            new CssMinimizerPlugin(),
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        open: true,
        historyApiFallback: true,
    },
    mode: 'production',
};
