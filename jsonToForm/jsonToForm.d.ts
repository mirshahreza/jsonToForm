/**
 * JsonToForm v2.0.0 TypeScript Definitions
 * 
 * Provides type safety and IntelliSense support for JsonToForm plugin
 */

declare namespace JsonToForm {
    
    // ===== INTERFACES =====
    
    interface JsonSchema {
        type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'spacer' | 'email' | 'tel' | 'url' | 'date' | 'color';
        title?: string;
        description?: string;
        
        // String/Number constraints
        minLength?: number;
        maxLength?: number;
        minimum?: number;
        maximum?: number;
        pattern?: string;
        
        // Array constraints
        items?: JsonSchema;
        
        // Object constraints
        properties?: { [key: string]: JsonSchema };
        required?: string[];
        
        // Enum values
        enum?: any[];
        
        // Reference to definitions
        $ref?: string;
        
        // UI configuration
        ui?: UIConfiguration;
        
        // Schema definitions
        definitions?: { [key: string]: JsonSchema };
    }
    
    interface UIConfiguration {
        editor?: 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'url' | 'date' | 'color' | 'checkbox' | 'radio' | 'select' | 'html';
        class?: string;
        disabled?: boolean;
        placeholder?: string;
        placeholderHint?: string;
        hoverHint?: string;
        inlineHint?: string;
        validationHint?: string;
        validationRule?: string;
        rows?: number; // For textarea
        [key: string]: any; // Allow additional custom properties
    }
    
    interface ValidationRule {
        pattern?: RegExp;
        validate?: (value: any, element?: JQuery) => boolean;
        message: string;
    }
    
    interface ValidationResult {
        isValid: boolean;
        errors: string[];
        element: JQuery;
    }
    
    interface ValidationConfiguration {
        realTime?: boolean;
        showHints?: boolean;
        customRules?: { [ruleName: string]: ValidationRule };
    }
    
    interface CallbackConfiguration {
        afterValueChanged?: (value: any, schema: JsonSchema) => void;
        afterWidgetCreated?: (value: any, schema: JsonSchema) => void;
        beforeValidation?: (element: JQuery, result: ValidationResult) => void;
        afterValidation?: (element: JQuery, result: ValidationResult) => void;
    }
    
    interface Configuration {
        // Core settings
        schema?: JsonSchema;
        value?: any;
        
        // Display settings
        expandingLevel?: number;
        renderFirstLevel?: boolean;
        indenting?: number;
        treeExpandCollapseButton?: boolean;
        
        // Form behavior
        autoTrimValues?: boolean;
        radioNullCaption?: string;
        selectNullCaption?: string;
        
        // Theme and responsiveness
        theme?: 'default' | 'dark' | string;
        responsive?: boolean;
        
        // Validation
        validation?: ValidationConfiguration;
        
        // Callbacks
        callbacks?: CallbackConfiguration;
    }
    
    interface ArrayTemplate {
        htmlTemplate: string;
        dataTemplate: any;
    }
    
    interface ValidationError {
        field: string;
        message: string;
        element: JQuery;
    }
    
    // ===== CLASSES =====
    
    class JsonFormUtils {
        constructor(jsonToForm: JsonToFormInstance);
        
        deepMerge(target: object, source: object): object;
        isObject(value: any): boolean;
        generatePath(element: JQuery): string;
        getIdBasedDataPath(dataPath: string, containerId: string): string;
        getNestedValue(obj: object, path: string): any;
        setNestedValue(obj: object, path: string, value: any): void;
        ensureDataPath(obj: object, dataPath: string): void;
        jsonEscape(str: string): string;
        replaceAll(source: string, find: string, replace: string): string;
        escapeRegExp(string: string): string;
        fixNullUndefined(value: any, defaultValue: any): any;
        getUISetting(schemaNode: JsonSchema, settingName: string, defaultValue: any): any;
        getArrayType(schemaNode: JsonSchema): string;
        generateSpacer(level: number): string;
        generateExpandCollapseButton(type: string): string;
        generateTitle(schemaNode: JsonSchema, schemaName: string): string;
        escapeHtml(text: string): string;
        debounce(func: Function, wait: number): Function;
        isEmpty(value: any): boolean;
    }
    
    class JsonFormValidator {
        validationRules: { [ruleName: string]: ValidationRule };
        
        constructor(jsonToForm: JsonToFormInstance);
        
        validateAll(): void;
        validateInput(element: JQuery): ValidationResult;
        isFormValid(): boolean;
        getAllErrors(): ValidationError[];
        clearValidationMessages(): void;
        addCustomRule(name: string, rule: ValidationRule): void;
    }
    
    class JsonFormEventHandler {
        constructor(jsonToForm: JsonToFormInstance);
        
        initialize(): void;
        destroy(): void;
        triggerChange(element: JQuery): void;
        on(eventName: string, handler: Function): void;
        off(eventName: string, handler?: Function): void;
        trigger(eventName: string, data?: any[]): void;
    }
    
    class JsonFormRenderer {
        constructor(jsonToForm: JsonToFormInstance);
        
        renderSchemaNode(schemaNode: JsonSchema, schemaName: string, requiredItems?: string[]): string;
        addArrayItem(addButton: JQuery, needsReinitialization: boolean, itemIndex: number | null): void;
    }
    
    class JsonToFormInstance {
        element: JQuery;
        config: Configuration;
        level: number;
        arrayTemplates: { [templateId: string]: ArrayTemplate };
        
        renderer: JsonFormRenderer;
        validator: JsonFormValidator;
        eventHandler: JsonFormEventHandler;
        utils: JsonFormUtils;
        
        constructor(element: JQuery, options?: Configuration);
        
        // Public API
        isValid(): boolean;
        getSchema(): JsonSchema;
        getValue(): any;
        setValue(value: any): void;
        updateSchema(schema: JsonSchema): void;
        destroy(): void;
    }
}

// ===== JQUERY PLUGIN INTERFACE =====

interface JQuery {
    /**
     * Initialize JsonToForm plugin on selected elements
     * @param options Configuration options
     * @returns JsonToForm instance or jQuery object for chaining
     */
    jsonToForm(options?: JsonToForm.Configuration): JsonToForm.JsonToFormInstance | JQuery;
}

interface JQueryStatic {
    fn: {
        jsonToForm: {
            /**
             * Plugin version
             */
            version: string;
            
            /**
             * Default configuration options
             */
            defaults: JsonToForm.Configuration;
            
            /**
             * Add global validation rule
             * @param name Rule name
             * @param rule Rule definition
             */
            addValidationRule(name: string, rule: JsonToForm.ValidationRule): void;
            
            /**
             * Set global theme
             * @param themeName Theme name
             */
            setTheme(themeName: string): void;
        }
    }
}

// ===== GLOBAL CLASSES (for direct usage) =====

declare global {
    interface Window {
        JsonToForm: typeof JsonToForm.JsonToFormInstance;
        JsonFormRenderer: typeof JsonToForm.JsonFormRenderer;
        JsonFormValidator: typeof JsonToForm.JsonFormValidator;
        JsonFormEventHandler: typeof JsonToForm.JsonFormEventHandler;
        JsonFormUtils: typeof JsonToForm.JsonFormUtils;
        
        JsonToFormClasses: {
            JsonToForm: typeof JsonToForm.JsonToFormInstance;
            JsonFormRenderer: typeof JsonToForm.JsonFormRenderer;
            JsonFormValidator: typeof JsonToForm.JsonFormValidator;
            JsonFormEventHandler: typeof JsonToForm.JsonFormEventHandler;
            JsonFormUtils: typeof JsonToForm.JsonFormUtils;
        };
    }
}

// ===== MODULE EXPORTS (for ES6/CommonJS) =====

export = JsonToForm;
export as namespace JsonToForm;