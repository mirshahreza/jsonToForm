# Changelog

All notable changes to JsonToForm project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-19

### 🚀 Added
- **Modern ES6+ Architecture**: Complete rewrite using ES6 classes and modules
- **TypeScript Support**: Full TypeScript definitions included
- **Advanced Validation System**: Real-time validation with custom rules
- **Modular Design**: Separated into JsonToForm, Renderer, Validator, EventHandler, and Utils modules
- **Modern CSS Framework**: Two themes (Modern and Clean) with CSS custom properties
- **Enhanced RTL Support**: Better right-to-left language support for Persian/Arabic
- **New Input Types**: Added email, tel, url, date, time, datetime-local support
- **Array Management**: Dynamic add/remove items in arrays
- **Object Nesting**: Better nested object rendering and management
- **Event System**: Enhanced event handling with proper cleanup
- **Persian Demo**: Complete Persian (Farsi) demonstration with RTL layout

### 🎨 Improved
- **CSS Architecture**: Modern CSS with custom properties, Flexbox, and Grid
- **Responsive Design**: Mobile-first approach with better responsive behavior
- **Color Palette**: Clean, modern color scheme with proper contrast ratios
- **Typography**: Improved font system and text hierarchy
- **Layout System**: Better spacing and alignment using CSS Grid/Flexbox
- **Form Controls**: Enhanced styling for all input types
- **Button Design**: Modern button styles with hover and focus states

### 🔧 Changed
- **Breaking Changes**: New API structure (methods now accept method name as first parameter)
- **File Structure**: Organized into `src/` directory with proper module separation
- **CSS Classes**: Updated class naming convention for better clarity
- **Method Names**: Consistent API method naming
- **Options Object**: Restructured options for better organization

### 🐛 Fixed
- **Container Overflow**: Fixed form controls extending beyond their containers
- **Input Width Issues**: Proper `max-width: 100%` and `box-sizing: border-box`
- **RTL Layout**: Better right-to-left text direction handling
- **Validation Timing**: Fixed validation timing and error display
- **Memory Leaks**: Proper event cleanup and object disposal
- **CSS Specificity**: Better CSS specificity management

### 📁 File Structure
```
jsonToForm/
├── src/
│   ├── core/
│   │   ├── JsonToForm.js          # Main plugin class
│   │   ├── JsonFormRenderer.js    # Form rendering engine
│   │   ├── JsonFormValidator.js   # Validation system
│   │   ├── JsonFormEventHandler.js # Event management
│   │   └── JsonFormUtils.js       # Utility functions
│   ├── styles/
│   │   ├── jsonToForm.modern.css  # Modern theme
│   │   └── jsonToForm.clean.css   # Clean minimal theme
│   └── types/
│       └── jsonToForm.d.ts        # TypeScript definitions
├── jsonToForm/
│   ├── jsonToForm.v2.js           # Compiled v2.0 (production)
│   ├── jsonToForm.js              # Legacy v1.x
│   └── jsonToForm.css             # Legacy styles
├── demo-farsi.html                # Persian RTL demo
├── demo-v2.html                   # English demo
└── README-v2.md                   # v2.0 documentation
```

### 🌟 New Features Detail

#### Enhanced Validation System
- Real-time validation as users type
- Custom validation rules support
- Persian error messages
- Visual validation feedback
- Validation summary display

#### Modern CSS Themes
- **Clean Theme**: Minimal, professional design
- **Modern Theme**: Rich, feature-complete styling
- CSS custom properties for easy theming
- Dark mode support infrastructure
- Mobile-optimized responsive design

#### Advanced Input Support
- HTML5 input types (email, tel, url, date, time)
- Rich text editor for HTML content
- Color picker integration
- File upload preparation
- Custom input type extensibility

#### Improved Internationalization
- Better RTL (Right-to-Left) language support
- Persian/Farsi localization
- Custom message templates
- Direction-aware layout system

### 🔄 Migration Guide

#### From v1.x to v2.0

**Old Way (v1.x):**
```javascript
$('#form').jsonToForm({
    schema: schema,
    value: initialData
});

var data = $('#form').jsonToForm().getValue();
var isValid = $('#form').jsonToForm().isValid();
```

**New Way (v2.0):**
```javascript
$('#form').jsonToForm({
    schema: schema
});
$('#form').jsonToForm('setValue', initialData);

var data = $('#form').jsonToForm('getValue');
var isValid = $('#form').jsonToForm('isValid');
```

**CSS Migration:**
```html
<!-- Old -->
<link href="jsonToForm/jsonToForm.css" rel="stylesheet" />

<!-- New -->
<link href="src/styles/jsonToForm.clean.css" rel="stylesheet" />
```

### 📊 Performance Improvements
- Reduced bundle size through modular architecture
- Better memory management with proper cleanup
- Optimized DOM manipulation
- Efficient event delegation
- Lazy loading of non-essential features

### 🧪 Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### 📋 Known Issues
- Internet Explorer is no longer supported
- Some advanced CSS features require modern browsers
- File upload functionality not yet implemented

### 🎯 Future Plans (v2.1)
- [ ] File upload input type
- [ ] Advanced array validation
- [ ] Custom theme builder
- [ ] Vue.js and React adapters
- [ ] Performance monitoring
- [ ] Accessibility improvements

---

## [1.0.0] - Previous Release

### Features
- Basic JSON Schema to HTML form conversion
- Simple validation system
- RTL support
- jQuery plugin architecture
- Property grid mode
- Basic input types support

### Supported Input Types
- text, checkbox, textarea, html, color, date, number, radio, select

### Options
- schema: JSON schema definition
- value: Initial form values
- expandingLevel: Tree expansion level
- renderFirstLevel: Root element rendering
- autoTrimValues: Automatic value trimming
- indenting: Tree indentation spaces
- treeExpandCollapseButton: Show/hide expand buttons
- selectNullCaption: Select null option caption
- radioNullCaption: Radio null option caption

### Events
- afterValueChanged: Triggered after value changes
- afterWidgetCreated: Triggered after widget creation

### Methods
- isValid(): Check form validation
- getSchema(): Get current schema
- getValue(): Get form values
- setValue(value): Set form values

---

## Contributing

Please read our contributing guidelines before submitting pull requests. All contributions should include appropriate tests and documentation updates.

## License

This project is licensed under the MIT License - see the LICENSE file for details.