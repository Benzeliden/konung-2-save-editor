import { parseSaveFile, downloadNewSaveFile, ItemEnchant } from './parcer.js';
import { LocaleManager } from './localeManager.js';
import { UIManager } from './uiManager.js';
import { ItemsManager } from './itemsManager.js';
import { HeroEditor } from './heroEditor.js';
import { initTabs } from './tabs.js';

const uiManager = new UIManager();
const dropArea = uiManager.dropArea;
const fileInput = uiManager.fileInput;
const itemsManager = new ItemsManager();

const localeManager = new LocaleManager(itemsManager, "ru");
const heroEditor = new HeroEditor(uiManager, localeManager, itemsManager);
let saveData = null;
let fileName = "KONUNG2.SA0"; // Default file name

document.addEventListener('DOMContentLoaded', () => {
    initTabs();

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
        heroEditor.setSaveData(saveData);
        await localeManager.waitForLoad();
        uiManager.localizeUI(localeManager);
        // Update gold value in UI
        uiManager.goldInput.value = saveData.gold;
        uiManager.originalGoldValue.textContent = saveData.gold;

        // Update heroes list
        heroEditor.updateHerosList();
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
            heroEditor.hideHeroEdit();
            fileInput.value = '';
            uiManager.editorSection.style.display = 'none';
            dropArea.style.display = '';
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

            // Submit hero edit form to save changes if currently editing
            heroEditor.submitCurrentEdit();

            downloadNewSaveFile(fileName, saveData);
        });
    }
});