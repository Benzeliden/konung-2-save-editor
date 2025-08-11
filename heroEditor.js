import { ItemEnchant } from './parcer.js';
import { ItemEditor } from './itemEditor.js';
import { AppearanceEditor } from './appearanceEditor.js'
import { searchForUnknownAppearances } from './parcer.js'

export class HeroEditor {
    constructor(uiManager, localeManager, itemsManager) {
        this.uiManager = uiManager;
        this.localeManager = localeManager;
        this.itemsManager = itemsManager;
        this.currentHeroIndex = null;
        this.saveData = null;
        this.itemEditor = new ItemEditor(uiManager, localeManager, itemsManager);
        this.appearanceEditor = new AppearanceEditor(uiManager, localeManager);

        this.initializeEventHandlers();
        this.setupItemEditor();
    }

    setSaveData(saveData) {
        this.saveData = saveData;
    }

    setupItemEditor() {
        // Set up callbacks for the ItemEditor
        this.itemEditor.setCallbacks(
            () => this.saveData.heroes[this.currentHeroIndex], // currentHeroGetter
            () => this.currentHeroIndex, // currentHeroIndexGetter
            () => this.showHeroEdit(this.currentHeroIndex) // onItemEditCallback
        );
    }

    initializeEventHandlers() {
        // Attach edit button handlers
        for (let i = 1; i <= 9; i++) {
            const btn = this.uiManager.heroListItems[i - 1].querySelector('.edit-hero-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showHeroEdit(i - 1);
                });
            }
        }

        // Save handler
        const heroEditForm = this.uiManager.heroEditForm;
        if (heroEditForm) {
            heroEditForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveHeroChanges();
            });
        }

        // Cancel handler
        const cancelHeroEditBtn = this.uiManager.cancelHeroEditBtn;
        if (cancelHeroEditBtn) {
            cancelHeroEditBtn.addEventListener('click', () => {
                this.hideHeroEdit();
            });
        }

        // Best enchants button
        if (this.uiManager.bestEnchantsForEquippedBtn) {
            this.uiManager.bestEnchantsForEquippedBtn.addEventListener('click', () => {
                this.applyBestEnchants();
            });
        }

        // Potion refill button
        if (this.uiManager.potionRefillBtn) {
            this.uiManager.potionRefillBtn.addEventListener('click', () => {
                this.refillPotions();
            });
        }

        // Test something button
        if (this.uiManager.testSomethingBtn) {
            this.uiManager.testSomethingBtn.addEventListener('click', () => {
                searchForUnknownAppearances(this.localeManager, this.appearanceEditor)
                return;
            });
        }
    }

    showHeroEdit(index) {
        const heroChanged = this.currentHeroIndex !== index;
        this.currentHeroIndex = index;
        const hero = this.saveData.heroes[index];
        if (!hero) return;
        //console.log("Editing hero:", hero);
        this.uiManager.shortHeroInfoForEditor.textContent = this.uiManager.displayHeroShort(hero, this.localeManager);

        // Hide list, show edit block
        this.uiManager.heroesBlock.style.display = 'none';
        this.uiManager.heroViewBlock.style.display = '';

        // Populate fields
        this.uiManager.heroNameSelect.value = hero.nameId;
        this.uiManager.heroNicknameSelect.value = hero.nicknameId;
        this.uiManager.freePointsInput.value = hero.freePoints || 0;

        // Main stats
        for (let i = 0; i < 6; i++) {
            this.uiManager.mainStatsBaseInputs[i].value = hero.mainStatsBase[i];
            this.uiManager.mainStatsCurrentInputs[i].value = hero.mainStatsCurrent[i];
        }

        // Secondary stats
        for (let i = 1; i <= 20; i++) {
            this.uiManager.secondaryStats[i - 1].value = hero.secondaryStats[i - 1] || 0;
        }

        // Equipment items
        this.uiManager.heroItemMeleeWeapon.textContent = this.localeManager.getRawItemFullDescription(hero.weapon);
        this.uiManager.heroItemRangedWeapon.textContent = this.localeManager.getRawItemFullDescription(hero.rangedWeapon);
        this.uiManager.heroItemBodyArmor.textContent = this.localeManager.getRawItemFullDescription(hero.bodyArmor);
        this.uiManager.heroItemHelmArmor.textContent = this.localeManager.getRawItemFullDescription(hero.helmArmor);
        this.uiManager.heroItemLeftHand.textContent = this.localeManager.getRawItemFullDescription(hero.leftHand);
        this.uiManager.heroItemNeck.textContent = this.localeManager.getRawItemFullDescription(hero.neck);
        this.uiManager.heroItemBraceletRight.textContent = this.localeManager.getRawItemFullDescription(hero.braceletRight);
        this.uiManager.heroItemBraceletLeft.textContent = this.localeManager.getRawItemFullDescription(hero.braceletLeft);
        this.uiManager.heroItemRingRight.textContent = this.localeManager.getRawItemFullDescription(hero.ringRight);
        this.uiManager.heroItemRingLeft.textContent = this.localeManager.getRawItemFullDescription(hero.ringLeft);
        this.uiManager.heroItemArrows.textContent = this.localeManager.getRawItemFullDescription(hero.arrows);

        // Show inventory items
        this.updateInventoryDisplay(hero);

        // Setup inventory item editor
        this.itemEditor.setupForHero(hero, heroChanged);

        this.appearanceEditor.setupAppearanceEditor(hero);
    }

    hideHeroEdit() {
        this.uiManager.heroViewBlock.style.display = 'none';
        this.uiManager.heroesBlock.style.display = '';
        this.currentHeroIndex = null;
    }

    saveHeroChanges() {
        if (this.currentHeroIndex === null) return;
        const hero = this.saveData.heroes[this.currentHeroIndex];

        hero.nameId = this.uiManager.heroNameSelect.value;
        hero.nicknameId = this.uiManager.heroNicknameSelect.value;
        hero.freePoints = parseInt(this.uiManager.freePointsInput.value) || 0;

        this.appearanceEditor.fillFromSelected(hero)

        // Main stats
        for (let i = 0; i < 6; i++) {
            hero.mainStatsBase[i] = parseInt(this.uiManager.mainStatsBaseInputs[i].value) || 0;
            hero.mainStatsCurrent[i] = parseInt(this.uiManager.mainStatsCurrentInputs[i].value) || 0;
        }

        // Secondary stats
        for (let i = 1; i <= 20; i++) {
            hero.secondaryStats[i - 1] = parseInt(this.uiManager.secondaryStats[i - 1].value) || 0;
        }

        // Update hero info in list
        const li = this.uiManager.heroListItems[this.currentHeroIndex];
        const infoSpan = li.querySelector('.hero-info');
        infoSpan.textContent = this.uiManager.displayHeroShort(hero, this.localeManager);
        this.hideHeroEdit();
    }

    updateInventoryDisplay(hero) {
        const inventoryList = this.uiManager.heroInventoryList;
        inventoryList.innerHTML = '';
        for (let i = 0; i < hero.inventory.length; i++) {
            const item = hero.inventory[i];
            const li = document.createElement('li');
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-inv-item-btn';
            editBtn.type = 'button';
            //editBtn.setAttribute('data-inventory-idx', i);
            editBtn.title = 'Edit';
            editBtn.innerHTML = '<span>&#9998;</span>';

            editBtn.addEventListener('click', () => {
                this.uiManager.inventoryItemEditorIndexInput.value = i;
                this.uiManager.inventoryItemEditorIndexInput.dispatchEvent(new Event('change'));
                // scroll page to inventory editor
                this.uiManager.inventoryItemEditorDiv.scrollIntoView({ behavior: 'smooth' });
            });

            const span = document.createElement('span');
            span.textContent = this.localeManager.getRawItemFullDescription(item);

            li.appendChild(editBtn);
            li.appendChild(span);
            this.uiManager.heroInventoryList.appendChild(li);
        }
    }

    applyBestEnchants() {
        if (this.currentHeroIndex === null) return;
        const hero = this.saveData.heroes[this.currentHeroIndex];

        const bestEnchant = new ItemEnchant(28086);

        for (let inventoryItem of hero.inventory) {
            if (inventoryItem.isEnchantable()) {
                inventoryItem.applyEnchant(bestEnchant);
            }
        }

        this.showHeroEdit(this.currentHeroIndex);
    }

    refillPotions() {
        if (this.currentHeroIndex === null) return;
        const hero = this.saveData.heroes[this.currentHeroIndex];

        var value = parseFloat(this.uiManager.potionConcentrationInput.value);
        if (!value || isNaN(value) || value < 0) {
            value = 0;
            this.uiManager.potionConcentrationInput.value = 0;
            alert("Invalid potion concentration value. Setting to 0.");
            return;
        }

        for (let inventoryItem of hero.inventory) {
            if (inventoryItem.potionConcentration) {
                inventoryItem.applyConcentration(value);
            }
        }

        this.showHeroEdit(this.currentHeroIndex);
    }

    testSomething(currentItemId) {
        if (this.currentHeroIndex === null) return;
        const hero = this.saveData.heroes[this.currentHeroIndex];

        for (let inventoryItem of hero.inventory) {
            while (!this.itemsManager.getItemData(currentItemId).name_ru.startsWith("Dummy")) {
                currentItemId++;
                if (currentItemId > 254) {
                    currentItemId = 1;
                }
            }
            inventoryItem.applyItemId(currentItemId, inventoryItem.itemType);
            currentItemId++;
        }

        this.showHeroEdit(this.currentHeroIndex);
    }

    updateHerosList() {
        // Update heroes list
        for (let i = 1; i <= 9; i++) {
            const li = this.uiManager.heroListItems[i - 1];
            const infoSpan = li.querySelector('.hero-info');
            if (this.saveData.heroes[i - 1]) {
                const hero = this.saveData.heroes[i - 1];
                infoSpan.textContent = this.uiManager.displayHeroShort(hero, this.localeManager);
                li.style.display = '';
            } else {
                infoSpan.textContent = '';
                li.style.display = 'none';
            }
        }

        this.appearanceEditor.localizeUI();
    }

    getCurrentHeroIndex() {
        return this.currentHeroIndex;
    }

    isEditingHero() {
        return this.currentHeroIndex !== null;
    }

    submitCurrentEdit() {
        if (this.isEditingHero()) {
            const heroEditForm = this.uiManager.heroEditForm;
            if (heroEditForm) {
                heroEditForm.dispatchEvent(new Event('submit'));
            }
        }
    }
}