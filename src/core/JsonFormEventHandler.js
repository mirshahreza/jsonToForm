/**
 * JsonFormEventHandler - Event management for JsonToForm
 * 
 * @class JsonFormEventHandler
 */
class JsonFormEventHandler {
    
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
        this.eventNamespace = '.jsonToForm';
        this.debouncedValidation = this.jsonToForm.utils.debounce(
            (element) => this.jsonToForm.validator.validateInput(element), 
            300
        );
    }
    
    /**
     * Initialize all event handlers
     */
    initialize() {
        this._bindExpandCollapseEvents();
        this._bindArrayManipulationEvents();
        this._bindInputChangeEvents();
        this._bindFormValidationEvents();
        this._bindKeyboardEvents();
        this._bindFocusEvents();
    }
    
    /**
     * Destroy all event handlers
     */
    destroy() {
        this.jsonToForm.element.off(this.eventNamespace);
    }
    
    /**
     * Bind expand/collapse events for tree nodes
     * @private
     */
    _bindExpandCollapseEvents() {
        this.jsonToForm.element
            .off(`click${this.eventNamespace}`, '.j-ec')
            .on(`click${this.eventNamespace}`, '.j-ec', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this._handleToggleSubTree(event.target);
            });
    }
    
    /**
     * Bind array item add/remove events
     * @private
     */
    _bindArrayManipulationEvents() {
        // Add array item
        this.jsonToForm.element
            .off(`click${this.eventNamespace}`, '.j-add-array-item')
            .on(`click${this.eventNamespace}`, '.j-add-array-item', (event) => {
                event.preventDefault();
                this._handleAddArrayItem($(event.target));
            });
        
        // Remove array item
        this.jsonToForm.element
            .off(`click${this.eventNamespace}`, '.j-remove-array-item')
            .on(`click${this.eventNamespace}`, '.j-remove-array-item', (event) => {
                event.preventDefault();
                this._handleRemoveArrayItem($(event.target));
            });
    }
    
    /**
     * Bind input change events
     * @private
     */
    _bindInputChangeEvents() {
        // Text inputs (keyup for real-time)
        this.jsonToForm.element
            .off(`keyup${this.eventNamespace}`, '.j-input-text, .j-input-textarea, .j-input-date, .j-input-number, .j-input-email, .j-input-tel, .j-input-url')
            .on(`keyup${this.eventNamespace}`, '.j-input-text, .j-input-textarea, .j-input-date, .j-input-number, .j-input-email, .j-input-tel, .j-input-url', (event) => {
                this._handleInputChange($(event.target));
            });
        
        // Change events for select, checkbox, radio, etc.
        this.jsonToForm.element
            .off(`change${this.eventNamespace}`, '.j-input-checkbox, .j-input-radio, .j-input-select, .j-input-color, .j-input-date, .j-input-number, .j-input-html')
            .on(`change${this.eventNamespace}`, '.j-input-checkbox, .j-input-radio, .j-input-select, .j-input-color, .j-input-date, .j-input-number, .j-input-html', (event) => {
                this._handleInputChange($(event.target));
            });
        
        // HTML editor events
        this.jsonToForm.element
            .off(`keyup${this.eventNamespace}`, '.j-input-html-div')
            .on(`keyup${this.eventNamespace}`, '.j-input-html-div', (event) => {
                this._handleHtmlEditorChange($(event.target));
            })
            .off(`paste${this.eventNamespace}`, '.j-input-html-div')
            .on(`paste${this.eventNamespace}`, '.j-input-html-div', (event) => {
                // Delay to allow paste content to be processed
                setTimeout(() => this._handleHtmlEditorChange($(event.target)), 10);
            });
    }
    
    /**
     * Bind form validation events
     * @private
     */
    _bindFormValidationEvents() {
        // Real-time validation on blur
        this.jsonToForm.element
            .off(`blur${this.eventNamespace}`, '.j-input')
            .on(`blur${this.eventNamespace}`, '.j-input', (event) => {
                if (this.jsonToForm.config.validation.realTime) {
                    this.jsonToForm.validator.validateInput($(event.target));
                }
            });
    }
    
    /**
     * Bind keyboard events for better UX
     * @private
     */
    _bindKeyboardEvents() {
        // Enter key handling
        this.jsonToForm.element
            .off(`keypress${this.eventNamespace}`, '.j-input')
            .on(`keypress${this.eventNamespace}`, '.j-input', (event) => {
                if (event.which === 13) { // Enter key
                    this._handleEnterKey($(event.target), event);
                }
            });
        
        // Tab navigation enhancement
        this.jsonToForm.element
            .off(`keydown${this.eventNamespace}`, '.j-input')
            .on(`keydown${this.eventNamespace}`, '.j-input', (event) => {
                if (event.which === 9) { // Tab key
                    this._handleTabKey($(event.target), event);
                }
            });
    }
    
    /**
     * Bind focus events
     * @private
     */
    _bindFocusEvents() {
        // HTML editor focus redirect
        this.jsonToForm.element
            .off(`focus${this.eventNamespace}`, '.j-input-html')
            .on(`focus${this.eventNamespace}`, '.j-input-html', (event) => {
                $(event.target).closest('td').find('.j-input-html-div').focus();
            });
        
        // Focus highlighting
        this.jsonToForm.element
            .off(`focus${this.eventNamespace}`, '.j-input')
            .on(`focus${this.eventNamespace}`, '.j-input', (event) => {
                $(event.target).addClass('j-input-focused');
            })
            .off(`blur${this.eventNamespace}`, '.j-input')
            .on(`blur${this.eventNamespace}`, '.j-input', (event) => {
                $(event.target).removeClass('j-input-focused');
            });
    }
    
    /**
     * Handle expand/collapse tree nodes
     * @private
     */
    _handleToggleSubTree(button) {
        const $button = $(button);
        const isExpanded = $button.text().trim() === '-';
        
        if (isExpanded) {
            this._collapseNode($button);
        } else {
            this._expandNode($button);
        }
    }
    
    /**
     * Expand tree node
     * @private
     */
    _expandNode($button) {
        $button.text('-').removeClass('j-expand-btn').addClass('j-collapse-btn');
        $button.closest('tr').next('tr').removeClass('j-collapsed');
        
        // Trigger custom event
        this.jsonToForm.element.trigger('nodeExpanded', [$button]);
    }
    
    /**
     * Collapse tree node
     * @private
     */
    _collapseNode($button) {
        $button.text('+').removeClass('j-collapse-btn').addClass('j-expand-btn');
        $button.closest('tr').next('tr').addClass('j-collapsed');
        
        // Trigger custom event
        this.jsonToForm.element.trigger('nodeCollapsed', [$button]);
    }
    
    /**
     * Handle adding array item
     * @private
     */
    _handleAddArrayItem($button) {
        this.jsonToForm.renderer.addArrayItem($button, true, null);
        
        // Focus on the newly added item
        setTimeout(() => {
            const $newItem = $button.closest('tr').next('tr').find('.j-input').last();
            if ($newItem.length) {
                $newItem.focus();
            }
        }, 100);
        
        // Trigger custom event
        this.jsonToForm.element.trigger('arrayItemAdded', [$button]);
    }
    
    /**
     * Handle removing array item
     * @private
     */
    _handleRemoveArrayItem($button) {
        const itemIndex = $button.attr('data-index');
        const $nodeToRemove = $button.closest('table');
        const dataPath = $nodeToRemove.closest('td').attr('data-path');
        
        if (confirm('Are you sure you want to remove this item?')) {
            // Remove from data
            const pathParts = dataPath.replace(/\['/g, '.').replace(/']/g, '').replace(/^\./, '').split('.');
            let current = this.jsonToForm.config.value;
            
            for (let i = 0; i < pathParts.length; i++) {
                if (i === pathParts.length - 1) {
                    if (Array.isArray(current) && current[itemIndex] !== undefined) {
                        current.splice(itemIndex, 1);
                    }
                } else {
                    current = current[pathParts[i]];
                    if (!current) break;
                }
            }
            
            // Remove from DOM
            $nodeToRemove.remove();
            
            // Re-render to fix indexes
            this.jsonToForm.setValue(this.jsonToForm.config.value);
            
            // Trigger callback and custom event
            if (this.jsonToForm.config.callbacks.afterValueChanged) {
                this.jsonToForm.config.callbacks.afterValueChanged(
                    this.jsonToForm.config.value, 
                    this.jsonToForm.config.schema
                );
            }
            
            this.jsonToForm.element.trigger('arrayItemRemoved', [$button, itemIndex]);
        }
    }
    
    /**
     * Handle input value changes
     * @private
     */
    _handleInputChange($element) {
        this._updateValueFromInput($element);
        
        // Real-time validation if enabled
        if (this.jsonToForm.config.validation.realTime) {
            this.debouncedValidation($element);
        }
        
        // Trigger callback
        if (this.jsonToForm.config.callbacks.afterValueChanged) {
            this.jsonToForm.config.callbacks.afterValueChanged(
                this.jsonToForm.config.value, 
                this.jsonToForm.config.schema
            );
        }
        
        // Trigger custom event
        this.jsonToForm.element.trigger('valueChanged', [$element, this.jsonToForm.config.value]);
    }
    
    /**
     * Handle HTML editor changes
     * @private
     */
    _handleHtmlEditorChange($htmlDiv) {
        const $input = $htmlDiv.closest('td').find('.j-input-html');
        $input.val($htmlDiv.html());
        this._handleInputChange($input);
    }
    
    /**
     * Update internal value from input element
     * @private
     */
    _updateValueFromInput($element) {
        const dataPath = $element.attr('data-path');
        if (!dataPath) return;
        
        this.jsonToForm.utils.ensureDataPath(this.jsonToForm.config.value, dataPath);
        
        const tagName = $element.prop('tagName').toLowerCase();
        const inputType = $element.prop('type') ? $element.prop('type').toLowerCase() : '';
        
        let value;
        
        if (tagName === 'input' && inputType === 'checkbox') {
            value = $element.prop('checked');
        } else if (tagName === 'input' && inputType === 'radio') {
            // Handle radio button groups
            const name = $element.attr('name');
            const $checkedRadio = this.jsonToForm.element.find(`input[name="${name}"]:checked`);
            value = $checkedRadio.length ? $checkedRadio.val() : null;
            
            // Update validation state for radio group
            const $radioContainer = $element.closest('div[data-required]');
            if ($radioContainer.length) {
                $radioContainer.attr('data-is-valid', value !== null ? 'true' : 'false');
            }
        } else {
            value = $element.val();
            
            // Auto-trim if enabled
            if (this.jsonToForm.config.autoTrimValues && typeof value === 'string') {
                value = value.trim();
                $element.val(value); // Update the input with trimmed value
            }
        }
        
        // Set the value in the data object
        this.jsonToForm.utils.setNestedValue(this.jsonToForm.config.value, dataPath, value);
    }
    
    /**
     * Handle Enter key press
     * @private
     */
    _handleEnterKey($element, event) {
        const tagName = $element.prop('tagName').toLowerCase();
        
        if (tagName === 'input') {
            // Move to next input field
            const $inputs = this.jsonToForm.element.find('.j-input:visible');
            const currentIndex = $inputs.index($element);
            const $nextInput = $inputs.eq(currentIndex + 1);
            
            if ($nextInput.length) {
                $nextInput.focus();
            }
        } else if (tagName === 'textarea') {
            // Allow normal Enter behavior in textarea
            return true;
        }
        
        event.preventDefault();
        return false;
    }
    
    /**
     * Handle Tab key navigation
     * @private
     */
    _handleTabKey($element, event) {
        // Enhanced tab navigation could be implemented here
        // For now, we let the browser handle default tab behavior
        return true;
    }
    
    /**
     * Programmatically trigger input change
     * @param {jQuery} $element - Element to trigger change on
     */
    triggerChange($element) {
        this._handleInputChange($element);
    }
    
    /**
     * Add custom event listener
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     */
    on(eventName, handler) {
        this.jsonToForm.element.on(eventName, handler);
    }
    
    /**
     * Remove custom event listener
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler (optional)
     */
    off(eventName, handler) {
        this.jsonToForm.element.off(eventName, handler);
    }
    
    /**
     * Trigger custom event
     * @param {string} eventName - Event name
     * @param {Array} data - Event data
     */
    trigger(eventName, data) {
        this.jsonToForm.element.trigger(eventName, data);
    }
}

// Export for module systems or global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonFormEventHandler;
} else if (typeof window !== 'undefined') {
    window.JsonFormEventHandler = JsonFormEventHandler;
}