import { enchantProperties } from './parcer.js';

const dmgArmorEnchantValues = [4, 12, 20, 28, 40, 48];

class LocaleManager {
    constructor(itemsManager, language = 'ru') {
        this.currentLocale = language;
        this.fallbackLocale = language === 'ru' ? 'en' : 'ru';
        this.strings = {};
        this.loaded = false;
        this.loadPromise = this.loadStrings();
        this.itemsManager = itemsManager;
    }

    async loadStrings() {
        try {
            const response = await fetch('./data/strings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.strings = await response.json();
            this.loaded = true;
        } catch (error) {
            console.error('Failed to load strings.json:', error);
            this.strings = {};
            this.loaded = true;
        }
    }

    async waitForLoad() {
        await this.loadPromise;
    }

    getText(category, index) {
        // Check if category exists in current locale
        const currentLocaleData = this.strings[this.currentLocale];
        if (currentLocaleData && currentLocaleData[category]) {
            const categoryArray = currentLocaleData[category];

            if (Array.isArray(categoryArray)) {
                // Check if index is within range
                if (index >= 0 && index < categoryArray.length) {
                    const text = categoryArray[index];
                    if (text || text === "") {
                        return text;
                    }
                }
            }
            else {
                const text = categoryArray[index];
                if (text || text === "") {
                    return text;
                }
            }

        }

        // Try fallback locale
        const fallbackLocaleData = this.strings[this.fallbackLocale];
        if (fallbackLocaleData && fallbackLocaleData[category]) {
            const categoryArray = fallbackLocaleData[category];

            if (Array.isArray(categoryArray)) {
                // Check if index is within range
                if (index >= 0 && index < categoryArray.length) {
                    const text = categoryArray[index];
                    if (text || text === "") {
                        return text;
                    }
                }
            }
            else {
                const text = categoryArray[index];
                if (text || text === "") {
                    return text;
                }
            }
        }

        // Return special text if not found or index out of range
        return `Unknown ${category}:${index}`;
    }

    getItemName(itemData) {
        let firstName;
        if (this.currentLocale == "ru") {
            firstName = itemData.name_ru || itemData.name_en;
        } else {
            firstName = itemData.name_en || itemData.name_ru;
        }
        return firstName || `Unknown Item:${itemData.id}`;
    }

    getItemNameById(id) {
        const itemData = this.itemsManager.getItemData(id);
        return this.getItemName(itemData);
    }

    getItemDescription(itemData) {
        let description;
        if (this.currentLocale == "ru") {
            description = itemData.desc_ru || itemData.desc_en;
        } else {
            description = itemData.desc_en || itemData.desc_ru;
        }

        return description || "";
    }

    getItemDescriptionById(id) {
        const itemData = this.itemsManager.getItemData(id);
        return this.getItemDescription(itemData);
    }

    getRawItemName(rawItem) {
        if (!rawItem || !rawItem.id) {
            return "-- пусто --";
        }

        return this.getItemNameById(rawItem.id);
    }

    getRawItemFullDescription(rawItem) {
        if (!rawItem || !rawItem.id) {
            return "-- пусто --";
        }

        const itemName = this.getItemNameById(rawItem.id);
        const itemDescription = this.getItemDescriptionById(rawItem.id);

        switch (rawItem.itemType) {
            case 0: // Melee weapon
            case 1: // Ranged weapon
            case 2: // Body armor
            case 3: // Helm armor
            case 4: // shield
                return `${itemName}, ${itemDescription}. Прочность - ${rawItem.currentDurability.toFixed(0)} / ${rawItem.maxDurability.toFixed(0)}.${this.displayEnchant(rawItem.getEnchant())}`;
            case 6: // Neck item;
            case 7: // Bracelet
            case 8: // Ring
                return `${itemName}, ${itemDescription}.${this.displayEnchant(rawItem.getEnchant())}`;
            case 9: // Potion?
                return `${itemName}, ${itemDescription}.`
                    + (rawItem.potionConcentration ? ` Концентрация - ${rawItem.potionConcentration.toFixed(2)}` : "");
            case 0x0B:
                return `${itemName}, ${itemDescription}`
            case 0x0C: // arrows
                return `${itemName}, ${itemDescription}. Количество - ${rawItem.amount}` +
                    (rawItem.arrowPoison ? `. Отравление - ${rawItem.arrowPoison}` : "");
            default:
                return `${itemName}, ${itemDescription}. Type - ${rawItem.itemType}`;
        }
    }

    displayEnchant(enchant) {
        if (enchant === undefined || enchant === 0) {
            return "";
        }
        this.__cacheEnchantTexts();

        let enchantText = "";
        for (let prop of enchantProperties) {
            if (enchant[prop] > 0) {
                let value = enchant[prop];
                if (prop === 'dmg' || prop === 'armor') {
                    value = dmgArmorEnchantValues[value - 1] || value; // Convert index to actual value
                }
                enchantText += ` ${this.__enchantTexts[prop]} +${value}`;
            }
        }
        return enchantText;
    }

    __cacheEnchantTexts() {
        if (this.__enchantTexts) return;
        this.__enchantTexts = {};
        for (let prop of enchantProperties) {
            this.__enchantTexts[prop] = this.getText("enchants", prop)
        }
        //console.log("Cached enchant texts:", this.__enchantTexts);
    }

    setLocale(language) {
        this.currentLocale = language;
        this.fallbackLocale = language === 'ru' ? 'en' : 'ru';
        this.__enchantTexts = undefined; // Reset cached enchant texts
    }

    getCurrentLocale() {
        return this.currentLocale;
    }
}

export { LocaleManager };