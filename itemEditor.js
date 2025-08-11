import { ItemEnchant, RawItem } from './parcer.js';

export class ItemEditor {
    constructor(uiManager, localeManager, itemsManager) {
        this.uiManager = uiManager;
        this.localeManager = localeManager;
        this.itemsManager = itemsManager;
        this.lastSelectedItemType = -1;
        this.currentHeroGetter = null;
        this.currentHeroIndexGetter = null;
        this.onItemEditCallback = null;

        this.initializeEventHandlers();
    }

    setCallbacks(currentHeroGetter, currentHeroIndexGetter, onItemEditCallback) {
        this.currentHeroGetter = currentHeroGetter;
        this.currentHeroIndexGetter = currentHeroIndexGetter;
        this.onItemEditCallback = onItemEditCallback;
    }

    initializeEventHandlers() {
        // Inventory item editor handlers
        if (this.uiManager.inventoryItemEditorIndexInput) {
            this.uiManager.inventoryItemEditorIndexInput.addEventListener('change', () => {
                this.onInventoryItemIndexChange();
            });
        }

        if (this.uiManager.inventoryItemEditorTypeSelect) {
            this.uiManager.inventoryItemEditorTypeSelect.addEventListener('change', () => {
                const itemType = parseInt(this.uiManager.inventoryItemEditorTypeSelect.value);
                //console.log("Inventory item editor type changed to " + itemType);
                this.selectItemTypeForEditor(itemType);
            });
        }

        if (this.uiManager.inventoryItemEditorApplyBtn) {
            this.uiManager.inventoryItemEditorApplyBtn.addEventListener('click', () => {
                this.applyInventoryItemEdit();
            });
        }
    }

    prepopulateInventoryItemForEditor(item) {
        if (item == null) {
            this.uiManager.inventoryItemEditorCurrentName.textContent = '-- select an item --';
            return;
        } else {
            this.uiManager.inventoryItemEditorCurrentName.textContent = this.localeManager.getRawItemFullDescription(item);
        }

        //console.log("Prepopulating inventory item editor for item:", item);
        this.selectItemTypeForEditor(item.itemType, item.id);

        if (item.maxDurability) {
            this.uiManager.inventoryItemEditorDurabilityInput.value = item.maxDurability;
        }

        if (item.isEnchantable()) {
            const enchant = item.getEnchant();
            if (enchant) {
                // todo: select proper radio buttons for enchant
            }
        }

        if (item.potionConcentration) {
            this.uiManager.inventoryItemEditorPotionConcentrationInput.value = item.potionConcentration.toFixed(2);
        }

        if (item.amount) {
            this.uiManager.inventoryItemEditorArrowQuantityInput.value = item.amount;
        }

        if (item.appliedPoison) {
            this.uiManager.inventoryItemEditorappliedPoisoningInput.value = item.appliedPoison;
        }
    }

    selectItemTypeForEditor(itemType, knownItemId) {
        if (this.lastSelectedItemType === itemType) {
            if (knownItemId) {
                this.uiManager.inventoryItemEditorItemSelect.value = knownItemId;
            }
            return; // No change in type or item
        }
        this.uiManager.inventoryItemEditorTypeSelect.value = itemType;

        switch (itemType) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                this.uiManager.inventoryItemEditorDurabilitySetup.style.display = '';
                this.uiManager.inventoryItemEditorEnchantSetup.style.display = '';
                this.uiManager.inventoryItemEditorPotionSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorArrowSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPoisoningSetup.style.display = itemType == 1 ? '' : 'none';
                break;
            case 6:
            case 7:
            case 8:
                this.uiManager.inventoryItemEditorDurabilitySetup.style.display = 'none';
                this.uiManager.inventoryItemEditorEnchantSetup.style.display = '';
                this.uiManager.inventoryItemEditorPotionSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorArrowSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPoisoningSetup.style.display = 'none';
                break;
            case 9:
                this.uiManager.inventoryItemEditorDurabilitySetup.style.display = 'none';
                this.uiManager.inventoryItemEditorEnchantSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPotionSetup.style.display = '';
                this.uiManager.inventoryItemEditorArrowSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPoisoningSetup.style.display = 'none';
                break;
            case 12:
                this.uiManager.inventoryItemEditorDurabilitySetup.style.display = 'none';
                this.uiManager.inventoryItemEditorEnchantSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPotionSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorArrowSetup.style.display = '';
                this.uiManager.inventoryItemEditorPoisoningSetup.style.display = '';
                break;
            default:
                this.uiManager.inventoryItemEditorDurabilitySetup.style.display = 'none';
                this.uiManager.inventoryItemEditorEnchantSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPotionSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorArrowSetup.style.display = 'none';
                this.uiManager.inventoryItemEditorPoisoningSetup.style.display = 'none';
        }

        //console.log(`selectItemTypeForEditor: ${this.lastSelectedItemType} -> ${itemType}`);
        if (this.lastSelectedItemType != itemType) {
            this.lastSelectedItemType = itemType;
            this.uiManager.inventoryItemEditorItemSelect.innerHTML = '';

            // Populate item select options based on the selected item type
            const itemList = this.itemsManager.getItemListByType(itemType);
            // todo: use localization manager
            itemList.sort((a, b) =>
                a.name_ru.localeCompare(b.name_ru) * 2 +
                (a.desc_ru || '').localeCompare(b.desc_ru || '')
            );
            itemList.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.name_ru} - ${item.desc_ru}`;
                if (option.textContent.length > 50) {
                    option.title = option.textContent;
                    option.textContent = option.textContent.slice(0, 50) + '...';
                }
                if (knownItemId === item.id) {
                    option.selected = true;
                }
                this.uiManager.inventoryItemEditorItemSelect.appendChild(option);
            });
        }
    }

    onInventoryItemIndexChange() {
        const newIndex = parseInt(this.uiManager.inventoryItemEditorIndexInput.value);
        //console.log("Inventory item editor index changed to " + newIndex);
        let item = null;
        if (!isNaN(newIndex)) {
            this.uiManager.inventoryItemEditorIndexInput.value = newIndex;

            const hero = this.currentHeroGetter();
            if (hero && newIndex >= 0 && newIndex < hero.inventory.length) {
                item = hero.inventory[newIndex];
            }
        }
        this.prepopulateInventoryItemForEditor(item);
    }

    applyInventoryItemEdit() {
        const currentHeroIndex = this.currentHeroIndexGetter();
        if (currentHeroIndex === null) return;
        const hero = this.currentHeroGetter();

        const selectedItemIndex = parseInt(this.uiManager.inventoryItemEditorIndexInput.value);
        if (!hero || isNaN(selectedItemIndex) || selectedItemIndex < 0 || selectedItemIndex >= hero.inventory.length) return;

        const item = hero.inventory[selectedItemIndex];

        const newId = parseInt(this.uiManager.inventoryItemEditorItemSelect.value);
        const newType = parseInt(this.uiManager.inventoryItemEditorTypeSelect.value);
        if (isNaN(newId) || isNaN(newType) || newId <= 0 || newId > 255 || newType < 0) {
            alert("Invalid item ID or type.");
            return;
        }

        let enchant = undefined
        if (RawItem.isEnchantableType(newType)) {
            enchant = new ItemEnchant();
            enchant.agi = parseInt(document.querySelector('input[name="stat-agi"]:checked').value);
            enchant.str = parseInt(document.querySelector('input[name="stat-str"]:checked').value);
            enchant.vit = parseInt(document.querySelector('input[name="stat-vit"]:checked').value);
            enchant.dmg = parseInt(document.querySelector('input[name="stat-dmg"]:checked').value);
            enchant.armor = parseInt(document.querySelector('input[name="stat-armor"]:checked').value);
            //console.log("Got enchant ", enchant)
        }

        let durability = parseInt(this.uiManager.inventoryItemEditorDurabilitySetup.value);
        let concentration = parseFloat(this.uiManager.inventoryItemEditorPotionConcentrationInput.value);
        let arrowAmount = parseInt(this.uiManager.inventoryItemEditorArrowQuantityInput.value);
        let appliedPoison = parseInt(this.uiManager.inventoryItemEditorappliedPoisoningInput.value);
        item.applyItemData(newId, newType, durability, enchant, concentration, arrowAmount, appliedPoison);
        this.prepopulateInventoryItemForEditor(item);

        // Notify the parent component that an item was edited
        if (this.onItemEditCallback) {
            this.onItemEditCallback();
        }
    }

    setupForHero(hero, heroChanged) {
        const showItemEditor = hero.inventory.length > 0;
        if (showItemEditor) {
            this.uiManager.inventoryItemEditorDiv.style.display = '';
            if (heroChanged) {
                this.uiManager.inventoryItemEditorIndexInput.value = 0;
                this.uiManager.inventoryItemEditorCurrentName.textContent = this.localeManager.getRawItemFullDescription(hero.inventory[0]);
                this.prepopulateInventoryItemForEditor(hero.inventory[0]);
            }
        } else {
            this.uiManager.inventoryItemEditorDiv.style.display = 'none';
        }
    }
}