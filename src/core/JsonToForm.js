/**
 * JsonToForm - Modern jQuery plugin for converting JSON Schema to HTML forms
 * 
 * @class JsonToForm
 * @version 2.0.0
 */
class JsonToForm {
    
    /**
     * Constructor - Initialize the JsonToForm instance
     * @param {jQuery} element - The jQuery element to render the form
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
        this.element = element;
        this.config = this._initializeConfig(options);
        this.level = 0;
        this.arrayTemplates = {};
        
        // Initialize submodules
        this.renderer = new JsonFormRenderer(this);
        this.validator = new JsonFormValidator(this);
        this.eventHandler = new JsonFormEventHandler(this);
        this.utils = new JsonFormUtils(this);
        
        this._initialize();
    }
    
    /**
     * Initialize configuration with defaults
     * @private
     */
    _initializeConfig(options) {
        const defaults = {
            expandingLevel: -1, // -1: expand all levels
            value: {},
            schema: {},
            renderFirstLevel: false,
            autoTrimValues: true,
            indenting: 5,
            radioNullCaption: 'null',
            selectNullCaption: '',
            treeExpandCollapseButton: true,
            theme: 'default', // New: theme support
            responsive: true, // New: responsive design
            validation: {
                realTime: true, // New: real-time validation
                showHints: true, // New: show validation hints
                customRules: {} // New: custom validation rules
            },
            callbacks: {
                afterValueChanged: null,
                afterWidgetCreated: null,
                beforeValidation: null,
                afterValidation: null
            }
        };
        
        return this.utils.deepMerge(defaults, options);
    }
    
    /**
     * Initialize the widget
     * @private
     */
    _initialize() {
        this.level = 0;
        this.arrayTemplates = {};
        
        const widgetContent = this.renderer.renderSchemaNode(this.config.schema, "");
        this.element.html(widgetContent);
        
        this._initValuePaths();
        this.setValue(this.config.value);
        this.eventHandler.initialize();
        this.validator.validateAll();
        
        // Execute callback if provided
        if (this.config.callbacks.afterWidgetCreated) {
            this.config.callbacks.afterWidgetCreated(this.config.value, this.config.schema);
        }
    }
    
    /**
     * Initialize data paths for all form elements
     * @private
     */
    _initValuePaths() {
        this.element.find("[data-value-name]").each((index, element) => {
            const $element = $(element);
            const dataPath = this.utils.generatePath($element);
            $element.attr("data-path", dataPath);
            
            if (dataPath) {
                const elementId = this.utils.getIdBasedDataPath(dataPath, this.element.attr("id"));
                $element.attr("id", elementId);
                $element.parents("table:first").find("label:first").attr("for", elementId);
            }
        });
    }
    
    /**
     * Public API Methods
     */
    
    /**
     * Check if the form is valid
     * @returns {boolean} True if form is valid
     */
    isValid() {
        return this.validator.isFormValid();
    }
    
    /**
     * Get the current schema
     * @returns {Object} The JSON schema
     */
    getSchema() {
        return this.config.schema;
    }
    
    /**
     * Get the current form values
     * @returns {Object} The form values as JSON
     */
    getValue() {
        return this.config.value;
    }
    
    /**
     * Set form values
     * @param {Object} value - The new values to set
     */
    setValue(value) {
        this.config.value = value;
        this._addArrayItemsToDOM();
        this._populateFormValues();
    }
    
    /**
     * Update the schema and re-render
     * @param {Object} schema - The new schema
     */
    updateSchema(schema) {
        this.config.schema = schema;
        this._initialize();
    }
    
    /**
     * Destroy the widget and clean up event listeners
     */
    destroy() {
        this.eventHandler.destroy();
        this.element.empty();
    }
    
    /**
     * Private helper methods
     */
    
    /**
     * Add array items to DOM based on current values
     * @private
     */
    _addArrayItemsToDOM() {
        const arrayNodes = this.element.find('[data-array-loaded="false"]');
        if (arrayNodes.length === 0) {
            this._initValuePaths();
            return;
        }
        
        arrayNodes.each((index, element) => {
            const $addBtn = $(element);
            const dataPath = this._getArrayDataPath($addBtn);
            const arrayValue = this.utils.getNestedValue(this.config.value, dataPath);
            
            if (arrayValue && Array.isArray(arrayValue)) {
                arrayValue.forEach((item, idx) => {
                    this.renderer.addArrayItem($addBtn, false, idx);
                });
            }
            
            $addBtn.attr("data-array-loaded", "true");
        });
        
        // Recursively handle nested arrays
        this._addArrayItemsToDOM();
    }
    
    /**
     * Get array data path for add button
     * @private
     */
    _getArrayDataPath($addBtn) {
        let dataPath = $addBtn.parents("tr:first").next("tr").find("td:first").attr("data-path");
        
        if (!dataPath) {
            const $container = $addBtn.parents("tr:first").next("tr").find("td:first");
            dataPath = this.utils.generatePath($container);
            $container.attr("data-path", dataPath);
        }
        
        return dataPath;
    }
    
    /**
     * Populate form values from current data
     * @private
     */
    _populateFormValues() {
        this.element.find("input[data-path], select[data-path], textarea[data-path]").each((index, element) => {
            const $element = $(element);
            const dataPath = $element.attr("data-path");
            const value = this.utils.getNestedValue(this.config.value, dataPath);
            
            this._setElementValue($element, value);
        });
    }
    
    /**
     * Set individual element value
     * @private
     */
    _setElementValue($element, value) {
        const tagName = $element.prop("tagName").toLowerCase();
        const inputType = $element.prop("type") ? $element.prop("type").toLowerCase() : "";
        
        if (tagName === "input" && inputType === "checkbox") {
            $element.prop("checked", value === true);
        } else if (tagName === "input" && inputType === "radio") {
            this.element.find(`[data-path="${$element.attr("data-path")}"][value="${value}"]`).prop("checked", true);
        } else {
            const processedValue = this.config.autoTrimValues && value ? value.toString().trim() : value;
            $element.val(processedValue || '');
            
            // Handle HTML editor
            if ($element.hasClass("j-input-html")) {
                $element.parents(":first").find(".j-input-html-div:first").html($element.val());
            }
        }
    }
}

// Export for module systems or global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonToForm;
} else if (typeof window !== 'undefined') {
    window.JsonToForm = JsonToForm;
}