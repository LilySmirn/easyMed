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
const popupOverlay = document.getElementById("popup-overlay");
const closeButton = document.querySelector(".exam-popup__close");
const crmLinkContainer = document.getElementById('crm-link-container');
const addImageBlock = document.querySelector('.add-img');
const fileInput = document.getElementById('fileInput');
const addImgText = document.querySelector('.add-img__text');
const removeFileBtn = document.getElementById('removeFileBtn');
const fileNameText = document.getElementById('fileName');
const tablePopup = document.getElementById('table-popup-overlay');
const tablePopupContent = document.getElementById('table-popup-content');
const tablePopupCloseBtn = document.getElementById('table-popup-close');
tablePopupCloseBtn.addEventListener('click', () => {
  tablePopup.classList.add('hidden');
  tablePopupContent.innerHTML = '';
})
let popupData = null;

/*if (ageToggleElem) {
  ageToggleElem.addEventListener('click', async () => await setLists());
}*/


// селект параметров сортировки
const selectElement = document.getElementById("select-sorting");

function initSortSelect(selectId) {

  if (!selectElement) return;

  function handleSelection(value) {
    switch (value) {
      case "one":
        sortByAlphabet();
        sortByAlphabetTreatment();
        break;
      case "two":
        sortByUur();
        sortByUurTreatment();
        break;
      case "three":
        sortByQuality();
        sortByQualityTreatment();
        break;
      case "four":
        sortById();
        sortByIdTreatment();
        break;
      default:
        sortByAlphabet();
        sortByAlphabetTreatment();
        break;
    }
  }

  handleSelection(selectElement.value || "one");

  selectElement.addEventListener("change", function () {
    handleSelection(this.value);
  });
}

initSortSelect("select-sorting");


function sortByAlphabet() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  setExamText();
}
function sortByAlphabetTreatment() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const currentStandardIndex = getStandardInd('treat');
  const standard = mkbData[currentAge].standards[currentStandardIndex];

  setTreatText(standard.treatments);
}

function groupByCategoryAndSortByQuality(arr) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];
    const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
    const groupKey = category === '' || category === 'null' ? 'Прочее' : category;

    if (!groups[groupKey]) groups[groupKey] = [];

    const cloned = { ...item };
    groups[groupKey].push(cloned);
  });

  const result = Object.entries(groups)
      .filter(([groupName]) => groupName !== 'Прочее')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, values]) => {
        const split = splitByNameAndQuality(values);
        const sorted = split.sort((a, b) => {
          if (b.is_qualitative !== a.is_qualitative) {
            return b.is_qualitative - a.is_qualitative;
          }
          return a.name.localeCompare(b.name);
        });
        return {
          name: groupName,
          values: sorted
        };
      });

  if (groups['Прочее']) {
    const split = splitByNameAndQuality(groups['Прочее']);
    const sorted = split.sort((a, b) => {
      if (b.is_qualitative !== a.is_qualitative) {
        return b.is_qualitative - a.is_qualitative;
      }
      return a.name.localeCompare(b.name);
    });
    result.push({ name: 'Прочее', values: sorted });
  }

  return result;
}
function splitByNameAndQuality(arr) {
  const map = new Map();

  arr.forEach((item, i) => {
    const key = `${item.name}___${item.is_qualitative}_${item.cr_db_id || ""}_${i}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });

  return Array.from(map.values()).flat();
}
function sortByQuality() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const currentStandardIndex = getStandardInd('exam'); // для диагностики
  const standard = mkbData[currentAge].standards[currentStandardIndex];

  const examCardRequiredElem = document.getElementById('exam-card-required');
  const examCardOptionalElem = document.getElementById('exam-card-optional');

  clearCard(examCardRequiredElem);
  clearCard(examCardOptionalElem);

  const examsRequired = standard.examinations.filter(e =>
      e.is_required && e.is_stationary !== 1
  );
  const examsOptional = standard.examinations.filter(e =>
      !e.is_required && e.is_stationary !== 1
  );

  const requiredGrouped = groupByCategoryAndSortByQuality(examsRequired);
  const optionalGrouped = groupByCategoryAndSortByQuality(examsOptional);

  let hasRequired = requiredGrouped.length > 0;
  let hasOptional = optionalGrouped.length > 0;

  if (hasRequired) {
    let prevName = "";
    requiredGrouped.forEach(group => {
      createGroupTitle(examCardRequiredElem, group.name);
      prevName = "";
      group.values.forEach(item => {
        createExamBlock(examCardRequiredElem, item, prevName);
        prevName = item.name;
      });
    });
    examCardRequiredElem.classList.remove('hidden');
  } else {
    examCardRequiredElem.classList.add('hidden');
  }

  if (hasOptional) {
    let prevName = "";
    optionalGrouped.forEach(group => {
      createGroupTitle(examCardOptionalElem, group.name);
      prevName = "";
      group.values.forEach(item => {
        createExamBlock(examCardOptionalElem, item, prevName);
        prevName = item.name;
      });
    });
    examCardOptionalElem.classList.remove('hidden');
  } else {
    examCardOptionalElem.classList.add('hidden');
  }

  revealSection('exam');
}
function sortByQualityTreatment() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const currentStandardIndex = getStandardInd('treat');
  const standard = mkbData[currentAge].standards[currentStandardIndex];

  const treatCardActionElem = document.getElementById('treat-card-action');
  const treatCardDrugElem = document.getElementById('treat-card-drug');
  const treatCardDrugOfflabelElem = document.getElementById('treat-card-drug-offlabel');

  clearCard(treatCardActionElem);
  clearCard(treatCardDrugElem);
  clearCard(treatCardDrugOfflabelElem);

  const allTreatments = standard.treatments.filter(t => t.is_stationary !== 1);

  const drugTreatments = allTreatments.filter(t => t.type === "drug" && !t.is_offlabel);
  const actionTreatments = allTreatments.filter(t => t.type === "service");
  const offlabelTreatments = allTreatments.filter(t => t.is_offlabel && t.type === "drug");

  const groupedDrugs = groupTreatByCategoryAndSortByQuality(drugTreatments);
  const groupedActions = groupTreatByCategoryAndSortByQuality(actionTreatments);
  const groupedOfflabel = groupTreatByCategoryAndSortByQuality(offlabelTreatments);

  let hasDrug = false;
  let hasAction = false;
  let hasOfflabel = false;

  groupedDrugs.forEach(group => {
    createGroupTitle(treatCardDrugElem, group.name);
    let prevName = "";
    group.values.forEach(item => {
      createTreatBlock(treatCardDrugElem, item, prevName);
      prevName = item.name;
    });
    hasDrug = true;
  });

  groupedActions.forEach(group => {
    createGroupTitle(treatCardActionElem, group.name);
    let prevName = "";
    group.values.forEach(item => {
      createTreatBlock(treatCardActionElem, item, prevName);
      prevName = item.name;
    });
    hasAction = true;
  });

  groupedOfflabel.forEach(group => {
    createGroupTitle(treatCardDrugOfflabelElem, group.name);
    let prevName = "";
    group.values.forEach(item => {
      createTreatBlock(treatCardDrugOfflabelElem, item, prevName);
      prevName = item.name;
    });
    hasOfflabel = true;
  });

  if (hasDrug) treatCardDrugElem.classList.remove('hidden');
  else treatCardDrugElem.classList.add('hidden');

  if (hasAction) treatCardActionElem.classList.remove('hidden');
  else treatCardActionElem.classList.add('hidden');

  if (hasOfflabel) {
    treatCardDrugOfflabelElem.classList.remove('hidden');
    treatCardDrugOfflabelElem.classList.add('minimized');
  } else {
    treatCardDrugOfflabelElem.classList.add('hidden');
  }

  revealSection('treat');
}
function groupTreatByCategoryAndSortByQuality(arr) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];
    const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
    const groupKey = category === '' || category === 'null' ? 'Прочее' : category;

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ ...item });
  });

  const result = Object.entries(groups)
      .filter(([groupName]) => groupName !== 'Прочее')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, values]) => {
        const split = splitByNameAndQuality(values);
        const sorted = split.sort((a, b) => {
          if (b.is_qualitative !== a.is_qualitative) {
            return b.is_qualitative - a.is_qualitative;
          }
          return a.name.localeCompare(b.name);
        });
        return {
          name: groupName,
          values: sorted
        };
      });

  if (groups['Прочее']) {
    const split = splitByNameAndQuality(groups['Прочее']);
    const sorted = split.sort((a, b) => {
      if (b.is_qualitative !== a.is_qualitative) {
        return b.is_qualitative - a.is_qualitative;
      }
      return a.name.localeCompare(b.name);
    });

    result.push({ name: 'Прочее', values: sorted });
  }

  return result;
}

function sortByPers(groupName, values) {
  const sortedWithPers = values
      .filter(x => x.hasOwnProperty('pers'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => {

        let aValue = `${a.pers["уур"]}${a.pers["удд"]}`;
        let bValue = `${b.pers["уур"]}${b.pers["удд"]}`;

        return aValue.localeCompare(bValue);
      });

  const sortedNoPers = values
      .filter(x => !x.hasOwnProperty('pers'))
      .sort((a, b) => a.name.localeCompare(b.name));

  return {
    name: groupName,
    values: sortedWithPers.concat(sortedNoPers)
  };
}
function groupByCategoryAndSortByUur(arr) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];
    const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
    const groupKey = category === '' || category === 'null' ? 'Прочее' : category;

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ ...item });
  });

  const result = Object.entries(groups)
      .sort(([a], [b]) => a === 'Прочее' ? 1 : b === 'Прочее' ? -1 : a.localeCompare(b))
      .map(([groupName, values]) => sortByPers(groupName, values));

  return result;
}
function sortByUur() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const currentStandardIndex = getStandardInd('exam');
  const standard = mkbData[currentAge].standards[currentStandardIndex];

  const examCardRequiredElem = document.getElementById('exam-card-required');
  const examCardOptionalElem = document.getElementById('exam-card-optional');

  clearCard(examCardRequiredElem);
  clearCard(examCardOptionalElem);

  const examsRequired = standard.examinations.filter(e =>
      e.is_required && e.is_stationary !== 1
  );
  const examsOptional = standard.examinations.filter(e =>
      !e.is_required && e.is_stationary !== 1
  );

  const requiredGrouped = groupByCategoryAndSortByUur(examsRequired);
  const optionalGrouped = groupByCategoryAndSortByUur(examsOptional);

  if (requiredGrouped.length > 0) {
    let prevName = "";
    requiredGrouped.forEach(group => {
      createGroupTitle(examCardRequiredElem, group.name);
      group.values.forEach(item => {
        createExamBlock(examCardRequiredElem, item, null);
      });
    });
    examCardRequiredElem.classList.remove('hidden');
  } else {
    examCardRequiredElem.classList.add('hidden');
  }

  if (optionalGrouped.length > 0) {
    let prevName = "";
    optionalGrouped.forEach(group => {
      createGroupTitle(examCardOptionalElem, group.name);
      group.values.forEach(item => {
        createExamBlock(examCardOptionalElem, item, null);
      });
    });
    examCardOptionalElem.classList.remove('hidden');
  } else {
    examCardOptionalElem.classList.add('hidden');
  }

  revealSection('exam');
}
function groupTreatByCategoryAndSortByUur(arr) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];
    const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
    const groupKey = category === '' || category === 'null' ? 'Прочее' : category;

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ ...item });
  });

  const result = Object.entries(groups)
      .sort(([a], [b]) => a === 'Прочее' ? 1 : b === 'Прочее' ? -1 : a.localeCompare(b))
      .map(([groupName, values]) => sortByPers(groupName, values));

  return result;
}
function sortByUurTreatment() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const standardInd = getStandardInd('treat');
  const standard = mkbData[currentAge].standards[standardInd];

  const treatCardActionElem = document.getElementById('treat-card-action');
  const treatCardDrugElem = document.getElementById('treat-card-drug');
  const treatCardDrugOfflabelElem = document.getElementById('treat-card-drug-offlabel');

  clearCard(treatCardActionElem);
  clearCard(treatCardDrugElem);
  clearCard(treatCardDrugOfflabelElem);

  const allTreatments = standard.treatments.filter(t => t.is_stationary !== 1);

  const drugTreatments = allTreatments.filter(t => t.type === "drug" && !t.is_offlabel);
  const actionTreatments = allTreatments.filter(t => t.type === "service");
  const offlabelTreatments = allTreatments.filter(t => t.is_offlabel && t.type === "drug");

  const groupedDrugs = groupTreatByCategoryAndSortByUur(drugTreatments);
  const groupedActions = groupTreatByCategoryAndSortByUur(actionTreatments);
  const groupedOfflabel = groupTreatByCategoryAndSortByUur(offlabelTreatments);

  let hasDrug = false;
  let hasAction = false;
  let hasOfflabel = false;

  groupedDrugs.forEach(group => {
    createGroupTitle(treatCardDrugElem, group.name);
    group.values.forEach(item => {
      createTreatBlock(treatCardDrugElem, item, null);
    });
    hasDrug = true;
  });

  groupedActions.forEach(group => {
    createGroupTitle(treatCardActionElem, group.name);
    group.values.forEach(item => {
      createTreatBlock(treatCardActionElem, item, null);
    });
    hasAction = true;
  });

  groupedOfflabel.forEach(group => {
    createGroupTitle(treatCardDrugOfflabelElem, group.name);
    group.values.forEach(item => {
      createTreatBlock(treatCardDrugOfflabelElem, item, null);
    });
    hasOfflabel = true;
  });

  if (hasDrug) treatCardDrugElem.classList.remove('hidden');
  else treatCardDrugElem.classList.add('hidden');

  if (hasAction) treatCardActionElem.classList.remove('hidden');
  else treatCardActionElem.classList.add('hidden');

  if (hasOfflabel) {
    treatCardDrugOfflabelElem.classList.remove('hidden');
    treatCardDrugOfflabelElem.classList.add('minimized');
  } else {
    treatCardDrugOfflabelElem.classList.add('hidden');
  }

  revealSection('treat');
}

function groupByCategoryAndSortById(arr) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];
    const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
    const groupKey = category === '' || category === 'null' ? 'Прочее' : category;

    if (!groups[groupKey]) groups[groupKey] = [];

    groups[groupKey].push({ ...item }); // Клонируем объект
  });

  const result = Object.entries(groups)
      .filter(([groupName]) => groupName !== 'Прочее')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, values]) => {
        const split = splitByNameAndId(values);
        const sorted = split.sort((a, b) => {
          const aId = parseInt(a.cr_db_id) || 0;
          const bId = parseInt(b.cr_db_id) || 0;

          if (aId !== bId) return aId - bId;
          return a.name.localeCompare(b.name);
        });

        return {
          name: groupName,
          values: sorted
        };
      });

  if (groups['Прочее']) {
    const split = splitByNameAndId(groups['Прочее']);
    const sorted = split.sort((a, b) => {
      const aId = parseInt(a.cr_db_id) || 0;
      const bId = parseInt(b.cr_db_id) || 0;

      if (aId !== bId) return aId - bId;
      return a.name.localeCompare(b.name);
    });

    result.push({ name: 'Прочее', values: sorted });
  }

  return result;
}
function groupTreatByCategoryAndSortById(arr) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];
    const category = typeof rawCategory === 'string' ? rawCategory.trim() : '';
    const groupKey = category === '' || category === 'null' ? 'Прочее' : category;

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ ...item });
  });

  const result = Object.entries(groups)
      .filter(([groupName]) => groupName !== 'Прочее')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, values]) => {
        const split = splitByNameAndId(values);
        const sorted = split.sort((a, b) => {
          const aId = parseFloat((a.cr_db_id || '').replace(/[^\d.]/g, '')) || 0;
          const bId = parseFloat((b.cr_db_id || '').replace(/[^\d.]/g, '')) || 0;

          if (aId !== bId) return aId - bId;
          return a.name.localeCompare(b.name);
        });

        return {
          name: groupName,
          values: sorted
        };
      });

  if (groups['Прочее']) {
    const split = splitByNameAndId(groups['Прочее']);
    const sorted = split.sort((a, b) => {
      const aId = parseFloat((a.cr_db_id || '').replace(/[^\d.]/g, '')) || 0;
      const bId = parseFloat((b.cr_db_id || '').replace(/[^\d.]/g, '')) || 0;

      if (aId !== bId) return aId - bId;
      return a.name.localeCompare(b.name);
    });

    result.push({ name: 'Прочее', values: sorted });
  }

  return result;
}
function splitByNameAndId(arr) {
  const map = new Map();

  arr.forEach(item => {
    const key = `${item.name}___${item.cr_db_id}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });

  return Array.from(map.values()).flat();
}
function sortById() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const currentStandardIndex = getStandardInd('exam'); // для диагностики
  const standard = mkbData[currentAge].standards[currentStandardIndex];

  const examCardRequiredElem = document.getElementById('exam-card-required');
  const examCardOptionalElem = document.getElementById('exam-card-optional');

  clearCard(examCardRequiredElem);
  clearCard(examCardOptionalElem);

  const examsRequired = standard.examinations.filter(e =>
      e.is_required && e.is_stationary !== 1
  );
  const examsOptional = standard.examinations.filter(e =>
      !e.is_required && e.is_stationary !== 1
  );

  const requiredGrouped = groupByCategoryAndSortById(examsRequired);
  const optionalGrouped = groupByCategoryAndSortById(examsOptional);

  let hasRequired = requiredGrouped.length > 0;
  let hasOptional = optionalGrouped.length > 0;

  if (hasRequired) {
    let prevName = "";
    requiredGrouped.forEach(group => {
      createGroupTitle(examCardRequiredElem, group.name);
      prevName = "";
      group.values.forEach(item => {
        createExamBlock(examCardRequiredElem, item, prevName);
        prevName = item.name;
      });
    });
    examCardRequiredElem.classList.remove('hidden');
  } else {
    examCardRequiredElem.classList.add('hidden');
  }

  if (hasOptional) {
    let prevName = "";
    optionalGrouped.forEach(group => {
      createGroupTitle(examCardOptionalElem, group.name);
      prevName = "";
      group.values.forEach(item => {
        createExamBlock(examCardOptionalElem, item, prevName);
        prevName = item.name;
      });
    });
    examCardOptionalElem.classList.remove('hidden');
  } else {
    examCardOptionalElem.classList.add('hidden');
  }

  revealSection('exam');
}
function sortByIdTreatment() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const currentAge = document.getElementById('age-toggle').checked ? 'grownup' : 'child';
  const currentStandardIndex = getStandardInd('treat');
  const standard = mkbData[currentAge].standards[currentStandardIndex];

  const treatCardActionElem = document.getElementById('treat-card-action');
  const treatCardDrugElem = document.getElementById('treat-card-drug');
  const treatCardDrugOfflabelElem = document.getElementById('treat-card-drug-offlabel');

  clearCard(treatCardActionElem);
  clearCard(treatCardDrugElem);
  clearCard(treatCardDrugOfflabelElem);

  const allTreatments = standard.treatments.filter(t => t.is_stationary !== 1);

  const drugTreatments = allTreatments.filter(t => t.type === "drug" && !t.is_offlabel);
  const actionTreatments = allTreatments.filter(t => t.type === "service");
  const offlabelTreatments = allTreatments.filter(t => t.is_offlabel && t.type === "drug");

  const groupedDrugs = groupTreatByCategoryAndSortById(drugTreatments);
  const groupedActions = groupTreatByCategoryAndSortById(actionTreatments);
  const groupedOfflabel = groupTreatByCategoryAndSortById(offlabelTreatments);

  let hasDrug = false;
  let hasAction = false;
  let hasOfflabel = false;

  groupedDrugs.forEach(group => {
    createGroupTitle(treatCardDrugElem, group.name);
    let prevName = "";
    group.values.forEach(item => {
      createTreatBlock(treatCardDrugElem, item, prevName);
      prevName = item.name;
    });
    hasDrug = true;
  });

  groupedActions.forEach(group => {
    createGroupTitle(treatCardActionElem, group.name);
    let prevName = "";
    group.values.forEach(item => {
      createTreatBlock(treatCardActionElem, item, prevName);
      prevName = item.name;
    });
    hasAction = true;
  });

  groupedOfflabel.forEach(group => {
    createGroupTitle(treatCardDrugOfflabelElem, group.name);
    let prevName = "";
    group.values.forEach(item => {
      createTreatBlock(treatCardDrugOfflabelElem, item, prevName);
      prevName = item.name;
    });
    hasOfflabel = true;
  });

  if (hasDrug) treatCardDrugElem.classList.remove('hidden');
  else treatCardDrugElem.classList.add('hidden');

  if (hasAction) treatCardActionElem.classList.remove('hidden');
  else treatCardActionElem.classList.add('hidden');

  if (hasOfflabel) {
    treatCardDrugOfflabelElem.classList.remove('hidden');
    treatCardDrugOfflabelElem.classList.add('minimized');
  } else {
    treatCardDrugOfflabelElem.classList.add('hidden');
  }

  revealSection('treat');
}





async function fetchPopupDataOnce() {
  const maxRetries = 2; //2 попытки
  const retryDelay = 1000; // между попытками, ms
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // const response = await fetch('/res_K26.0_second.json');
      // const response = await fetch('/test-s.json');

      const code = searchInput.codeValue;

      // Get credentials from cookies
      const username = getCookie('username');
      const password = getCookie('password');
      const response = await fetch(`../php/get-data-popup.php/login?code=${code}&username=${username}&password=${password}`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      popupData = await response.json();
      return popupData;
    } catch (err) {
      console.error(`Попытка ${attempt + 1} не удалась:`, err);
      attempt++;

      if (attempt > maxRetries) {
        console.error('Ошибка загрузки расширенных данных после 3 попыток');
        popupData = {};
        return popupData;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}


function initPage() {
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
}

initPage();
setupPopupCloseHandlers(); //закрыть поп-ап инфо

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

//закрыть table popup
document.getElementById('table-popup-overlay').addEventListener('click', function (e) {
  const popup = document.querySelector('.table-popup');
  if (!popup.contains(e.target)) {
    closeTablePopup();
  }
});

document.getElementById('table-popup-close').addEventListener('click', closeTablePopup);

function closeTablePopup() {
  document.getElementById('table-popup-overlay').classList.add('hidden');
  document.getElementById('table-popup-content').innerHTML = '';
}


// Открыть окно выбора файла для отправки
if (addImageBlock && fileInput) {
  addImageBlock.addEventListener('click', (event) => {
    // Проверка: если клик был по кнопке удаления, не открывать окно выбора файла
    if (event.target === removeFileBtn) return;
    fileInput.click();
  });
}

fileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    addImgText.style.display = 'none'; // скрыть "Прикрепить изображение"
    fileNameText.textContent = `Выбран файл: ${file.name}`;
    removeFileBtn.style.display = 'inline-block'; // показать кнопку удаления
  } else {
    resetFileSelection();
  }
});

removeFileBtn.addEventListener('click', function (event) {
  event.stopPropagation();
  fileInput.value = '';
  resetFileSelection();   // сбрасываем интерфейс
});

//сбросить прикрепленный файл
function resetFileSelection() {
  addImgText.style.display = 'block';   // показать "Прикрепить изображение"
  fileNameText.textContent = '';        // убрать название файла
  removeFileBtn.style.display = 'none'; // скрыть кнопку удаления
}

//отправка заявки с mkb в бот
document.getElementById('popupForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const token = '7860976863:AAE2Y43llKvWPkhnV7_MtGHGHUIMBxb4270';
  const chatId = '-1002653556555';

  const email = this.email.value.trim();
  const name = this.name.value.trim();
  const phone = this.phone.value.trim();
  const crm = this.crm.value.trim() || '—';
  const description = this.description.value.trim() || '—';
  const file = this.attachment.files[0];

  const message = `📥 Новая заявка с сайта:\n\n📧 Email: ${email}\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n🗂 МИС/CRM: ${crm}\n📝 Проблема: ${description}`;

  // 1. Сначала отправляем текстовое сообщение
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  })
      .then(response => {
        if (!response.ok) throw new Error('Ошибка отправки текста');

        // 2. Если есть файл — отправим его отдельным запросом
        if (file) {
          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('photo', file); // можно заменить на document
          formData.append('caption', `📎 Файл от ${name}`);

          return fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: 'POST',
            body: formData
          });
        }

        return Promise.resolve(); // ничего не делаем, если файла нет
      })
      .then(response => {
        if (response && !response.ok) throw new Error('Ошибка при отправке изображения');

        alert('✅ Заявка успешно отправлена!');
        this.reset();
        resetFileSelection();
        closePopup();
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

ageToggleElem.addEventListener('click', async () => await setLists());
standardToggleElem.addEventListener('click', async () => await setLists());

setCardViewTogglers();
setTextBlockSelectionEventHandler();
setCardCopyButtonsEventHandler();

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
  // Перебираем все карточки
  Array.from(document.getElementsByClassName('form__card')).forEach((cardElem) => {
    const copyButton = cardElem.querySelector('.copy-button__copy-button');
    const closeButton = cardElem.querySelector('.copy-button__close-button');
    const copyAllButton = cardElem.querySelector(
        '.form__card--copy-button[data-copy-all="true"]'
    );

    // Кнопка "копировать выделенные блоки"
    if (copyButton) {
      addCopyCardAllTextDataEventListeners(copyButton);
    }

    // Кнопка "закрыть выделение"
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        const card = e.target.closest('.form__card');
        removeBlockSelections(card);
      });
    }

    // Кнопка "копировать всё в этой карточке"
    if (copyAllButton) {
      copyAllButton.addEventListener('click', (e) => {
        const blocks = cardElem.querySelectorAll('.block__container');
        blocks.forEach(block => block.classList.add('block__container--selected'));

        const text = getCardDataText(cardElem, copyAllButton);
        const count = getCopiedBlockCount(cardElem);

        if (text) {
          copyToClipboard(text, flashTooltipOnEvent, [
            e,
            `Скопировано ${count} шт.`,
            1000,
          ]);
        }

        removeBlockSelections(cardElem);
      });
    }
  });
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
      const toggleElem = currentElem.querySelector('.form__card-toggle');
      toggleElem.classList.toggle('rotated');

      // Обновляем title в зависимости от состояния стрелки
      if (toggleElem.classList.contains('rotated')) {
        toggleElem.title = 'Свернуть';
      } else {
        toggleElem.title = 'Развернуть';
      }
    });
  });
}

function setTextBlockSelectionEventHandler() {
  const cardElems = Array.from(document.getElementsByClassName('form__card'));

  cardElems.forEach((cardElem) => {
    cardElem.addEventListener('click', (e) => {
      // Пропускаем клик, если он пришёл от иконки "i"
      if (e.target.closest('.block__info-icon')) {
        return;
      }

      // Пропускаем клик, если он пришёл от заголовка категории
      if (e.target.closest('.category-name')) {
        return;
      }

      // Если клик пришёл напрямую по .block__container
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

      // Иначе ищем ближайший .block__container
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
  const copyButton = cardElem.querySelector('.form__card--copy-button');
  const closeButton = cardElem.querySelector('.copy-button__close-button');

  if (copyButton) copyButton.classList.remove('copy-button--selected');
  if (closeButton) closeButton.classList.add('hidden');

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
    const copiedCount = getCopiedBlockCount(cardElem);

    copyToClipboard(textToCopy, flashTooltipOnEvent, [
      e,
      `Скопировано ${copiedCount} шт.`,
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
  const selectedBlocks = Array.from(cardElem.getElementsByClassName('block__container--selected'))
      .filter(block => {
        const header = block.querySelector('.block__header');
        return !(header && header.classList.contains('category-name'));
      });

  let lastTitle = '';

  const linesToCopy = selectedBlocks.map(blockElem => {
    let headerElem = blockElem.querySelector('.block__header');

    if (!headerElem || headerElem.classList.contains('category-name')) {
      let prev = blockElem.previousElementSibling;
      while (prev && (!prev.querySelector('.block__header') || prev.querySelector('.block__header').classList.contains('category-name'))) {
        prev = prev.previousElementSibling;
      }
      if (prev) {
        headerElem = prev.querySelector('.block__header');
      }
    }

    const titleText = headerElem?.innerText.trim() || '';
    const planElem = blockElem.querySelector('.block__comment--plan');
    const durationElem = blockElem.querySelector('.block__comment--duration');

    const planText = planElem ? `Схема лечения: ${planElem.innerText.replace(/^.*?:\s*>?/, '').trim()}` : '';
    const durationText = durationElem ? `Длительность курса: ${durationElem.innerText.replace(/^.*?:\s*/, '').trim()}` : '';

    const blockLines = [titleText];
    if (planText) blockLines.push(planText);
    if (durationText) blockLines.push(durationText);

    // Удалить дублирующийся заголовок
    if (titleText === lastTitle) {
      blockLines[0] = '';
    } else {
      lastTitle = titleText;
    }

    return blockLines.filter(Boolean).join('\n');
  });

  return linesToCopy.filter(Boolean).join('\n\n').trim();
}

function getCopiedBlockCount(cardElem) {
  const selectedBlocks = Array.from(cardElem.querySelectorAll('.block__container--selected'));

  const blocksToCount = selectedBlocks.length > 0
      ? selectedBlocks.filter(block => {
        const header = block.querySelector('.block__header');
        return header && !header.classList.contains('category-name');
      })
      : Array.from(cardElem.querySelectorAll('.block__container'))
          .filter(block => {
            const header = block.querySelector('.block__header');
            return header && !header.classList.contains('category-name');
          });

  return blocksToCount.length;
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
    // const response = await fetch('/res_K26.0_first.json');
    // const response = await fetch('/test-f.json');

    console.log(document.tablesData);

    const response = await fetch(`../php/get-data-main.php/login?code=${code}&username=${username}&password=${password}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // fire and forget: the additional data should be loaded in background
    await fetchPopupDataOnce();


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
    console.log(document.mkbData);
    const newSearchData = {
      valueData: data.child.code,
      textContent: data.child.code + ': ' + data.child.name,
    };
    updateHistory(newSearchData);
    clearButton.classList.remove('hidden');
    searchButton.classList.remove('hidden');
    setMkbName();
    const listsAreSet = await setLists();
    if (listsAreSet) revealMkbData();
  }
  catch (error) {
    console.error('Ошибка:', error);
    searchInput.placeholder = 'Название нозологии или код МКБ';
    searchInput.disabled = false;
  }
}

function setMkbName() {
  searchInput.value = `${document.mkbData.child.code} ${document.mkbData.child.name}`;
  searchInput.placeholder = 'Название нозологии или код МКБ';
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

async function setLists() {
  removeAllBlockSelections();
  sectionToggles.classList.remove('hidden');
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const examRequiredTextElem = document.getElementById('exam-required');
  const examOptionalTextElem = document.getElementById('exam-optional');
  const treatActionTextElem = document.getElementById('treat-action');
  const treatDrugTextElem = document.getElementById('treat-drug');
  const noDataPopup = document.getElementById('no-data-popup-section');

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

  createList('exam', listsData.exam);
  createList('treat', listsData.treat);
  await createTableSection();

  return true;
}

function createList(type, listData) {
  const listElem = document.getElementById(type + '-list');
  listElem.removeEventListener(
      'change',
      type === 'exam' ? setExamText : type === 'treat' ? setTreatText : setTableText
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
      monolistElem.classList.add('hidden');
    }
    if (monolistElem.id === 'tables-monolist') {
      setTableText();
      monolistElem.classList.add('hidden');
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
      type === 'exam' ? setExamText : type === 'treat' ? setTreatText : setTableText
  );
  revealSection(type);

  if (type === 'exam') {
    setTimeout(updateButtonsVisibility, 0);
  }
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

  crmLinkContainer.innerHTML = '';

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
  const examStageToggleFirstElem = document.getElementById('exam-stage-toggle-first');
  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';
  const currentStage = examStageToggleFirstElem.classList.contains('stage__selected') ? "1" : "2";
  const standardInd = getStandardInd('exam');

  const examCardRequiredElem = document.getElementById('exam-card-required');
  const examCardOptionalElem = document.getElementById('exam-card-optional');
  clearCard(examCardRequiredElem);
  clearCard(examCardOptionalElem);

  // Add recommendations link
  crmLinkContainer.innerHTML = '';
  crmLinkContainer.classList.remove('active');

  let crmId = mkbData[currentAge].standards[standardInd].cr_m_id;

  if (crmId !== undefined) {
    crmLinkContainer.innerHTML =
      `<a href="https://cr.minzdrav.gov.ru/view-cr/${crmId}" 
        target="_blank" rel="noopener noreferrer" 
        class="crm-link" title="Перейти на Рубрикатор">
        <img src="../images/eagle.svg" alt="eagle" class="crm-link-img eagle" />
        <img src="../images/link-icon.png" alt="link" class="crm-link-img link-icon" />
      </a>`;

    crmLinkContainer.classList.add('active');
  }

  let requiredExaminationsByCategory = groupByCategoryAndSort(
      mkbData[currentAge].standards[standardInd].examinations
          .filter(exam =>
              exam.stage === currentStage &&
              exam.is_required &&
              exam.is_stationary !== 1
          )
  );

  let optionalExaminationsByCategory = groupByCategoryAndSort(
      mkbData[currentAge].standards[standardInd].examinations
          .filter(exam =>
              exam.stage === currentStage &&
              !exam.is_required &&
              exam.is_stationary !== 1
          )
  );

  let hasRequired = requiredExaminationsByCategory.length > 0;
  let hasOptional = optionalExaminationsByCategory.length > 0;

  if (hasRequired) {
    let prevName = "";
    requiredExaminationsByCategory.forEach((category) => {
      createGroupTitle(examCardRequiredElem, category.name);
      prevName = "";
      category.values.forEach((exam) => {
        createExamBlock(examCardRequiredElem, exam, prevName);
        prevName = exam.name;
      });
    });
    examCardRequiredElem.classList.remove('hidden');
  } else {
    examCardRequiredElem.classList.add('hidden');
  }

  if (hasOptional) {
    let prevName = "";
    optionalExaminationsByCategory.forEach((category) => {
      createGroupTitle(examCardOptionalElem, category.name);
      prevName = "";
      category.values.forEach((exam) => {
        createExamBlock(examCardOptionalElem, exam, prevName);
        prevName = exam.name;
      });
    });
    examCardOptionalElem.classList.remove('hidden');
  } else {
    examCardOptionalElem.classList.add('hidden');
  }
}

function setTreatText() {
  const mkbData = document.mkbData;
  if (!mkbData) return;

  const ageToggleElem = document.getElementById('age-toggle');
  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';
  const standardInd = getStandardInd('treat');

  const treatCardActionElem = document.getElementById('treat-card-action');
  const treatCardDrugElem = document.getElementById('treat-card-drug');
  const treatCardDrugOfflabelElem = document.getElementById('treat-card-drug-offlabel');
  clearCard(treatCardDrugOfflabelElem);

  clearCard(treatCardActionElem);
  clearCard(treatCardDrugElem);

  const allTreatments = mkbData[currentAge]
      .standards[standardInd]
      .treatments
      .filter(t => t.is_stationary !== 1);

  const treatments = allTreatments
      .filter(t => !t.is_offlabel)
      .sort((a, b) => a.name.localeCompare(b.name));

  const offlabelTreatments = allTreatments
      .filter(t => t.is_offlabel)
      .sort((a, b) => a.name.localeCompare(b.name));

  let hasAction = false;
  let hasDrug = false;

  let prevDrugName = "";
  let prevActionName = "";

  treatments.forEach((treatment) => {
    if (treatment.type === "drug") {
      createTreatBlock(treatCardDrugElem, treatment, prevDrugName);
      prevDrugName = treatment.name;
      hasDrug = true;
    } else if (treatment.type === "service") {
      createTreatBlock(treatCardActionElem, treatment, prevActionName);
      prevActionName = treatment.name;
      hasAction = true;
    }
  });

  let hasOfflabel = false;
  let prevDrugNameOff = "";
  offlabelTreatments.forEach((treatment) => {
    if (treatment.type === "drug") {
      createTreatBlock(treatCardDrugOfflabelElem, treatment, prevDrugNameOff);
      prevDrugNameOff = treatment.name;
      hasOfflabel = true;
    }
  });

  if (hasOfflabel) {
    treatCardDrugOfflabelElem.classList.remove('hidden');
    treatCardDrugOfflabelElem.classList.add('minimized');
  } else {
    treatCardDrugOfflabelElem.classList.add('hidden');
  }

  if (hasAction) {
    treatCardActionElem.classList.remove('hidden');
  } else {
    treatCardActionElem.classList.add('hidden');
  }

  if (hasDrug) {
    treatCardDrugElem.classList.remove('hidden');
  } else {
    treatCardDrugElem.classList.add('hidden');
  }
}

async function createTableSection() {
  clearTablesData();

  const crmId = getCurrentCrmId(document.mkbData);
  const tableData = await loadTableData(crmId);

  //const tableData = tablesData.find(x => x.crId === crmId);
  console.log(tableData);

  const tablesSection = document.getElementById('tables-section');
  const tablesDataElement = document.getElementById('tables-data');

  if (!tableData) {
    if (tablesSection) tablesSection.classList.add('hidden');
    return;
  }

  const tables = tableData.sections?.drugTables?.content?.attachments;
  let renderedHtml = '';

  tables?.forEach((table) => {
    renderedHtml += createTableBlock(table);
  });

  if (!renderedHtml.trim()) {
    if (tablesSection) tablesSection.classList.add('hidden');
    return;
  }

  tablesDataElement.innerHTML = renderedHtml;
  tablesDataElement.classList.remove('hidden');
  if (tablesSection) tablesSection.classList.remove('hidden');

  tablesDataElement.querySelectorAll('.form__card-header').forEach(header => {
    header.addEventListener('click', () => header.parentElement.classList.toggle("minimized"));
  });

  tablesDataElement.querySelectorAll('.form__card-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      toggle.classList.toggle('rotated');
    });
  });

  tablesDataElement.querySelectorAll('.table-container').forEach(tableContainer => {
    tableContainer.addEventListener('click', () => {
      openTablePopup(tableContainer.id);
    });
  });
}


function openTablePopup(id) {
  if (!document.tablesObject.hasOwnProperty(id)) {
    return;
  }

  tablePopup.classList.remove('hidden');
  tablePopupContent.innerHTML = document.tablesObject[id].html;
}

function clearTablesData() {
  const tablesDataElement = document.getElementById('tables-data');
  tablesDataElement.innerHTML = '';
  tablesDataElement.classList.add('hidden');
  document.tablesObject = {};
}

function createTableBlock(tableData) {
  const title = tableData.name || "";
  const match = title.match(/^(Приложение\s+[АA]?\d+(\.\d+)?\.?)\s*(.*)$/i);

  let formattedTitle;
  if (match) {
    const boldPart = match[1];
    const normalPart = match[3];
    formattedTitle = `<strong>${boldPart}</strong> ${normalPart}`;
  } else {
    formattedTitle = title;
  }

  tableData.sections.map((section) => {
    if (section.name === null || section.name.trim() === '') {
      section.name = '';
    }

    return section;
  });

  /*const hasAnyCategoryName = (tableData.sections || []).some(
      section => section.name && section.name.trim() !== ''
  );
  if (!hasAnyCategoryName) return '';*/

  const sectionsHtml = createTableBlockSections(tableData.sections);
  if (!sectionsHtml.trim()) return '';

  return `<div class="form__section form__section--tables">
    <div class="form__card minimized">
      <div class="form__card-header">
        <div class="form__card-header--container">
          <h3 class="form__card-title">${formattedTitle}</h3>
        </div>
        <button class="form__card-toggle">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      ${sectionsHtml}
    </div>
  </div>`;
}


function createTableBlockSections(sections) {
  let sectionsHtml = '';
  let tablesCounter = 0;

  sections.forEach(section => {
    if (section.name.trim() !== '') {
      // Только если есть название секции — рисуем заголовок и таблицы
      sectionsHtml += `<div class="block__container" style="margin-bottom: 5px;">
                        <div class="block__header category-name" style="display: flex; justify-content: space-between; align-items: center; background-color: rgb(245, 245, 245); padding: 5px 5px 5px 10px; border-radius: 100px; cursor: default;">
                          <h4 style="margin: 0px; font-weight: normal;">${section.name}</h4>
                        </div>
                      </div>`;
    }

    section?.tables?.forEach(table => {
      tablesCounter++;
      const id = generateGUID();
      document.tablesObject[id] = table;

      const fullName = table.name?.trim() || '';
      const defaultTitle = `Таблица ${tablesCounter}`;

      let mainTitle = defaultTitle;
      let subtitle = '';

      const match = fullName.match(/^Таблица\s*\d+[.:]?\s*(.+)$/i);
      if (match) {
        subtitle = match[1].trim();
      } else if (fullName !== '') {
        subtitle = fullName;
      }

      sectionsHtml += `<div class="block__container table-container" id="${id}">
        <div class="block__header">
          <h4 style="margin: 0; font-weight: normal; line-height: 1.3;">
            <strong>${mainTitle}</strong>
            ${subtitle ? `<div style="margin-top: 8px; font-weight: normal;">${subtitle}</div>` : ''}
          </h4>
        </div>
        <img src="../images/eye.svg" alt="table" class="table-eye">
      </div>`;
    });
  });

  return sectionsHtml;
}


function generateGUID() {
  const cryptoObj = window.crypto || window.msCrypto; // поддержка IE11
  const buffer = new Uint8Array(16);
  cryptoObj.getRandomValues(buffer);

  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  buffer[8] = (buffer[8] & 0x3f) | 0x80;

  const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0'));

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join('')
  ].join('-');
}

function getCurrentCrmId(mkbData) {
  const ageToggleElem = document.getElementById('age-toggle');
  const currentAge = ageToggleElem.checked ? 'grownup' : 'child';
  let standardInd = getStandardInd('exam');

  if (isNaN(parseInt(standardInd))) {
    return null;
  }

  console.log(mkbData);
  console.log(currentAge);
  console.log(standardInd);

  console.log(mkbData[currentAge].standards[standardInd]);

  return mkbData[currentAge].standards[standardInd].cr_m_id;
}

function groupByCategoryAndSort(arr, key) {
  const groups = {};

  arr.forEach(item => {
    const rawCategory = item['category_name'];

    //TODO: Fix category in database [workitem #29]
    const strCategory = typeof rawCategory === 'string' ? rawCategory.trim() : '';

    const groupKey = strCategory === '' || strCategory === 'null' ? 'Прочее' : strCategory;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(item);
  });

  // Сортировка, кроме "Прочее"
  const result = Object.entries(groups)
      .filter(([groupName]) => groupName !== 'Прочее')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, values]) => ({
        name: groupName,
        values: values.sort((a, b) => a.name.localeCompare(b.name))
      }));

  // Добавляем "Прочее" в конец
  if (groups['Прочее']) {
    result.push({
      name: 'Прочее',
      values: groups['Прочее'].sort((a, b) => a.name.localeCompare(b.name))
    });
  }

  return result;
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

function setupPopupCloseHandlers() {

  if (closeButton) {
    closeButton.addEventListener("click", function () {
      popupOverlay.classList.add("hidden");
    });
  }

  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.classList.add("hidden");
    }
  });
}

//открытие инфо поп-апа с тестовыми данными
function openInfoPopupByTitle(examData) {
  const popupOverlay = document.getElementById('popup-overlay');
  const titleEl = popupOverlay.querySelector('.popup__title');
  const descEl = popupOverlay.querySelector('.popup__description');
  const commentTitleEl = popupOverlay.querySelector('.popup__comment');
  const commentEl = popupOverlay.querySelector('.popup__comment-text');
  const urrImg = popupOverlay.querySelector('.circle__img');
  const uddText = popupOverlay.querySelector('.udd__text');

  const crDbId = examData.cr_db_id;
  const popupInfo = popupData[crDbId];

  if (popupInfo) {
    console.log(popupInfo);

    // 1. Заголовок
    titleEl.textContent = examData.name || "Без названия";

    // 2. Код
    if (examData.pers) {
      const { уур, удд } = examData.pers;
      uddText.textContent = `${уур}${удд}`;
    } else {
      uddText.textContent = "";
    }

    // 3. Полоска качества (зелёная/серая)
    const qualityWrapper = popupOverlay.querySelector('.popup__quality-wrapper');
    if (qualityWrapper) {
      let qualityIndicator = qualityWrapper.querySelector('.popup__quality');
      if (!qualityIndicator) {
        qualityIndicator = document.createElement('div');
        qualityIndicator.classList.add('popup__quality');
        qualityWrapper.prepend(qualityIndicator);
      }

      qualityIndicator.classList.remove('block__quality--green', 'block__quality--gray');
      qualityIndicator.classList.add(
          examData.is_qualitative === 1 ? 'block__quality--green' : 'block__quality--gray'
      );
    }

    // 5. Описание
    descEl.textContent = popupInfo.text || "Описание отсутствует";

    // 6. Комментарий
    const commentText = popupInfo.comment?.trim();
    if (commentText) {
      commentEl.innerHTML = `<i>${commentText}</i>`;
      commentTitleEl.classList.remove('hidden');
      commentEl.classList.remove('hidden');
    } else {
      commentEl.innerHTML = '';
      commentTitleEl.classList.add('hidden');
      commentEl.classList.add('hidden');
    }

    // 7. Показать попап
    popupOverlay.classList.remove('hidden');
  } else {
    console.warn("Нет данных из второго JSON для:", crDbId);
  }
}



//вставка данных в левый блок анализов
function fillLeftBlockData(examName, uddTextElem, urrImgElem) {
  const popupEntry = popupData[examName];

  console.log(popupEntry);

  if (!popupEntry) return;

  if (popupEntry.udd) {
    uddTextElem.textContent = popupEntry.udd;
  }

  if (popupEntry.urr === 'no') {
    urrImgElem.style.visibility = 'hidden';
  }
}

function createGroupTitle(blockParentElem, title) {
  const examContainer = document.createElement('div');
  examContainer.classList.add('block__container');
  examContainer.style.marginBottom = '5px';

  const examHeader = document.createElement('div');
  examHeader.classList.add('block__header');
  examHeader.style.display = 'flex';
  examHeader.style.justifyContent = 'space-between';
  examHeader.style.alignItems = 'center';
  examHeader.style.backgroundColor = '#f5f5f5';
  examHeader.style.padding = '5px 5px 5px 10px';
  examHeader.style.borderRadius = '100px';
  examHeader.style.cursor = 'default';

  examHeader.classList.add('block__header', 'category-name');

  const examTitle = document.createElement('h4');
  examTitle.innerText = capitalizeFirstLetter(title);
  examTitle.style.margin = '0';
  examTitle.style.fontWeight = 'normal';

  examHeader.appendChild(examTitle);
  examContainer.appendChild(examHeader);
  blockParentElem.appendChild(examContainer);
}

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function createExamBlock(blockParentElem, examData, prevName) {
  const examContainer = document.createElement('div');
  examContainer.classList.add('block__container');

  const examQuality = document.createElement('div');
  examQuality.classList.add('block__quality');
  examQuality.classList.add(
      examData.is_qualitative ? 'block__quality--green' : 'block__quality--gray'
  );

  // Заголовок (только если новое имя)
  if (examData.name !== prevName) {
    const examHeader = document.createElement('div');
    examHeader.classList.add('block__header');

    const examTitle = document.createElement('h4');
    examTitle.innerText = capitalizeFirstLetter(examData.name);
    examTitle.style.margin = '0';

    examHeader.appendChild(examTitle);
    examContainer.appendChild(examHeader);
  }

  // Комментарий + udd + urr + иконка "i"
  const commentWrapper = document.createElement('div');
  commentWrapper.style.display = 'flex';
  commentWrapper.style.justifyContent = 'space-between';
  commentWrapper.style.alignItems = 'flex-start';

  const leftBlock = document.createElement('div');
  leftBlock.style.display = 'flex';
  leftBlock.style.alignItems = 'center';
  leftBlock.style.gap = '8px';

  const infoBox = document.createElement('div');
  infoBox.style.display = 'flex';
  infoBox.style.alignItems = 'center';
  infoBox.style.gap = '4px';

  const uddText = document.createElement('span');
  uddText.style.fontWeight = 'normal';
  if (examData.pers) {
    const { уур, удд } = examData.pers;
    uddText.textContent = `${уур}${удд}`;
  }

  const urrImg = document.createElement('img');
  urrImg.src = '../images/circle-icon.png';
  urrImg.alt = 'urr';
  urrImg.classList.add('circle__img');
  urrImg.style.width = '20px';
  urrImg.style.height = '20px';
  if (examData.is_qualitative === 1) {
    urrImg.classList.remove('hidden');
  } else {
    urrImg.classList.add('hidden');
  }

  infoBox.appendChild(uddText);
  // infoBox.appendChild(urrImg);

  const examComment = document.createElement('p');
  examComment.classList.add('block__comment');
  examComment.innerText = examData.comment || '';

  leftBlock.appendChild(infoBox);
  leftBlock.appendChild(examComment);
  commentWrapper.appendChild(leftBlock);

  if (examData.cr_db_id) {
    const infoIcon = document.createElement('img');
    infoIcon.src = '../images/info-icon.png';
    infoIcon.alt = 'Info';
    infoIcon.classList.add('block__info-icon');
    infoIcon.style.cursor = 'pointer';
    infoIcon.style.marginLeft = '8px';
    infoIcon.title = 'Показать расширенные комментарии';
    infoIcon.addEventListener('click', () => openInfoPopupByTitle(examData));
    commentWrapper.appendChild(infoIcon);
  }

  examContainer.appendChild(commentWrapper);
  examContainer.appendChild(examQuality);
  blockParentElem.appendChild(examContainer);
}

function createTreatBlock(parentElem, treatData, prevName) {
  const treatContainer = document.createElement('div');
  treatContainer.classList.add('block__container');

  const treatQuality = document.createElement('div');
  treatQuality.classList.add('block__quality');
  treatQuality.classList.add(
      treatData.is_qualitative ? 'block__quality--green' : 'block__quality--gray'
  );

  // Заголовок (только если новое имя)
  if (treatData.name !== prevName) {
    const treatHeaderWrapper = document.createElement('div');
    treatHeaderWrapper.classList.add('block__header');

    const treatHeader = document.createElement('h4');
    treatHeader.innerText = capitalizeFirstLetter(treatData.name);
    treatHeader.style.margin = '0';

    treatHeaderWrapper.appendChild(treatHeader);
    treatContainer.appendChild(treatHeaderWrapper);
  }

  // Комментарий + udd + иконка "i"
  const commentWrapper = document.createElement('div');
  commentWrapper.style.display = 'flex';
  commentWrapper.style.justifyContent = 'space-between';
  commentWrapper.style.alignItems = 'flex-start';

  const leftBlock = document.createElement('div');
  leftBlock.style.display = 'flex';
  leftBlock.style.alignItems = 'center';
  leftBlock.style.gap = '8px';

  // infoBox (udd + urr)
  const infoBox = document.createElement('div');
  infoBox.style.display = 'flex';
  infoBox.style.alignItems = 'center';
  infoBox.style.gap = '4px';

  const uddText = document.createElement('span');
  uddText.style.fontWeight = 'normal';
  if (treatData.pers) {
    const { уур, удд } = treatData.pers;
    uddText.textContent = `${уур}${удд}`;
  }

  const urrImg = document.createElement('img');
  urrImg.src = '../images/circle-icon.png';
  urrImg.alt = 'urr';
  urrImg.classList.add('circle__img');
  urrImg.style.width = '20px';
  urrImg.style.height = '20px';
  if (treatData.is_qualitative === 1) {
    urrImg.classList.remove('hidden');
  } else {
    urrImg.classList.add('hidden');
  }

  infoBox.appendChild(uddText);
  // infoBox.appendChild(urrImg);

  const treatComment = document.createElement('p');
  treatComment.classList.add('block__comment');
  treatComment.innerText = treatData.comment || '';

  leftBlock.appendChild(infoBox);
  leftBlock.appendChild(treatComment);
  commentWrapper.appendChild(leftBlock);

  if (treatData.cr_db_id && popupData && popupData[treatData.cr_db_id]) {
    const infoIcon = document.createElement('img');
    infoIcon.src = '../images/info-icon.png';
    infoIcon.alt = 'Info';
    infoIcon.classList.add('block__info-icon');
    infoIcon.style.cursor = 'pointer';
    infoIcon.style.marginLeft = '8px';
    infoIcon.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      openInfoPopupByTitle(treatData);
    });
    commentWrapper.appendChild(infoIcon);
  }

  treatContainer.appendChild(commentWrapper);

  if (treatData.plan) {
    const treatPlan = document.createElement('p');
    treatPlan.classList.add('block__comment', 'block__comment--plan');
    treatPlan.innerHTML = '<b>Схема лечения: </b>>' + treatData.plan;
    treatContainer.appendChild(treatPlan);
  }

  if (treatData.duration) {
    const treatDuration = document.createElement('p');
    treatDuration.classList.add('block__comment', 'block__comment--duration');
    treatDuration.innerHTML = '<b>Длительность курса: </b>' + treatData.duration;
    treatContainer.appendChild(treatDuration);
  }

  treatContainer.appendChild(treatQuality);
  parentElem.appendChild(treatContainer);
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
    if (type !== standard.type || status !== standard.status) {
      return;
    }
    else {
      listData.push({
        name: standard.name,
        index: standardIndex,
        cr_m_id: standard.cr_m_id,
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

async function loadTableData(crmId) {
  try {
    // const response = await fetch('/cr_387_3_corrected.json');
    const username = getCookie('username');
    const password = getCookie('password');
    const response = await fetch(`../php/get-data-tables.php?cr_id=${crmId}&username=${username}&password=${password}`);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Ошибка при загрузке таблиц:', error);
  }

  return null;
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
