const usernameInputElem = document.getElementById('username')
const passwordInputElem = document.getElementById('password')
const loginButtonElem = document.getElementById('login-button')
const revealPassButtonElem = document.getElementById('reveal-password-img')
const hidePassButtonElem = document.getElementById('hide-password-img')

loginButtonElem.addEventListener('click', authorize)
revealPassButtonElem.addEventListener('click', togglePasswordView)
hidePassButtonElem.addEventListener('click', togglePasswordView)
usernameInputElem.addEventListener('input', setButtonState)
passwordInputElem.addEventListener('input', setButtonState)

const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')

if (
  usernameInputElem.value.length >= 6 &&
  passwordInputElem.value.length >= 6
) {
  loginButtonElem.disabled = false
}

usernameInputElem.focus()

document
  .querySelector('.header__logo-container')
  ?.addEventListener('click', function () {
    window.location.href = '../index.html'
  })

function getTargetUrl(branch) {
  const normalizedBranch = branch === 'mkb' ? 'mkb' : 'crm-soft'
  return code ? `/${normalizedBranch}?code=${code}` : `/${normalizedBranch}`
}

function authorize() {
  document
    .getElementsByClassName('login__form--error')[0]
    .classList.add('hidden')
  document
    .getElementsByClassName('login__shadow--popup')[0]
    .classList.remove('hidden')

  const username = usernameInputElem.value
  const password = passwordInputElem.value

  fetch(`../php/login.php/login?username=${username}&password=${password}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      if (data.result === 'denyIP') {
        document
          .getElementsByClassName('login__shadow--popup')[0]
          .classList.add('hidden')
        loginButtonElem.disabled = true
        document.getElementsByClassName(
          'login__form--error-text'
        )[0].innerText = 'IP не зарегистрирован'
        document
          .getElementsByClassName('login__form--error')[0]
          .classList.remove('hidden')
        console.log('Access denied (IP)')
        return
      }

      if (data.result === 'deny') {
        document
          .getElementsByClassName('login__shadow--popup')[0]
          .classList.add('hidden')
        loginButtonElem.disabled = true
        document.getElementsByClassName(
          'login__form--error-text'
        )[0].innerText = 'Неверный логин или пароль'
        document
          .getElementsByClassName('login__form--error')[0]
          .classList.remove('hidden')
        console.log('Access denied: ' + data.result)
        return
      }

      if (data.result === 'access') {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 30)

        document.cookie = `username=${username}; path=/; expires=${expirationDate.toUTCString()}`
        document.cookie = `password=${password}; path=/; expires=${expirationDate.toUTCString()}`

        const targetUrl = getTargetUrl(data.branch)
        window.location.href = window.location.origin + targetUrl
        return
      }

      console.log(data)
    })
    .catch((error) => {
      document
        .getElementsByClassName('login__shadow--popup')[0]
        .classList.add('hidden')
      loginButtonElem.disabled = true
      console.error('Ошибка:', error)
      document.getElementsByClassName('login__form--error-text')[0].innerText =
        'Ошибка'
      document
        .getElementsByClassName('login__form--error')[0]
        .classList.remove('hidden')
      console.log('Access denied. Error:', error)
    })
}

function togglePasswordView() {
  passwordInputElem.type =
    passwordInputElem.type == 'password' ? '' : 'password'
  revealPassButtonElem.classList.toggle('hidden')
  hidePassButtonElem.classList.toggle('hidden')
}

function setButtonState() {
  const usernameValue = usernameInputElem.value
  const passwordValue = passwordInputElem.value
  if (usernameValue.length < 6 || passwordValue.length < 6) {
    loginButtonElem.disabled = true
  } else {
    loginButtonElem.disabled = false
  }
}