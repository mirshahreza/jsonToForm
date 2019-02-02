**Why json-edit**
 - Fast and easy to use.
 - RTL support : just add style (direction:rtl) to the place holder element.
 - It just depends on jQuery.
 - It can be use in tow mode : property grid(currently implemented) / normal form(road map).
 - Easy to customize css.
 - Supported inputs : text/checkbox/textarea/html/color/date/number/radio/select.
 - Validation support.
 - Additional text option for describing inputs.
 - Based on schema standard.

**How to use**
- A demo.html is included that describe the usage.

**Options**
- schema / default : {} / a json schema  
- value / default : {} / a json object  
- expandingLevel / default : -1 / tree levels that initially is expanded. by default all levels will be expanded 
- renderFirstLevel / default : false / indicates root element renders as a visual container or no
- autoTrimValues / default : true / trims spaces automatically
- indenting / default : 5 / number of spaces for each level of tree
- treeExpandCollapseButton / default : true / show buttons to expand/collapse tree nodes 
- selectNullCaption / default : '' / caption for select elements when is null
- selectNullCaption / default : 'null' / caption for radio elements when is null 

**Events**
- afterValueChanged  
- afterWidgetCreated

**Methods**
- isValid()  
- getSchema()
- getValue()
- setValue(value)

**Next step V1.1.1**
- Defaults for schema / reset to default button
- Validation by regular based on schema standards
- Validation for array items based on schema standards

**Road map**
- Checkbox list (when node is simple array)
- Including some important schemas like schema(for design another schema) / css 
- Including some important regulars like email/website/...
- Layout option for switching between property grid mode and normal form
- Auto complete source for inputs by connecting to other API
- Additional item for object nodes


**Similar projects**
 - https://github.com/jsonform/jsonform 
 - https://jsonforms.io/
 - https://github.com/jdorn/json-editor
 - https://github.com/plantain-00/schema-based-json-editor
 - https://github.com/codecombat/treema
 - https://json-schema-editor.tangramjs.com/
 - https://github.com/yourtion/vue-json-ui-editor
 
 
