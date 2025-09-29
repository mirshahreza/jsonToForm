# JsonToForm v2.0 🚀

A modern, powerful jQuery plugin for converting JSON schemas to beautiful HTML forms with real-time validation and advanced features.

![JsonToForm Banner](https://img.shields.io/badge/JsonToForm-v2.0-blue?style=for-the-badge) ![jQuery](https://img.shields.io/badge/jQuery-3.x+-yellow?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- 🎨 Modern Design: Clean, responsive UI with CSS Grid/Flexbox
- 🔄 Real-time Validation: Instant feedback as users type
- 🌍 Internationalization: Full RTL support (Persian, Arabic, Hebrew)
- 📱 Mobile-First: Responsive design for all screen sizes
- 🎯 TypeScript Support: Full type definitions included
- 🧩 Modular Architecture: Clean, maintainable ES6+ code
- 🧪 Custom Controls: Rich input types and validation rules
- 🔧 Easy Theming: CSS custom properties for easy customization

## 🚀 Quick Start

### HTML
<!DOCTYPE html>
<html>
<head>
	<script src="jquery/jquery.min.js"></script>
	<script src="jsonToForm/jsonToForm.v2.js"></script>
	<link href="src/styles/jsonToForm.clean.css" rel="stylesheet" />
	<!-- Or: <link href="src/styles/jsonToForm.modern.css" rel="stylesheet" /> -->
	<!-- RTL? Add dir="rtl" to body or container. -->
  </head>
<body>
	<div id="myForm"></div>
</body>
</html>

### JavaScript
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

## 🧾 Supported Input Types

string, number, email, tel, url, date, time, textarea, select, checkbox, radio, color, html, object, array

## 🎨 Styling & Themes

- Clean theme: src/styles/jsonToForm.clean.css
- Modern theme: src/styles/jsonToForm.modern.css

## 🌍 Internationalization

See demo-v2.html for a comprehensive example.

## 🧩 Project Structure

- src/ … modular core (renderer, validator, events, utils, styles)
- jsonToForm/jsonToForm.v2.js … compiled v2 bundle
- v1/ … legacy v1 plugin and demos

## 🔁 Migration from v1.x

Old: $('#myForm').jsonToForm({ schema, value })
New: $('#myForm').jsonToForm({ schema }); $('#myForm').jsonToForm('setValue', value);

For the legacy version and original demos, see the v1/ folder.


