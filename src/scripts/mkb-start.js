const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')
const urlUsername = urlParams.get('username')
const urlPassword = urlParams.get('password')
const loginUrl = code ? `/login?code=${encodeURIComponent(code)}` : `/login`

const cookieUsername = getCookie('username')
const cookiePassword = getCookie('password')

function isCrmSoftPage() {
  const path = window.location.pathname
    .replace(/\/index\.html$/i, '')
    .replace(/\/+$/, '')
  return /\/crm-soft$/.test(path)
}

// URL auto-login: validate credentials without saving cookies.
// Uses php/login.php (same checks as auto-login.php).
if (urlUsername && urlPassword) {
  fetch(
    `../php/login.php/login?username=${encodeURIComponent(urlUsername)}&password=${encodeURIComponent(urlPassword)}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      if (data.result === 'deny' || data.result === 'denyIP') {
        window.location.href = window.location.origin + loginUrl
        return
      }
      if (data.result === 'access') {
        console.log('Auto-login authentication successful')
        return
      }
      window.location.href = window.location.origin + loginUrl
    })
    .catch((error) => {
      console.error('Ошибка:', error)
      window.location.href = window.location.origin + loginUrl
    })
} else if (!cookieUsername || !cookiePassword) {
  // CRM Soft has no session and no address-bar credentials: send to login.
  // Username/password in the address stay on the auto-login branch above.
  if (isCrmSoftPage()) {
    window.location.href = window.location.origin + loginUrl
  } else {
    console.log('LOCAL: auth skipped')
  }

} else {
  fetch(
    `../php/login.php/login?username=${encodeURIComponent(cookieUsername)}&password=${encodeURIComponent(cookiePassword)}`
  )
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
}

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
