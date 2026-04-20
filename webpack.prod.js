const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin(),
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [
        new WebpackObfuscator(
            {
                rotateStringArray: true,
                stringArray: true,
                stringArrayEncoding: ['base64'],
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.4,
            },
            ['**/index/smoothScroll.js']
        ),
        new TerserWebpackPlugin({
            terserOptions: {
                compress: {
                    drop_console: true,
                },
                mangle: {
                    reserved: ['smoothScroll'],
                },
            },
        }),
    ],
});
