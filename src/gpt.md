I have a db with the next structure:
age
-age_id
-name
-age_gap

examination
-examination_id
-examination_type_id
-name
-comment
-age_id
-examination_stage_id
-is_required
-is_qualitative

examination_stage
-examination_stage_id
-examination_name

examination_type
-examination_type_id
-examination_name

mkb
-mkb_id
-code
-name
-age_id

mkb_standard_link
-mkb_standard_id
-mkb_id
-standard_id

standard
-standard_id
-name
-standard_type_id
-standard_status_id

standard_data_link
-standard_data_link_id
-standard_id
-examination_id 
-treatment_id

standard_status
-standard_status_id
-name

standard_type
-standard_type_id
-name

treatment
-treatment_id
-treatment_type_id
-name
-comment
-age_id
-plan
-duration
-is_qualitative

treatment_type
-treatment_type_id
-name

I need to implement an php file, which would do next:
it has some code string;
creates an object "mkb", where mkb.child = empty object, mkb.grownup = empty object;
finds mkbs by code string from mkb table;
uses found mkb with age_id = 1 for mkb.child and found mkb with age_id = 2 for mkb.grownup;
mkb.child.code = mkb code;
mkb.child.name = mkb name;
mkb.grownup.code = mkb code;
mkb.grownup.name = mkb name;
using mkb_ids finds corresponding standard_ids from mkb_standard_link table;
finds corresponding standards from standard table by standard_ids and puts them into mkb.child.standards [] and mkb.grownup.standards [] accordingly as objects with name, standard type and standard status and empty array of examinations and treatments;
for each standard finds corresponding examinations and treatments using standard_data_link, examination, treatment tables by standard_ids and puts them into corresponding arrays;
returns this mkb object json string.

Сделай на русском языке описание системы, работающей с использованием API.
Суть системы в том, что есть удаленный сервер (УС) с PHP и mySQL базой данных (БД) и веб приложение (ВП) по адресу https://easymed.pro/mkb/, которое отображает эти данные определенным образом. А есть система МИС - пользовательский интерфейс для врачей. И в этот МИС будет встраиваться виджет с поисковой строкой. В эту поисковую строку будет писаться некий код, и при нажатии на кнопку поиска у пользователя будет открываться браузер с ВП на соответствующей коду странице. То есть УС открывает браузер с предзаданным URL, по которому браузер и переходит на соответствующую страницу.
Важный момент, что должна быть предусмотрена авторизация. В БД хранятся данные о пользователях - логин, пароль и IP адрес, с которого может быть осуществлен доступ. При первом переходе логин и пароль должны быть введены пользователем в браузере, впоследствии они будут подтягиваться из кэша или кукис (как лучше?).
Нужн описание схемы работы всей этой системы вкупе и описание, как работает это IP. Описано должно быть подробно, ясно и понятно.

При этом в базовой версии сайт работает как SPA, а для этой системы нужно реализовать работу с запросом через url. То есть МИС открывает браузер по определенной ссылке, браузерный скрипт берет данные берет данные о коде из url и данные о логине и пароле из кукис/кэша или перебрасывает на страницу регистрации, если в кукис/кэше. Если логин и пароль есть, то браузерный скрипт отправляет запрос на поиск данного кода как обычно.

Now I need to implement this api.
My server contains different files for htmls, js scripts, css and php.
Basic address is https://easymed.pro/mkb.
When this page opens in browser it opens index.html file.
At the start index.html loads mkb-start.js, which gets username and password from cookies and sends them to login.php this way:
fetch(`../php/login.php/login?username=${username}&password=${password}`)
login.php on the server side checks if username and password are correct, and if they are, it returns "access" string, if not, it returns "deny" string.
Then mkb-start.js checks the response. If it is "access" index.html continues to load, if "deny" index.html redirects to login.html.
login.html contains login form, which sends username and password to login.php in the same way as mkb-start.js.
login.php checks if username and password are correct, and if they are, it returns "access" string, if not, it returns "deny" string.
Then login.html checks the response. If it is "access" login.html redirects to index.html, if "deny" login.html redirects to login.html.
If index.html is loaded completely, it loads mkb.js, which works with index.html page.
index.html has a search input field, which sends search query to get-data.php this way:
fetch(`../php/get-data.php/login?code=${code}&username=${username}&password=${password}`)
get-data.php on the server side checks if username and password are correct, and if they are, it returns data from mkb table as json string, if not, it returns "deny" string.
If get-data.php returns json string, mkb.js parses it and displays data on the page.

So now I need to implement this api, we described earlier.
If browser receives input like
https://easymed.pro/mkb/?code=<some-code>
it should open browser with https://easymed.pro/mkb and send request to get-data.php with code=<some-code> and username=<username> and password=<password> and act as if user entered this code in search field.


I have two kinds of requests, being sent to server side of a site, where php processes them and send back JSON as response. I would use it as API for my clients, who would send the same kind of requests and receive the same kind of responses. There are two kinds of requests:
`easymed.pro/mkb/php/search.php?q=${encodeURIComponent(query)}`
and 
`easymed.pro/mkb/php/get-data.php/login?code=${code}&username=${username}&password=${password}`.
I need to generate a text file with an API description of this API in russian language, so the client would understand, how to work with this API - what to send and what would be received. The corresponding php code is in search.php and get-data.php
