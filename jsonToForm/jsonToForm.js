(function ($) {
    $.fn.jsonToForm = function (options) {

        var renderPlace = this;
        var level = 0;
        var arrayTemplates = {};
        initOptions();
        initWidget();

        var output = {
            "isValid": function () { return isValid(); },
            "getSchema": function () { return getSchema(); },
            "getValue": function () { return getValue(); },
            "setValue": function (v) { return setValue(v); }
        };
        return output;

        function initOptions() {
            options = options || {};
            options["expandingLevel"] = (options["expandingLevel"] == null ? -1 : options["expandingLevel"]) // -1:expand all
            options["value"] = options["value"] || {};
            options["schema"] = options["schema"] || {};
            options["renderFirstLevel"] = options["renderFirstLevel"] || 'false';
            options["autoTrimValues"] = options["autoTrimValues"] || 'true';
            options["indenting"] = options["indenting"] || 5;
            options["radioNullCaption"] = options["radioNullCaption"] || 'null';
            options["selectNullCaption"] = options["selectNullCaption"] || '';
            options["treeExpandCollapseButton"] = options["treeExpandCollapseButton"] || 'true';
        }

        function initWidget() {
            level = 0;
            arrayTemplates = {};
            var widgetContent = renderSchemaNode(options["schema"], "");
            renderPlace.html(widgetContent);
            initValuePathes();
            setValue(options["value"]);
            initEvents();
            validateWidget();
            if (options["afterWidgetCreated"]) options["afterWidgetCreated"](options["value"], options["schema"]);
        }

        function validateWidget() {
            $(".j-input").each(function () {
                validateInput($(this));
            });
        }

        function setValidation(elm, isValid) {
            elm.attr("data-is-valid", isValid ? "true" : "false");
            return isValid;
        }

        function validateInput(elm) {
            const v_required = fixNU(elm.attr("data-required"), "false") === "true";
            const v_min = elm.attr("data-min") ? parseFloat(elm.attr("data-min")) : null;
            const v_max = elm.attr("data-max") ? parseFloat(elm.attr("data-max")) : null;

            const isTextInput = elm.hasClass("j-input-text") || elm.hasClass("j-input-textarea");
            const isNumberInput = elm.hasClass("j-input-number");
            const isBasicInput = isTextInput || elm.hasClass("j-input-select") || isNumberInput || elm.hasClass("j-input-date");
            
            if (isBasicInput) {
                // Check required field
                if (!setValidation(elm, !(v_required && fixNU(elm.val(), "") === ""))) return;
                
                // Check minimum constraints
                if (v_min !== null) {
                    if (isTextInput) {
                        if (!setValidation(elm, elm.val().length >= v_min)) return;
                    } else if (isNumberInput) {
                        if (!setValidation(elm, parseFloat(elm.val()) >= v_min)) return;
                    }
                }
                
                // Check maximum constraints
                if (v_max !== null) {
                    if (isTextInput) {
                        if (!setValidation(elm, elm.val().length <= v_max)) return;
                    } else if (isNumberInput) {
                        if (!setValidation(elm, parseFloat(elm.val()) <= v_max)) return;
                    }
                }
            }
            
            if (elm.hasClass("j-input-email")) {
                const emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                setValidation(elm, emailRegex.test(elm.val()));
            }
            
            if (elm.hasClass("j-input-tel")) {
                const telRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
                setValidation(elm, telRegex.test(elm.val()));
            }
            
            if (elm.hasClass("j-input-checkbox")) {
                const v_required = fixNU(elm.attr("data-required"), "false") === "true";
                setValidation(elm, !(v_required && !elm.prop("checked")));
            }
            
            if (elm.hasClass("j-input-radio")) {
                let hasChecked = false;
                elm.parent().parent().find('input[type=radio]').each(function () {
                    if ($(this).prop("checked")) {
                        hasChecked = true;
                    }
                });
                elm.parent().parent().attr("data-is-valid", hasChecked ? "true" : "false");
            }

            if (elm.hasClass("j-input-html")) {
                const v_required = fixNU(elm.attr("data-required"), "false") === "true";
                const isEmpty = elm.next(".j-input-html-div:first").text() === "";
                elm.next(".j-input-html-div:first").attr("data-is-valid", !(v_required && isEmpty) ? "true" : "false");
            }
        }

        function isValid() {
            return renderPlace.find('[data-is-valid="false"]:first').length === 0;
        }

        function initEvents() {
            // Cache frequently used selectors for better performance
            const $renderPlace = renderPlace;
            
            $renderPlace.find(".j-ec").off("click").on("click", function () { toggleSubTree(this); });
            $renderPlace.find(".j-add-array-item").off("click").on("click", function () { addArrayItem($(this), true, null); });
            $renderPlace.find(".j-remove-array-item").off("click").on("click", function () { removeArrayItem($(this)); });
            $renderPlace.find(".j-input-text,.j-input-textarea,.j-input-date,.j-input-number,.j-input-email,.j-input-tel").off("keyup").on("keyup", function () { valueChanged($(this)) });
            $renderPlace.find(".j-input-checkbox,.j-input-radio,.j-input-select,.j-input-color,.j-input-date,.j-input-number,.j-input-html").off("change").on("change", function () { valueChanged($(this)) });
            $renderPlace.find(".j-input-html-div").off("keyup").on("keyup", function () { changeInput($(this)) });
            $renderPlace.find(".j-input-html").off("focus").on("focus", function () { $(this).parents("td:first").find(".j-input-html-div:first").focus(); });
        }

        function changeInput(htmlDiv) {
            var i = htmlDiv.parents(":first").find("input:first");
            i.val(htmlDiv.html());
            valueChanged(i);
        }

        function removeArrayItem(arrItem) {
            const itemIndex = parseInt(arrItem.attr("data-index"));
            const nodeToRemove = arrItem.parents("table:first");
            const p = nodeToRemove.parents("td:first").attr("data-path");
            const array = V(options["value"], p);
            if (array && Array.isArray(array)) {
                array.splice(itemIndex, 1);
            }
            nodeToRemove.remove();
            setValue(options["value"]);
            if (options["afterValueChanged"]) options["afterValueChanged"](options["value"], options["schema"]);
        }

        function addArrayItem(arrayContainer, needInitiations, itemIndex) {
            const tId = arrayContainer.attr("data-template-id");
            const htmlTemplate = arrayTemplates[tId]["htmlTemplate"];
            const dataTemplate = JSON.parse(JSON.stringify(arrayTemplates[tId]["dataTemplate"]));
            const dataPath = arrayContainer.parents("tr:first").next().find("td:first").attr("data-path");
            
            if (V(options["value"], dataPath) == undefined || V(options["value"], dataPath) == null) {
                setV(options["value"], dataPath, []);
            }

            if (itemIndex == null) {
                const array = V(options["value"], dataPath);
                if (array && Array.isArray(array)) {
                    array.push(dataTemplate);
                    itemIndex = array.length - 1;
                }
            }

            const finalHtmlTemplate = replaceAll(htmlTemplate, "$index$", itemIndex);
            arrayContainer.parents("tr:first").next().find("td:first").append(finalHtmlTemplate);

            if (needInitiations) {
                initValuePathes();
                initEvents();
            }
        }

        function valueChanged(changedObject) {
            ensureDataPath(changedObject.attr("data-path"));
            const dataPath = changedObject.attr("data-path");
            let value;
            
            if (changedObject.prop("tagName").toLowerCase() === "input" && changedObject.prop("type").toLowerCase() === "checkbox") {
                value = changedObject.prop("checked");
            } else {
                const rawValue = changedObject.val();
                value = options["autoTrimValues"] === "true" ? jsonEscape(rawValue) : jsonEscape(rawValue);
            }

            if (changedObject.prop("tagName").toLowerCase() === "input" && changedObject.prop("type").toLowerCase() === "radio") {
                changedObject.parents("div").attr("data-is-valid", "true");
            }
            
            setV(options["value"], dataPath, value);
            validateInput(changedObject);
            if (options["afterValueChanged"]) options["afterValueChanged"](options["value"], options["schema"]);
        }

        function renderSchemaNode(schemaNode, schemaName, requiredItems) {
            const nodeType = fixNU(schemaNode["type"], "string");
            if (nodeType === "string" || nodeType === "number" || nodeType === "integer" || nodeType === "boolean" || nodeType === "email" || nodeType === "tel")
                return renderSimpleNode(schemaNode, schemaName, (requiredItems ? requiredItems.includes(schemaName) : false));
            if (nodeType === "array") return renderArrayNode(schemaNode, schemaName);
            if (nodeType === "object") return renderObjectNode(schemaNode, schemaName);
            if (nodeType === "spacer") return renderSpacerNode(schemaNode, schemaName);
            return "";
        }

        function renderSimpleNode(schemaNode, schemaName, isRequired) {
            let ContainerT = '<table $hover-hint$ class="j-container"><tr class="j-oject-value-row">$$$</tr></table>';
            let TitleT = '<td class="j-title-col">$$$</td><td class="j-sep-col"></td>';
            let BodyT = '<td class="j-body-col">$$$</td>';
            let requiredAtt = "", requiredStar = "", inputBody = "", classAtt = "";
            let additionalClass = " " + getUISetting(schemaNode, "class", "");
            let nodeType = fixNU(schemaNode["type"], "string");
            let hoverHint = getUISetting(schemaNode, "hoverHint", "");
            let placeholderHint = getUISetting(schemaNode, "placeholderHint", "");
            let inlineHint = getUISetting(schemaNode, "inlineHint", "");
            let validationHint = getUISetting(schemaNode, "validationHint", "");
            let dataValueNameAtt = ' data-value-name="' + schemaName + '" ';

            let disabledAttr = getUISetting(schemaNode, "disabled", false) === false ? "" : ` disabled="disabled" `;

            if (hoverHint != "") hoverHint = 'title="' + hoverHint + '"';
            if (placeholderHint != "") placeholderHint = ' placeholder="' + placeholderHint + '" ';
            if (inlineHint != "") inlineHint = '<div class="j-inline-help">' + inlineHint + '</div>';
            if (validationHint != "") validationHint = '<div class="j-validation-help">' + validationHint + '</div>';
            if (isRequired) {
                requiredAtt = ' data-required="true" ';
                requiredStar = '&nbsp;&nbsp;<span class="j-required-star">*</span>';
            }

            if (nodeType == "boolean") {
                classAtt = ' class="j-input j-input-checkbox' + additionalClass + '" ';
                inputBody = '<input type="checkbox" ' + classAtt + dataValueNameAtt + requiredAtt + disabledAttr + ' />';
            } else {
                if (fixNU(schemaNode["enum"], "") == "") {
                    var editor = getUISetting(schemaNode, "editor", "text"), htmlEditor = "", minAtt = "", maxAtt = "", patternAtt = "";
                    if (nodeType == "date") { editor = "date"; patternAtt = " \d{4}-\d{2}-\d{2}"; }
                    if (nodeType == "email") editor = "email";
                    if (nodeType == "tel") editor = "tel";
                    if (nodeType == "number" || nodeType == "integer") editor = "number";
                    if (editor == "html") htmlEditor = '<div class="j-input j-input-html-div" ' + requiredAtt + ' contenteditable></div>';
                    minAtt = fixNU(schemaNode["minLength"], "") + fixNU(schemaNode["minimum"], "");
                    maxAtt = fixNU(schemaNode["maxLength"], "") + fixNU(schemaNode["maximum"], "");
                    if (minAtt != "") minAtt = ' data-min="' + minAtt + '" ';
                    if (maxAtt != "") maxAtt = ' data-max="' + maxAtt + '" ';

                    if (editor == "textarea") {
                        classAtt = ' class="j-input j-input-textarea' + additionalClass + '" ';
                        inputBody = '<textarea rows="4" ' + classAtt + dataValueNameAtt + requiredAtt + minAtt + maxAtt + disabledAttr + '></textarea>';
                    } else {
                        classAtt = ' class="j-input j-input-' + editor + additionalClass + '" ';
                        inputBody = (editor == "color" ? "&nbsp;&nbsp;" : "") + '<input type="' + editor + '" '
                            + classAtt + dataValueNameAtt + placeholderHint + requiredAtt + minAtt + maxAtt + disabledAttr + patternAtt + ' />' + htmlEditor;
                    }
                } else {
                    var editor = getUISetting(schemaNode, "editor", "select");
                    classAtt = ' class="j-input j-input-' + editor + additionalClass + '" ';

                    if (editor == "radio") {
                        var nameAtt = ' name="rdo_' + schemaName + '" ';

                        if (!isRequired) inputBody = '&nbsp;<label><input checked value="' + options["radioNullCaption"] + '" ' + classAtt + ' type="radio" ' + nameAtt
                            + dataValueNameAtt + requiredAtt + ' /> <span class="j-input-radio-label">null</span></label>&nbsp;&nbsp;&nbsp;';

                        jQuery.each(schemaNode["enum"], function (index) {
                            inputBody += '&nbsp;<label><input value="' + schemaNode["enum"][index] + '" type="radio" ' + classAtt + nameAtt + dataValueNameAtt + requiredAtt + disabledAttr
                                + ' /> <span class="j-input-radio-label">' + schemaNode["enum"][index] + '</span></label>&nbsp;&nbsp;&nbsp;';
                        });

                        inputBody = `<div ${requiredAtt} ${disabledAttr} data-is-valid="false">${inputBody}</div>`;
                    }

                    if (editor == "select") {
                        if (!isRequired) inputBody = '<option selected="true">' + options["selectNullCaption"] + '</option>';
                        jQuery.each(schemaNode["enum"], function (index) {
                            inputBody += '<option value="' + schemaNode["enum"][index] + '">' + schemaNode["enum"][index] + '</option>';
                        });
                        inputBody = '<select ' + classAtt + dataValueNameAtt + requiredAtt + disabledAttr + '>' + inputBody + "</select>";
                    }
                }
            }

            BodyT = BodyT.replace("$$$", inputBody + validationHint + inlineHint);
            TitleT = TitleT.replace("$$$", getSpacer(level) + getEC('') + getTitle(schemaNode, schemaName) + requiredStar);
            return ContainerT.replace("$$$", TitleT + BodyT).replace("$hover-hint$", hoverHint);
        }

        function renderObjectNode(schemaNode, schemaName) {
            var ContainerT = '<table class="j-container">$$$</table>';
            var TitleT = '<tr class="j-oject-title-row"><td class="j-title-col">$$$</td><td class="j-sep-col"></td><td class="j-body-col">$inlinehint$</td></tr>';
            var childClass = ((options["expandingLevel"] != -1 && level + 1 > options["expandingLevel"]) ? "j-collapsed" : "");
            var ecBtn = (childClass == "j-collapsed" ? "e" : "c");
            var properties = Object.keys(schemaNode["properties"]);
            var inlineHint = getUISetting(schemaNode, "inlineHint", "");
            if (inlineHint != "") inlineHint = '<span class="j-inline-help">' + inlineHint + '</span>';
            TitleT = TitleT.replace("$inlinehint$", inlineHint);
            var temp = "";

            var BodyT = '<tr class="' + childClass + '"><td colspan="3" data-value-name="' + schemaName + '">$$$</td></tr>';
            TitleT = TitleT.replace("$$$", getSpacer(level) + getEC(ecBtn) + getTitle(schemaNode, schemaName));
            TitleT = (options["renderFirstLevel"] == "false" && level == 0 ? "" : TitleT);

            level = level + 1;
            properties.forEach(function (item, index, arr) {
                temp += renderSchemaNode(schemaNode["properties"][item.toString()], item.toString(), schemaNode["required"]);
            });
            level = level - 1;
            return ContainerT.replace("$$$", TitleT + BodyT.replace("$$$", temp));
        }

        function renderArrayNode(schemaNode, schemaName) {
            var ContainerT = '<table class="j-container">$$$</table>';
            var TitleT = '<tr class="j-array-title-row"><td class="j-title-col">$$$&nbsp;$ArrTools$</td><td class="j-sep-col"></td><td class="j-body-col">$inlinehint$</td></tr>';
            var childClass = ((options["expandingLevel"] != -1 && level + 1 > options["expandingLevel"]) ? "j-collapsed" : "");
            var ecBtn = (childClass == "j-collapsed" ? "e" : "c");
            var itemTemplateId = schemaName + "_" + level;
            var BodyT = '<tr class="' + childClass + '"><td colspan="3" data-value-name="' + schemaName + '" class="j-array-items">$$$</td></tr>';
            var inlineHint = getUISetting(schemaNode, "inlineHint", "");
            if (inlineHint != "") inlineHint = '<div class="j-inline-help">' + inlineHint + '</div>';
            TitleT = TitleT.replace("$$$", getSpacer(level) + getEC(ecBtn) + getTitle(schemaNode, schemaName));
            TitleT = TitleT.replace("$ArrTools$", '<span class="j-add-array-item" data-array-loaded="false" data-template-id="' + itemTemplateId + '">[+]</span>');
            TitleT = TitleT.replace("$inlinehint$", inlineHint);

            var arrType = getArrayType(schemaNode);
            var itemDataTemplate = null, itemContainerT = null;
            var arrSchema = { "title": "", "type": arrType };

            level++;
            if (arrType == "string" || arrType == "number" || arrType == "boolean" || arrType == "email" || arrType == "tel") {
                if (schemaNode["items"] && schemaNode["items"]["ui"]) arrSchema["ui"] = schemaNode["items"]["ui"];
                if (schemaNode["items"] && schemaNode["items"]["enum"]) arrSchema["enum"] = schemaNode["items"]["enum"];
                arrSchema["title"] = arrSchema["title"] + ' [$index$] <span class="j-remove-array-item" data-index="$index$"> X </span>';
                itemContainerT = renderSimpleNode(arrSchema, "$index$");
            }

            if (arrType.startsWith("#")) {
                const pathSegments = arrType.replace('#/', "").split('/');
                const r = `['${pathSegments.join("']['")}']`;
                arrSchema = JSON.parse(JSON.stringify(V(options["schema"], r)));
                arrSchema["title"] = `${fixNU(arrSchema["title"], "")} [\$index\$] <span class="j-remove-array-item" data-index="\$index\$"> X </span>`;
                itemContainerT = renderSchemaNode(arrSchema, "$index$");
            }
            level--;

            arrayTemplates[itemTemplateId] = { "htmlTemplate": itemContainerT, "dataTemplate": itemDataTemplate };
            return ContainerT.replace("$$$", TitleT + BodyT.replace("$$$", ""));
        }

        function renderSpacerNode(schemaNode, schemaName) {
            return `<div class="j-spacer-row">${fixNU(schemaNode["title"], "")}</div>`;
        }

        function getTitle(schemaNode, schemaName) {
            return '<label>' + fixNU(schemaNode["title"], schemaName) + "</label>";
        }

        function getIdBasedDataPath(dataPath) {
            let n = replaceAll(dataPath, '][', '_');
            n = n.replaceAll(n, '[', '');
            n = n.replaceAll(n, ']', '');
            n = n.replaceAll(n, '"', '');
            n = n.replaceAll(n, "'", '');
            return renderPlace.attr("id") + "_" + n;
        }

        function initValuePathes() {
            renderPlace.find("[data-value-name]").each(function () {
                var dp = generatePath($(this));
                $(this).attr("data-path", dp);
                if (dp) {
                    $(this).attr("id", getIdBasedDataPath(dp));
                    $(this).parents("table:first").find("label:first").attr("for", $(this).attr("id"));
                }
            });
        }

        function generatePath(o) {
            var p = [];
            o.parents("[data-value-name]").each(function () {
                p.push("['" + $(this).attr("data-value-name") + "']");
            });
            var r = p.reverse().join(".");
            r = replaceAll(r, ".[", "[");
            r = replaceAll(r, "['']", "");
            r = r + "['" + o.attr("data-value-name") + "']";
            return r;
        }

        function setValue(v) {
            addArrayItemsToTheDOM();
            renderPlace.find("input[data-path],select[data-path],textarea[data-path]").each(function () {
                if ($(this).prop("tagName").toLowerCase() == "input" && $(this).prop("type").toLowerCase() == "checkbox") {
                    $(this).prop("checked", V(v, $(this).attr("data-path")) == true ? true : false);
                } else if ($(this).prop("tagName").toLowerCase() == "input" && $(this).prop("type").toLowerCase() == "radio") {
                    $('[data-path="' + $(this).attr("data-path") + '"][value="' + V(v, $(this).attr("data-path")) + '"]').prop("checked", true);
                } else {
                    if (options["autoTrimValues"] == "true") {
                        var _temp = V(v, $(this).attr("data-path"));
                        if (_temp) _temp = _temp;
                        $(this).val(_temp);
                    } else {
                        $(this).val(V(v, $(this).attr("data-path")));
                    }
                    if ($(this).hasClass("j-input-html")) {
                        $(this).parents(":first").find(".j-input-html-div:first").html($(this).val());
                    }
                }
            });
            options["value"] = v;
        }

        function addArrayItemsToTheDOM() {
            const arrayNodes = renderPlace.find('[data-array-loaded="false"]');
            if (arrayNodes.length === 0) {
                initValuePathes();
                return;
            }
            arrayNodes.each(function () {
                const addArrayItemBtn = $(this);
                let dataPath = addArrayItemBtn.parents("tr:first").next("tr").find("td:first").attr("data-path");
                if (dataPath === undefined) {
                    const o = addArrayItemBtn.parents("tr:first").next("tr").find("td:first");
                    o.attr("data-path", generatePath(o));
                    dataPath = addArrayItemBtn.parents("tr:first").next("tr").find("td:first").attr("data-path");
                }
                const arr = V(options["value"], dataPath);
                if (arr && Array.isArray(arr)) {
                    arr.forEach(function (item, index, arr) {
                        addArrayItem(addArrayItemBtn, false, index);
                    });
                }
                addArrayItemBtn.attr("data-array-loaded", "true");
            });

            addArrayItemsToTheDOM();
        }

        function getValue() {
            return options["value"];
        }

        function getSchema() {
            return options["schema"];
        }

        function getUISetting(schemaNode, name, ifNU) {
            return (schemaNode["ui"] && schemaNode["ui"][name] ? schemaNode["ui"][name] : ifNU);
        }

        function getArrayType(schemaNode) {
            var type = (schemaNode["items"] != undefined && schemaNode["items"]["type"] != undefined ? schemaNode["items"]["type"] : "");
            if (type == "") {
                type = (schemaNode["items"] != undefined && schemaNode["items"]["$ref"] != undefined ? schemaNode["items"]["$ref"] : "string");
            }
            return type;
        }

        function ensureDataPath(dataPath) {
            const pathParts = replaceAll(dataPath, "][", "].[").split('.');
            let pathCursor = "";
            pathParts.forEach((item) => {
                pathCursor += item.toString();
                if (V(options["value"], pathCursor) === undefined || V(options["value"], pathCursor) === null) {
                    setV(options["value"], pathCursor, {});
                }
            });
        }

        function V(o, p) {
            try {
                // Parse path like ["stringField"] or ["objectArray"][0]["name"]
                if (!p || p === '') return o;
                
                // Remove leading brackets and split by '][' 
                const pathParts = p.replace(/^\[/, '').replace(/\]$/, '').split('][');
                let current = o;
                
                for (let part of pathParts) {
                    if (part === '') continue;
                    // Remove quotes from property names
                    const cleanPart = part.replace(/^['"]|['"]$/g, '');
                    
                    if (current === null || current === undefined) {
                        return null;
                    }
                    
                    // Handle array indices (numeric) vs object properties
                    if (/^\d+$/.test(cleanPart)) {
                        current = current[parseInt(cleanPart)];
                    } else {
                        current = current[cleanPart];
                    }
                }
                
                return current;
            } catch (e) { 
                return null; 
            }
        }

        function setV(o, p, value) {
            try {
                if (!p || p === '') return;
                
                // Remove leading brackets and split by '][' 
                const pathParts = p.replace(/^\[/, '').replace(/\]$/, '').split('][');
                let current = o;
                
                // Navigate to the parent of the target property
                for (let i = 0; i < pathParts.length - 1; i++) {
                    const part = pathParts[i];
                    if (part === '') continue;
                    
                    const cleanPart = part.replace(/^['"]|['"]$/g, '');
                    
                    if (current[cleanPart] === undefined || current[cleanPart] === null) {
                        // Determine if next part is array index or object property
                        const nextPart = pathParts[i + 1];
                        const nextCleanPart = nextPart ? nextPart.replace(/^['"]|['"]$/g, '') : '';
                        current[cleanPart] = /^\d+$/.test(nextCleanPart) ? [] : {};
                    }
                    
                    current = current[cleanPart];
                }
                
                // Set the final property
                const finalPart = pathParts[pathParts.length - 1];
                if (finalPart !== '') {
                    const cleanFinalPart = finalPart.replace(/^['"]|['"]$/g, '');
                    if (/^\d+$/.test(cleanFinalPart)) {
                        current[parseInt(cleanFinalPart)] = value;
                    } else {
                        current[cleanFinalPart] = value;
                    }
                }
            } catch (e) {
                console.error('Error setting value:', e);
            }
        }

        function jsonEscape(str) {
            return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
        }

        function getEC(ECType) {
            if (options["treeExpandCollapseButton"] != "true") return "";
            if (ECType == "e") return '<span class="j-ec">+</span>&nbsp;&nbsp;';
            if (ECType == "c") return '<span class="j-ec">-</span>&nbsp;&nbsp;';
            return '';
        }

        function toggleSubTree(btn) {
            var state = $(btn).text().trim();
            if (state == "-") { collapseByECButton(btn); } else if (state == "+") { expandByECButton(btn); }
        }

        function expandByECButton(btn) {
            $(btn).text("-");
            $(btn).parents("tr:first").next("tr").removeClass("j-collapsed");
        }

        function collapseByECButton(btn) {
            $(btn).text("+");
            $(btn).parents("tr:first").next("tr").addClass("j-collapsed");
        }

        function getSpacer(number) {
            var spaces = "";
            var n = number + (options["renderFirstLevel"] == "false" ? -1 : 0);
            for (i = 1; i < n * options["indenting"]; i++) {
                spaces += "&nbsp;";
            }
            return '<span class="j-spacer">' + spaces + '</span>';
        }

        function fixNU(o, v) {
            return o || v;
        }

        function replaceAll(source, find, replace) {
            var str = source;
            return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
        }


    }
}(jQuery));
