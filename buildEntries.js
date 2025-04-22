const path = require('path');
const fs = require('fs');

function walk(dir, exts, fileList = {}) {
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
            walk(filepath, exts, fileList);
        } else {
            const ext = path.extname(file);
            const base = path.basename(file);

            if (
                exts.includes(ext) &&
                !base.endsWith('.bak') &&
                !base.endsWith('.test.js') &&
                !base.endsWith('.md')
            ) {
                const relativePath = path.relative('src', filepath).replace(ext, '');
                fileList[relativePath] = path.resolve(filepath);
            }
        }
    });

    return fileList;
}

module.exports = walk('src', ['.js', '.css']);
