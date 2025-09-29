(function ($) {
    console.log("🔥 JsonToForm script loaded");
    
    $.fn.jsonToForm = function (options) {
        console.log("🚀 JsonToForm plugin initialized");

        var renderPlace = this;
        var level = 0;
        var arrayTemplates = {};
        initOptions();
        initWidget();

        // Global function for direct removal
        window.removeArrayItemDirect = function(button) {
            console.log("🗑️ Direct removal function called", button);
            
            var $button = $(button);
            var itemIndex = $button.attr("data-index");
            console.log("Button index:", itemIndex);
            
            // Find the container to remove
            var $arrayItem = $button.closest(".j-array-item");
            if ($arrayItem.length === 0) {
                $arrayItem = $button.closest(".j-container");
            }
            console.log("Container to remove:", $arrayItem);
            
            if ($arrayItem.length > 0) {
                // Find array container
                var $arrayContainer = $arrayItem.closest(".j-array-container");
                console.log("Array container:", $arrayContainer);
                
                if ($arrayContainer.length > 0) {
                    var dataPath = $arrayContainer.attr("data-path");
                    if (!dataPath) {
                        dataPath = generatePath($arrayContainer);
                    }
                    console.log("Data path:", dataPath);
                    
                    try {
                        // Remove from data
                        eval('options["value"]' + dataPath + '.splice(' + itemIndex + ',1);');
                        
                        // Remove from DOM
                        $arrayItem.remove();
                        
                        // Refresh
                        setValue(options["value"]);
                        
                        console.log("✅ Item removed successfully!");
                    } catch (error) {
                        console.error("❌ Error:", error);
                    }
                }
            }
        };

        var output = {
            "isValid": function () { return isValid(); },
            "getSchema": function () { return getSchema(); },
            "getValue": function () { return getValue(); },
            "setValue": function (v) { return setValue(v); },
            // Render mode functions removed
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
            // Render mode functionality removed - using only default current mode
        }

        function initWidget() {
            console.log("🏗️ InitWidget called");
            level = 0;
            arrayTemplates = {};
            var widgetContent = "";
            
            // Mode selector functionality removed
            
            widgetContent += renderSchemaNode(options["schema"], "");
            console.log("📄 Generated HTML content:", widgetContent);
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

        function validateInput(elm) {
            var v_required = fixNU(elm.attr("data-required"), "false"),
                v_min = elm.attr("data-min"), v_max = elm.attr("data-max");

            v_min = (v_min ? parseFloat(v_min) : null);
            v_max = (v_max ? parseFloat(v_max) : null);

            if (elm.hasClass("j-input-text") || elm.hasClass("j-input-textarea") || elm.hasClass("j-input-select") || elm.hasClass("j-input-number") || elm.hasClass("j-input-date")) {
                elm.attr("data-is-valid", (v_required == "true" && fixNU(elm.val(), "") == "" ? "false" : "true"));
                if (elm.attr("data-is-valid") == "false") return;
                if (v_min) {
                    if (elm.hasClass("j-input-text") || elm.hasClass("j-input-textarea")) {
                        elm.attr("data-is-valid", (elm.val().length < v_min ? "false" : "true"));
                        if (elm.attr("data-is-valid") == "false") return;
                    }
                    if (elm.hasClass("j-input-number")) {
                        elm.attr("data-is-valid", (elm.val() < v_min ? "false" : "true"));
                        if (elm.attr("data-is-valid") == "false") return;
                    }
                }
                if (v_max) {
                    if (elm.hasClass("j-input-text") || elm.hasClass("j-input-textarea")) {
                        elm.attr("data-is-valid", (elm.val().length > v_max ? "false" : "true"));
                        if (elm.attr("data-is-valid") == "false") return;
                    }

                    if (elm.hasClass("j-input-number")) {
                        elm.attr("data-is-valid", (elm.val() > v_max ? "false" : "true"));
                        if (elm.attr("data-is-valid") == "false") return;
                    }
                }
            }
            if (elm.hasClass("j-input-email")) {
                let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/; // Regex validation for international number
                elm.attr("data-is-valid", (regex.test(elm.val())));
            }
            if (elm.hasClass("j-input-tel")) {
                let regex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/; // Regex validation for email
                elm.attr("data-is-valid", (regex.test(elm.val())));
            }
            if (elm.hasClass("j-input-checkbox")) {
                elm.attr("data-is-valid", (v_required == "true" && elm.prop("checked") == false ? "false" : "true"));
            }
            if (elm.hasClass("j-input-radio")) {
                elm.parent().parent().find('input[type=radio]').each(function () {
                    if ($(this).prop("checked")) {
                        elm.parent().parent().attr("data-is-valid", "true");
                    }
                });
            }

            if (elm.hasClass("j-input-html")) {
                let v = (elm.next(".j-input-html-div:first").text() == "")
                elm.next(".j-input-html-div:first").attr("data-is-valid", (v_required == "true" && v ? "false" : "true"));
            }
        }

        function isValid() {
            return renderPlace.find('[data-is-valid="false"]:first').length === 0;
        }

        function initEvents() {
            console.log("InitEvents called - setting up event delegation");
            // Use event delegation for dynamic elements
            renderPlace.off("click", ".j-ec").on("click", ".j-ec", function () { toggleSubTree(this); });
            renderPlace.off("click", ".j-add-array-item").on("click", ".j-add-array-item", function () { addArrayItem($(this), true, null); });
            renderPlace.off("click", ".j-remove-array-item").on("click", ".j-remove-array-item", function () { 
                console.log("Remove button clicked - event delegated correctly");
                removeArrayItem($(this)); 
            });
            
            // Direct binding for input events
            renderPlace.find(".j-input-text,.j-input-textarea,.j-input-date,.j-input-number,.j-input-email,.j-input-tel").off("keyup").on("keyup", function () { valueChanged($(this)) });
            renderPlace.find(".j-input-checkbox,.j-input-radio,.j-input-select,.j-input-color,.j-input-date,.j-input-number,.j-input-html").off("change").on("change", function () { valueChanged($(this)) });
            renderPlace.find(".j-input-html-div").off("keyup").on("keyup", function () { changeInput($(this)) });
            renderPlace.find(".j-input-html").off("focus").on("focus", function () { $(this).parents("td:first").find(".j-input-html-div:first").focus(); });
            
            // Mode selector event removed
        }

        function changeInput(htmlDiv) {
            var i = htmlDiv.parents(":first").find("input:first");
            i.val(htmlDiv.html());
            valueChanged(i);
        }

        function removeArrayItem(arrItem) {
            console.log("Remove button clicked, button element:", arrItem[0]);
            console.log("Button data-index:", arrItem.attr("data-index"));
            console.log("Button parent elements:", arrItem.parents());
            
            // Find the array item container (should be immediate parent or close ancestor)
            var nodeToRemove = arrItem.closest(".j-array-item");
            console.log("Found j-array-item:", nodeToRemove);
            
            if (nodeToRemove.length === 0) {
                // Fallback: try to find by going up the DOM
                nodeToRemove = arrItem.parent().closest(".j-container");
                console.log("Fallback - found container:", nodeToRemove);
            }
            
            if (nodeToRemove.length === 0) {
                console.error("Could not find any container to remove");
                return;
            }
            
            // Find the array container
            var arrayContainer = nodeToRemove.closest(".j-array-container");
            console.log("Array container:", arrayContainer);
            
            if (arrayContainer.length === 0) {
                console.error("Could not find array container");
                return;
            }
            
            // Get the index from the button
            var itemIndex = arrItem.attr("data-index");
            if (!itemIndex && itemIndex !== 0) {
                console.error("No data-index found on button");
                return;
            }
            
            // Get data path
            var dataPath = arrayContainer.attr("data-path");
            if (!dataPath) {
                dataPath = generatePath(arrayContainer);
            }
            console.log("Data path:", dataPath, "Index:", itemIndex);
            
            try {
                // Remove from data
                eval('options["value"]' + dataPath + '.splice(' + itemIndex + ',1);');
                
                // Remove from DOM
                nodeToRemove.remove();
                
                // Refresh the form
                setValue(options["value"]);
                
                if (options["afterValueChanged"]) {
                    options["afterValueChanged"](options["value"], options["schema"]);
                }
                
                console.log("✅ Array item removed successfully!");
            } catch (error) {
                console.error("❌ Error removing array item:", error);
            }
        }

        function addArrayItem(arrayContainer, needInitiations, itemIndex) {
            var tId = arrayContainer.attr("data-template-id");
            if (!tId || !arrayTemplates[tId]) {
                return;
            }
            var htmlTemplate = arrayTemplates[tId]["htmlTemplate"];
            var dataTemplate = JSON.parse(JSON.stringify(arrayTemplates[tId]["dataTemplate"]));
            
            var arrayBody, arrayContainerElement, dataPath;
            
            // Use default array container handling
            arrayContainerElement = arrayContainer.closest(".j-array-container");
            arrayBody = arrayContainerElement.find(".j-array-body");
            
            if (!arrayContainerElement.length || !arrayBody.length) {
                return;
            }
            
            dataPath = arrayContainerElement.attr("data-path");
            if (!dataPath) {
                dataPath = generatePath(arrayContainerElement);
                arrayContainerElement.attr("data-path", dataPath);
            }
            
            if (V(options["value"], dataPath) == undefined || V(options["value"], dataPath) == null) {
                eval('options["value"]' + dataPath + "=[];");
            }

            if (itemIndex == null) {
                var arrLen = null;
                eval('options["value"]' + dataPath + ".push(dataTemplate);");
                eval('arrLen = options["value"]' + dataPath + ".length;");
                itemIndex = arrLen - 1;
            }

            console.log("Before replacement - HTML template:", htmlTemplate);
            htmlTemplate = replaceAll(htmlTemplate, "$index$", itemIndex);
            console.log("After replacement - HTML template:", htmlTemplate);
            console.log("Adding to arrayBody:", arrayBody);
            arrayBody.append(htmlTemplate);
            console.log("DOM after append:", arrayBody.html());

            if (needInitiations) {
                initValuePathes();
                initEvents();
                console.log("Events re-initialized for new array item");
            }
        }

        function valueChanged(changedObject) {
            ensureDataPath(changedObject.attr("data-path"));
            let p = 'options["value"]' + changedObject.attr("data-path");
            if (changedObject.prop("tagName").toLowerCase() == "input" && changedObject.prop("type").toLowerCase() == "checkbox") {
                p = p + "=" + (changedObject.prop("checked") == true ? "true" : "false") + ";";
            } else {
                p = p + "='" + (options["autoTrimValues"] == "true" ? jsonEscape(changedObject.val()) : jsonEscape(changedObject.val())) + "';";
            }

            if (changedObject.prop("tagName").toLowerCase() == "input" && changedObject.prop("type").toLowerCase() == "radio") {
                changedObject.parents("div").attr("data-is-valid", "true");
            }
            eval(p);
            validateInput(changedObject);
            if (options["afterValueChanged"]) options["afterValueChanged"](options["value"], options["schema"]);
        }

        function renderSchemaNode(schemaNode, schemaName, requiredItems) {
            // Use only default rendering mode
            var nodeType = fixNU(schemaNode["type"], "string");
            if (nodeType == "string" || nodeType == "number" || nodeType == "integer" || nodeType == "boolean" || nodeType == "email" || nodeType == "tel")
                return renderSimpleNode(schemaNode, schemaName, (requiredItems ? requiredItems.includes(schemaName) : false));
            if (nodeType == "array") return renderArrayNode(schemaNode, schemaName);
            if (nodeType == "object") return renderObjectNode(schemaNode, schemaName);
            if (nodeType == "spacer") return renderSpacerNode(schemaNode, schemaName);
            return "";
        }

        function renderSimpleNode(schemaNode, schemaName, isRequired) {
            let ContainerT = '<div $hover-hint$ class="j-container"><div class="j-field-row">$$$</div></div>';
            let TitleT = '<div class="j-label-col">$$$</div>';
            let BodyT = '<div class="j-input-col">$$$</div>';
            let ActionT = '<div class="j-action-col">$$$</div>';
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
            
            // اضافه کردن ستون action برای array items
            let actionContent = "";
            if (schemaName === "$index$") {
                actionContent = '<button class="j-remove-array-item" data-index="$index$" onclick="window.testRemove(this);" title="حذف این آیتم"></button>';
            }
            ActionT = ActionT.replace("$$$", actionContent);
            
            var result = ContainerT.replace("$$$", TitleT + BodyT + ActionT).replace("$hover-hint$", hoverHint);
            if (schemaName === "$index$") {
                console.log("🏗️ Rendering array item:", {
                    schemaName: schemaName,
                    ContainerT: ContainerT,
                    TitleT: TitleT,
                    BodyT: BodyT,
                    ActionT: ActionT,
                    result: result
                });
            }
            return result;
        }

        function renderObjectNode(schemaNode, schemaName) {
            var ContainerT = '<div class="j-object-container" data-value-name="' + schemaName + '">$$$</div>';
            var childClass = ((options["expandingLevel"] != -1 && level + 1 > options["expandingLevel"]) ? "j-collapsed" : "");
            var ecBtn = (childClass == "j-collapsed" ? "e" : "c");
            var properties = Object.keys(schemaNode["properties"]);
            var inlineHint = getUISetting(schemaNode, "inlineHint", "");
            if (inlineHint != "") inlineHint = '<span class="j-inline-help">' + inlineHint + '</span>';
            
            var TitleT = '<div class="j-object-header">' + getSpacer(level) + getEC(ecBtn) + getTitle(schemaNode, schemaName) + inlineHint + '</div>';
            var BodyT = '<div class="j-object-body ' + childClass + '">$$$</div>';
            
            TitleT = (options["renderFirstLevel"] == "false" && level == 0 ? "" : TitleT);
            var temp = "";

            level = level + 1;
            properties.forEach(function (item, index, arr) {
                temp += renderSchemaNode(schemaNode["properties"][item.toString()], item.toString(), schemaNode["required"]);
            });
            level = level - 1;
            return ContainerT.replace("$$$", TitleT + BodyT.replace("$$$", temp));
        }

        function renderArrayNode(schemaNode, schemaName) {
            var ContainerT = '<div class="j-array-container" data-value-name="' + schemaName + '">$$$</div>';
            var childClass = ((options["expandingLevel"] != -1 && level + 1 > options["expandingLevel"]) ? "j-collapsed" : "");
            var ecBtn = (childClass == "j-collapsed" ? "e" : "c");
            var itemTemplateId = schemaName + "_" + level;
            var inlineHint = getUISetting(schemaNode, "inlineHint", "");
            if (inlineHint != "") inlineHint = '<div class="j-inline-help">' + inlineHint + '</div>';
            
            var TitleT = '<div class="j-array-header">' + getSpacer(level) + getEC(ecBtn) + getTitle(schemaNode, schemaName) + 
                         '<button class="j-add-array-item" data-array-loaded="false" data-template-id="' + itemTemplateId + '" title="افزودن آیتم جدید">+</button>' + 
                         inlineHint + '</div>';
            var BodyT = '<div class="j-array-body ' + childClass + '">$$$</div>';

            var arrType = getArrayType(schemaNode);
            var itemDataTemplate = null, itemContainerT = null;
            var arrSchema = { "title": "", "type": arrType };

            level++;
            if (arrType == "string" || arrType == "number" || arrType == "boolean" || arrType == "email" || arrType == "tel") {
                if (schemaNode["items"] && schemaNode["items"]["ui"]) arrSchema["ui"] = schemaNode["items"]["ui"];
                if (schemaNode["items"] && schemaNode["items"]["enum"]) arrSchema["enum"] = schemaNode["items"]["enum"];
                arrSchema["title"] = arrSchema["title"] + ' [$index$]';
                var simpleNodeHtml = renderSimpleNode(arrSchema, "$index$");
                console.log("Simple node HTML:", simpleNodeHtml);
                itemContainerT = '<div class="j-array-item" data-index="$index$">' + simpleNodeHtml + '</div>';
                console.log("Item container template:", itemContainerT);
                itemDataTemplate = "";
            } else if (arrType == "object") {
                // Handle object arrays
                if (schemaNode["items"]) {
                    arrSchema = JSON.parse(JSON.stringify(schemaNode["items"]));
                    arrSchema["title"] = fixNU(arrSchema["title"], "") + ' [$index$]';
                    itemContainerT = '<div class="j-array-item" data-index="$index$">' + renderSchemaNode(arrSchema, "$index$") + '</div>';
                    itemDataTemplate = {};
                }
            } else if (arrType.startsWith("#")) {
                var r = "['" + replaceAll(arrType.replace('#/', ""), '/', "']['") + "']";
                arrSchema = JSON.parse(JSON.stringify(V(options["schema"], r)));
                arrSchema["title"] = fixNU(arrSchema["title"], "") + ' [$index$]';
                itemContainerT = '<div class="j-array-item" data-index="$index$">' + renderSchemaNode(arrSchema, "$index$") + '</div>';
                itemDataTemplate = {};
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
            if (!dataPath) return "";
            let n = replaceAll(dataPath, '][', '_');
            n = replaceAll(n, '[', '');
            n = replaceAll(n, ']', '');
            n = replaceAll(n, '"', '');
            n = replaceAll(n, "'", '');
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
            var arrayNodes = renderPlace.find('[data-array-loaded="false"]');
            if (arrayNodes.length == 0) {
                initValuePathes();
                return;
            }
            arrayNodes.each(function () {
                var addArrayItemBtn = $(this);
                var arrayContainer, arrayBody, dataPath;
                
                // Use default array container handling
                arrayContainer = addArrayItemBtn.closest(".j-array-container");
                arrayBody = arrayContainer.find(".j-array-body");
                
                if (arrayContainer.length === 0 || arrayBody.length === 0) {
                    return;
                }
                
                dataPath = arrayContainer.attr("data-path");
                if (!dataPath) {
                    dataPath = generatePath(arrayContainer);
                    arrayContainer.attr("data-path", dataPath);
                }
                
                var arr = V(options["value"], dataPath);
                
                if (arr && Array.isArray(arr)) {
                    arr.forEach(function (item, index) {
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
            var pathParts = replaceAll(dataPath, "][", "].[").split('.');
            var pathCursor = "";
            pathParts.forEach(function (item, index, arr) {
                pathCursor = pathCursor + item.toString();
                if (V(options["value"], pathCursor) === undefined || V(options["value"], pathCursor) === null) {
                    var phrase = 'options["value"]' + pathCursor + '={};';
                    eval(phrase);
                }
            });
        }

        function V(o, p) {
            try {
                return eval("o" + p);
            } catch (e) { return null; }
        }

        function jsonEscape(str) {
            if (!str) return "";
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
            // Find the next sibling body element for div-based structure
            var $header = $(btn).closest('.j-object-header, .j-array-header');
            var $body = $header.next('.j-object-body, .j-array-body');
            if ($body.length > 0) {
                $body.removeClass("j-collapsed");
            }
        }

        function collapseByECButton(btn) {
            $(btn).text("+");
            // Find the next sibling body element for div-based structure
            var $header = $(btn).closest('.j-object-header, .j-array-header');
            var $body = $header.next('.j-object-body, .j-array-body');
            if ($body.length > 0) {
                $body.addClass("j-collapsed");
            }
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
            if (!source) return "";
            var str = source;
            return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
        }

        // Mode selector and render mode functions removed

        // renderSchemaNodeWithMode function removed

        // All PropertyGrid and StandardForm rendering functions removed - using only default current mode


    }
}(jQuery));
