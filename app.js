import { parseSaveFile, downloadNewSaveFile, ItemEnchant } from './parcer.js';
import { LocaleManager } from './localeManager.js';
import { UIManager } from './uiManager.js';
import { ItemsManager } from './itemsManager.js';

const uiManager = new UIManager();
const dropArea = uiManager.dropArea;
const fileInput = uiManager.fileInput;
const itemsManager = new ItemsManager();
const localeManager = new LocaleManager(itemsManager, "ru");
let currentHeroIndex = null;
let saveData = null;
let fileName = "KONUNG2.SA0"; // Default file name


// Highlight drop area on dragover
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('highlight');
    });
});

// Remove highlight on dragleave or drop
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('highlight');
    });
});

async function handleFileUpload(file) {
    // Hide drop-area, show editor-section
    dropArea.style.display = 'none';
    uiManager.editorSection.style.display = '';
    // Show filename
    fileName = file.name || "KONUNG2.SA0";
    uiManager.filenameLabel.textContent = fileName;
    // ...todo: code for processing file...
    const arrayBuffer = await file.arrayBuffer();
    saveData = parseSaveFile(arrayBuffer);
    await localeManager.waitForLoad();
    uiManager.localizeUI(localeManager);
    // Update gold value in UI
    uiManager.goldInput.value = saveData.gold;
    uiManager.originalGoldValue.textContent = saveData.gold;

    // Update heroes list
    for (let i = 1; i <= 9; i++) {
        const li = uiManager.heroListItems[i - 1];
        const infoSpan = li.querySelector('.hero-info');
        if (saveData.heroes[i - 1]) {
            const hero = saveData.heroes[i - 1];
            infoSpan.textContent = uiManager.displayHeroShort(hero, localeManager);
            li.style.display = '';
        } else {
            infoSpan.textContent = '';
            li.style.display = 'none';
        }
    }
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Handle file drop
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    }
});

// Optional: allow clicking drop-area to open file dialog
dropArea.addEventListener('click', () => {
    fileInput.click();
});

// Reset button logic
const resetBtn = uiManager.resetBtn;
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        uiManager.editorSection.style.display = 'none';
        dropArea.style.display = '';
    });
}

function showHeroEdit(index) {
    currentHeroIndex = index;
    const hero = saveData.heroes[index];
    if (!hero) return;
    console.log("Editing hero:", hero);
    // Hide list, show edit block
    uiManager.heroesBlock.style.display = 'none';
    uiManager.heroViewBlock.style.display = '';
    // Populate fields
    uiManager.heroNameSelect.value = hero.nameId;
    uiManager.heroNicknameSelect.value = hero.nicknameId;
    uiManager.freePointsInput.value = hero.freePoints || 0;
    // Main stats
    for (let i = 0; i < 6; i++) {
        uiManager.mainStatsBaseInputs[i].value = hero.mainStatsBase[i];
        uiManager.mainStatsCurrentInputs[i].value = hero.mainStatsCurrent[i];
    }
    // Secondary stats
    for (let i = 1; i <= 20; i++) {
        uiManager.secondaryStats[i - 1].value = hero.secondaryStats[i - 1] || 0;
    }

    uiManager.heroItemMeleeWeapon.textContent = localeManager.getRawItemFullDescription(hero.weapon);
    uiManager.heroItemRangedWeapon.textContent = localeManager.getRawItemFullDescription(hero.rangedWeapon);
    uiManager.heroItemBodyArmor.textContent = localeManager.getRawItemFullDescription(hero.bodyArmor);
    uiManager.heroItemHelmArmor.textContent = localeManager.getRawItemFullDescription(hero.helmArmor);
    uiManager.heroItemLeftHand.textContent = localeManager.getRawItemFullDescription(hero.leftHand);
    uiManager.heroItemNeck.textContent = localeManager.getRawItemFullDescription(hero.neck);
    uiManager.heroItemBraceletRight.textContent = localeManager.getRawItemFullDescription(hero.braceletRight);
    uiManager.heroItemBraceletLeft.textContent = localeManager.getRawItemFullDescription(hero.braceletLeft);
    uiManager.heroItemRingRight.textContent = localeManager.getRawItemFullDescription(hero.ringRight);
    uiManager.heroItemRingLeft.textContent = localeManager.getRawItemFullDescription(hero.ringLeft);
    uiManager.heroItemArrows.textContent = localeManager.getRawItemFullDescription(hero.arrows);

    // show inventory items
    const inventoryList = uiManager.heroInventoryList;
    inventoryList.innerHTML = ''; // Clear previous items
    for (let i = 0; i < hero.inventory.length; i++) {
        const item = hero.inventory[i];
        const li = document.createElement('li');
        li.textContent = localeManager.getRawItemFullDescription(item);
        uiManager.heroInventoryList.appendChild(li);
    }
}

function hideHeroEdit() {
    uiManager.heroViewBlock.style.display = 'none';
    uiManager.heroesBlock.style.display = '';
    currentHeroIndex = null;
}

// Attach edit button handlers
for (let i = 1; i <= 9; i++) {
    const btn = uiManager.heroListItems[i - 1].querySelector('.edit-hero-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            showHeroEdit(i - 1);
        });
    }
}

// Save handler
const heroEditForm = uiManager.heroEditForm;
if (heroEditForm) {
    heroEditForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (currentHeroIndex === null) return;
        const hero = saveData.heroes[currentHeroIndex];
        hero.nameId = uiManager.heroNameSelect.value;
        hero.nicknameId = uiManager.heroNicknameSelect.value;
        hero.freePoints = parseInt(uiManager.freePointsInput.value) || 0;
        // Main stats
        for (let i = 0; i < 6; i++) {
            hero.mainStatsBase[i] = parseInt(uiManager.mainStatsBaseInputs[i].value) || 0;
            hero.mainStatsCurrent[i] = parseInt(uiManager.mainStatsCurrentInputs[i].value) || 0;
        }
        // Secondary stats
        for (let i = 1; i <= 20; i++) {
            hero.secondaryStats[i - 1] = parseInt(uiManager.secondaryStats[i - 1].value) || 0;
        }
        // Update hero info in list
        const li = uiManager.heroListItems[currentHeroIndex];
        const infoSpan = li.querySelector('.hero-info');
        infoSpan.textContent = uiManager.displayHeroShort(hero, localeManager);
        hideHeroEdit();
    });
}

// Cancel handler
const cancelHeroEditBtn = uiManager.cancelHeroEditBtn;
if (cancelHeroEditBtn) {
    cancelHeroEditBtn.addEventListener('click', function () {
        hideHeroEdit();
    });
}

if (uiManager.bestEnchantsForEquippedBtn) {
    uiManager.bestEnchantsForEquippedBtn.addEventListener('click', () => {
        if (currentHeroIndex === null) return;
        const hero = saveData.heroes[currentHeroIndex];

        const bestEnchant = new ItemEnchant(28086)

        const slotNames = ["weapon", "rangedWeapon", "bodyArmor", "helmArmor", "leftHand", "neck", "braceletRight", "braceletLeft", "ringRight", "ringLeft"];
        for (const slotName of slotNames) {
            const item = hero[slotName];
            if (item) {
                item.applyEnchant(bestEnchant);
            }
        }

        // Update UI
        showHeroEdit(currentHeroIndex);
    });
}

if (uiManager.testEnchantsBtn) {
    let currentEnchantIndex = 1;
    uiManager.testEnchantsBtn.addEventListener('click', () => {
        if (currentHeroIndex === null) return;
        const hero = saveData.heroes[currentHeroIndex];

        for (let inventoryItem of hero.inventory) {
            let enchant = new ItemEnchant(0);
            enchant.dmg = currentEnchantIndex;
            enchant.armor = currentEnchantIndex;
            currentEnchantIndex++;
            if (currentEnchantIndex > 6) {
                currentEnchantIndex = 1;
            }
            inventoryItem.applyEnchant(enchant);
        }

        // Update UI
        showHeroEdit(currentHeroIndex);
    });
}

// Download button logic
const downloadBtn = uiManager.downloadBtn;
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (!saveData) {
            alert("No save data to download!");
            return;
        }
        // get gold from input
        const goldValue = parseInt(uiManager.goldInput.value) || 0;
        if (saveData.gold !== goldValue) {
            saveData.gold = goldValue; // Update gold value
        }

        if (currentHeroIndex !== null) {
            // submit hero edit form to save changes
            heroEditForm.dispatchEvent(new Event('submit'));
        }

        downloadNewSaveFile(fileName, saveData);
    });
}