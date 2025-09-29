/**
 * JsonToForm v2.0.0 - Complete Build
 * Generated: ${new Date().toISOString()}
 */

// Utils
class JsonFormUtils {
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
    }
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (this.isObject(source[key]) && this.isObject(result[key])) {
                    result[key] = this.deepMerge(result[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }
    
    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    
    generatePath(element) {
        const pathParts = [];
        
        element.parents("[data-value-name]").each(function() {
            pathParts.push(`['${$(this).attr("data-value-name")}']`);
        });
        
        const basePath = pathParts.reverse().join(".");
        const elementName = element.attr("data-value-name");
        
        let result = basePath.replace(/\.\[/g, "[").replace(/\['']/g, "");
        if (elementName) {
            result += `['${elementName}']`;
        }
        
        return result;
    }
    
    getIdBasedDataPath(dataPath, containerId) {
        let id = dataPath
            .replace(/\]\[/g, '_')
            .replace(/[\[\]"']/g, '');
        
        return `${containerId}_${id}`;
    }
    
    getNestedValue(obj, path) {
        try {
            const sanitizedPath = path.replace(/\['/g, '.').replace(/']/g, '').replace(/^\./, '');
            const pathParts = sanitizedPath.split('.');
            
            let current = obj;
            for (const part of pathParts) {
                if (current === null || current === undefined) {
                    return null;
                }
                current = current[part];
            }
            
            return current;
        } catch (e) {
            console.warn('Error getting nested value:', e);
            return null;
        }
    }
    
    setNestedValue(obj, path, value) {
        try {
            const sanitizedPath = path.replace(/\['/g, '.').replace(/']/g, '').replace(/^\./, '');
            const pathParts = sanitizedPath.split('.');
            
            let current = obj;
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!(part in current) || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
            
            const lastPart = pathParts[pathParts.length - 1];
            current[lastPart] = value;
        } catch (e) {
            console.error('Error setting nested value:', e);
        }
    }
    
    ensureDataPath(obj, dataPath) {
        const pathParts = dataPath.replace(/\]\[/g, '].['). split('.');
        let pathCursor = "";
        
        pathParts.forEach(part => {
            pathCursor += part;
            if (this.getNestedValue(obj, pathCursor) === undefined) {
                this.setNestedValue(obj, pathCursor, {});
            }
        });
    }
    
    jsonEscape(str) {
        if (!str) return '';
        return str.toString()
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/"/g, '\\"');
    }
    
    replaceAll(source, find, replace) {
        if (!source) return '';
        return source.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
    
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    fixNullUndefined(value, defaultValue) {
        return value !== null && value !== undefined ? value : defaultValue;
    }
    
    getUISetting(schemaNode, settingName, defaultValue) {
        if (schemaNode && schemaNode.ui && schemaNode.ui[settingName] !== undefined) {
            return schemaNode.ui[settingName];
        }
        return defaultValue;
    }
    
    getArrayType(schemaNode) {
        if (schemaNode.items && schemaNode.items.type) {
            return schemaNode.items.type;
        }
        
        if (schemaNode.items && schemaNode.items.$ref) {
            return schemaNode.items.$ref;
        }
        
        return "string";
    }
    
    generateSpacer(level) {
        const adjustedLevel = level + (this.jsonToForm.config.renderFirstLevel ? 0 : -1);
        const spaceCount = Math.max(0, adjustedLevel * this.jsonToForm.config.indenting);
        const spaces = '&nbsp;'.repeat(spaceCount);
        
        return `<span class="j-spacer">${spaces}</span>`;
    }
    
    generateExpandCollapseButton(type) {
        if (!this.jsonToForm.config.treeExpandCollapseButton) {
            return '';
        }
        
        switch (type) {
            case 'e':
                return '<span class="j-ec j-expand-btn">+</span>&nbsp;&nbsp;';
            case 'c':
                return '<span class="j-ec j-collapse-btn">-</span>&nbsp;&nbsp;';
            default:
                return '';
        }
    }
    
    generateTitle(schemaNode, schemaName) {
        const title = this.fixNullUndefined(schemaNode.title, schemaName);
        return `<label class="j-field-label">${this.escapeHtml(title)}</label>`;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        return false;
    }
}

// Validator
class JsonFormValidator {
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
        this.validationRules = this._initializeValidationRules();
    }
    
    _initializeValidationRules() {
        return {
            email: {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Please enter a valid email address'
            },
            tel: {
                pattern: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
                message: 'Please enter a valid phone number'
            },
            url: {
                pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
                message: 'Please enter a valid URL'
            },
            strongPassword: {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must contain at least 8 characters including uppercase, lowercase, number and special character'
            }
        };
    }
    
    validateAll() {
        const inputs = this.jsonToForm.element.find(".j-input");
        inputs.each((index, element) => {
            this.validateInput($(element));
        });
    }
    
    validateInput($element) {
        const result = {
            isValid: true,
            errors: [],
            element: $element
        };
        
        if (this.jsonToForm.config.callbacks.beforeValidation) {
            this.jsonToForm.config.callbacks.beforeValidation($element, result);
        }
        
        const isRequired = $element.attr("data-required") === "true";
        const minValue = this._parseNumeric($element.attr("data-min"));
        const maxValue = this._parseNumeric($element.attr("data-max"));
        const pattern = $element.attr("data-pattern");
        const customRule = $element.attr("data-validation-rule");
        
        const value = this._getElementValue($element);
        
        if (isRequired && this.jsonToForm.utils.isEmpty(value)) {
            result.isValid = false;
            result.errors.push('This field is required');
        } else if (!this.jsonToForm.utils.isEmpty(value)) {
            this._validateRange($element, value, minValue, maxValue, result);
            this._validatePattern($element, value, pattern, result);
            this._validateInputType($element, value, result);
            this._validateCustomRule($element, value, customRule, result);
        }
        
        this._updateElementValidationState($element, result);
        
        if (this.jsonToForm.config.callbacks.afterValidation) {
            this.jsonToForm.config.callbacks.afterValidation($element, result);
        }
        
        return result;
    }
    
    _getElementValue($element) {
        const tagName = $element.prop("tagName").toLowerCase();
        const inputType = $element.prop("type") ? $element.prop("type").toLowerCase() : "";
        
        if (tagName === "input" && inputType === "checkbox") {
            return $element.prop("checked");
        } else if (tagName === "input" && inputType === "radio") {
            const name = $element.attr("name");
            const checkedRadio = this.jsonToForm.element.find(`input[name="${name}"]:checked`);
            return checkedRadio.length > 0 ? checkedRadio.val() : null;
        } else if ($element.hasClass("j-input-html")) {
            return $element.siblings(".j-input-html-div").text();
        } else {
            return $element.val();
        }
    }
    
    _validateRange($element, value, minValue, maxValue, result) {
        if ($element.hasClass("j-input-text") || $element.hasClass("j-input-textarea")) {
            const length = value ? value.toString().length : 0;
            
            if (minValue !== null && length < minValue) {
                result.isValid = false;
                result.errors.push(`Minimum length is ${minValue} characters`);
            }
            
            if (maxValue !== null && length > maxValue) {
                result.isValid = false;
                result.errors.push(`Maximum length is ${maxValue} characters`);
            }
        } else if ($element.hasClass("j-input-number")) {
            const numValue = parseFloat(value);
            
            if (!isNaN(numValue)) {
                if (minValue !== null && numValue < minValue) {
                    result.isValid = false;
                    result.errors.push(`Minimum value is ${minValue}`);
                }
                
                if (maxValue !== null && numValue > maxValue) {
                    result.isValid = false;
                    result.errors.push(`Maximum value is ${maxValue}`);
                }
            }
        }
    }
    
    _validatePattern($element, value, pattern, result) {
        if (pattern && value) {
            try {
                const regex = new RegExp(pattern);
                if (!regex.test(value)) {
                    result.isValid = false;
                    result.errors.push('Value does not match required pattern');
                }
            } catch (e) {
                console.warn('Invalid regex pattern:', pattern);
            }
        }
    }
    
    _validateInputType($element, value, result) {
        if ($element.hasClass("j-input-email")) {
            this._applyValidationRule(value, 'email', result);
        } else if ($element.hasClass("j-input-tel")) {
            this._applyValidationRule(value, 'tel', result);
        } else if ($element.hasClass("j-input-url")) {
            this._applyValidationRule(value, 'url', result);
        } else if ($element.hasClass("j-input-number")) {
            if (value && isNaN(parseFloat(value))) {
                result.isValid = false;
                result.errors.push('Please enter a valid number');
            }
        }
    }
    
    _validateCustomRule($element, value, customRule, result) {
        if (customRule) {
            if (this.validationRules[customRule]) {
                this._applyValidationRule(value, customRule, result);
            }
            
            const userRules = this.jsonToForm.config.validation.customRules;
            if (userRules[customRule]) {
                const rule = userRules[customRule];
                let isValid = true;
                
                if (typeof rule.validate === 'function') {
                    isValid = rule.validate(value, $element);
                } else if (rule.pattern) {
                    isValid = rule.pattern.test(value);
                }
                
                if (!isValid) {
                    result.isValid = false;
                    result.errors.push(rule.message || 'Custom validation failed');
                }
            }
        }
    }
    
    _applyValidationRule(value, ruleName, result) {
        const rule = this.validationRules[ruleName];
        if (!rule) return;
        
        let isValid = true;
        
        if (typeof rule.validate === 'function') {
            isValid = rule.validate(value);
        } else if (rule.pattern) {
            isValid = rule.pattern.test(value);
        }
        
        if (!isValid) {
            result.isValid = false;
            result.errors.push(rule.message);
        }
    }
    
    _updateElementValidationState($element, result) {
        $element.attr("data-is-valid", result.isValid ? "true" : "false");
        
        $element.siblings('.j-validation-message').remove();
        
        if (!result.isValid && this.jsonToForm.config.validation.showHints && result.errors.length > 0) {
            const errorMessage = result.errors[0];
            const messageHtml = `<div class="j-validation-message">${this.jsonToForm.utils.escapeHtml(errorMessage)}</div>`;
            $element.after(messageHtml);
        }
    }
    
    isFormValid() {
        return this.jsonToForm.element.find('[data-is-valid="false"]').length === 0;
    }
    
    getAllErrors() {
        const errors = [];
        
        this.jsonToForm.element.find('[data-is-valid="false"]').each((index, element) => {
            const $element = $(element);
            const fieldName = $element.attr('data-value-name') || 'Unknown field';
            const message = $element.siblings('.j-validation-message').text() || 'Validation error';
            
            errors.push({
                field: fieldName,
                message: message,
                element: $element
            });
        });
        
        return errors;
    }
    
    clearValidationMessages() {
        this.jsonToForm.element.find('.j-validation-message').remove();
        this.jsonToForm.element.find('[data-is-valid]').attr('data-is-valid', 'true');
    }
    
    addCustomRule(name, rule) {
        this.validationRules[name] = rule;
    }
    
    _parseNumeric(value) {
        return value ? parseFloat(value) : null;
    }
}

// Event Handler (simplified version for demo)
class JsonFormEventHandler {
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
        this.eventNamespace = '.jsonToForm';
        this.debouncedValidation = this.jsonToForm.utils.debounce(
            (element) => this.jsonToForm.validator.validateInput(element), 
            300
        );
    }
    
    initialize() {
        this._bindExpandCollapseEvents();
        this._bindArrayManipulationEvents();
        this._bindInputChangeEvents();
        this._bindFormValidationEvents();
    }
    
    destroy() {
        this.jsonToForm.element.off(this.eventNamespace);
    }
    
    _bindExpandCollapseEvents() {
        this.jsonToForm.element
            .off(`click${this.eventNamespace}`, '.j-expand-collapse-btn')
            .on(`click${this.eventNamespace}`, '.j-expand-collapse-btn', (event) => {
                event.preventDefault();
                this._handleToggleSubTree($(event.target));
            });
    }
    
    _bindArrayManipulationEvents() {
        this.jsonToForm.element
            .off(`click${this.eventNamespace}`, '.j-add-array-item')
            .on(`click${this.eventNamespace}`, '.j-add-array-item', (event) => {
                event.preventDefault();
                this._handleAddArrayItem($(event.target));
            });
        
        this.jsonToForm.element
            .off(`click${this.eventNamespace}`, '.j-remove-array-item')
            .on(`click${this.eventNamespace}`, '.j-remove-array-item', (event) => {
                event.preventDefault();
                this._handleRemoveArrayItem($(event.target));
            });
    }
    
    _bindInputChangeEvents() {
        this.jsonToForm.element
            .off(`keyup${this.eventNamespace}`, '.j-input')
            .on(`keyup${this.eventNamespace}`, '.j-input', (event) => {
                this._handleInputChange($(event.target));
            });
        
        this.jsonToForm.element
            .off(`change${this.eventNamespace}`, '.j-input')
            .on(`change${this.eventNamespace}`, '.j-input', (event) => {
                this._handleInputChange($(event.target));
            });
    }
    
    _bindFormValidationEvents() {
        this.jsonToForm.element
            .off(`blur${this.eventNamespace}`, '.j-input')
            .on(`blur${this.eventNamespace}`, '.j-input', (event) => {
                if (this.jsonToForm.config.validation.realTime) {
                    this.jsonToForm.validator.validateInput($(event.target));
                }
            });
    }
    
    _handleToggleSubTree($button) {
        const $container = $button.closest('.j-object-container, .j-array-container');
        const $body = $container.find('.j-object-body, .j-array-body').first();
        
        if ($body.hasClass('j-collapsed')) {
            $body.removeClass('j-collapsed');
            $button.text('-').removeClass('j-expand-btn').addClass('j-collapse-btn');
        } else {
            $body.addClass('j-collapsed');
            $button.text('+').removeClass('j-collapse-btn').addClass('j-expand-btn');
        }
    }
    
    _handleAddArrayItem($button) {
        this.jsonToForm.renderer.addArrayItem($button, true, null);
        
        if (this.jsonToForm.config.callbacks.afterValueChanged) {
            this.jsonToForm.config.callbacks.afterValueChanged(
                this.jsonToForm.config.value, 
                this.jsonToForm.config.schema
            );
        }
    }
    
    _handleRemoveArrayItem($button) {
        const itemIndex = parseInt($button.attr('data-index'));
        const $arrayItem = $button.closest('.j-array-item');
        const $arrayContainer = $button.closest('.j-array-container');
        const dataPath = $arrayContainer.attr('data-path');
        
        if (confirm('Are you sure you want to remove this item?')) {
            const arrayValue = this.jsonToForm.utils.getNestedValue(this.jsonToForm.config.value, dataPath);
            if (Array.isArray(arrayValue) && arrayValue[itemIndex] !== undefined) {
                arrayValue.splice(itemIndex, 1);
            }
            
            $arrayItem.remove();
            this.jsonToForm.setValue(this.jsonToForm.config.value);
            
            if (this.jsonToForm.config.callbacks.afterValueChanged) {
                this.jsonToForm.config.callbacks.afterValueChanged(
                    this.jsonToForm.config.value, 
                    this.jsonToForm.config.schema
                );
            }
        }
    }
    
    _handleInputChange($element) {
        this._updateValueFromInput($element);
        
        if (this.jsonToForm.config.validation.realTime) {
            this.debouncedValidation($element);
        }
        
        if (this.jsonToForm.config.callbacks.afterValueChanged) {
            this.jsonToForm.config.callbacks.afterValueChanged(
                this.jsonToForm.config.value, 
                this.jsonToForm.config.schema
            );
        }
    }
    
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
            const name = $element.attr('name');
            const $checkedRadio = this.jsonToForm.element.find(`input[name="${name}"]:checked`);
            value = $checkedRadio.length ? $checkedRadio.val() : null;
        } else {
            value = $element.val();
            
            if (this.jsonToForm.config.autoTrimValues && typeof value === 'string') {
                value = value.trim();
                $element.val(value);
            }
        }
        
        this.jsonToForm.utils.setNestedValue(this.jsonToForm.config.value, dataPath, value);
    }
}

// Simple Renderer (basic implementation for demo)
class JsonFormRenderer {
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
    }
    
    renderSchemaNode(schemaNode, schemaName, requiredItems = []) {
        if (!schemaNode || typeof schemaNode !== 'object') {
            return '';
        }
        
        const nodeType = schemaNode.type || 'string';
        
        switch (nodeType) {
            case 'object':
                return this._renderObjectNode(schemaNode, schemaName, requiredItems);
            case 'array':
                return this._renderArrayNode(schemaNode, schemaName);
            case 'spacer':
                return this._renderSpacerNode(schemaNode, schemaName);
            default:
                return this._renderSimpleNode(schemaNode, schemaName, requiredItems.includes(schemaName));
        }
    }
    
    _renderSimpleNode(schemaNode, schemaName, isRequired) {
        const nodeType = schemaNode.type || 'string';
        const uiSettings = schemaNode.ui || {};
        
        let inputHtml = '';
        const fieldClass = `j-input j-input-${this._getDefaultEditor(nodeType)}`;
        const attributes = this._buildFieldAttributes(schemaNode, schemaName, isRequired);
        
        if (schemaNode.enum) {
            inputHtml = this._renderSelect(schemaNode.enum, attributes, isRequired);
        } else {
            switch (nodeType) {
                case 'boolean':
                    inputHtml = `<input type="checkbox" class="${fieldClass}" ${this._attributesToString(attributes)} />`;
                    break;
                case 'number':
                case 'integer':
                    inputHtml = `<input type="number" class="${fieldClass}" ${this._attributesToString(attributes)} />`;
                    break;
                default:
                    inputHtml = `<input type="text" class="${fieldClass}" ${this._attributesToString(attributes)} />`;
            }
        }
        
        const labelText = schemaNode.title || schemaName;
        const requiredStar = isRequired ? '<span class="j-required-star">*</span>' : '';
        const inlineHelp = uiSettings.inlineHint ? `<div class="j-inline-help">${uiSettings.inlineHint}</div>` : '';
        
        return `
            <div class="j-field-row">
                <div class="j-field-label-col">
                    <label class="j-field-label">${labelText}${requiredStar}</label>
                </div>
                <div class="j-field-input-col">
                    ${inputHtml}
                    ${inlineHelp}
                </div>
            </div>
        `;
    }
    
    _renderObjectNode(schemaNode, schemaName) {
        const properties = schemaNode.properties || {};
        const required = schemaNode.required || [];
        const uiSettings = schemaNode.ui || {};
        
        let childrenHtml = '';
        Object.keys(properties).forEach(propName => {
            childrenHtml += this.renderSchemaNode(properties[propName], propName, required);
        });
        
        const title = schemaNode.title || schemaName;
        const inlineHelp = uiSettings.inlineHint ? `<div class="j-inline-help">${uiSettings.inlineHint}</div>` : '';
        
        return `
            <div class="j-object-container" data-value-name="${schemaName}">
                <div class="j-object-header">
                    <button type="button" class="j-expand-collapse-btn j-collapse-btn">-</button>
                    <label class="j-field-label">${title}</label>
                    ${inlineHelp}
                </div>
                <div class="j-object-body">
                    ${childrenHtml}
                </div>
            </div>
        `;
    }
    
    _renderArrayNode(schemaNode, schemaName) {
        const title = schemaNode.title || schemaName;
        const templateId = `${schemaName}_${Date.now()}`;
        const uiSettings = schemaNode.ui || {};
        
        // Store template for later use
        const itemSchema = schemaNode.items || { type: 'string' };
        const itemTemplate = this._createArrayItemTemplate(itemSchema, templateId);
        
        this.jsonToForm.arrayTemplates = this.jsonToForm.arrayTemplates || {};
        this.jsonToForm.arrayTemplates[templateId] = {
            htmlTemplate: itemTemplate,
            dataTemplate: this._getDefaultValueForType(itemSchema.type || 'string')
        };
        
        const inlineHelp = uiSettings.inlineHint ? `<div class="j-inline-help">${uiSettings.inlineHint}</div>` : '';
        
        return `
            <div class="j-array-container" data-value-name="${schemaName}">
                <div class="j-array-header">
                    <button type="button" class="j-expand-collapse-btn j-collapse-btn">-</button>
                    <label class="j-field-label">${title}</label>
                    <button type="button" class="j-add-array-item" data-template-id="${templateId}" data-array-loaded="false">+ Add Item</button>
                    ${inlineHelp}
                </div>
                <div class="j-array-body"></div>
            </div>
        `;
    }
    
    _renderSpacerNode(schemaNode, schemaName) {
        const title = schemaNode.title || '';
        return `<div class="j-spacer-row">${title}</div>`;
    }
    
    _createArrayItemTemplate(itemSchema, templateId) {
        const removeButton = '<button type="button" class="j-remove-array-item" data-index="$index$">× Remove</button>';
        const modifiedSchema = { ...itemSchema, title: `${itemSchema.title || ''} [$index$] ${removeButton}` };
        
        return `<div class="j-array-item">${this.renderSchemaNode(modifiedSchema, '$index$')}</div>`;
    }
    
    _renderSelect(options, attributes, isRequired) {
        let html = `<select class="j-input j-input-select" ${this._attributesToString(attributes)}>`;
        
        if (!isRequired) {
            html += '<option value="" selected></option>';
        }
        
        options.forEach(option => {
            html += `<option value="${option}">${option}</option>`;
        });
        
        html += '</select>';
        return html;
    }
    
    _buildFieldAttributes(schemaNode, schemaName, isRequired) {
        const attributes = {
            'data-value-name': schemaName
        };
        
        if (isRequired) attributes['data-required'] = 'true';
        if (schemaNode.minLength !== undefined) attributes['data-min'] = schemaNode.minLength;
        if (schemaNode.maxLength !== undefined) attributes['data-max'] = schemaNode.maxLength;
        if (schemaNode.minimum !== undefined) attributes['data-min'] = schemaNode.minimum;
        if (schemaNode.maximum !== undefined) attributes['data-max'] = schemaNode.maximum;
        if (schemaNode.pattern) attributes['data-pattern'] = schemaNode.pattern;
        
        const uiSettings = schemaNode.ui || {};
        if (uiSettings.disabled) attributes['disabled'] = 'disabled';
        if (uiSettings.placeholder) attributes['placeholder'] = uiSettings.placeholder;
        
        return attributes;
    }
    
    _getDefaultEditor(nodeType) {
        const editorMap = {
            'string': 'text',
            'number': 'number',
            'integer': 'number',
            'boolean': 'checkbox',
            'email': 'email',
            'tel': 'tel',
            'date': 'date',
            'url': 'url'
        };
        
        return editorMap[nodeType] || 'text';
    }
    
    _attributesToString(attributes) {
        return Object.entries(attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
    }
    
    _getDefaultValueForType(type) {
        const defaults = {
            'string': '',
            'number': 0,
            'integer': 0,
            'boolean': false,
            'array': [],
            'object': {}
        };
        
        return defaults[type] || '';
    }
    
    addArrayItem($addButton, needsReinitialization, itemIndex) {
        const templateId = $addButton.attr('data-template-id');
        const template = this.jsonToForm.arrayTemplates[templateId];
        
        if (!template) {
            console.error('Array template not found:', templateId);
            return;
        }
        
        const $arrayContainer = $addButton.closest('.j-array-container');
        const dataPath = $arrayContainer.attr('data-path') || $arrayContainer.attr('data-value-name');
        
        // Initialize array if needed
        const arrayValue = this.jsonToForm.utils.getNestedValue(this.jsonToForm.config.value, dataPath);
        if (!Array.isArray(arrayValue)) {
            this.jsonToForm.utils.setNestedValue(this.jsonToForm.config.value, `['${dataPath}']`, []);
        }
        
        // Add data item if new
        if (itemIndex === null) {
            const currentArray = this.jsonToForm.utils.getNestedValue(this.jsonToForm.config.value, `['${dataPath}']`);
            currentArray.push(JSON.parse(JSON.stringify(template.dataTemplate)));
            itemIndex = currentArray.length - 1;
        }
        
        // Generate HTML from template
        let itemHtml = template.htmlTemplate.replace(/\$index\$/g, itemIndex);
        
        // Find the array body and append
        const $arrayBody = $addButton.closest('.j-array-header').next('.j-array-body');
        $arrayBody.append(itemHtml);
        
        if (needsReinitialization) {
            this.jsonToForm._initValuePaths();
            this.jsonToForm.eventHandler.initialize();
        }
    }
}

// Main JsonToForm Class
class JsonToForm {
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
    
    _initializeConfig(options) {
        const defaults = {
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
        
        return this.utils.deepMerge(defaults, options);
    }
    
    _initialize() {
        this.level = 0;
        this.arrayTemplates = {};
        
        const widgetContent = this.renderer.renderSchemaNode(this.config.schema, "");
        this.element.html(widgetContent);
        
        this._initValuePaths();
        this.setValue(this.config.value);
        this.eventHandler.initialize();
        this.validator.validateAll();
        
        if (this.config.callbacks.afterWidgetCreated) {
            this.config.callbacks.afterWidgetCreated(this.config.value, this.config.schema);
        }
    }
    
    _initValuePaths() {
        this.element.find("[data-value-name]").each((index, element) => {
            const $element = $(element);
            const dataPath = this.utils.generatePath($element);
            $element.attr("data-path", dataPath);
            
            if (dataPath) {
                const elementId = this.utils.getIdBasedDataPath(dataPath, this.element.attr("id"));
                $element.attr("id", elementId);
                $element.find("label:first").attr("for", elementId);
            }
        });
    }
    
    isValid() {
        return this.validator.isFormValid();
    }
    
    getSchema() {
        return this.config.schema;
    }
    
    getValue() {
        return this.config.value;
    }
    
    setValue(value) {
        this.config.value = value;
        this._addArrayItemsToDOM();
        this._populateFormValues();
    }
    
    updateSchema(schema) {
        this.config.schema = schema;
        this._initialize();
    }
    
    destroy() {
        this.eventHandler.destroy();
        this.element.empty();
    }
    
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
        
        this._addArrayItemsToDOM();
    }
    
    _getArrayDataPath($addBtn) {
        let dataPath = $addBtn.closest('.j-array-container').attr('data-path');
        
        if (!dataPath) {
            const $container = $addBtn.closest('.j-array-container');
            dataPath = this.utils.generatePath($container);
            $container.attr('data-path', dataPath);
        }
        
        return dataPath;
    }
    
    _populateFormValues() {
        this.element.find("input[data-path], select[data-path], textarea[data-path]").each((index, element) => {
            const $element = $(element);
            const dataPath = $element.attr("data-path");
            const value = this.utils.getNestedValue(this.config.value, dataPath);
            
            this._setElementValue($element, value);
        });
    }
    
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
        }
    }
}

// jQuery Plugin
(function($) {
    'use strict';
    
    const PLUGIN_NAME = 'jsonToForm';
    const PLUGIN_VERSION = '2.0.0';
    
    $.fn.jsonToForm = function(options) {
        if (this.length > 1) {
            return this.each(function() {
                $(this).jsonToForm(options);
            });
        }
        
        const $element = this.first();
        
        const existingInstance = $element.data(PLUGIN_NAME);
        if (existingInstance) {
            return existingInstance;
        }
        
        const instance = new JsonToForm($element, options);
        $element.data(PLUGIN_NAME, instance);
        
        return instance;
    };
    
    $.fn.jsonToForm.version = PLUGIN_VERSION;
    
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
    
})(jQuery);