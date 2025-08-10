function createTabs(root) {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];

    function activateTab(tab, { setFocus = true } = {}) {
        // deactivate all
        tabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.tabIndex = -1;
        });
        panels.forEach(p => p.hidden = true);

        // activate current
        tab.setAttribute('aria-selected', 'true');
        tab.tabIndex = 0;
        const panel = root.querySelector('#' + tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = false;
        if (setFocus) tab.focus();
    }

    // click / keyboard
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activateTab(tab, { setFocus: false }));
        tab.addEventListener('keydown', e => {
            const key = e.key;
            let idx = i;
            if (key === 'ArrowRight') {
                idx = (i + 1) % tabs.length;
                activateTab(tabs[idx]);
                e.preventDefault();
            } else if (key === 'ArrowLeft') {
                idx = (i - 1 + tabs.length) % tabs.length;
                activateTab(tabs[idx]);
                e.preventDefault();
            } else if (key === 'Home') {
                activateTab(tabs[0]);
                e.preventDefault();
            } else if (key === 'End') {
                activateTab(tabs[tabs.length - 1]);
                e.preventDefault();
            } else if (key === ' ' || key === 'Enter') {
                activateTab(tab, { setFocus: false });
                e.preventDefault();
            }
        });
    });

    activateTab(tabs[0], { setFocus: false });
}

export function initTabs() {
    createTabs(document.getElementById('hero-edit-tabs'));
}
