const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    entry: {
        'scripts/mkb': './src/scripts/mkb.js',
        'scripts/mkbStart': './src/scripts/mkb-start.js',
        'scripts/login': './src/scripts/login.js',
        'index/bubbles': './src/index/bubbles.js',
        'index/script': './src/index/script.js',
        'index/smoothScroll': './src/index/smooth-scroll.js',
        // 'index/styles': './src/index/styles.css',
        // 'css/main': './src/css/main.css',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/mkb/index.html',
            filename: 'mkb/index.html',
            chunks: ['scripts/mkb', 'scripts/mkbStart'],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['index/bubbles', 'index/script', 'index/smoothScroll'],
        }),
        new HtmlWebpackPlugin({
            template: './src/login/index.html',
            filename: 'login/index.html',
            chunks: ['scripts/login'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new WebpackObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
        }, []),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/php', to: 'php', noErrorOnMissing: true },
                { from: 'src/index/fonts', to: 'index/fonts', noErrorOnMissing: true },
                { from: 'src/index/images', to: 'index/images', noErrorOnMissing: true },
                { from: 'src/images', to: 'images', noErrorOnMissing: true },
                {
                    from: 'src/index',
                    to: 'index',
                    globOptions: {
                        ignore: ['**/*.js', '**/*.css'],
                        dot: true,
                    },
                    filter: (resourcePath) =>
                        /\.(js\.bak|md|xcf|mp4|jpeg|jpg)$/i.test(path.basename(resourcePath)),
                    noErrorOnMissing: true,
                },
                {
                    from: 'src',
                    to: '',
                    globOptions: {
                        ignore: ['**/*.js', '**/*.css', '**/*.html'],
                    },
                    filter: (resourcePath) =>
                        /\.(json|conf|config|js\.bak|md)$/i.test(path.basename(resourcePath)),
                    noErrorOnMissing: true,
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
            {
                test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]',
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
