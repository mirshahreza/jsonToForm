/**
 * JsonFormUtils - Utility functions for JsonToForm
 * 
 * @class JsonFormUtils
 */
class JsonFormUtils {
    
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
    }
    
    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
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
    
    /**
     * Check if value is an object
     * @param {*} value - Value to check
     * @returns {boolean} True if object
     */
    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    
    /**
     * Generate data path for an element
     * @param {jQuery} element - jQuery element
     * @returns {string} Generated path
     */
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
    
    /**
     * Get ID-based data path for form elements
     * @param {string} dataPath - Data path
     * @param {string} containerId - Container ID
     * @returns {string} Element ID
     */
    getIdBasedDataPath(dataPath, containerId) {
        let id = dataPath
            .replace(/\]\[/g, '_')
            .replace(/[\[\]"']/g, '');
        
        return `${containerId}_${id}`;
    }
    
    /**
     * Get nested value from object using path
     * @param {Object} obj - Object to traverse
     * @param {string} path - Path string
     * @returns {*} Value at path
     */
    getNestedValue(obj, path) {
        try {
            // Convert path format to property access
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
    
    /**
     * Set nested value in object using path
     * @param {Object} obj - Object to modify
     * @param {string} path - Path string
     * @param {*} value - Value to set
     */
    setNestedValue(obj, path, value) {
        try {
            // Convert path format to property access
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
    
    /**
     * Ensure data path exists in object
     * @param {Object} obj - Object to modify
     * @param {string} dataPath - Data path to ensure
     */
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
    
    /**
     * Escape JSON string for safe usage
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    jsonEscape(str) {
        if (!str) return '';
        return str.toString()
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/"/g, '\\"');
    }
    
    /**
     * Replace all occurrences of a string
     * @param {string} source - Source string
     * @param {string} find - String to find
     * @param {string} replace - Replacement string
     * @returns {string} Modified string
     */
    replaceAll(source, find, replace) {
        if (!source) return '';
        return source.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
    
    /**
     * Escape string for use in regular expression
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Fix null/undefined values with default
     * @param {*} value - Value to check
     * @param {*} defaultValue - Default value if null/undefined
     * @returns {*} Fixed value
     */
    fixNullUndefined(value, defaultValue) {
        return value !== null && value !== undefined ? value : defaultValue;
    }
    
    /**
     * Get UI setting from schema node
     * @param {Object} schemaNode - Schema node
     * @param {string} settingName - Setting name
     * @param {*} defaultValue - Default value
     * @returns {*} Setting value
     */
    getUISetting(schemaNode, settingName, defaultValue) {
        if (schemaNode && schemaNode.ui && schemaNode.ui[settingName] !== undefined) {
            return schemaNode.ui[settingName];
        }
        return defaultValue;
    }
    
    /**
     * Get array type from schema node
     * @param {Object} schemaNode - Schema node
     * @returns {string} Array type
     */
    getArrayType(schemaNode) {
        if (schemaNode.items && schemaNode.items.type) {
            return schemaNode.items.type;
        }
        
        if (schemaNode.items && schemaNode.items.$ref) {
            return schemaNode.items.$ref;
        }
        
        return "string";
    }
    
    /**
     * Generate spacer HTML for indentation
     * @param {number} level - Indentation level
     * @returns {string} Spacer HTML
     */
    generateSpacer(level) {
    const adjustedLevel = Math.max(0, level - 1);
    const spaceCount = adjustedLevel * this.jsonToForm.config.indenting;
        const spaces = '&nbsp;'.repeat(spaceCount);
        
        return `<span class="j-spacer">${spaces}</span>`;
    }
    
    /**
     * Generate expand/collapse button
     * @param {string} type - Button type ('e' for expand, 'c' for collapse, '' for none)
     * @returns {string} Button HTML
     */
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
    
    /**
     * Generate title HTML
     * @param {Object} schemaNode - Schema node
     * @param {string} schemaName - Schema name
     * @returns {string} Title HTML
     */
    generateTitle(schemaNode, schemaName) {
        const title = this.fixNullUndefined(schemaNode.title, schemaName);
        return `<label class="j-field-label">${this.escapeHtml(title)}</label>`;
    }
    
    /**
     * Escape HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
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
    
    /**
     * Check if value is empty (null, undefined, empty string, empty array)
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        return false;
    }
}

// Export for module systems or global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonFormUtils;
} else if (typeof window !== 'undefined') {
    window.JsonFormUtils = JsonFormUtils;
}