/**
 * JsonFormRenderer - HTML rendering engine for JsonToForm
 * 
 * @class JsonFormRenderer
 */
class JsonFormRenderer {
    
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
        this.templates = this._initializeTemplates();
    }
    
    /**
     * Initialize HTML templates
     * @private
     */
    _initializeTemplates() {
        return {
            container: '<div class="j-container" $hover-hint$>$$$</div>',
            fieldRow: '<div class="j-field-row j-field-$type$">$$$</div>',
            fieldLabel: '<div class="j-field-label-col">$$$</div>',
            fieldInput: '<div class="j-field-input-col">$$$</div>',
            objectContainer: '<div class="j-object-container">$$$</div>',
            objectHeader: '<div class="j-object-header $class$">$$$</div>',
            objectBody: '<div class="j-object-body $class$">$$$</div>',
            arrayContainer: '<div class="j-array-container">$$$</div>',
            arrayHeader: '<div class="j-array-header">$$$</div>',
            arrayBody: '<div class="j-array-body">$$$</div>',
            arrayItem: '<div class="j-array-item" data-array-index="$index$">$$$</div>',
            spacer: '<div class="j-spacer-row">$$$</div>',
            inlineHelp: '<div class="j-inline-help">$$$</div>',
            validationHelp: '<div class="j-validation-help">$$$</div>',
            requiredStar: '<span class="j-required-star">*</span>',
            expandButton: '<button type="button" class="j-expand-collapse-btn j-$state$-btn" aria-label="$action$">$icon$</button>',
            arrayControls: '<div class="j-array-controls">$$$</div>',
            addButton: '<button type="button" class="j-add-array-item" data-template-id="$template-id$" data-array-loaded="false">$icon$ Add Item</button>',
            removeButton: '<button type="button" class="j-remove-array-item" data-index="$index$">$icon$ Remove</button>'
        };
    }
    
    /**
     * Render a schema node
     * @param {Object} schemaNode - Schema node to render
     * @param {string} schemaName - Name of the schema node
     * @param {Array} requiredItems - List of required field names
     * @returns {string} Rendered HTML
     */
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
    
    /**
     * Render a simple input field node
     * @private
     */
    _renderSimpleNode(schemaNode, schemaName, isRequired) {
        const nodeType = schemaNode.type || 'string';
        const uiSettings = schemaNode.ui || {};
        
        // Build field attributes
        const attributes = this._buildFieldAttributes(schemaNode, schemaName, isRequired);
        const fieldClass = this._getFieldClass(nodeType, uiSettings);
        const inputHtml = this._renderInputElement(schemaNode, schemaName, attributes, fieldClass);
        
        // Build help content
        const helpContent = this._buildHelpContent(uiSettings);
        
        // Build label
        const labelContent = this._buildLabelContent(schemaNode, schemaName, isRequired);
        
        // Assemble field
        const labelHtml = this.templates.fieldLabel.replace('$$$', labelContent);
        const inputWithHelp = inputHtml + helpContent;
        const inputHtml_final = this.templates.fieldInput.replace('$$$', inputWithHelp);
        
        const fieldContent = labelHtml + inputHtml_final;
        const fieldHtml = this.templates.fieldRow
            .replace('$type$', nodeType)
            .replace('$$$', fieldContent);
        
        // Add hover hint if present
        const hoverHint = uiSettings.hoverHint ? `title="${this.jsonToForm.utils.escapeHtml(uiSettings.hoverHint)}"` : '';
        
        return this.templates.container
            .replace('$hover-hint$', hoverHint)
            .replace('$$$', fieldHtml);
    }
    
    /**
     * Render an object node
     * @private
     */
    _renderObjectNode(schemaNode, schemaName) {
        const uiSettings = schemaNode.ui || {};
        const properties = schemaNode.properties || {};
        const required = schemaNode.required || [];
        
        const shouldShowHeader = this.jsonToForm.config.renderFirstLevel || this.jsonToForm.level > 0;
        const isCollapsed = this.jsonToForm.config.expandingLevel !== -1 && 
                           this.jsonToForm.level + 1 > this.jsonToForm.config.expandingLevel;
        
        let headerHtml = '';
        if (shouldShowHeader) {
            const expandButton = this.jsonToForm.config.treeExpandCollapseButton ? 
                this._renderExpandCollapseButton(isCollapsed ? 'expand' : 'collapse') : '';
            const title = this.jsonToForm.utils.generateTitle(schemaNode, schemaName);
            const spacer = this.jsonToForm.utils.generateSpacer(this.jsonToForm.level);
            const inlineHelp = uiSettings.inlineHint ? 
                this.templates.inlineHelp.replace('$$$', this.jsonToForm.utils.escapeHtml(uiSettings.inlineHint)) : '';
            
            headerHtml = this.templates.objectHeader
                .replace('$class$', isCollapsed ? 'j-collapsed' : '')
                .replace('$$$', spacer + expandButton + title + inlineHelp);
        }
        
        // Render child properties
        this.jsonToForm.level++;
        let childrenHtml = '';
        
        Object.keys(properties).forEach(propName => {
            const propSchema = properties[propName];
            childrenHtml += this.renderSchemaNode(propSchema, propName, required);
        });
        
        this.jsonToForm.level--;
        
        const bodyClass = isCollapsed ? 'j-collapsed' : '';
        const bodyHtml = this.templates.objectBody
            .replace('$class$', bodyClass)
            .replace('$$$', childrenHtml);
        
        const containerContent = headerHtml + bodyHtml;
        const containerHtml = this.templates.objectContainer
            .replace('$$$', containerContent);
        
        // Add data attributes
        const dataAttr = schemaName ? `data-value-name="${schemaName}"` : '';
        
        return containerHtml.replace('<div class="j-object-container"', 
                                   `<div class="j-object-container" ${dataAttr}`);
    }
    
    /**
     * Render an array node
     * @private
     */
    _renderArrayNode(schemaNode, schemaName) {
        const uiSettings = schemaNode.ui || {};
        const itemSchema = schemaNode.items || { type: 'string' };
        const isCollapsed = this.jsonToForm.config.expandingLevel !== -1 && 
                           this.jsonToForm.level + 1 > this.jsonToForm.config.expandingLevel;
        
        const templateId = `${schemaName}_${this.jsonToForm.level}`;
        
        // Render header
        const expandButton = this.jsonToForm.config.treeExpandCollapseButton ? 
            this._renderExpandCollapseButton(isCollapsed ? 'expand' : 'collapse') : '';
        const title = this.jsonToForm.utils.generateTitle(schemaNode, schemaName);
        const spacer = this.jsonToForm.utils.generateSpacer(this.jsonToForm.level);
        const addButton = this._renderAddButton(templateId);
        const inlineHelp = uiSettings.inlineHint ? 
            this.templates.inlineHelp.replace('$$$', this.jsonToForm.utils.escapeHtml(uiSettings.inlineHint)) : '';
        
        const headerContent = spacer + expandButton + title + addButton + inlineHelp;
        const headerHtml = this.templates.arrayHeader.replace('$$$', headerContent);
        
        // Create item template
        const itemTemplate = this._createArrayItemTemplate(itemSchema, templateId);
        
        // Store template for later use
        this.jsonToForm.arrayTemplates[templateId] = {
            htmlTemplate: itemTemplate,
            dataTemplate: this._getDefaultValueForType(itemSchema.type || 'string')
        };
        
        const bodyClass = isCollapsed ? 'j-collapsed' : '';
        const bodyHtml = this.templates.arrayBody
            .replace('$class$', bodyClass)
            .replace('$$$', ''); // Items will be added dynamically
        
        const containerContent = headerHtml + bodyHtml;
        const containerHtml = this.templates.arrayContainer.replace('$$$', containerContent);
        
        // Add data attributes
        const dataAttr = schemaName ? `data-value-name="${schemaName}"` : '';
        
        return containerHtml.replace('<div class="j-array-container"', 
                                   `<div class="j-array-container" ${dataAttr}`);
    }
    
    /**
     * Render a spacer node
     * @private
     */
    _renderSpacerNode(schemaNode, schemaName) {
        const title = schemaNode.title || '';
        return this.templates.spacer.replace('$$$', this.jsonToForm.utils.escapeHtml(title));
    }
    
    /**
     * Create array item template
     * @private
     */
    _createArrayItemTemplate(itemSchema, templateId) {
        this.jsonToForm.level++;
        
        let itemHtml;
        const itemType = itemSchema.type || 'string';
        
        if (['string', 'number', 'integer', 'boolean', 'email', 'tel'].includes(itemType)) {
            // Clone schema and add remove button to title
            const modifiedSchema = { ...itemSchema };
            const removeButton = this._renderRemoveButton('$index$');
            modifiedSchema.title = `${itemSchema.title || ''} [$index$] ${removeButton}`;
            
            itemHtml = this._renderSimpleNode(modifiedSchema, '$index$', false);
        } else if (itemType.startsWith('#/')) {
            // Reference to definition
            const refPath = itemType.replace('#/', '').split('/');
            let refSchema = this.jsonToForm.config.schema;
            
            refPath.forEach(part => {
                refSchema = refSchema[part];
            });
            
            if (refSchema) {
                const modifiedSchema = { ...refSchema };
                const removeButton = this._renderRemoveButton('$index$');
                modifiedSchema.title = `${refSchema.title || ''} [$index$] ${removeButton}`;
                
                itemHtml = this.renderSchemaNode(modifiedSchema, '$index$');
            }
        } else {
            // Object or other complex type
            const modifiedSchema = { ...itemSchema };
            const removeButton = this._renderRemoveButton('$index$');
            modifiedSchema.title = `${itemSchema.title || ''} [$index$] ${removeButton}`;
            
            itemHtml = this.renderSchemaNode(modifiedSchema, '$index$');
        }
        
        this.jsonToForm.level--;
        
        return this.templates.arrayItem.replace('$$$', itemHtml);
    }
    
    /**
     * Build field attributes
     * @private
     */
    _buildFieldAttributes(schemaNode, schemaName, isRequired) {
        const attributes = {
            'data-value-name': schemaName,
            'class': 'j-input'
        };
        
        if (isRequired) {
            attributes['data-required'] = 'true';
        }
        
        // Min/Max attributes
        if (schemaNode.minLength !== undefined) attributes['data-min'] = schemaNode.minLength;
        if (schemaNode.maxLength !== undefined) attributes['data-max'] = schemaNode.maxLength;
        if (schemaNode.minimum !== undefined) attributes['data-min'] = schemaNode.minimum;
        if (schemaNode.maximum !== undefined) attributes['data-max'] = schemaNode.maximum;
        
        // Pattern attribute
        if (schemaNode.pattern) attributes['data-pattern'] = schemaNode.pattern;
        
        // UI settings
        const uiSettings = schemaNode.ui || {};
        if (uiSettings.disabled) attributes['disabled'] = 'disabled';
        if (uiSettings.placeholder) attributes['placeholder'] = uiSettings.placeholder;
        if (uiSettings.validationRule) attributes['data-validation-rule'] = uiSettings.validationRule;
        if (uiSettings.class) attributes['class'] += ` ${uiSettings.class}`;
        
        return attributes;
    }
    
    /**
     * Get field CSS class
     * @private
     */
    _getFieldClass(nodeType, uiSettings) {
        const editor = uiSettings.editor || this._getDefaultEditor(nodeType);
        return `j-input-${editor}`;
    }
    
    /**
     * Get default editor type for node type
     * @private
     */
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
    
    /**
     * Render input element based on type and settings
     * @private
     */
    _renderInputElement(schemaNode, schemaName, attributes, fieldClass) {
        const nodeType = schemaNode.type || 'string';
        const uiSettings = schemaNode.ui || {};
        const editor = uiSettings.editor || this._getDefaultEditor(nodeType);
        
        attributes.class += ` ${fieldClass}`;
        
        // Handle enum values (select/radio)
        if (schemaNode.enum) {
            return this._renderEnumInput(schemaNode, attributes, editor);
        }
        
        // Handle different input types
        switch (editor) {
            case 'textarea':
                return this._renderTextarea(attributes);
            case 'checkbox':
                return this._renderCheckbox(attributes);
            case 'html':
                return this._renderHtmlEditor(attributes);
            case 'color':
                return this._renderColorInput(attributes);
            default:
                return this._renderTextInput(editor, attributes);
        }
    }
    
    /**
     * Render enum input (select or radio)
     * @private
     */
    _renderEnumInput(schemaNode, attributes, editor) {
        const isRequired = attributes['data-required'] === 'true';
        const options = schemaNode.enum || [];
        
        if (editor === 'radio') {
            return this._renderRadioGroup(options, attributes, isRequired);
        } else {
            return this._renderSelect(options, attributes, isRequired);
        }
    }
    
    /**
     * Render radio group
     * @private
     */
    _renderRadioGroup(options, attributes, isRequired) {
        const radioName = `rdo_${Math.random().toString(36).substr(2, 9)}`;
        let html = '<div class="j-radio-group"';
        
        if (isRequired) {
            html += ' data-required="true" data-is-valid="false"';
        }
        
        html += '>';
        
        // Add null option if not required
        if (!isRequired) {
            html += `
                <label class="j-radio-option">
                    <input type="radio" name="${radioName}" value="${this.jsonToForm.config.radioNullCaption}" 
                           class="${attributes.class}" data-value-name="${attributes['data-value-name']}" 
                           ${attributes.disabled ? 'disabled' : ''} checked />
                    <span class="j-radio-label">null</span>
                </label>
            `;
        }
        
        // Add options
        options.forEach(option => {
            html += `
                <label class="j-radio-option">
                    <input type="radio" name="${radioName}" value="${this.jsonToForm.utils.escapeHtml(option)}" 
                           class="${attributes.class}" data-value-name="${attributes['data-value-name']}" 
                           ${attributes.disabled ? 'disabled' : ''} />
                    <span class="j-radio-label">${this.jsonToForm.utils.escapeHtml(option)}</span>
                </label>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Render select dropdown
     * @private
     */
    _renderSelect(options, attributes, isRequired) {
        let html = `<select ${this._attributesToString(attributes)}>`;
        
        // Add null option if not required
        if (!isRequired) {
            html += `<option value="" selected>${this.jsonToForm.config.selectNullCaption}</option>`;
        }
        
        // Add options
        options.forEach(option => {
            html += `<option value="${this.jsonToForm.utils.escapeHtml(option)}">${this.jsonToForm.utils.escapeHtml(option)}</option>`;
        });
        
        html += '</select>';
        return html;
    }
    
    /**
     * Render textarea
     * @private
     */
    _renderTextarea(attributes) {
        const rows = attributes.rows || 4;
        return `<textarea rows="${rows}" ${this._attributesToString(attributes)}></textarea>`;
    }
    
    /**
     * Render checkbox
     * @private
     */
    _renderCheckbox(attributes) {
        return `<input type="checkbox" ${this._attributesToString(attributes)} />`;
    }
    
    /**
     * Render HTML editor
     * @private
     */
    _renderHtmlEditor(attributes) {
        const hiddenInput = `<input type="hidden" ${this._attributesToString(attributes)} />`;
        const editableDiv = `<div class="j-input-html-div" contenteditable="true" ${attributes.disabled ? '' : ''}></div>`;
        return hiddenInput + editableDiv;
    }
    
    /**
     * Render color input
     * @private
     */
    _renderColorInput(attributes) {
        return `<input type="color" ${this._attributesToString(attributes)} />`;
    }
    
    /**
     * Render text input
     * @private
     */
    _renderTextInput(inputType, attributes) {
        return `<input type="${inputType}" ${this._attributesToString(attributes)} />`;
    }
    
    /**
     * Build help content (inline and validation hints)
     * @private
     */
    _buildHelpContent(uiSettings) {
        let helpHtml = '';
        
        if (uiSettings.inlineHint) {
            helpHtml += this.templates.inlineHelp.replace('$$$', 
                this.jsonToForm.utils.escapeHtml(uiSettings.inlineHint));
        }
        
        if (uiSettings.validationHint) {
            helpHtml += this.templates.validationHelp.replace('$$$', 
                this.jsonToForm.utils.escapeHtml(uiSettings.validationHint));
        }
        
        return helpHtml;
    }
    
    /**
     * Build label content
     * @private
     */
    _buildLabelContent(schemaNode, schemaName, isRequired) {
        const spacer = this.jsonToForm.utils.generateSpacer(this.jsonToForm.level);
        const expandButton = ''; // Simple fields don't need expand buttons
        const title = this.jsonToForm.utils.generateTitle(schemaNode, schemaName);
        const requiredStar = isRequired ? this.templates.requiredStar : '';
        
        return spacer + expandButton + title + requiredStar;
    }
    
    /**
     * Render expand/collapse button
     * @private
     */
    _renderExpandCollapseButton(state) {
        const iconMap = {
            expand: '+',
            collapse: '-'
        };
        
        const actionMap = {
            expand: 'Expand',
            collapse: 'Collapse'
        };
        
        return this.templates.expandButton
            .replace('$state$', state)
            .replace('$action$', actionMap[state])
            .replace('$icon$', iconMap[state]);
    }
    
    /**
     * Render add array item button
     * @private
     */
    _renderAddButton(templateId) {
        return this.templates.addButton
            .replace('$template-id$', templateId)
            .replace('$icon$', '+');
    }
    
    /**
     * Render remove array item button
     * @private
     */
    _renderRemoveButton(index) {
        return this.templates.removeButton
            .replace('$index$', index)
            .replace('$icon$', '×');
    }
    
    /**
     * Convert attributes object to HTML string
     * @private
     */
    _attributesToString(attributes) {
        return Object.entries(attributes)
            .map(([key, value]) => `${key}="${this.jsonToForm.utils.escapeHtml(value)}"`)
            .join(' ');
    }
    
    /**
     * Get default value for a given type
     * @private
     */
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
    
    /**
     * Add array item to the DOM
     * @param {jQuery} $addButton - Add button element
     * @param {boolean} needsReinitialization - Whether to reinitialize events
     * @param {number} itemIndex - Item index (null for new items)
     */
    addArrayItem($addButton, needsReinitialization, itemIndex) {
        const templateId = $addButton.attr('data-template-id');
        const template = this.jsonToForm.arrayTemplates[templateId];
        
        if (!template) {
            console.error('Array template not found:', templateId);
            return;
        }
        
        const dataPath = this._getArrayDataPath($addButton);
        
        // Initialize array if needed
        const arrayValue = this.jsonToForm.utils.getNestedValue(this.jsonToForm.config.value, dataPath);
        if (!Array.isArray(arrayValue)) {
            this.jsonToForm.utils.setNestedValue(this.jsonToForm.config.value, dataPath, []);
        }
        
        // Add data item if new
        if (itemIndex === null) {
            const currentArray = this.jsonToForm.utils.getNestedValue(this.jsonToForm.config.value, dataPath);
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
    
    /**
     * Get array data path from add button
     * @private
     */
    _getArrayDataPath($addButton) {
        const $arrayContainer = $addButton.closest('.j-array-container');
        let dataPath = $arrayContainer.attr('data-path');
        
        if (!dataPath) {
            dataPath = this.jsonToForm.utils.generatePath($arrayContainer);
            $arrayContainer.attr('data-path', dataPath);
        }
        
        return dataPath;
    }
}

// Export for module systems or global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonFormRenderer;
} else if (typeof window !== 'undefined') {
    window.JsonFormRenderer = JsonFormRenderer;
}