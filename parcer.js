
const heroEquippedItemsPropNames = [
    'weapon',
    'rangedWeapon',
    'bodyArmor',
    'helmArmor',
    'leftHand',
    'neck',
    'braceletRight',
    'braceletLeft',
    'ringRight',
    'ringLeft',
    'arrows'
]

class Hero {
    constructor() {
        this.level = 0; // number
        this.expCurrent = 0; // number
        this.expNextLevel = 0; // number
        this.freePoints = 0;
        this.mainStatsBase = [0, 0, 0, 0, 0, 0]; // array of 6 numbers
        this.mainStatsCurrent = [0, 0, 0, 0, 0, 0]; // array of 6 numbers
        this.secondaryStats = Array(20).fill(0); // array of 20 numbers
        this.nameId = 0;
        this.nicknameId = 0;
        this.figureId = 0;
        this.appearanceId = 0;
        this.portraitId = 0;
        this.selfIdentity = 0;
        this.positionX = 0;
        this.positionY = 0;
        this.hp = 0; // number, stored as [0, 1600] but displayed as [0, 100]

        this.inventory = []; // array of RawItem objects
        this.weapon = null; // RawItem for melee weapon
        this.rangedWeapon = null; // RawItem for ranged weapon
        this.bodyArmor = null; // RawItem for body armor
        this.helmArmor = null; // RawItem for helm armor
        this.leftHand = null; // RawItem for left hand item
        this.neck = null; // RawItem for neck item
        this.braceletRight = null; // RawItem for right bracelet
        this.braceletLeft = null; // RawItem for left bracelet
        this.ringRight = null; // RawItem for right ring
        this.ringLeft = null; // RawItem for left ring
        this.arrows = null; // RawItem for arrows
    }

    clone() {
        const copy = new Hero();
        copy.level = this.level;
        copy.expCurrent = this.expCurrent;
        copy.expNextLevel = this.expNextLevel;
        copy.mainStatsBase = [...this.mainStatsBase];
        copy.mainStatsCurrent = [...this.mainStatsCurrent];
        copy.secondaryStats = [...this.secondaryStats];
        copy.nameId = this.nameId;
        copy.nicknameId = this.nicknameId;
        copy.figureId = this.figureId;
        copy.appearanceId = this.appearanceId;
        copy.portraitId = this.portraitId;
        copy.hp = this.hp;
        copy.freePoints = this.freePoints;
        copy.positionX = this.positionX;
        copy.positionY = this.positionY;
        copy.selfIdentity = this.selfIdentity;

        // Clone items
        copy.inventory = this.inventory.map(item => item.clone());
        for (let prop of heroEquippedItemsPropNames) {
            copy[prop] = this[prop] ? this[prop].clone() : null;
        }

        return copy;
    }
}

const enchantProperties = [
    'vit',
    'str',
    'agi',
    'dmg',
    'armor',
];
const enchantMask = 0x7; // 3 bits for each property

class ItemEnchant {
    constructor(enchantValue = 0) {
        this.str = 0;
        this.agi = 0;
        this.vit = 0;
        this.armor = 0;
        this.dmg = 0;

        for (let i = 0; i < enchantProperties.length; i++) {
            this[enchantProperties[i]] = (enchantValue >> (i * 3)) & enchantMask;
        }
    }

    encodeToInt16() {
        let value = 0;
        for (let i = 0; i < enchantProperties.length; i++) {
            value |= (this[enchantProperties[i]] & enchantMask) << (i * 3);
        }
        return value;
    }
}

class RawItem {
    // pass 16-bytes DataView to constructor
    constructor(subView, itemIdx) {
        this.itemType = subView.getUint8(0); // 1 byte
        this.id = subView.getUint8(3); // 1 byte
        this.subView = subView; // store the DataView for later use
        this.itemIdx = itemIdx; // store the item index for later use
        this.dirty = false;

        switch (this.itemType) {
            case 0: // Melee weapon
            case 1: // Ranged weapon
            case 2: // Body armor
            case 3: // Helm armor
            case 4: // shield
                {
                    this.currentDurability = subView.getFloat32(4, true);
                    this.maxDurability = subView.getFloat32(8, true);
                    this.enchant = subView.getUint16(14, true);
                    if (this.itemType == 0) {
                        this.appliedPoison = subView.getUint16(12, true);
                    }
                    break;
                }
            case 6: // Neck item;
            case 7: // Bracelet
            case 8: // Ring
                {
                    this.enchant = subView.getUint16(14, true);
                    break;
                }
            case 9: // Potion & ingredients
                {
                    // For potions, we can have concentration value
                    if (this.id >= 85 && this.id <= 92) {
                        this.potionConcentration = subView.getFloat32(4, true);
                    }
                    break;
                }
            case 0x0C: // arrows
                {
                    this.amount = subView.getUint8(4, true);
                    this.appliedPoison = subView.getUint16(12, true);
                    break;
                }
        }
    }

    saveToSubview() {
        if (!this.subView) return;

        this.subView.setUint8(0, this.itemType);
        this.subView.setUint16(1, 0xFFFF, true);
        this.subView.setUint8(3, this.id);

        switch (this.itemType) {
            case 0: // Melee weapon
            case 1: // Ranged weapon
            case 2: // Body armor
            case 3: // Helm armor
            case 4: // shield
                {
                    this.subView.setFloat32(4, this.currentDurability, true);
                    this.subView.setFloat32(8, this.maxDurability, true);
                    if (this.itemType === 2 || this.itemType == 3) {
                        this.subView.setUint16(12, 0xFFFF, true);
                    } else if (this.itemType === 0) {
                        this.subView.setUint16(12, this.appliedPoison, true);
                    } else {
                        this.subView.setUint16(12, 0, true);
                    }
                    this.subView.setUint16(14, this.enchant, true);
                    break;
                }
            case 6: // Neck item;
            case 7: // Bracelet
            case 8: // Ring
                {
                    this.subView.setUint32(4, 0xFFFFFFFF, true);
                    this.subView.setUint32(8, 0, true);
                    this.subView.setUint16(12, 0xFFFF, true);
                    this.subView.setUint16(14, this.enchant, true);
                    break;
                }
            case 9: // Potion & ingredients
                {
                    // For potions, we can have concentration value
                    if (this.id >= 85 && this.id <= 92) {
                        this.subView.setFloat32(4, this.potionConcentration, true);
                    } else {
                        this.subView.setFloat32(4, 0, true); // Clear concentration for non-potion items
                        this.potionConcentration = undefined; // Reset concentration
                    }
                    this.subView.setUint32(8, 0xFFFFFFFF, true);
                    this.subView.setUint32(12, 0xFFFF, true);
                    break;
                }
            case 0x0C: // arrows
                {
                    this.subView.setUint16(4, this.amount, true);
                    this.subView.setUint16(6, 0, true);
                    this.subView.setUint32(8, 0xFFFFFFFF, true);
                    this.subView.setUint16(12, this.appliedPoison, true);
                    this.subView.setUint16(14, 0, true);
                    break;
                }
            case 0x0B: {
                this.subView.setUint32(4, 0xFFFFFFFF, true);
                this.subView.setUint32(8, 0xFFFFFFFF, true);
                this.subView.setUint32(12, 0xFFFF, true);
                break;
            }
        }
        this.dirty = false;
    }

    getEnchant() {
        if (this.isEnchantable()) {
            return new ItemEnchant(this.enchant);
        }
        return undefined;
    }

    applyEnchant(enchant) {
        if (this.isEnchantable()) {
            this.enchant = enchant.encodeToInt16();
            this.dirty = true;
        }
    }

    isEnchantable() {
        return RawItem.isEnchantableType(this.itemType);
    }

    static isEnchantableType(itemType) {
        return itemType >= 0 && itemType <= 4 || itemType >= 6 && itemType <= 8;
    }

    applyConcentration(floatValue) {
        if (this.potionConcentration !== undefined) {
            this.potionConcentration = floatValue;
            this.dirty = true;
        }
    }

    applyItemId(id, itemType) {
        if (this.id !== undefined) {
            this.id = id;
            this.itemType = itemType;
            this.dirty = true;
        }
    }

    applyItemData(id, itemType, durability, enchant, concentration, arrowsAmount, arrowsPoison) {
        // check input
        if (enchant instanceof ItemEnchant) {
            enchant = enchant.encodeToInt16();
        } else {
            enchant = 0;
        }

        this.id = id;
        this.itemType = itemType;
        this.dirty = true;

        this.currentDurability = undefined;
        this.maxDurability = undefined;
        this.enchant = undefined;
        this.potionConcentration = undefined;
        this.amount = undefined;
        this.appliedPoison = undefined;
        switch (this.itemType) {
            case 0: // Melee weapon
            case 1: // Ranged weapon
            case 2: // Body armor
            case 3: // Helm armor
            case 4: // shield
                {
                    if (typeof durability !== "number" || !isFinite(durability) || durability < 1 || durability > 1000) {
                        durability = 50;
                    }
                    this.currentDurability = durability
                    this.maxDurability = durability

                    this.enchant = enchant
                    break;
                }
            case 6: // Neck item;
            case 7: // Bracelet
            case 8: // Ring
                {
                    this.enchant = enchant
                    break;
                }
            case 9: // Potion & ingredients
                {
                    // For potions, we can have concentration value
                    if (this.id >= 85 && this.id <= 92) {

                        if (typeof concentration !== "number" || !isFinite(concentration) || concentration < 1 || concentration > 1000) {
                            concentration = 15;
                        }
                        this.potionConcentration = concentration;
                    }
                    break;
                }
            case 0x0C: // arrows
                {
                    if (typeof arrowsAmount === "number" && isFinite(arrowsAmount)) {
                        if (arrowsAmount < 1 || arrowsAmount > 255) {
                            arrowsAmount = 30;
                        }
                        this.amount = Math.round(arrowsAmount);
                    } else {
                        this.amount = 30;
                    }
                    if (typeof arrowsPoison === "number" && isFinite(arrowsPoison)) {
                        if (arrowsPoison < 0 || arrowsPoison > 255) {
                            arrowsPoison = 0;
                        }
                        this.appliedPoison = Math.round(arrowsPoison);
                    } else {
                        this.appliedPoison = 0;
                    }
                    break;
                }
        }
    }

    clone() {
        const copy = new RawItem(this.subView);
        return copy;
    }
}

class SaveFileModel {
    constructor() {
        this.gold = 0; // number
        this.heroes = []; // array of Hero objects
        this.items = []; // todo: all in-game items
    }

    clone() {
        const copy = new SaveFileModel();
        copy.gold = this.gold;

        // assume Hero has its own .clone()
        copy.heroes = this.heroes.map(hero => hero.clone());

        // similarly for items
        copy.items = this.items.map(item => item.clone());

        return copy;
    }
}

let currentView = null; // DataView of the save file
let currentSaveModel = null; // SaveFileModel of the current save file

const partySizeOffset = 0x00026060; // 1 byte
const goldIndex = 0x0004B2F2; // 4 bytes index for gold in the buffer
const nextHeroOffset = 0x100; // offset to the next hero data
const mainHeroExp = 0x0004B2EE; // 4 bytes index for main hero experience in the buffer
const mainHeroExpToNextLevel = 0x0004B2F6; // 4 bytes index for main hero experience needed to next level
const mainHeroLevel = 0x0004B3BF; // 1 byte for main hero level

const mainHeroNameOffset = 0x04B3BC; // 1 byte for main hero name id
const mainHeroNicknameOffset = 0x04B3BD; // 1 byte for main hero nickname id
const mainHeroHpOffset = 0x0004B31A; // int16 for main hero HP. Hp in game displayed as [0, 100], but stored as [0, 1600]
const mainHeroFigureOffset = 0x0004B3C8; // 1 byte for main hero race and gender id
const mainHeroAppearanceOffset = 0x0004B2FB; // 1 byte for main hero appearance id
const mainHeroPortraitOffset = 0x0004B3BB; // 1 byte for main hero portrait id

const mainHeroCoordinateX = 0x04B2DE;
const mainHeroCoordinateY = 0x04B2DF;
const mainHeroSelfIdentityOffset = 0x0004B3C8;

const mainHeroMainStatsBaseOffset = 0x0004B38C;
const mainHeroMainStatsCurrentOffset = 0x0004B398;
const mainHeroSecondaryStatsOffset = 0x0004B39E; // 20 bytes, 1 byte for each secondary stat
const mainHeroFreeSkillPointsOffset = 0x0004B314; // 2 bytes

const mainHeroPoisoning = 0x0004B31E // 2 bytes

// Items:

const mainHeroItemMelee = 0x0004B324; // melee weapon
const mainHeroItemRanged = 0x0004B326; // ranged weapon id
const mainHeroItemBodyArmor = 0x0004B328; // body armor
const mainHeroItemHelmArmor = 0x0004B32A; // helm armor
const mainHeroItemLeftHand = 0x0004B32C; // left hand
const mainHeroItemNeck = 0x0004B382; // neck
const mainHeroItemBraceletRight = 0x0004B384; // bracelet on right hand
const mainHeroItemBraceletLeft = 0x0004B386; // bracelet on left hand
const mainHeroItemRingRight = 0x0004B388; // ring on right hand
const mainHeroItemRingLeft = 0x0004B38A; // ring on left hand
const mainHeroItemArrows = 0x0004B31C; // arrows for ranged weapon
const mainHeroEquippedItemsOffsets = [
    mainHeroItemMelee,
    mainHeroItemRanged,
    mainHeroItemBodyArmor,
    mainHeroItemHelmArmor,
    mainHeroItemLeftHand,
    mainHeroItemNeck,
    mainHeroItemBraceletRight,
    mainHeroItemBraceletLeft,
    mainHeroItemRingRight,
    mainHeroItemRingLeft,
    mainHeroItemArrows
]

const mainHeroInventoryOffset = 0x0004B32E; // 42 items in inventory, each item is 2 bytes reference

const itemsAreaOffset = 0x115C; // 0x115C is the start of items area in save file
const itemSize = 0x10; // each item is described by 16 bytes

function getRawItemForHero(view, itemIdx) {
    if (itemIdx <= 0) {
        return null; // No item at this index
    }
    const address = itemsAreaOffset + itemIdx * itemSize;
    const subView = new DataView(view.buffer, address, itemSize);
    return new RawItem(subView, itemIdx);
}

function saveRawItemIfNeeded(view, rawItem) {
    if (!rawItem || !rawItem.dirty) {
        return; // No item or no changes to save
    }

    rawItem.saveToSubview();
    rawItem.dirty = false; // Mark as clean after saving
}

function parseSaveFile(buffer) {
    //console.log("Parsing save file...");
    const view = new DataView(buffer);
    currentView = view; // Store the current view for later use

    const goldValue = view.getUint32(goldIndex, /* littleEndian= */ true);

    const model = new SaveFileModel();
    model.gold = goldValue;
    const partySize = view.getUint8(partySizeOffset, /* littleEndian= */ true);

    for (let i = 0; i < partySize; i++) {
        let offset = nextHeroOffset * i;
        const hero = new Hero();

        hero.level = view.getUint8(offset + mainHeroLevel, /* littleEndian= */ true);
        hero.expCurrent = view.getUint32(offset + mainHeroExp, /* littleEndian= */ true);
        hero.hp = view.getUint16(offset + mainHeroHpOffset, /* littleEndian= */ true) / 16; // Convert to [0, 100] scale
        hero.expNextLevel = view.getUint32(offset + mainHeroExpToNextLevel, /* littleEndian= */ true);
        hero.nameId = view.getUint8(offset + mainHeroNameOffset, /* littleEndian= */ true);
        hero.nicknameId = view.getUint8(offset + mainHeroNicknameOffset, /* littleEndian= */ true);
        hero.freePoints = view.getUint16(offset + mainHeroFreeSkillPointsOffset, /* littleEndian= */ true);
        hero.figureId = view.getUint8(offset + mainHeroFigureOffset, /* littleEndian= */ true);
        hero.appearanceId = view.getUint16(offset + mainHeroAppearanceOffset, /* littleEndian= */ true);
        hero.portraitId = view.getUint8(offset + mainHeroPortraitOffset, /* littleEndian= */ true);

        hero.positionX = view.getUint8(offset + mainHeroCoordinateX, true)
        hero.positionY = view.getUint8(offset + mainHeroCoordinateY, true)
        hero.selfIdentity = view.getUint8(offset + mainHeroSelfIdentityOffset, /* littleEndian= */ true);

        // Main stats
        for (let j = 0; j < 6; j++) {
            hero.mainStatsBase[j] = view.getUint8(offset + mainHeroMainStatsBaseOffset + j, /* littleEndian= */ true);
            hero.mainStatsCurrent[j] = view.getUint8(offset + mainHeroMainStatsCurrentOffset + j, /* littleEndian= */ true);
        }
        // Secondary stats
        for (let j = 0; j < 20; j++) {
            hero.secondaryStats[j] = view.getUint8(offset + mainHeroSecondaryStatsOffset + j, /* littleEndian= */ true);
        }

        // Equipped items
        for (let j = 0; j < heroEquippedItemsPropNames.length; j++) {
            const itemOffset = offset + mainHeroEquippedItemsOffsets[j];
            const itemIdx = view.getUint16(itemOffset, /* littleEndian= */ true);
            const item = getRawItemForHero(view, itemIdx);
            hero[heroEquippedItemsPropNames[j]] = item;
        }
        // Inventory items
        for (let j = 0; j < 42; j++) {
            let itm = getRawItemForHero(view, view.getUint16(offset + mainHeroInventoryOffset + j * 2, /* littleEndian= */ true))
            if (itm == null) {
                break; // No more items in inventory
            }
            hero.inventory.push(itm);
        }

        model.heroes.push(hero);
    }

    currentSaveModel = model.clone();
    return model;
}

function searchForUnknownAppearances(localeManager, appearanceEditor) {
    let stats = {}
    let testCases = []
    for (let i = 0; i < 2000; i++) {
        let offset = nextHeroOffset * i;
        let level = currentView.getUint8(offset + mainHeroLevel, true);
        if (level == 0) {
            continue;
        }
        let hp = currentView.getUint16(offset + mainHeroHpOffset, /* littleEndian= */ true) / 16;
        let nameId = currentView.getUint8(offset + mainHeroNameOffset, /* littleEndian= */ true);
        let figureId = currentView.getUint8(offset + mainHeroFigureOffset, /* littleEndian= */ true);
        if (figureId > 5) {
            continue;
        }
        let appearanceId = currentView.getUint8(offset + mainHeroAppearanceOffset, /* littleEndian= */ true);
        let test16bit = currentView.getUint16(offset + mainHeroAppearanceOffset, /* littleEndian= */ true);
        let portraitId = currentView.getUint8(offset + mainHeroPortraitOffset, /* littleEndian= */ true);

        if (portraitId > 0) {
            const name = localeManager.getText('names', nameId);
            if (testCases[portraitId] == undefined) {
                testCases[portraitId] = { name: name, portraitId: portraitId, portraitHex: portraitId.toString(16).padStart(2, '0') };
            } else {
                if (!testCases[portraitId].name.includes(name)) {
                    testCases[portraitId].name += `, ${name}`;
                }
            }

        }

        let statsKey = `${figureId}-${appearanceId}-${test16bit}`;
        if (stats[statsKey] == undefined) {
            stats[statsKey] = 0
            if (!appearanceEditor.isKnown(figureId, appearanceId) && localeManager.getText('names', nameId) !== '') {
                testCases.push({ figureId, appearanceId: test16bit, name: localeManager.getText('names', nameId) });
                console.log(`Hero ${i}. Offset: ${offset}. Level: ${level}. Hp: ${hp}. Name: ${localeManager.getText('names', nameId)}. Race/Gender: ${localeManager.getText('figure', figureId)}. Appearance: ${localeManager.getText('appearance-colors', appearanceId)}. Appearance (16-bit): ${test16bit}. Portrait: ${localeManager.getText('portraits', portraitId)}`);

            }
        }
        stats[statsKey]++
        //if (localeManager.getText('names', nameId) == "Ифгений") {
        //    console.warn("Found Ифгений");
        //    console.log(`Hero ${i}. Offset: ${offset}. Level: ${level}. Hp: ${hp}. Name: ${localeManager.getText('names', nameId)}. Race/Gender: ${localeManager.getText('figure', figureId)}. Appearance: ${localeManager.getText('appearance-colors', appearanceId)}. Appearance (16-bit): ${test16bit}. Portrait: ${localeManager.getText('portraits', portraitId)}`);
        //}
    }
    //testCases.sort((a, b) => {
    //    if (a.figureId !== b.figureId) {
    //        return a.figureId - b.figureId;
    //    }
    //    return a.appearanceId - b.appearanceId;
    //});
    console.log(JSON.stringify(testCases, null, 2));
    //console.log(stats);
}

function applyChangesToCurrentView(saveData) {
    if (!currentView || !saveData) {
        console.error("No current view or save data to apply changes.");
        return;
    }
    // Update gold
    currentView.setUint32(goldIndex, saveData.gold, true);
    // Update heroes
    for (let i = 0; i < saveData.heroes.length; i++) {
        const hero = saveData.heroes[i];
        let offset = nextHeroOffset * i;

        currentView.setUint8(offset + mainHeroLevel, hero.level, true);
        currentView.setUint32(offset + mainHeroExp, hero.expCurrent, true);
        // hp change disabled for now
        //currentView.setUint16(offset + mainHeroHpOffset, hero.hp * 16, true); // Convert back to [0, 1600] scale
        currentView.setUint32(offset + mainHeroExpToNextLevel, hero.expNextLevel, true);
        currentView.setUint8(offset + mainHeroNameOffset, hero.nameId, true);
        currentView.setUint8(offset + mainHeroNicknameOffset, hero.nicknameId, true);
        currentView.setUint16(offset + mainHeroFreeSkillPointsOffset, hero.freePoints, true);
        currentView.setUint8(offset + mainHeroFigureOffset, hero.figureId, true);
        currentView.setUint16(offset + mainHeroAppearanceOffset, hero.appearanceId, true);
        currentView.setUint8(offset + mainHeroPortraitOffset, hero.portraitId, true);

        // Main stats
        for (let j = 0; j < 6; j++) {
            currentView.setUint8(offset + mainHeroMainStatsBaseOffset + j, hero.mainStatsBase[j], true);
            currentView.setUint8(offset + mainHeroMainStatsCurrentOffset + j, hero.mainStatsCurrent[j], true);
        }
        // Secondary stats
        for (let j = 0; j < 20; j++) {
            currentView.setUint8(offset + mainHeroSecondaryStatsOffset + j, hero.secondaryStats[j], true);
        }

        // Equipped items
        for (let j = 0; j < heroEquippedItemsPropNames.length; j++) {
            const item = hero[heroEquippedItemsPropNames[j]];
            const itemOffset = offset + mainHeroEquippedItemsOffsets[j];
            if (item) {
                currentView.setUint16(itemOffset, item.itemIdx, true);
                saveRawItemIfNeeded(currentView, item);
            } else {
                currentView.setUint16(itemOffset, 0, true); // Clear slot
            }
        }
        // Inventory items
        for (let j = 0; j < 42; j++) {
            if (j < hero.inventory.length) {
                const item = hero.inventory[j];
                currentView.setUint16(offset + mainHeroInventoryOffset + j * 2, item.itemIdx, true);
                saveRawItemIfNeeded(currentView, item);
            } else {
                currentView.setUint16(offset + mainHeroInventoryOffset + j * 2, 0, true); // Clear unused slots
            }
        }
    }
}

function downloadNewSaveFile(fileName = "KONUNG2.SA0", saveData) {
    // apply changes from saveData to currentView
    if (!currentView || !saveData) {
        console.error("No current view or save data to download.");
        return;
    }
    applyChangesToCurrentView(saveData);

    const blob = new Blob([currentView.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export { parseSaveFile, downloadNewSaveFile, SaveFileModel, Hero, enchantProperties, ItemEnchant, RawItem, searchForUnknownAppearances };
