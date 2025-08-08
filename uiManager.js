export class UIManager {
    constructor() {
        this.dropArea = document.getElementById('drop-area');
        this.fileInput = document.getElementById('save-file');
        this.downloadBtn = document.getElementById('download-btn');
        this.editorSection = document.getElementById('editor-section');
        this.filenameLabel = document.getElementById('filename-label');
        this.goldInput = document.getElementById('gold-input');
        this.originalGoldValue = document.getElementById('original-gold-value');
        this.resetBtn = document.getElementById('reset-btn');
        this.heroesBlock = document.getElementById('heroes-block');
        this.heroViewBlock = document.getElementById('hero-view-block');
        this.heroNameSelect = document.getElementById('hero-name-select');
        this.heroNicknameSelect = document.getElementById('hero-nickname-select');
        this.heroEditForm = document.getElementById('hero-edit-form');
        this.cancelHeroEditBtn = document.getElementById('cancel-hero-edit');
        this.bestEnchantsForEquippedBtn = document.getElementById('best-enchants-for-equipped-btn');
        this.testSomethingBtn = document.getElementById('test-btn');
        this.potionRefillBtn = document.getElementById('potions-refill-btn');
        this.potionConcentrationInput = document.getElementById('potion-concentration-input');
        // item editor
        this.inventoryItemEditorDiv = document.getElementById('inventory-item-editor-div');
        this.inventoryItemEditorIndexInput = document.getElementById('inventory-index-input');
        this.inventoryItemEditorApplyBtn = document.getElementById('inventory-item-editor-apply-btn');
        this.inventoryItemEditorCurrentName = document.getElementById('inventory-item-editor-current-name');
        this.inventoryItemEditorTypeSelect = document.getElementById('inventory-item-type-editor-select');
        this.inventoryItemEditorItemSelect = document.getElementById('inventory-item-editor-select');
        this.inventoryItemEditorDurabilitySetup = document.getElementById('inventory-item-editor-durability-setup');
        this.inventoryItemEditorEnchantSetup = document.getElementById('inventory-item-editor-enchant-setup');
        this.inventoryItemEditorPotionSetup = document.getElementById('inventory-item-editor-potion-setup');
        this.inventoryItemEditorArrowSetup = document.getElementById('inventory-item-editor-arrow-setup');
        this.inventoryItemEditorNewItemForm = document.getElementById('inventory-editor-new-item-form');
        this.inventoryItemEditorDurabilityInput = document.getElementById('inventory-item-editor-durability-input');
        this.inventoryItemEditorPotionConcentrationInput = document.getElementById('inventory-item-editor-potion-concentration-input');
        this.inventoryItemEditorArrowQuantityInput = document.getElementById('inventory-item-editor-arrow-quantity-input');
        this.inventoryItemEditorArrowPoisoningInput = document.getElementById('inventory-item-editor-arrow-poisoning-input');

        // Stat inputs
        this.freePointsInput = document.getElementById('free-points-value');
        this.mainStatsBaseInputs = [];
        this.mainStatsCurrentInputs = [];
        for (let i = 0; i < 6; i++) {
            this.mainStatsBaseInputs.push(document.getElementById(`main-stat-base-${i}`));
            this.mainStatsCurrentInputs.push(document.getElementById(`main-stat-current-${i}`));
        }
        // Secondary stats
        this.secondaryStats = [];
        for (let i = 1; i <= 20; i++) {
            this.secondaryStats.push(document.getElementById(`secondary-stat-${i}`));
        }
        // Hero list items
        this.heroListItems = [];
        for (let i = 1; i <= 9; i++) {
            this.heroListItems.push(document.getElementById(`hero-${i}`));
        }

        this.secondaryStatsTable = document.querySelector('#secondary-stats-block table');

        this.heroItemMeleeWeapon = document.getElementById('melee-weapon');
        this.heroItemRangedWeapon = document.getElementById('ranged-weapon');
        this.heroItemBodyArmor = document.getElementById('body-armor');
        this.heroItemHelmArmor = document.getElementById('helm-armor');
        this.heroItemLeftHand = document.getElementById('left-hand');
        this.heroItemNeck = document.getElementById('neck');
        this.heroItemBraceletRight = document.getElementById('bracelet-right');
        this.heroItemBraceletLeft = document.getElementById('bracelet-left');
        this.heroItemRingRight = document.getElementById('ring-right');
        this.heroItemRingLeft = document.getElementById('ring-left');
        this.heroItemArrows = document.getElementById('arrows');
        this.heroInventoryList = document.getElementById('hero-inventory-list');
    }

    localizeUI(localeManager) {
        const rows = this.secondaryStatsTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            const cell = row.querySelector('td:first-child');
            if (cell) {
                cell.textContent = localeManager.getText('secondaryStats', index - 1);
            }
        });

        for (let i = 0; i < 21; i++) {
            let option = this.heroNicknameSelect.querySelector(`option[value="${i}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = i;
                this.heroNicknameSelect.appendChild(option);
            }
            option.textContent = localeManager.getText('nicknames', i);
        }

        for (let i = 0; i < 206; i++) {
            let option = this.heroNameSelect.querySelector(`option[value="${i}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = i;
                this.heroNameSelect.appendChild(option);
            }
            option.textContent = localeManager.getText('names', i);
        }
    }

    displayHeroShort(hero, localeManager) {

        let heroName = localeManager.getText('names', hero.nameId);
        let heroNickname = localeManager.getText('nicknames', hero.nicknameId);
        return `${heroName} ${heroNickname} hp ${hero.hp.toFixed(0)} (Level: ${hero.level}, exp: ${hero.expCurrent} / ${hero.expNextLevel}). Inventory ${hero.inventory.length} / 42 items.`;

    }
}
