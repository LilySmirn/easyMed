const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function findHtmlPlugins(baseDir) {
    const plugins = [];

    function walk(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (file === 'index.html') {
                const relative = path.relative('src', fullPath);
                plugins.push(
                    new HtmlWebpackPlugin({
                        template: fullPath,
                        filename: relative, // сохраняет путь
                    })
                );
            }
        });
    }

    walk(baseDir);
    return plugins;
}

module.exports = findHtmlPlugins;
