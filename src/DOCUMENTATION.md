# src documentation

## .htaccess

Do not deploy an `.htaccess` file or folder to reg.ru. The host returns 403 Forbidden when that name is present in the site root (it was created as a folder by the build copy). Cache control for the embedded browser is left to the HTML meta tags in `crm-soft/index.html`, `mkb/index.html`, and `login/index.html`.

Used in:
- not copied by `webpack.common.js`
