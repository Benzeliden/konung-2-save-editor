/*
04B3C8 - внешний вид:

00 - муж. славяне
01 - жен. славяне
02 - муж. скандинавы
03 - жен. скандинавы
04 - муж. византийцы
05 - жен. византийцы

04B2FB - цвет одежды. Тут есть нюанс: нужно ставить код только соответствующий модельке. Т.е. если внешний вид проставлен - мужик славянин, то и брать нужно из славянского пула (если попытаться поставить скандинавские наряды, то в игре персонаж будет переливаться всеми цветами радуги как советский телевизор):

Славяне (цвет рубахи):
8C - красный
8E - зеленый
90 - синий
92 - оранжевый
94 - бежевый

Скандинавы:
38 - зеленые штаны, черная рубаха
3A - синие штаны, черная рубаха
3C - красные штаны, черная рубаха
3E - зеленые штаны, черная рубаха, рыжие волосы
40 - зеленые штаны, серая рубаха
42 - коричневые штаны, черная рубаха, рыжие волосы
*/

const slavicColors = [0x8C, 0x8E, 0x90, 0x92, 0x94]; // 
const scandinavianColors = [0x38, 0x3A, 0x3C, 0x3E, 0x40, 0x42, 0xDA, 0xDC, 0xE4];
//const scandinavianMaleColors = Array.from(new Set([...scandinavianColors, 0xDA, 0xDC, 0xE4]));
const busantineColors = [0x44, 0x46, 0x48, 0x4A, 0x4C, 0x4E, 0xE2, 0xDE, 0xE0]; // 

const appearanceMapping = [
    slavicColors,
    slavicColors,
    scandinavianColors,
    scandinavianColors,
    busantineColors,
    busantineColors
]

export class AppearanceEditor {
    constructor(uiManager, localeManager) {
        this.uiManager = uiManager;
        this.localeManager = localeManager;
        this.currentFigureId = -1;
        this.currentColor = -1;
        this.currentPortraitId = -1;

        this.uiManager.heroFigureSelect.addEventListener('change', (e) => {
            const figureId = parseInt(e.target.value);
            this.setupColorsFromAppearance(figureId);
        })
    }

    localizeUI() {
    }

    setupAppearanceEditor(hero) {
        this.setupColorsFromAppearance(hero.figureId);
        this.currentFigureId = hero.figureId;
        this.currentColor = hero.color;
        this.currentPortraitId = hero.portraitId;

        this.uiManager.heroFigureIdHexValue.textContent = "0x0" + hero.figureId.toString(16).toUpperCase();
        this.uiManager.heroAppearanceIdHexValue.textContent = (hero.appearanceId < 16 ? "0x0" : "0x") + hero.appearanceId.toString(16).toUpperCase();
        this.uiManager.heroPortraitIdHexValue.textContent = (hero.portraitId < 16 ? "0x0" : "0x") + hero.portraitId.toString(16).toUpperCase();

        this.uiManager.heroFigureSelect.value = hero.figureId;
        this.uiManager.heroAppearanceSelect.value = hero.appearanceId;
        this.uiManager.heroPortraitIdSelect.value = hero.portraitId;
    }

    setupColorsFromAppearance(figureId) {
        const colors = appearanceMapping[figureId];
        this.uiManager.heroAppearanceSelect.innerHTML = '';
        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = this.localeManager.getText('appearance-colors', color.toString());
            this.uiManager.heroAppearanceSelect.appendChild(option);
        });
    }

    isKnown(figureId, color) {
        const colors = appearanceMapping[figureId];
        return colors && colors.includes(color);
    }

    fillFromSelected(hero) {
        hero.figureId = parseInt(this.uiManager.heroFigureSelect.value);
        hero.appearanceId = parseInt(this.uiManager.heroAppearanceSelect.value);
        hero.portraitId = parseInt(this.uiManager.heroPortraitIdSelect.value);
    }
}