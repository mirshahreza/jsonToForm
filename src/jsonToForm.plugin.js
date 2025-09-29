/**
 * JsonToForm v2.0.0 - Modern jQuery Plugin
 * 
 * A powerful jQuery plugin for converting JSON Schema to HTML forms with modern features:
 * - Modular architecture with separate concerns
 * - Enhanced validation with custom rules
 * - Modern CSS with theme support
 * - Improved accessibility and UX
 * - Performance optimizations
 * 
 * @author JsonToForm Team
 * @version 2.0.0
 * @license MIT
 */

(function($) {
    'use strict';
    
    // Plugin namespace
    const PLUGIN_NAME = 'jsonToForm';
    const PLUGIN_VERSION = '2.0.0';
    
    /**
     * jQuery plugin entry point
     */
    $.fn.jsonToForm = function(options) {
        // Handle multiple elements
        if (this.length > 1) {
            return this.each(function() {
                $(this).jsonToForm(options);
            });
        }
        
        const $element = this.first();
        
        // Return existing instance if already initialized
        const existingInstance = $element.data(PLUGIN_NAME);
        if (existingInstance) {
            return existingInstance;
        }
        
        // Create and initialize new instance
        const instance = new JsonToForm($element, options);
        $element.data(PLUGIN_NAME, instance);
        
        return instance;
    };
    
    // Plugin version
    $.fn.jsonToForm.version = PLUGIN_VERSION;
    
    // Default configuration
    $.fn.jsonToForm.defaults = {
        expandingLevel: -1,
        value: {},
        schema: {},
        renderFirstLevel: false,
        autoTrimValues: true,
        indenting: 5,
        radioNullCaption: 'null',
        selectNullCaption: '',
        treeExpandCollapseButton: true,
        theme: 'default',
        responsive: true,
        validation: {
            realTime: true,
            showHints: true,
            customRules: {}
        },
        callbacks: {
            afterValueChanged: null,
            afterWidgetCreated: null,
            beforeValidation: null,
            afterValidation: null
        }
    };
    
    // Utility method to add custom validation rules globally
    $.fn.jsonToForm.addValidationRule = function(name, rule) {
        if (window.JsonFormValidator && JsonFormValidator.prototype) {
            JsonFormValidator.prototype.validationRules = JsonFormValidator.prototype.validationRules || {};
            JsonFormValidator.prototype.validationRules[name] = rule;
        }
    };
    
    // Utility method to set global theme
    $.fn.jsonToForm.setTheme = function(themeName) {
        $(document.body).attr('data-json-form-theme', themeName);
    };
    
    // Plugin initialization
    $(document).ready(function() {
        // Auto-initialize forms with data-json-schema attribute
        $('[data-json-schema]').each(function() {
            const $form = $(this);
            const schemaUrl = $form.attr('data-json-schema');
            const valueUrl = $form.attr('data-json-value');
            
            // Load schema and optionally value from URLs
            const loadPromises = [$.getJSON(schemaUrl)];
            if (valueUrl) {
                loadPromises.push($.getJSON(valueUrl));
            }
            
            $.when.apply($, loadPromises).done(function(schema, value) {
                const options = {
                    schema: schema,
                    value: value || {}
                };
                
                // Parse additional options from data attributes
                const dataOptions = $form.data();
                Object.keys(dataOptions).forEach(key => {
                    if (key.startsWith('jsonForm')) {
                        const optionKey = key.replace('jsonForm', '').toLowerCase();
                        options[optionKey] = dataOptions[key];
                    }
                });
                
                $form.jsonToForm(options);
            });
        });
    });
    
})(jQuery);

// Expose classes for advanced usage
if (typeof window !== 'undefined') {
    window.JsonToFormClasses = {
        JsonToForm: window.JsonToForm,
        JsonFormRenderer: window.JsonFormRenderer,
        JsonFormValidator: window.JsonFormValidator,
        JsonFormEventHandler: window.JsonFormEventHandler,
        JsonFormUtils: window.JsonFormUtils
    };
}