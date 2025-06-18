import './styles.css';
import './bubbles.js';
import './bubbles.css';

// Convert HTMLCollection to Array to use forEach
Array.from(document.getElementsByClassName('demo-button')).forEach((button) =>
    button.addEventListener('click', function (e) {
      e.preventDefault();

      const contactForm = document.querySelector('.contact-form-wrapper');

      const scrollToElement = (element) => {
        const startPosition = window.scrollY;
        const targetPosition = element.getBoundingClientRect().top + window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        const easeInOutCubic = t =>
            t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percentage = Math.min(progress / duration, 1);
          window.scrollTo(0, startPosition + distance * easeInOutCubic(percentage));

          if (progress < duration) {
            window.requestAnimationFrame(step);
          }
        };

        window.requestAnimationFrame(step);
      };

      // Добавляем небольшую задержку, чтобы избежать дергания
      setTimeout(() => {
        scrollToElement(contactForm);
      }, 50);
    })
);

function handleScroll () {
  const sections = document.querySelectorAll('.advantages, .differences, .faq')

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const isVisible = rect.top <= window.innerHeight * 0.75

    if (isVisible && !section.classList.contains('expanded')) {
      // Expand the section
      section.classList.add('expanded')

      // Animate list items with delay
      const items = section.querySelectorAll('li')
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('show')
        }, index * 100) // 100ms delay between each item
      })
    } else if (!isVisible && section.classList.contains('expanded')) {
      // Collapse the section when it's out of view
      section.classList.remove('expanded')
      const items = section.querySelectorAll('li')
      items.forEach((item) => {
        item.classList.remove('show')
      })
    }
  })

  // Handle header color change on scroll
  const header = document.querySelector('.site-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll)
// Initial check for visible sections
handleScroll()

// Contact form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('.contact-form form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      // Получаем поля формы
      const emailInput = contactForm.querySelector('input[type="email"]');
      const nameInput = contactForm.querySelector('input[placeholder="Ваше имя"]');
      const phoneInput = contactForm.querySelector('input[type="tel"]');
      const misInput = contactForm.querySelector('input[placeholder="МИС или CRM"]');

      // Проверка наличия всех полей
      if (!emailInput || !nameInput || !phoneInput || !misInput) {
        alert('Ошибка: одно из полей формы не найдено. Пожалуйста, обновите страницу.');
        return;
      }

      // Чтение значений
      const email = emailInput.value.trim();
      const name = nameInput.value.trim();
      const phoneNumber = phoneInput.value.trim();
      const misName = misInput.value.trim();

      const contactData = {
        email,
        name,
        phoneNumber,
        misName
      };

      const url = 'https://script.google.com/macros/s/AKfycbwdzgB4VUFVK9V1JG0J762KDaM0VM14MtDwzgrbAYKCooQcsGEHKXevpRKx0Ts8xQxk/exec';

      try {
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(contactData),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          mode: 'no-cors',
        });

        alert(`${contactData.name}, заявка отправлена!\nМы свяжемся с Вами в ближайшее время.`);
        contactForm.reset();
      } catch (error) {
        alert("Ошибка отправки данных.\nНапишите, пожалуйста, нам в телеграм\nhttps://t.me/easymed_admin");
        console.error('Error sending form data:', error);
      }
    });
  }
});
