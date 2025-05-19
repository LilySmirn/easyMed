const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    entry: {
        'scripts/mkb': './src/scripts/mkb.js',
        'scripts/mkbStart': './src/scripts/mkb-start.js',
        'scripts/login': './src/scripts/login.js',
        'index/bubbles': ['./src/index/bubbles.js', './src/index/bubbles.css'],
        'index/script': './src/index/script.js',
        'index/styles': './src/index/styles.css',
        'css/main': './src/css/main.css',
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
            chunks: ['scripts/mkb', 'scripts/mkbStart', 'css/main'],
            inject: 'head',
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['index/styles', 'index/script', 'index/bubbles'],
            inject: 'head',
        }),
        new HtmlWebpackPlugin({
            template: './src/login/index.html',
            filename: 'login/index.html',
            chunks: ['scripts/login'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
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
                use: [
                    isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
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
};
