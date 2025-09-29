# JsonToForm v2.0 🚀

> Modern jQuery plugin for converting JSON Schema to beautiful, responsive HTML forms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![jQuery Compatible](https://img.shields.io/badge/jQuery-3.x+-blue.svg)](https://jquery.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Definitions-blue.svg)](./jsonToForm/jsonToForm.d.ts)

## 🌟 What's New in v2.0

### 🏗️ **Complete Architecture Refactor**
- **Modular Design**: Separated into logical modules (Renderer, Validator, EventHandler, Utils)
- **ES6+ Features**: Modern JavaScript with classes and modules
- **Better Performance**: Optimized DOM manipulation and event handling
- **Memory Management**: Proper cleanup and event unbinding

### 🎨 **Modern UI & UX**
- **CSS Custom Properties**: Full theme system with CSS variables
- **Dark/Light Mode**: Built-in theme switching
- **Responsive Design**: Mobile-first approach with Flexbox/Grid
- **Accessibility**: WCAG compliance and keyboard navigation
- **Smooth Animations**: CSS transitions and micro-interactions

### ✅ **Enhanced Validation System**
- **Real-time Validation**: Live feedback as users type
- **Custom Rules**: Extensible validation with regex patterns
- **Better Error Messages**: User-friendly validation hints
- **Async Validation**: Support for server-side validation
- **Built-in Rules**: Email, phone, URL, credit card validation

### 💻 **Developer Experience**
- **TypeScript Definitions**: Full type safety and IntelliSense
- **Better API**: Consistent and intuitive method names
- **Event System**: Rich event callbacks for customization
- **Documentation**: Comprehensive examples and guides

---

## 🚀 Quick Start

### Installation

```html
<!-- Include jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Include JsonToForm v2.0 -->
<link href="jsonToForm/jsonToForm.modern.css" rel="stylesheet">
<script src="jsonToForm/jsonToForm.v2.js"></script>
```

### Basic Usage

```javascript
$("#myForm").jsonToForm({
    schema: {
        type: "object",
        properties: {
            name: {
                title: "Full Name",
                type: "string",
                minLength: 2,
                ui: {
                    placeholder: "Enter your name",
                    inlineHint: "As it appears on your ID"
                }
            },
            email: {
                title: "Email",
                type: "email",
                ui: {
                    placeholder: "user@example.com"
                }
            }
        },
        required: ["name", "email"]
    },
    value: {
        name: "John Doe",
        email: "john@example.com"
    },
    callbacks: {
        afterValueChanged: (value, schema) => {
            console.log("Form value:", value);
        }
    }
});
```

---

## 📋 Features Overview

### 🎛️ **Supported Input Types**

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single line text input | Name, title, etc. |
| `textarea` | Multi-line text | Comments, descriptions |
| `number` | Numeric input with validation | Age, price, quantity |
| `email` | Email with built-in validation | user@domain.com |
| `tel` | Phone number | +1 (555) 123-4567 |
| `date` | Date picker | 2023-12-25 |
| `color` | Color picker | #007bff |
| `checkbox` | Boolean true/false | Agree to terms |
| `radio` | Single choice from options | Gender, size |
| `select` | Dropdown selection | Country, category |
| `html` | Rich text editor | Formatted content |

### 🔧 **Configuration Options**

```javascript
{
    // Core settings
    schema: {},              // JSON Schema definition
    value: {},               // Initial form values
    
    // Display options
    expandingLevel: -1,      // Tree expansion level (-1 = all)
    renderFirstLevel: false, // Show root container
    indenting: 5,           // Indentation spacing
    treeExpandCollapseButton: true,
    
    // Form behavior
    autoTrimValues: true,    // Auto-trim whitespace
    radioNullCaption: 'null',
    selectNullCaption: '',
    
    // Theme and design
    theme: 'default',        // 'default' | 'dark' | custom
    responsive: true,        // Enable responsive design
    
    // Validation
    validation: {
        realTime: true,      // Live validation
        showHints: true,     // Show validation messages
        customRules: {}      // Custom validation rules
    },
    
    // Event callbacks
    callbacks: {
        afterValueChanged: null,
        afterWidgetCreated: null,
        beforeValidation: null,
        afterValidation: null
    }
}
```

---

## 🎨 Theming & Customization

### Dark Mode
```javascript
// Enable dark theme
$.fn.jsonToForm.setTheme('dark');

// Or toggle programmatically
document.body.setAttribute('data-json-form-theme', 'dark');
```

### Custom CSS Variables
```css
:root {
    --jtf-primary-color: #your-brand-color;
    --jtf-border-radius: 8px;
    --jtf-font-family: 'Your Font', sans-serif;
}
```

---

## ✅ Validation System

### Built-in Validation Rules

```javascript
// Email validation
{
    type: "email",
    ui: {
        validationRule: "email"
    }
}

// Phone number validation
{
    type: "tel",
    pattern: "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$"
}

// Custom validation rule
{
    type: "string",
    ui: {
        validationRule: "strongPassword"
    }
}
```

### Adding Custom Rules

```javascript
// Global custom rule
$.fn.jsonToForm.addValidationRule('strongPassword', {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and symbol'
});

// Instance-specific rule
$("#myForm").jsonToForm({
    validation: {
        customRules: {
            uniqueUsername: {
                validate: async (value, element) => {
                    // Custom async validation logic
                    return await checkUsernameAvailability(value);
                },
                message: 'Username is already taken'
            }
        }
    }
});
```

---

## 🔧 API Reference

### Methods

```javascript
const form = $("#myForm").jsonToForm(options);

// Get/Set values
const value = form.getValue();
form.setValue({ name: "New Name" });

// Get/Update schema
const schema = form.getSchema();
form.updateSchema(newSchema);

// Validation
const isValid = form.isValid();
const errors = form.validator.getAllErrors();

// Cleanup
form.destroy();
```

### Events

```javascript
$("#myForm").on('valueChanged', function(event, element, newValue) {
    console.log('Value changed:', newValue);
});

$("#myForm").on('nodeExpanded', function(event, button) {
    console.log('Node expanded');
});

$("#myForm").on('arrayItemAdded', function(event, button) {
    console.log('Array item added');
});
```

---

## 📱 Responsive Design

JsonToForm v2.0 is mobile-first and fully responsive:

- **Flexbox Layout**: Modern CSS layout system
- **Adaptive Forms**: Fields stack on mobile, side-by-side on desktop
- **Touch Friendly**: Larger touch targets on mobile devices
- **Readable Text**: Responsive font sizes prevent zoom on iOS

---

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Chrome for Android

---

## 🔄 Migration from v1.x

### Breaking Changes
1. **CSS Classes**: New BEM-style naming convention
2. **Configuration**: Some options renamed for consistency
3. **Events**: New event system with namespaced events

### Migration Guide

```javascript
// v1.x
$("#form").jsonToForm({
    "afterValueChanged": callback,
    "renderFirstLevel": "false"
});

// v2.0
$("#form").jsonToForm({
    callbacks: {
        afterValueChanged: callback
    },
    renderFirstLevel: false  // Boolean instead of string
});
```

---

## 🎯 Examples

### Complex Form with Arrays

```javascript
{
    "type": "object",
    "properties": {
        "users": {
            "title": "Team Members",
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": { "type": "string", "title": "Name" },
                    "role": { 
                        "type": "string", 
                        "title": "Role",
                        "enum": ["Developer", "Designer", "Manager"]
                    },
                    "skills": {
                        "type": "array",
                        "title": "Skills",
                        "items": { "type": "string" }
                    }
                },
                "required": ["name", "role"]
            }
        }
    }
}
```

### Conditional Fields (Coming Soon)

```javascript
{
    "type": "object",
    "properties": {
        "hasAccount": {
            "type": "boolean",
            "title": "Do you have an account?"
        },
        "username": {
            "type": "string",
            "title": "Username",
            "ui": {
                "conditionalDisplay": {
                    "field": "hasAccount",
                    "value": true
                }
            }
        }
    }
}
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/mirshahreza/jsonToForm.git
cd jsonToForm
npm install
npm run dev
```

### Build Process

```bash
npm run build        # Build production version
npm run test         # Run tests
npm run lint         # Code linting
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Original JsonToForm concept and v1.x codebase
- jQuery community for the amazing ecosystem
- JSON Schema specification for standardization
- Contributors and users for feedback and improvements

---

## 🔗 Links

- **Demo**: [Live Demo](demo-v2.html)
- **Documentation**: [Full Documentation](docs/)
- **Examples**: [Code Examples](examples/)
- **Issues**: [GitHub Issues](https://github.com/mirshahreza/jsonToForm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mirshahreza/jsonToForm/discussions)

---

*Made with ❤️ for the web development community*