const dummyItem ={
    id: 76,
    name_ru: 'Dummy Item',
    description_ru: 'Bad item',
    type: 0
}


class ItemsManager {
    constructor() {
        this.items = [];
        this.loaded = false;
        this.loadPromise = this.loadItems();
    }

    async loadItems() {
        try {
            const response = await fetch('./data/items.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.items = await response.json();
            this.loaded = true;
        } catch (error) {
            console.error('Failed to load items.json:', error);
            this.items = [];
            this.loaded = true;
        }
    }

    async waitForLoad() {
        await this.loadPromise;
    }

    getItemData(id) {
        const item = this.items.find(i => i.id === id);
        return item || {
            id: id,
            name_ru: `Dummy Item ${id}`,
        };
    }

    getItemListByType(type) {
        return this.items.filter(item => item.type === type);
    }
}

export { ItemsManager };
