const username = getCookie('username')
const password = getCookie('password')

const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')
const loginUrl = code ? `/login?code=${code}` : `/login`

// Only redirect if no credentials found
if (!username || !password) {
    window.location.href = window.location.origin + loginUrl
    throw new Error('No credentials found')
}

fetch(`../php/login.php/login?username=${username}&password=${password}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  })
  .then((data) => {
    if (data.result === 'deny') {
      window.location.href = window.location.origin + loginUrl
      return
    }
    // Valid credentials, continue loading page
    console.log('Authentication successful')
  })
  .catch((error) => {
    console.error('Ошибка:', error)
    window.location.href = window.location.origin + loginUrl
  })

function getCookie(cname) {
  let name = cname + '='
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
