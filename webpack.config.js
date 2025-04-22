const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: './src/scripts/mkb.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scripts/mkb.js',
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/mkb/index.html',
            filename: 'mkb/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: 'css/main.css',
        }),
        // Плагин для обфускации
        new WebpackObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
        }, ['scripts/mkb.js']),
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
        historyApiFallback: {
            index: 'mkb/index.html',
        },
    },
    mode: 'production',
};
