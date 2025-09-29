<div align="center">

# JsonToForm v2.0 🚀

Modern jQuery plugin that turns JSON Schema-like definitions into beautiful, responsive HTML forms with real-time validation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![jQuery](https://img.shields.io/badge/jQuery-3.x+-blue.svg)
[![TypeScript](https://img.shields.io/badge/TypeScript-Definitions-blue.svg)](jsonToForm/jsonToForm.d.ts)

[Live Demo](demo-v2.html)

</div>

## ✨ Highlights

- 🎨 Modern UI: clean, responsive (Flexbox/Grid), light/dark ready
- � Real-time validation: instant feedback with friendly hints
- 🌍 i18n & RTL: Persian/Farsi and other RTL languages supported
- 🧩 Rich inputs: string, number, email, tel, url, date, time, textarea, select, checkbox, radio, color, html, object, array
- � Modular code: Renderer, Validator, EventHandler, Utils
- �️ TypeScript: bundled `.d.ts` for great IntelliSense

## 🚀 Quick Start

Include jQuery, the compiled plugin, and one of the themes:

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<script src="jquery/jquery.min.js"></script>
		<script src="jsonToForm/jsonToForm.v2.js"></script>
		<link href="src/styles/jsonToForm.clean.css" rel="stylesheet" />
		<!-- Or: <link href="src/styles/jsonToForm.modern.css" rel="stylesheet" /> -->
	</head>
	<body>
		<div id="myForm"></div>
		<script>
			$("#myForm").jsonToForm({
				schema: {
					type: "object",
					properties: {
						name: { type: "string", title: "Full Name", minLength: 2, required: true },
						email: { type: "email", title: "Email Address", required: true },
						age: { type: "number", title: "Age", min: 18, max: 100 }
					},
					required: ["name", "email"]
				}
			});

			// Read & validate
			const data = $("#myForm").jsonToForm("getValue");
			const isValid = $("#myForm").jsonToForm("isValid");
			console.log({ data, isValid });
		</script>
	</body>
	</html>
```

## � API (essentials)

- `getValue()` → returns the current form value
- `setValue(obj)` → sets/replaces form value
- `isValid()` → boolean validity of the whole form
- `validator.getAllErrors()` → list of validation errors

Example:

```js
const form = $("#myForm").jsonToForm(options);
form.setValue({ name: "John Doe" });
console.log(form.getValue(), form.isValid());
console.log(form.validator.getAllErrors());
```

## 🎨 Theming & RTL

- Themes: `src/styles/jsonToForm.clean.css` (simple), `src/styles/jsonToForm.modern.css` (polished)
- Dark mode: set `data-json-form-theme="dark"` on `<body>`
- RTL: add `dir="rtl"` on `<html>`/`<body>`/container

```html
<body dir="rtl" data-json-form-theme="dark">
	<!-- your form container -->
</body>
```

## � Project Structure

- `src/` → modular source (core, renderer, validator, events, utils, styles)
- `jsonToForm/jsonToForm.v2.js` → compiled v2 bundle
- `jsonToForm/jsonToForm.d.ts` → TypeScript definitions
- `v1/` → legacy v1 plugin, styles, and demos
- `demo-v2.html` → v2 demo

## 🔁 Migrating from v1.x

Old usage (v1.x):

```js
$('#myForm').jsonToForm({ schema, value });
```

New usage (v2):

```js
$('#myForm').jsonToForm({ schema });
$('#myForm').jsonToForm('setValue', value);
```

For legacy plugin and original demos, see the `v1/` folder.

## 📝 License

MIT © Contributors — see [LICENSE](LICENSE)


