import './styles.css';
import './bubbles.js';
import './bubbles.css';

// Convert HTMLCollection to Array to use forEach
Array.from(document.getElementsByClassName('demo-button')).forEach((button) =>
    button.addEventListener('click', function (e) {
      // e.preventDefault();

      const contactForm = document.querySelector('.contact-form-wrapper');

      if (!contactForm) return;

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

      // Запуск прокрутки сразу, без задержки
      scrollToElement(contactForm);
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

      // Get form input values
      const email = contactForm.querySelector('input[type="email"]').value.trim();
      const name = contactForm.querySelector('input[type="text"][placeholder="Ваше имя"]').value.trim();
      const phoneNumber = contactForm.querySelector('input[type="tel"]').value.trim();
      const misName = contactForm.querySelector('input[type="text"][placeholder="МИС или CRM"]').value.trim();

      // Create contact data object
      const contactData = {
        email,
        name,
        phoneNumber,
        misName
      };

      // Google Apps Script endpoint
      const url = 'https://script.google.com/macros/s/AKfycbwdzgB4VUFVK9V1JG0J762KDaM0VM14MtDwzgrbAYKCooQcsGEHKXevpRKx0Ts8xQxk/exec';

      try {
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(contactData),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          mode: 'no-cors',
        });

        // Show success message
        alert(`${contactData.name}, заявка отправлена!\nМы свяжемся с Вами в ближайшее время.`);

        // Reset form
        contactForm.reset();
      } catch(error) {
        // Show error message
        alert("Ошибка отправки данных.\nНапишите, пожалуйста, нам в телеграм\nhttps://t.me/easymed_admin");
        console.error('Error sending form data:', error);
      }
    });
  }
});
