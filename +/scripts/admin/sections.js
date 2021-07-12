/** global: GLSR, jQuery */

const Sections = function (options) {
    this.options = jQuery.extend({}, this.defaults, options);
    this.tabs = document.querySelectorAll(this.options.tabSelector);
    if (!this.tabs) return;
    this.init_();
};

Sections.prototype = {
    defaults: {
        expandSelectors: '.glsr-nav-view, .glsr-notice',
        tabSelector: '.glsr-nav-tab',
    },

    /** @return void */
    init_: function () {
        var self = this;
        [].forEach.call(self.tabs, function (tab, index) {
            tab.addEventListener('click', self.onClick_.bind(self));
            tab.addEventListener('touchend', self.onClick_.bind(self));
        }.bind(self));
        jQuery(self.options.expandSelectors).on('click', 'a', function () {
            var elId = jQuery(this).data('expand');
            localStorage.setItem('glsr-expand', elId);
            self.scrollSectionIntoView_(jQuery(elId));
        });
        jQuery(window).on('load', function () {
            self.scrollSectionIntoView_(jQuery(localStorage.getItem('glsr-expand')));
        });
    },

    /** @return void */
    onClick_: function (ev) {
        ev.preventDefault();
        this.toggleCollapsibleViewSections_(ev.currentTarget);
    },

    /** @return void */
    scrollSectionIntoView_: function (el) {
        if (el.length) {
            var parentEl = el.parent().parent();
            parentEl.removeClass('collapsed');
            this.toggleCollapsibleSections_(parentEl);
            parentEl.removeClass('collapsed');
            el.parent().removeClass('closed').find('.glsr-accordion-trigger').attr('aria-expanded', true);
            window.setTimeout(function () {
                el.parent()[0].scrollIntoView({behavior: 'smooth', block: 'center'});
                localStorage.removeItem('glsr-expand');
            }, 10);
        }
    },

    /** @return void */
    toggleCollapsibleSections_: function (viewEl) {
        var action = viewEl.hasClass('collapsed') ? 'remove' : 'add';
        viewEl[action + 'Class']('collapsed')
            .find('.glsr-card.postbox')[action + 'Class']('closed')
            .find('.glsr-accordion-trigger').attr('aria-expanded', action !== 'add');
    },

    /** @return void */
    toggleCollapsibleViewSections_: function (el) {
        if (!el.classList.contains('nav-tab-active')) return;
        var viewEl = jQuery(el.getAttribute('href'));
        this.toggleCollapsibleSections_(viewEl);
    },
};

export default Sections;
