# JsonToForm v2.0 🚀

A modern, powerful jQuery plugin for converting JSON schemas to beautiful HTML forms with real-time validation and advanced features.

![JsonToForm Banner](https://img.shields.io/badge/JsonToForm-v2.0-blue?style=for-the-badge) ![jQuery](https://img.shields.io/badge/jQuery-3.x+-yellow?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- 🎨 **Modern Design**: Clean, responsive UI with CSS Grid/Flexbox
- 🔄 **Real-time Validation**: Instant feedback as users type
- 🌍 **Internationalization**: Full RTL support (Persian, Arabic, Hebrew)
- 📱 **Mobile-First**: Responsive design for all screen sizes
- 🎯 **TypeScript Support**: Full type definitions included
- 🧩 **Modular Architecture**: Clean, maintainable ES6+ code
- 🎪 **Custom Controls**: Rich input types and validation rules
- 🔧 **Easy Theming**: CSS custom properties for easy customization

## 🚀 Quick Start

### HTML
```html
<!DOCTYPE html>
<html>
<head>
    <script src="jquery/jquery.min.js"></script>
    <script src="jsonToForm/jsonToForm.v2.js"></script>
    <link href="src/styles/jsonToForm.clean.css" rel="stylesheet" />
</head>
<body>
    <div id="myForm"></div>
</body>
</html>
```

### JavaScript
```javascript
// Simple form
$('#myForm').jsonToForm({
    schema: {
        "name": {
            "type": "string",
            "title": "Full Name",
            "required": true,
            "minLength": 2
        },
        "email": {
            "type": "email",
            "title": "Email Address",
            "required": true
        },
        "age": {
            "type": "number",
            "title": "Age",
            "min": 18,
            "max": 100
        }
    }
});

// Get form data
const data = $('#myForm').jsonToForm('getValue');
console.log(data);

// Validate form
const isValid = $('#myForm').jsonToForm('isValid');
console.log('Form is valid:', isValid);
```

## 📋 Supported Input Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text input | Name, description |
| `number` | Numeric input | Age, price |
| `email` | Email input | Email address |
| `tel` | Phone input | Phone number |
| `url` | URL input | Website |
| `date` | Date picker | Birth date |
| `time` | Time picker | Meeting time |
| `textarea` | Multi-line text | Comments, notes |
| `select` | Dropdown | Country, category |
| `checkbox` | Boolean input | Agree to terms |
| `radio` | Radio buttons | Gender, size |
| `color` | Color picker | Theme color |
| `html` | Rich text editor | Content, description |
| `object` | Nested object | Address, contact info |
| `array` | Dynamic list | Skills, hobbies |

## 🎨 Styling & Themes

### Using Clean Theme (Recommended)
```html
<link href="src/styles/jsonToForm.clean.css" rel="stylesheet" />
```

### Using Modern Theme
```html
<link href="src/styles/jsonToForm.modern.css" rel="stylesheet" />
```

### Custom Theming
```css
:root {
  --jtf-primary: #4f46e5;
  --jtf-success: #16a34a;
  --jtf-danger: #dc2626;
  --jtf-gray-50: #f8fafc;
  /* ... customize colors */
}
```

## 🌍 Internationalization

### Persian (Farsi) Support
```javascript
$('#myForm').jsonToForm({
    schema: schema,
    options: {
        language: 'fa',
        direction: 'rtl'
    }
});
```

### Custom Messages
```javascript
$('#myForm').jsonToForm({
    schema: schema,
    options: {
        messages: {
            required: 'این فیلد اجباری است',
            minLength: 'حداقل {0} کاراکتر وارد کنید',
            email: 'ایمیل معتبر وارد کنید'
        }
    }
});
```

## 🔧 Advanced Configuration

### Complex Schema Example
```javascript
const advancedSchema = {
    "personalInfo": {
        "type": "object",
        "title": "اطلاعات شخصی",
        "properties": {
            "firstName": {
                "type": "string",
                "title": "نام",
                "required": true,
                "minLength": 2,
                "maxLength": 50
            },
            "lastName": {
                "type": "string", 
                "title": "نام خانوادگی",
                "required": true
            },
            "birthDate": {
                "type": "date",
                "title": "تاریخ تولد",
                "max": "2005-12-31"
            },
            "skills": {
                "type": "array",
                "title": "مهارت‌ها",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "title": "نام مهارت",
                            "required": true
                        },
                        "level": {
                            "type": "select",
                            "title": "سطح",
                            "options": [
                                {"value": "beginner", "text": "مبتدی"},
                                {"value": "intermediate", "text": "متوسط"},
                                {"value": "advanced", "text": "پیشرفته"}
                            ]
                        }
                    }
                }
            }
        }
    }
};

$('#myForm').jsonToForm({
    schema: advancedSchema,
    options: {
        showValidationSummary: true,
        enableCollapse: true,
        validateOnChange: true
    }
});
```

## 🔄 API Methods

### getValue()
```javascript
const formData = $('#myForm').jsonToForm('getValue');
```

### setValue(data)
```javascript
$('#myForm').jsonToForm('setValue', {
    name: 'John Doe',
    email: 'john@example.com'
});
```

### isValid()
```javascript
const isValid = $('#myForm').jsonToForm('isValid');
```

### validate()
```javascript
const validation = $('#myForm').jsonToForm('validate');
console.log(validation.isValid, validation.errors);
```

### reset()
```javascript
$('#myForm').jsonToForm('reset');
```

### destroy()
```javascript
$('#myForm').jsonToForm('destroy');
```

## 📦 Project Structure

```
jsonToForm/
├── src/
│   ├── core/
│   │   ├── JsonToForm.js          # Main plugin class
│   │   ├── JsonFormRenderer.js    # Form rendering
│   │   ├── JsonFormValidator.js   # Validation engine
│   │   ├── JsonFormEventHandler.js # Event management
│   │   └── JsonFormUtils.js       # Utility functions
│   ├── styles/
│   │   ├── jsonToForm.modern.css  # Modern theme
│   │   └── jsonToForm.clean.css   # Clean theme
│   └── types/
│       └── jsonToForm.d.ts        # TypeScript definitions
├── jsonToForm/
│   ├── jsonToForm.js              # Legacy version
│   ├── jsonToForm.css             # Legacy styles
│   └── jsonToForm.v2.js           # Compiled v2.0
├── demo-farsi.html                # Persian demo
├── demo-v2.html                   # English demo
└── README.md
```

## 🎯 Validation Rules

### String Validation
- `required`: Field is mandatory
- `minLength`: Minimum character count
- `maxLength`: Maximum character count
- `pattern`: Regular expression pattern

### Number Validation
- `required`: Field is mandatory
- `min`: Minimum value
- `max`: Maximum value
- `step`: Number increment

### Array Validation
- `minItems`: Minimum array length
- `maxItems`: Maximum array length
- `uniqueItems`: No duplicate values

## 🚀 Performance Features

- **Lazy Loading**: Only load necessary components
- **Efficient Rendering**: Virtual DOM-like updates
- **Memory Management**: Proper cleanup and disposal
- **Event Delegation**: Optimized event handling

## 🧪 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+ 
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Built with ❤️ using jQuery
- Modern CSS techniques and best practices
- Inspired by JSON Schema specification

## 📞 Support

- 📧 Issues: [GitHub Issues](https://github.com/yourusername/jsonToForm/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/jsonToForm/discussions)
- 📖 Wiki: [GitHub Wiki](https://github.com/yourusername/jsonToForm/wiki)

---

**JsonToForm v2.0** - Transform JSON schemas into beautiful, functional forms effortlessly! 🎉

## 📋 Legacy Features (v1.x)

The original JsonToForm had these features:
- Fast and easy to use
- RTL support with simple CSS
- jQuery dependency only
- Property grid mode
- Easy CSS customization
- Basic validation support
- Schema-based structure

## 🔄 Migration from v1.x

### Old Usage (v1.x)
```javascript
$('#myForm').jsonToForm({
    schema: schema,
    value: data
});
```

### New Usage (v2.0)
```javascript
$('#myForm').jsonToForm({
    schema: schema
});
$('#myForm').jsonToForm('setValue', data);
```

## 🔗 Similar Projects

- [jsonform/jsonform](https://github.com/jsonform/jsonform)
- [jsonforms.io](https://jsonforms.io/)
- [jdorn/json-editor](https://github.com/jdorn/json-editor)
- [plantain-00/schema-based-json-editor](https://github.com/plantain-00/schema-based-json-editor)
- [codecombat/treema](https://github.com/codecombat/treema)