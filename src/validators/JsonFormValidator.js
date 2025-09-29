/**
 * JsonFormValidator - Validation engine for JsonToForm
 * 
 * @class JsonFormValidator
 */
class JsonFormValidator {
    
    constructor(jsonToForm) {
        this.jsonToForm = jsonToForm;
        this.validationRules = this._initializeValidationRules();
    }
    
    /**
     * Initialize built-in validation rules
     * @private
     */
    _initializeValidationRules() {
        return {
            // Email validation
            email: {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Please enter a valid email address'
            },
            
            // Phone number validation
            tel: {
                pattern: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
                message: 'Please enter a valid phone number'
            },
            
            // URL validation
            url: {
                pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
                message: 'Please enter a valid URL'
            },
            
            // Credit card validation (basic Luhn algorithm)
            creditCard: {
                validate: (value) => this._validateCreditCard(value),
                message: 'Please enter a valid credit card number'
            },
            
            // Strong password validation
            strongPassword: {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must contain at least 8 characters including uppercase, lowercase, number and special character'
            }
        };
    }
    
    /**
     * Validate all form inputs
     */
    validateAll() {
        const inputs = this.jsonToForm.element.find(".j-input");
        inputs.each((index, element) => {
            this.validateInput($(element));
        });
    }
    
    /**
     * Validate a single input element
     * @param {jQuery} $element - Input element to validate
     * @returns {Object} Validation result
     */
    validateInput($element) {
        const result = {
            isValid: true,
            errors: [],
            element: $element
        };
        
        // Execute before validation callback
        if (this.jsonToForm.config.callbacks.beforeValidation) {
            this.jsonToForm.config.callbacks.beforeValidation($element, result);
        }
        
        // Get validation parameters
        const isRequired = $element.attr("data-required") === "true";
        const minValue = this._parseNumeric($element.attr("data-min"));
        const maxValue = this._parseNumeric($element.attr("data-max"));
        const pattern = $element.attr("data-pattern");
        const customRule = $element.attr("data-validation-rule");
        
        // Get current value
        const value = this._getElementValue($element);
        
        // Required validation
        if (isRequired && this.jsonToForm.utils.isEmpty(value)) {
            result.isValid = false;
            result.errors.push('This field is required');
        } else if (!this.jsonToForm.utils.isEmpty(value)) {
            // Only validate other rules if field has value
            
            // Length/value range validation
            this._validateRange($element, value, minValue, maxValue, result);
            
            // Pattern validation
            this._validatePattern($element, value, pattern, result);
            
            // Input type specific validation
            this._validateInputType($element, value, result);
            
            // Custom rule validation
            this._validateCustomRule($element, value, customRule, result);
        }
        
        // Update element validation state
        this._updateElementValidationState($element, result);
        
        // Execute after validation callback
        if (this.jsonToForm.config.callbacks.afterValidation) {
            this.jsonToForm.config.callbacks.afterValidation($element, result);
        }
        
        return result;
    }
    
    /**
     * Get element value based on type
     * @private
     */
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
    
    /**
     * Validate range (length for strings, value for numbers)
     * @private
     */
    _validateRange($element, value, minValue, maxValue, result) {
        if ($element.hasClass("j-input-text") || $element.hasClass("j-input-textarea")) {
            // String length validation
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
            // Numeric value validation
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
    
    /**
     * Validate pattern
     * @private
     */
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
    
    /**
     * Validate based on input type
     * @private
     */
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
        } else if ($element.hasClass("j-input-radio")) {
            // Radio button group validation
            const name = $element.attr("name");
            const isChecked = this.jsonToForm.element.find(`input[name="${name}"]:checked`).length > 0;
            
            if ($element.attr("data-required") === "true" && !isChecked) {
                result.isValid = false;
                result.errors.push('Please select an option');
                
                // Set validation state on the container
                $element.closest('div[data-required]').attr("data-is-valid", "false");
            } else {
                $element.closest('div[data-required]').attr("data-is-valid", "true");
            }
        }
    }
    
    /**
     * Validate custom rule
     * @private
     */
    _validateCustomRule($element, value, customRule, result) {
        if (customRule) {
            // Check built-in rules
            if (this.validationRules[customRule]) {
                this._applyValidationRule(value, customRule, result);
            }
            
            // Check user-defined custom rules
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
    
    /**
     * Apply a validation rule
     * @private
     */
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
    
    /**
     * Update element validation state
     * @private
     */
    _updateElementValidationState($element, result) {
        $element.attr("data-is-valid", result.isValid ? "true" : "false");
        
        // Remove existing validation messages
        $element.siblings('.j-validation-message').remove();
        
        // Add validation messages if configured
        if (!result.isValid && this.jsonToForm.config.validation.showHints && result.errors.length > 0) {
            const errorMessage = result.errors[0]; // Show first error
            const messageHtml = `<div class="j-validation-message">${this.jsonToForm.utils.escapeHtml(errorMessage)}</div>`;
            $element.after(messageHtml);
        }
    }
    
    /**
     * Check if entire form is valid
     * @returns {boolean} True if form is valid
     */
    isFormValid() {
        return this.jsonToForm.element.find('[data-is-valid="false"]').length === 0;
    }
    
    /**
     * Get all validation errors
     * @returns {Array} Array of validation errors
     */
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
    
    /**
     * Clear all validation messages
     */
    clearValidationMessages() {
        this.jsonToForm.element.find('.j-validation-message').remove();
        this.jsonToForm.element.find('[data-is-valid]').attr('data-is-valid', 'true');
    }
    
    /**
     * Add custom validation rule
     * @param {string} name - Rule name
     * @param {Object} rule - Rule definition
     */
    addCustomRule(name, rule) {
        this.validationRules[name] = rule;
    }
    
    /**
     * Helper method to parse numeric values
     * @private
     */
    _parseNumeric(value) {
        return value ? parseFloat(value) : null;
    }
    
    /**
     * Validate credit card number using Luhn algorithm
     * @private
     */
    _validateCreditCard(cardNumber) {
        if (!cardNumber) return false;
        
        const number = cardNumber.replace(/\D/g, '');
        if (number.length < 13 || number.length > 19) return false;
        
        let sum = 0;
        let shouldDouble = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number.charAt(i));
            
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        
        return sum % 10 === 0;
    }
}

// Export for module systems or global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonFormValidator;
} else if (typeof window !== 'undefined') {
    window.JsonFormValidator = JsonFormValidator;
}