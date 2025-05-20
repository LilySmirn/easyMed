import '../css/main.css';

import { decryptData } from './crypto.js';

const searchInput = document.getElementById('search-input');
const clearButton = document.getElementById('clear-button');
const searchButton = document.getElementById('search-button');
const ageToggleElem = document.getElementById('age-toggle');
const standardToggleElem = document.getElementById('standard-toggle');
const treatListElem = document.getElementById('treat-list');
const searchListElem = document.getElementById('search-list');
const exitButtonElem = document.querySelector('.header__exit-btn-container');
const urlMkbParams = new URLSearchParams(window.location.search);
const urlCode = urlMkbParams.get('code');
const selectElem = document.getElementById('exam-list');
const buttonsSection = document.querySelector(".form__section--buttons");
const pageMkb = document.querySelector('.page__mkb');
const sectionToggles = document.querySelector('.form__section--toggles');
const resultsContainer = document.querySelector('.form__input--list-container');
const loadingContainer = document.querySelector('.form__loading-container');
const openBtn = document.querySelector('.header__call-container');
const overlay = document.querySelector('.overlay');
const popup = overlay.querySelector('.call-popup');
const closeBtn = overlay.querySelector('.call-popup__close');

// button and form "Связаться с нами"
function openPopup() {
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => overlay.classList.add('hidden'), 300);
}

openBtn.addEventListener('click', openPopup);
closeBtn.addEventListener('click', closePopup);
overlay.addEventListener('click', (e) => {
  if (!popup.contains(e.target)) {
    closePopup();
  }
});

//отправка заявки с mkb в бот
document.getElementById('popupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const token = '7936795213:AAGRgurZVGGQIJcCuU1bZpodJtRqvqsuFLs';
  const chatId = '284467225';

  const email = this.email.value.trim();
  const name = this.name.value.trim();
  const phone = this.phone.value.trim();
  const crm = this.crm.value.trim() || '—';

  const message = `📥 Новая заявка с сайта:\n\n📧 Email: ${email}\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n🗂 МИС/CRM: ${crm}`;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  })
      .then(response => {
        if (response.ok) {
          alert('✅ Заявка успешно отправлена!');
          this.reset();
          closePopup();
        } else {
          alert('⚠️ Ошибка при отправке.');
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
        alert('⚠️ Не удалось отправить заявку.');
      });
});


exitButtonElem.addEventListener('click', () => {
  document.cookie = "username=''; path=/";
  document.cookie = "password=''; path=/";
  window.location.href = window.location.origin + '/login';
});

selectElem.addEventListener("change", function () {
  if (isNaN(parseInt(selectElem.value))) {
    buttonsSection.classList.add("hidden");
  } else {
    buttonsSection.classList.remove("hidden");
  }
});

clearButton.addEventListener('click', () => {
  pageMkb.classList.add('page__mkb--start');
  searchInput.value = '';
  clearButton.classList.add('hidden');
  sectionToggles.classList.add('hidden');
  resultsContainer.classList.add('hidden');
  searchButton.classList.add('form__button--search-disabled');
  searchButton.removeEventListener('click', searchMkb);
  hideMkbData();
  removeAllBlockSelections();
  searchInput.focus();
  createHistoryPanel();
});

document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
  if (
    !e.target.closest('.form__input--list-container') &&
    !resultsContainer.classList.contains('hidden')
  ) {
    resultsContainer.classList.add('hidden');
    searchInput.value = document.currentTextContent || '';
  }
});

document
  .querySelector('.header__logo-container')
  .addEventListener('click', () => {
    window.location.href = '/';
  });

searchInput.addEventListener('keypress', function (e) {
  if (
    e.key === 'Enter' &&
    !searchButton.classList.contains('form__button--search-disabled')
  ) {
    searchMkb();
  }
});

searchInput.addEventListener('input', function () {
  const query = this.value;
  searchButton.removeEventListener('click', searchMkb);
  searchButton.classList.add('form__button--search-disabled');
  if (query.length > 0) {
    clearButton.classList.remove('hidden');
  } else {
    clearButton.classList.add('hidden');
  }
  if (query.length > 1) {
    showInputListLoader();
    fetchResults(query);
  } else {
    resultsContainer.classList.add('hidden');
  }
});

searchInput.addEventListener('click', function () {
  searchInput.select();
});

searchListElem.addEventListener('click', function (e) {
  if (e.target.classList.contains('form__input--list-item')) {
    const codeValue = e.target.valueData;
    document.currentTextContent = e.target.textContent;
    searchInput.value = document.currentTextContent;
    searchInput.codeValue = codeValue;
    hideMkbData();
    searchMkb();
  }
});

ageToggleElem.addEventListener('click', setLists);
standardToggleElem.addEventListener('click', setLists);
standardToggleElem.addEventListener('change', () => {
  // standardToggleElem.setAttribute('data-user-touched', 'true');
});

setCardViewTogglers();
setTextBlockSelectionEventHandler();
setCardCopyButtonsEventHandler();

document.addEventListener('DOMContentLoaded', () => {
  const loadingContainer = document.querySelector('.form__loading-container');

  if (urlCode) {
    pageMkb.classList.remove('page__mkb--start');
    const searchInput = document.getElementById('search-input');
    searchInput.codeValue = urlCode;
    hideMkbData();
    searchMkb();
    if (loadingContainer) loadingContainer.remove();
    const newURL = window.location.origin + '/mkb';
    history.replaceState({}, '', newURL);
  } else {
    setTimeout(() => {
      if (loadingContainer) loadingContainer.remove();
      createHistoryPanel();
    }, 3000);
  }
});


// if (urlCode) {
//   pageMkb.classList.remove('page__mkb--start');
//   const searchInput = document.getElementById('search-input');
//   searchInput.codeValue = urlCode;
//   hideMkbData();
//   searchMkb();
//   loadingContainer.remove();
//   const newURL = window.location.origin + '/mkb';
//   history.replaceState({}, '', newURL);
// } else {
//   setTimeout(() => {
//     loadingContainer.remove();
//     createHistoryPanel();
//   }, 3000);
// }

async function createHistoryPanel() {
  const username = getCookie('username');
  document.historyDataArr = JSON.parse(
    localStorage.getItem(`mkbSearchHistory:${username}`)
  );
  if (!document.historyDataArr || document.historyDataArr.length === 0) {
    return;
  }
  const historyPanelElem = document.createElement('div');
  historyPanelElem.classList.add('history__panel');
  historyPanelElem.id = 'history-panel';
  pageMkb.appendChild(historyPanelElem);
  const historyBlockElemsArr = [];

  for (let historyData of document.historyDataArr) {
    historyBlockElemsArr.push(createHistoryBlockElem(historyData));
  }
  let delay = 111;
  for await (let historyBlockElem of historyBlockElemsArr) {
    historyPanelElem.appendChild(historyBlockElem);
    await delayFor(delay);
    delay = delay - 11;
  }

  historyPanelElem.addEventListener('click', function (e) {
    if (e.target.classList.contains('history__block')) {
      document.currentTextContent = e.target.textContent;
      searchInput.value = document.currentTextContent;
      searchInput.codeValue = e.target.valueData;
      removeHistoryPanel();
      hideMkbData();
      searchMkb();
    }
  });
}

function createHistoryBlockElem(historyData) {
  const historyBlockElem = document.createElement('div');
  historyBlockElem.classList.add('history__block');
  historyBlockElem.classList.add('bubble-up');
  historyBlockElem.style.opacity = 0;
  historyBlockElem.textContent = historyData.textContent;
  historyBlockElem.valueData = historyData.valueData;
  historyBlockElem.innerText = historyData.textContent;
  historyBlockElem.style.opacity = 1;
  return historyBlockElem;
}

function removeHistoryPanel() {
  document.getElementById('history-panel')?.remove();
}

async function updateHistory(newSearchData) {
  const oldHistoryArr = document.historyDataArr;
  if (oldHistoryArr) {
    const sameDataInd = oldHistoryArr.findIndex(
      (historyData) => historyData.valueData === newSearchData.valueData
    );
    if (sameDataInd !== -1) {
      oldHistoryArr.splice(sameDataInd, 1);
    }
  }
  const username = getCookie('username');
  const slicedHistory = oldHistoryArr ? oldHistoryArr.slice(0, 6) : [];
  const newHistoryArr = [newSearchData, ...slicedHistory];
  document.historyDataArr = newHistoryArr;
  localStorage.setItem(
    `mkbSearchHistory:${username}`,
    JSON.stringify(newHistoryArr)
  );
}

async function delayFor(delay) {
  await new Promise((resolve) => setTimeout(resolve, delay));
}

function setCardCopyButtonsEventHandler() {
  Array.from(document.getElementsByClassName('form__card')).forEach(
    (cardElem) => {
      addCopyCardAllTextDataEventListeners(
        cardElem.querySelector('.copy-button__copy-button')
      );
      cardElem
        .querySelector('.copy-button__close-button')
        .addEventListener('click', (e) => {
          const cardElem = e.target.closest('.form__card');
          removeBlockSelections(cardElem);
        });
    }
  );
}

function showInputListLoader() {
  const loadingElem = createLoadingElement();
  const resultsList = document.getElementById('search-list');
  searchListElem.innerHTML = loadingElem;
  resultsContainer.classList.remove('hidden');
}

function setCardViewTogglers() {
  console.log('setCardViewTogglers вызвана');
  const cardHeaderElems = document.getElementsByClassName('form__card-header');
  console.log('Найдено .form__card-header:', cardHeaderElems.length);
  Array.from(cardHeaderElems).forEach((header) => {
    header.addEventListener('click', (e) => {
      if (
        e.target.classList.contains('form__card--copy-button') ||
        e.target.classList.contains('form__card--copy-button--svg') ||
        e.target.closest('.form__card--copy-button') ||
        e.target.closest('.copy-button__close-button')
      ) {
        e.stopPropagation();
        return;
      }
      let currentElem = e.target;
      while (!currentElem.classList.contains('form__card')) {
        currentElem = currentElem.parentElement;
      }
      currentElem.classList.toggle('minimized');
      currentElem
        .querySelector('.form__card-toggle')
        .classList.toggle('rotated');
    });
  });
}
// window.setCardViewTogglers = setCardViewTogglers;
// document.addEventListener('DOMContentLoaded', () => {
//   window.setCardViewTogglers();
// });

function setTextBlockSelectionEventHandler() {
  const cardElems = Array.from(document.getElementsByClassName('form__card'));
  cardElems.forEach((cardElem) => {
    cardElem.addEventListener('click', (e) => {
      if (e.target.classList.contains('block__container')) {
        toggleBlockSelection(e.target);
        const textToCopy = getCardDataText(
          cardElem,
          cardElem.querySelector('.copy-button__copy-button')
        );
        const selectedBlocksAmount = cardElem.getElementsByClassName(
          'block__container--selected'
        ).length;
        if (selectedBlocksAmount) {
          const tooltipText = `Скопировано ${selectedBlocksAmount} шт.`;
          copyToClipboard(textToCopy, flashTooltipOnEvent, [
            e,
            tooltipText,
            500,
          ]);
        }
        e.stopPropagation();
        return;
      }
      const closestBlockElem = e.target.closest('.block__container');
      if (closestBlockElem) {
        toggleBlockSelection(closestBlockElem);
        const textToCopy = getCardDataText(
          cardElem,
          cardElem.querySelector('.copy-button__copy-button')
        );
        const selectedBlocksAmount = cardElem.getElementsByClassName(
          'block__container--selected'
        ).length;
        if (selectedBlocksAmount) {
          const tooltipText = `Скопировано ${selectedBlocksAmount} шт.`;
          copyToClipboard(textToCopy, flashTooltipOnEvent, [
            e,
            tooltipText,
            500,
          ]);
        }
        e.stopPropagation();
        return;
      }
    });
  });
}

function toggleBlockSelection(blockElem) {
  const cardElem = blockElem.closest('.form__card');
  blockElem.classList.toggle('block__container--selected');
  const copyButtonElem = cardElem.querySelector('.form__card--copy-button');
  if (
    Array.from(cardElem.getElementsByClassName('block__container')).find(
      (someBlockElem) => {
        return someBlockElem.classList.contains('block__container--selected');
      }
    )
  ) {
    switchOnCopyButton(copyButtonElem);
  } else {
    removeBlockSelections(cardElem);
  }
}

function removeBlockSelections(cardElem) {
  cardElem
    .querySelector('.form__card--copy-button')
    .classList.remove('copy-button--selected');
  cardElem
    .querySelector('.copy-button__close-button')
    .classList.add('hidden');
  Array.from(cardElem.getElementsByClassName('block__container')).forEach(
    (someBlockElem) => {
      someBlockElem.classList.remove('block__container--selected');
    }
  );
}

function removeAllBlockSelections() {
  Array.from(document.getElementsByClassName('form__card')).forEach(
    (cardElem) => {
      removeBlockSelections(cardElem);
    }
  );
}

function switchOnCopyButton(copyButtonElem) {
  if (copyButtonElem.classList.contains('copy-button--selected')) {
    return;
  } else {
    setTimeout(() => {
      copyButtonElem.classList.toggle('copy-button--selected');
    }, 100);
    setTimeout(() => {
      copyButtonElem.classList.toggle('copy-button--selected');
    }, 200);
    setTimeout(() => {
      copyButtonElem.classList.toggle('copy-button--selected');
    }, 300);
    setTimeout(() => {
      copyButtonElem.classList.toggle('copy-button--selected');
    }, 400);
    setTimeout(() => {
      copyButtonElem.classList.add('copy-button--selected');
    }, 500);
    copyButtonElem
      .closest('.form__card')
      .querySelector('.copy-button__close-button')
      .classList.remove('hidden');
  }
}

function addCopyCardAllTextDataEventListeners(cardCopyElem) {
  const tooltipElem = document.getElementById('tooltip');
  // Show tooltip on hover
  cardCopyElem.addEventListener('mouseenter', function () {
    tooltipElem.innerText = 'Копировать';
    tooltipElem.style.visibility = 'visible';
  });

  // Move tooltip with cursor
  cardCopyElem.addEventListener('mousemove', function (e) {
    tooltipElem.style.left = e.pageX + 'px';
    tooltipElem.style.top = e.pageY + 'px';
  });

  // Hide tooltip when not hovering
  cardCopyElem.addEventListener('mouseleave', function () {
    tooltipElem.style.visibility = 'hidden';
  });

  // Copy text to clipboard on click
  cardCopyElem.addEventListener('click', function (e) {
    const cardElem = e.target.closest('.form__card');
    const textToCopy = getCardDataText(cardElem, e.target);
    let selectedBlocksAmount = cardElem.getElementsByClassName(
      'block__container--selected'
    ).length;
    if (!selectedBlocksAmount)
      selectedBlocksAmount =
        cardElem.getElementsByClassName('block__container').length;
    copyToClipboard(textToCopy, flashTooltipOnEvent, [
      e,
      `Скопировано ${selectedBlocksAmount} шт.`,
    ]);
  });
}

function copyToClipboard(textToCopy, callback, args) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        if (callback) {
          args = args ? args : [];
          callback(...args);
        }
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  } else {
    // Fallback method using a temporary textarea element
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
      if (callback) {
        args = args ? args : [];
        callback(...args);
      }
    } catch (err) {
      console.error('Fallback: Could not copy text', err);
    }
    document.body.removeChild(tempTextArea);
  }
}

function flashTooltipOnEvent(event, tooltipText, timeout) {
  const tooltipElem = document.getElementById('tooltip');
  tooltipElem.style.left = event.pageX + 'px';
  tooltipElem.style.top = event.pageY + 'px';
  tooltipElem.innerText = tooltipText;
  tooltipElem.style.visibility = 'visible';
  if (timeout) {
    clearTimeout(document.tooltipHideTimeoutId);
    document.tooltipHideTimeoutId = setTimeout(
      () => (tooltipElem.style.visibility = 'hidden'),
      timeout
    );
  }
}

function getCardDataText(cardElem, copyButtonElem) {
  const selectionModeIsOn = copyButtonElem
    .closest('.form__card--copy-button')
    .classList.contains('copy-button--selected');
  const dataString = Array.from(
    cardElem.getElementsByClassName('block__container')
  ).reduce((string, blockElem) => {
    const titleText =
      blockElem.querySelector('.block__header').innerText;

    const planElem = blockElem.querySelector('.block__comment--plan');

    const durationELem = blockElem.querySelector('.block__comment--duration');

    if (
      selectionModeIsOn &&
      !blockElem.classList.contains('block__container--selected')
    ) {
      return string;
    }
    let newString = titleText;
    if (planElem) {
      newString += '\n' + planElem.innerText;
    }
    if (durationELem) {
      newString += '\n' + durationELem.innerText;
    }
    return string + '\n' + '\n' + newString;
  }, '');
  return dataString.trim();
}

function getSelectedBlocksAmount(cardElem) {
  return Array.from(
    cardElem.getElementsByClassName('block__container--selected')
  ).length;
}

async function searchMkb() {
  removeHistoryPanel();
  pageMkb.classList.remove('page__mkb--start');

  const code = searchInput.codeValue;

  // Get credentials from cookies
  const username = getCookie('username');
  const password = getCookie('password');

  clearButton.classList.add('hidden');
  searchButton.classList.add('hidden');
  document
    .querySelector('.form__input--list-container')
    .classList.add('hidden');
  searchInput.value = '';
  searchInput.placeholder = 'ЗАГРУЗКА...';
  searchInput.disabled = true;

  try {
    const response = await fetch(
      `../php/get-data.php/login?code=${code}&username=${username}&password=${password}`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // const encryptedText  = await response.text();
    // const data = await decryptData(encryptedText);
    //
    // if (!data || !data.child) {
    //   throw new Error('Invalid data received');
    // }

    const data = await response.json();

    if (!data || !data.child) {
      throw new Error('Invalid data received');
    }

    document.mkbData = data;
    const newSearchData = {
      valueData: data.child.code,
      textContent: data.child.code + ': ' + data.child.name,
    };
    updateHistory(newSearchData);
    clearButton.classList.remove('hidden');
    searchButton.classList.remove('hidden');
    setMkbName();
    const listsAreSet = setLists();
    if (listsAreSet) revealMkbData();
  } catch (error) {
    console.error('Ошибка:', error);
    searchInput.placeholder = 'Название или код болезни';
    searchInput.disabled = false;
  }
}

function setMkbName() {
  searchInput.value = `${document.mkbData.child.code} ${document.mkbData.child.name}`;
  searchInput.placeholder = 'Название или код болезни';
  searchInput.disabled = false;
}

function revealMkbData() {
  const mkbDataElem = document.getElementById('mkb-data');
  mkbDataElem.classList.remove('hidden');
}

function hideMkbData() {
  const mkbDataElem = document.getElementById('mkb-data');
  const noDataPopupElem = document.getElementById('no-data-popup-section');
  mkbDataElem.classList.add('hidden');
  noDataPopupElem.classList.add('hidden');
}

function revealSection(type) {
  const sectionElem = document.getElementById(`${type}-section`);
  sectionElem.classList.remove('hidden');
}

function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setLists() {
  removeAllBlockSelections();
  sectionToggles.classList.remove('hidden');
  const mkbData = document.mkbData;
  if (!mkbData) return;
  // console.log(mkbData)
  const examRequiredTextElem = document.getElementById('exam-required');
  const examOptionalTextElem = document.getElementById('exam-optional');
  const treatActionTextElem = document.getElementById('treat-action');
  const treatDrugTextElem = document.getElementById('treat-drug');
  const noDataPopup = document.getElementById('no-data-popup-section');
  // const ageToggleElem = document.getElementById('age-toggle');
  // const standardToggleElem = document.getElementById('standard-toggle');
  if (
    mkbData.child.standards.length === 0 &&
    mkbData.grownup.standards.length === 0
  ) {
    document.getElementById('mkb-code').innerText = mkbData.child.code;
    sectionToggles.classList.add('hidden');
    noDataPopup.classList.remove('hidden');
    ageToggleElem.disabled = true;
    standardToggleElem.disabled = true;
    return false;
  }
  noDataPopup.classList.add('hidden');
  setTogglers(mkbData);
  const examStageToggleFirstElem = document.getElementById(
    'exam-stage-toggle-first'
  );
  const examStageToggleSecondElem = document.getElementById(
    'exam-stage-toggle-second'
  );
  examStageToggleFirstElem.addEventListener('click', toggleStage);
  examStageToggleSecondElem.addEventListener('click', toggleStage);

  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';
  const currentStatus = standardToggleElem.checked
    ? 'Рекомендация'
    : 'Стандарт';

  const listsData = {};
  listsData.exam = createListData(
    mkbData,
    'Диагностика',
    currentStatus,
    currentAge
  );
  listsData.treat = createListData(
    mkbData,
    'Лечение',
    currentStatus,
    currentAge
  );

  createList('exam', listsData);
  createList('treat', listsData);
  return true;
}

function setTogglers(mkbData) {
  const ageToggleElem = document.getElementById('age-toggle');
  // const standardToggleElem = document.getElementById('standard-toggle');
  const examStageToggleFirstElem = document.getElementById(
      'exam-stage-toggle-first'
  );
  const examStageToggleSecondElem = document.getElementById(
      'exam-stage-toggle-second'
  );
  ageToggleElem.disabled = false;
  standardToggleElem.disabled = false;
  if (mkbData.child.standards.length === 0) {
    ageToggleElem.checked = true;
    ageToggleElem.disabled = true;
  } else if (mkbData.grownup.standards.length === 0) {
    ageToggleElem.checked = false;
    ageToggleElem.disabled = true;
  }
  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';

  const hasStandard = mkbData[currentAge].standards.some(
      (standard) => standard.status === 'Стандарт'
  );
  const hasRecommendation = mkbData[currentAge].standards.some(
      (standard) => standard.status === 'Рекомендация'
  );

  if (!hasStandard && hasRecommendation) {
    standardToggleElem.checked = true;
    standardToggleElem.disabled = true;
  } else if (hasStandard && !hasRecommendation) {
    standardToggleElem.checked = false;
    standardToggleElem.disabled = true;
  } else if (hasStandard && hasRecommendation) {
    if (!standardToggleElem.hasAttribute('data-user-touched')) {
      standardToggleElem.setAttribute('data-user-touched', 'true');
      standardToggleElem.checked = true;
    }
    standardToggleElem.disabled = false;
  }
}

function setExamText() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const ageToggleElem = document.getElementById('age-toggle');
  const examStageToggleFirstElem = document.getElementById(
    'exam-stage-toggle-first'
  );

  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';
  const currentStage = examStageToggleFirstElem.classList.contains(
    'stage__selected'
  )
    ? 1
    : 2;
  const standardInd = getStandardInd('exam');

  const examCardRequiredElem = document.getElementById('exam-card-required');
  const examCardOptionalElem = document.getElementById('exam-card-optional');
  clearCard(examCardRequiredElem);
  clearCard(examCardOptionalElem);
  mkbData[currentAge].standards[standardInd].examinations.forEach((exam) => {
    if (exam.examination_stage_id == currentStage) {
      if (exam.is_required) createExamBlock(examCardRequiredElem, exam);
      else createExamBlock(examCardOptionalElem, exam);
    }
  });
  examCardRequiredElem.classList.remove('hidden');
  examCardOptionalElem.classList.remove('hidden');
}

function setTreatText() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const ageToggleElem = document.getElementById('age-toggle');
  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';
  const standardInd = getStandardInd('treat');

  const treatCardActionElem = document.getElementById('treat-card-action');
  const treatCardDrugElem = document.getElementById('treat-card-drug');
  clearCard(treatCardActionElem);
  clearCard(treatCardDrugElem);
  mkbData[currentAge].standards[standardInd].treatments.forEach((treat) => {
    if (treat.treatment_type_id === 1)
      createExamBlock(treatCardActionElem, treat);
    else createTreatBlock(treatCardDrugElem, treat);
  });
  treatCardActionElem.classList.remove('hidden');
  treatCardDrugElem.classList.remove('hidden');
}

function toggleStage(e) {
  removeAllBlockSelections();
  const examStageToggleFirstElem = document.getElementById(
    'exam-stage-toggle-first'
  );
  const examStageToggleSecondElem = document.getElementById(
    'exam-stage-toggle-second'
  );
  if (e.target.classList.contains('stage__selected')) {
    return;
  } else {
    if (e.target === examStageToggleFirstElem) {
      examStageToggleSecondElem.classList.remove('stage__selected');
    } else {
      examStageToggleFirstElem.classList.remove('stage__selected');
    }
    e.target.classList.add('stage__selected');
    setExamText();
  }
}

function clearCard(cardParentElem) {
  Array.from(cardParentElem.children).forEach((elem, ind) => {
    if (ind != 0) elem.remove();
  });
}

function hideCard(cardType) {
  if (cardType === 'exam') {
    document.getElementById('exam-card-required').classList.add('hidden');
    document.getElementById('exam-card-optional').classList.add('hidden');
  } else {
    document.getElementById('treat-card-action').classList.add('hidden');
    document.getElementById('treat-card-drug').classList.add('hidden');
  }
}

function createExamBlock(blockParentElem, examData) {
  const examContainer = document.createElement('div');
  examContainer.classList.add('block__container');
  const examHeader = document.createElement('h4');
  examHeader.classList.add('block__header');
  examHeader.innerText = examData.name;
  const examComment = document.createElement('p');
  examComment.classList.add('block__comment');
  examComment.innerText = examData.comment;
  const examQuality = document.createElement('div');
  examQuality.classList.add('block__quality');
  examQuality.classList.add(
    examData.is_qualitative ? 'block__quality--green' : 'block__quality--gray'
  );
  examContainer.appendChild(examHeader);
  examContainer.appendChild(examComment);
  examContainer.appendChild(examQuality);
  blockParentElem.appendChild(examContainer);
}

function createTreatBlock(parentElem, treatData) {
  const treatContainer = document.createElement('div');
  treatContainer.classList.add('block__container');
  const treatHeader = document.createElement('h4');
  treatHeader.classList.add('block__header');
  treatHeader.innerText = treatData.name;
  const treatComment = document.createElement('p');
  treatComment.classList.add('block__comment');
  treatComment.innerText = treatData.comment;
  const treatQuality = document.createElement('div');
  treatQuality.classList.add('block__quality');
  treatQuality.classList.add(
    treatData.is_qualitative ? 'block__quality--green' : 'block__quality--gray'
  );
  treatContainer.appendChild(treatHeader);
  treatContainer.appendChild(treatComment);
  if (treatData.plan) {
    const treatPlan = document.createElement('p');
    treatPlan.classList.add('block__comment');
    treatPlan.classList.add('block__comment--plan');
    treatPlan.innerHTML = '<strong>Схема лечения: </strong>' + treatData.plan;
    treatContainer.appendChild(treatPlan);
  }
  if (treatData.duration) {
    const treatDuration = document.createElement('p');
    treatDuration.classList.add('block__comment');
    treatDuration.classList.add('block__comment--duration');
    treatDuration.innerHTML =
      '<strong>Длительность курса: </strong>' + treatData.duration;
    treatContainer.appendChild(treatDuration);
  }
  treatContainer.appendChild(treatQuality);
  parentElem.appendChild(treatContainer);
}

function createList(type, listsData) {
  const listData = listsData[type];
  const listElem = document.getElementById(type + '-list');
  listElem.removeEventListener(
    'change',
    type === 'exam' ? setExamText : setTreatText
  );
  removeOptions(listElem);
  const listParentElem = listElem.parentElement;
  const sectionElem = listParentElem.parentElement;
  const monolistElem = listParentElem.getElementsByTagName('p')[0];

  if (listData.length === 0) {
    sectionElem.classList.add('hidden');
    listElem.classList.add('hidden');
    monolistElem.classList.add('hidden');
    return;
  }

  if (listData.length === 1) {
    listElem.classList.add('hidden');
    monolistElem.classList.remove('hidden');
    monolistElem.innerText = listData[0].name;
    monolistElem.value = listData[0].index;
    if (monolistElem.id === 'exam-monolist') {
      setExamText();
    }
    if (monolistElem.id === 'treat-monolist') {
      setTreatText();
    }
  } else {
    hideCard(type);
    monolistElem.classList.add('hidden');
    listElem.classList.remove('hidden');
    listData.forEach((data) => {
      const optionElem = document.createElement('option');
      optionElem.innerText = data.name;
      optionElem.value = data.index;
      listElem.appendChild(optionElem);
    });
  }
  listElem.value = '';
  listElem.addEventListener(
    'change',
    type === 'exam' ? setExamText : setTreatText
  );
  revealSection(type);

  if (type === 'exam') {
    setTimeout(updateButtonsVisibility, 0);
  }
}

function updateButtonsVisibility() {
  const standardToggle = document.getElementById('standard-toggle');
  const selectElem = document.getElementById('exam-list');
  const monolist = document.getElementById('exam-monolist');
  const isRecommendation = standardToggle.checked;
  const selectHasValue = selectElem && selectElem.value !== "";
  const monolistVisible = monolist && !monolist.classList.contains("hidden") && monolist.textContent.trim() !== "";

  if (
      (!isRecommendation && selectHasValue) ||
      (isRecommendation && (selectHasValue || monolistVisible))
  ) {
    buttonsSection.classList.remove('hidden');
  } else {
    buttonsSection.classList.add('hidden');
  }
}

function removeOptions(listElem) {
  Array.from(listElem.children).forEach((elem, ind) => {
    if (ind != 0) elem.remove();
  });
}

function getStandardInd(type) {
  if (document.getElementById(`${type}-list`).classList.contains('hidden')) {
    const listElem = document.getElementById(`${type}-monolist`);
    return listElem.value;
  } else {
    const listElem = document.getElementById(`${type}-list`);
    return listElem.options[listElem.selectedIndex].value;
  }
}

function createListData(mkbData, type, status, age) {
  const agedStandards = (age === 'child' ? mkbData.child : mkbData.grownup)
    .standards;
  const listData = [];
  agedStandards.forEach((standard, standardIndex) => {
    if (type !== standard.type || status !== standard.status) return;
    else {
      listData.push({
        name: standard.name,
        index: standardIndex,
      });
    }
  });
  return listData;
}

// function fetchResults(query) {
//   fetch(`../php/search.php?q=${encodeURIComponent(query)}`)
//     .then((response) => response.text())
//     .then(async (encryptedText) => await decryptData(encryptedText))
//     .then((data) => {
//       displayResults(data);
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
//   }

function fetchResults(query) {
  fetch(`../php/search.php?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        displayResults(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
}

function displayResults(data) {
  searchListElem.innerHTML = '';
  const results = data.filter(
      (item, ind) => data.findIndex((obj) => obj.code === item.code) === ind
  );
  if (results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      const li = document.createElement('li');
      li.textContent = item.code + ': ' + item.name;
      li.valueData = item.code;
      li.classList.add('form__input--list-item');
      searchListElem.appendChild(li);
    }
    resultsContainer.classList.remove('hidden');
  } else {
    searchListElem.textContent = 'Совпадений не найдено';
  }
}

function createLoadingElement(className = '') {
  const lodingElemHtml = `<svg class="rotating" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:#2D50A7;" d="M267.636,0c-12.853,0-23.273,10.42-23.273,23.273v93.091c0,12.853,10.42,23.273,23.273,23.273c12.853,0,23.273-10.42,23.273-23.273V23.273C290.909,10.42,280.489,0,267.636,0z"/>
<path style="fill:#73A1FB;" d="M267.638,372.364c-12.853,0-23.273,10.42-23.273,23.273v93.091c0,12.853,10.42,23.273,23.273,23.273c12.853,0,23.273-10.42,23.273-23.273v-93.091C290.911,382.784,280.491,372.364,267.638,372.364z"/>
<path style="fill:#355EC9;" d="M185.355,140.808L119.529,74.98c-9.086-9.089-23.822-9.089-32.912,0c-9.089,9.089-9.089,23.824,0,32.912l65.826,65.828c4.544,4.544,10.501,6.817,16.455,6.817c5.955,0,11.913-2.273,16.455-6.817C194.444,164.631,194.444,149.897,185.355,140.808z"/>
<g>
<path style="fill:#C4D9FD;" d="M477.091,232.727h-46.545c-12.853,0-23.273,10.42-23.273,23.273c0,12.853,10.42,23.273,23.273,23.273h46.545c12.853,0,23.273-10.42,23.273-23.273C500.364,243.147,489.944,232.727,477.091,232.727z"/>
<path style="fill:#C4D9FD;" d="M382.83,338.283c-9.087-9.089-23.823-9.087-32.912,0c-9.089,9.089-9.087,23.823,0,32.912l65.828,65.825c4.544,4.544,10.501,6.816,16.457,6.816c5.956,0,11.913-2.273,16.455-6.816c9.089-9.089,9.089-23.824,0-32.912L382.83,338.283z"/>
</g>
<path style="fill:#3D6DEB;" d="M151.273,256c0-12.853-10.42-23.273-23.273-23.273H34.909c-12.853,0-23.273,10.42-23.273,23.273c0,12.853,10.42,23.273,23.273,23.273H128C140.853,279.273,151.273,268.853,151.273,256z"/>
<path style="fill:#5286FA;" d="M185.355,338.283c-9.087-9.089-23.824-9.089-32.912,0l-65.825,65.825c-9.089,9.087-9.089,23.824,0,32.912c4.544,4.544,10.501,6.816,16.457,6.816c5.956,0,11.913-2.271,16.455-6.816l65.825-65.825C194.444,362.108,194.444,347.372,185.355,338.283z"/>
</svg>`;
  return lodingElemHtml;
}
