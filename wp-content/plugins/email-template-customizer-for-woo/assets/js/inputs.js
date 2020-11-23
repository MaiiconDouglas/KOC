'use strict';
var $ = jQuery;

const viWecInforIcons = [];
for (let type in viWecParams.infor_icons) {
    for (let i in viWecParams.infor_icons[type]) {
        viWecInforIcons.push({
            icon: viWecParams.infor_icons[type][i].slug,
            text: viWecParams.infor_icons[type][i].text,
            value: `<img style="vertical-align: sub" src='${viWecParams.infor_icons[type][i].id}'>`
        });
    }
}

const viWecSocialIcons = [];
for (let type in viWecParams.social_icons) {
    for (let i in viWecParams.social_icons[type]) {
        viWecSocialIcons.push({
            icon: viWecParams.social_icons[type][i].slug,
            text: viWecParams.social_icons[type][i].text,
            value: `<img style="vertical-align: sub" src='${viWecParams.social_icons[type][i].id}'>`
        });
    }
}

window.viWecRgb2hex = (rgb) => {
    if (rgb) {
        let match = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        if (match && match.length === 4) {
            if (match.input.split(',').length === 3) {
                let hex = '#';
                hex += ("0" + parseInt(match[1], 10).toString(16)).slice(-2);
                hex += ("0" + parseInt(match[2], 10).toString(16)).slice(-2);
                hex += ("0" + parseInt(match[3], 10).toString(16)).slice(-2);
                return hex;
            } else {
                return '';
            }
        } else {
            return rgb;
        }
    }
};


var Input = {

    init: function (name) {
    },

    onChange: function (event, node) {
        if (event.data && event.data.element) {
            event.data.element.trigger('propertyChange', [$(this).val(), this]);
        }
    },

    renderTemplate: function (name, data) {
        return viWecTmpl("viwec-input-" + name, data);
    },

    setValue: function (value) {
        $('input', this.element).val(value);
    },

    render: function (name, data, callback) {
        this.element = $(this.renderTemplate(name, data));

        //bind events
        if (this.events)
            for (let i in this.events) {
                let ev = this.events[i][0];
                let fun = this[this.events[i][1]];
                let el = this.events[i][2];

                this.element.on(ev, el, {element: this.element, input: this}, fun);
            }

        if (typeof callback == "function") {
            callback(data, this.element);
        }
        return this.element;
    }
};

var TextInput = $.extend({}, Input, {

        events: [
            ["keyup", "onChange", "input"],
        ],

        init: function (data) {
            let textField = this.render("textinput", data);
            let cursorPos, ul = $(textField).find('.viwec-quick-shortcode-list');

            textField.on('focusout', 'input', function () {
                cursorPos = this.selectionStart
            });

            textField.one('click', '.viwec-quick-shortcode', () => {
                ul.append(viWecShortcodeListValue);
            });

            textField.on('click', '.viwec-quick-shortcode', function () {
                $('.viwec-quick-shortcode-list').not(ul).hide();
                ul.toggle();
            });

            textField.on('click', 'li', function () {
                let sc = $(this).text();
                let currentText = textField.find('input').val(), newText;

                if (cursorPos) {
                    let before = currentText.substr(0, cursorPos);
                    let after = currentText.substr(cursorPos + 1);
                    newText = before + sc + after;
                } else {
                    newText = currentText + sc;
                }

                // newText = viWecReplaceShortcode(newText);
                textField.find('input').val(newText).keyup();
            });

            return textField;
        },
    }
);

var TextareaInput = $.extend({}, Input, {

        events: [
            ["keyup", "onChange", "textarea"],
        ],

        setValue: function (value) {
            $('textarea', this.element).val(value);
        },

        init: function (data) {
            return this.render("textareainput", data);
        },
    }
);

var CheckboxInput = $.extend({}, Input, {

        onChange: function (event, node) {
            if (event.data && event.data.element) {
                event.data.element.trigger('propertyChange', [this.checked, this]);
            }
        },
        setValue: function (value) {
            if (value === 'true') {
                $('input', this.element).prop('checked', true);
            }
        },
        events: [
            ["change", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("checkboxinput", data);
        },
    }
);

var SelectInput = $.extend({}, Input, {
        events: [
            ["change", "onChange", "select"],
        ],

        setValue: function (value) {
            $('select', this.element).val(value);
        },

        init: function (data) {
            return this.render("select", data);
        },
    }
);

var SelectGroupInput = $.extend({}, Input, {
        events: [
            ["change", "onChange", "select"],
        ],

        setValue: function (value) {
            $('select', this.element).val(value);
        },

        init: function (data) {
            return this.render("select-group", data);
        },
    }
);

var Select2Input = $.extend({}, Input, {
        events: [
            ["change", "onChange", "select"],
        ],

        setValue: function (value) {
            value = value.split(',');
            $('select', this.element).val(value);
        },

        init: function (data) {
            return this.render("select2", data);
        },
    }
);

var LinkInput = $.extend({}, TextInput, {
        events: [
            ["change", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("textinput", data);
        },

    }
);

var RangeInput = $.extend({}, Input, {

        events: [
            ["change", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("rangeinput", data);
        },
        setValue: function (value) {
            $('input', this.element).val(parseInt(value));
        }
    }
);

var NumberInput = $.extend({}, Input, {

        events: [
            ["change keyup", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("numberinput", data);
        },

        setValue: function (value) {
            $('input', this.element).val(parseInt(value));
        },

        onChange: function (event) {
            let value = event.target.max && parseInt(this.value) >= parseInt(event.target.max) ? parseInt(event.target.max) : this.value;

            $(event.target).val(value);
            if (event.data && event.data.element) {
                event.data.element.trigger('propertyChange', [value, this]);
            }
        },
    }
);

var DateInput = $.extend({}, Input, {

        events: [
            ["change keyup", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("dateinput", data);
        },

        // onChange: function (event) {
        //     let value = event.target.max && parseInt(this.value) >= parseInt(event.target.max) ? parseInt(event.target.max) : this.value;
        //
        //     $(event.target).val(value);
        //     if (event.data && event.data.element) {
        //         event.data.element.trigger('propertyChange', [value, this]);
        //     }
        // },
    }
);

var CssUnitInput = $.extend({}, Input, {

        number: 0,
        unit: "px",

        events: [
            ["change", "onChange", "select"],
            ["change keyup mouseup", "onChange", "input"],
        ],

        onChange: function (event) {

            if (event.data && event.data.element) {
                let input = event.data.input;
                if (this.value != "") input[this.name] = this.value;// this.name = unit or number
                if (input['unit'] == "") input['unit'] = "px";//if unit is not set use default px

                var value = "";
                if (input.unit == "auto") {
                    $(event.data.element).addClass("auto");
                    value = input.unit;
                } else {
                    $(event.data.element).removeClass("auto");
                    value = input.number + input.unit;
                }

                event.data.element.trigger('propertyChange', [value, this]);
            }
        },

        setValue: function (value) {
            this.number = parseInt(value);
            this.unit = value.replace(this.number, '');

            if (this.unit == "auto") $(this.element).addClass("auto");

            $('input', this.element).val(this.number);
            $('select', this.element).val(this.unit);
        },

        init: function (data) {
            return this.render("cssunitinput", data);
        },
    }
);

var ColorInput = $.extend({}, Input, {
        events: [
            ["change", "onChange", "input"],
        ],

        setValue: function (value) {
            $('input', this.element).val(viWecRgb2hex(value));
            $('.viwec-color-picker', this.element).css('background-color', viWecRgb2hex(value));
        },

        init: function (data) {
            let node = this.render("colorinput", data, function (data, element) {
                $('.viwec-clear', element).on('click', function () {
                    $('.viwec-color-picker', element).css('background-color', 'transparent').val('').change();
                });
            });

            $('.viwec-color-picker', node).iris({
                change: function (ev, ui) {
                    $(this).val(ui.color.toString()).trigger('change');
                    $(this).css('background-color', ui.color.toString());
                }
            }).on('click', function (e) {
                let panel = $('#viwec-control-panel');
                let right = node.offset().left - panel.offset().left > 100 ? 0 : '';
                let bottom = (node.offset().top - panel.offset().top) / window.innerHeight > 0.6 ? '32px' : '';
                let css = {right: right, bottom: bottom};
                $('.iris-picker').hide();
                node.find('.iris-picker').css(css).show();
            });

            $('body').on('click', function (e) {
                if (!$(e.target).is('.viwec-color-picker, .iris-picker, .iris-picker-inner, .iris-square')) {
                    $('.iris-picker').hide();
                }
            });

            return node;
        },

        onChange: function (event, node) {
            if (event.data && event.data.element) {
                let thisValue = this.value ? this.value : 'transparent';
                event.data.element.trigger('propertyChange', [thisValue, this]);
            }
        },
    }
);

const TextEditor = $.extend({}, Input, {
    events: [
        ["change", "onChange", "textarea"],
    ],

    setValue: function (value) {
        $('textarea', this.element).val(value);
    },

    onChange: function (event, node) {
        if (event.data && event.data.element) {
            event.data.element.trigger('propertyChange', [$(this).val(), this]);
        }
    },
    init: function (data) {
        $(tinyMCE.editors).each(function () {
            tinyMCE.remove(this);
        });
        return this.render("texteditorinput", data);
    },
    subInit: function (element) {
        tinymce.init({
            mode: 'exact',
            selector: '#viwec-text-editor',
            content_style: 'body {background:#eeeeee;}',
            theme: 'modern',
            height: 'auto',
            menubar: false,
            statusbar: false,
            relative_urls: false,
            remove_script_host: false,
            convert_urls: false,
            plugins: ["link textcolor colorpicker image"],
            toolbar:
                [
                    'bold italic underline | alignleft aligncenter alignright alignjustify| link image',
                    'fontsizeselect forecolor backcolor',
                    // 'lineheightselect',
                    'shortcode viWecInforIcons viWecSocialIcons'
                ], //fontselect

            fontsize_formats: '10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 22px 24px 26px 28px 30px 35px 40px 50px 60px',
            // formats: {
            //     custom_format: {block: 'h1', attributes: {title: "Header"}, styles: {color: 'red'}}
            // },
            //styleselect
            // style_formats: [
            //     {title: '300', inline: 'span', styles: {fontWeight: '300'}},
            //     {title: '400', inline: 'span', styles: {fontWeight: '400'}},
            //     {title: '500', inline: 'span', styles: {fontWeight: '500'}},
            //     {title: '600', inline: 'span', styles: {fontWeight: '600'}},
            //     {title: '700', inline: 'span', styles: {fontWeight: '700'}},
            //     {title: '800', inline: 'span', styles: {fontWeight: '800'}},
            //     {title: '900', inline: 'span', styles: {fontWeight: '900'}},
            // ],
            setup: function (editor) {
                editor.addButton('shortcode', {
                    type: 'listbox',
                    text: 'Shortcode',
                    icon: false,
                    onselect: function (e) {
                        editor.insertContent(this.value())
                    },
                    values: viWecShortcodeList,
                });
                editor.addButton('viWecInforIcons', {
                    type: 'listbox',
                    text: 'Information icons',
                    icon: false,
                    onselect: function (e) {
                        editor.insertContent(this.value())
                    },
                    values: viWecInforIcons,
                });
                editor.addButton('viWecSocialIcons', {
                    type: 'listbox',
                    text: 'Social icons',
                    icon: false,
                    onselect: function (e) {
                        editor.insertContent(this.value())
                    },
                    values: viWecSocialIcons,
                });
                editor.on('keyup mouseup change', function (e) {
                    $('#viwec-text-editor').val(editor.getContent()).change();
                });
            }
        });

        let textEl = element;
        textEl.on('keyup', function () {
            $('iframe').contents().find('#tinymce[data-id="viwec-text-editor"]').html($(this).html());
        });
        // textEl.attr('contenteditable', true).focus();
    }
});

const BgImgInput = $.extend({}, Input, {
    events: [
        ["click", "onChange", "button"],
        ["click", "clear", ".viwec-clear"]
    ],

    init: function (data) {
        return this.render("bgimginput", data);
    },

    onChange: function (event, node) {
        if (event.data && event.data.element) {
            let images = wp.media({
                title: 'Select Image',
                multiple: false
            }).open().on('select', function (e) {
                let uploadedImages = images.state().get('selection').first();
                let selectedImages = uploadedImages.toJSON();
                event.data.element.trigger('propertyChange', [`url(${selectedImages.url})`, this]);
            })
        }
    },

    clear: function (event, node) {
        event.data.element.trigger('propertyChange', ['url()', this]);
    }
});

const ImgInput = $.extend({}, Input, {
    events: [
        ["click", "onChange", "button"],
        ["click", "clear", ".viwec-clear"]
    ],
    init: function (data) {
        return this.render("bgimginput", data);
    },
    onChange: function (event, node) {
        if (event.data && event.data.element) {
            let images = wp.media({
                title: 'Select Image',
                multiple: false
            }).open().on('select', function (e) {
                let uploadedImages = images.state().get('selection').first();
                let selectedImages = uploadedImages.toJSON();
                event.data.element.trigger('propertyChange', [selectedImages.url, this]);
            })
        }
    },
    clear: function (event, node) {
        event.data.element.trigger('propertyChange', ['', this]);
    }
});


var FileUploadInput = $.extend({}, TextInput, {

        events: [
            ["blur", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("textinput", data);
        },
    }
);


var RadioInput = $.extend({}, Input, {

        onChange: function (event, node) {
            if (event.data && event.data.element) {
                event.data.element.trigger('propertyChange', [this.value, this]);
            }
        },

        events: [
            ["change", "onChange", "input"],
        ],

        setValue: function (value) {
            $('input', this.element).removeAttr('checked');
            if (value)
                $("input[value=" + value + "]", this.element).attr("checked", "true").prop('checked', true);
        },

        init: function (data) {
            return this.render("radioinput", data);
        },
    }
);

var RadioButtonInput = $.extend({}, RadioInput, {
        events: [
            ["change", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("radiobuttoninput", data);
        },
    }
);

var ToggleInput = $.extend({}, TextInput, {

        onChange: function (event, node) {
            if (event.data && event.data.element) {
                event.data.element.trigger('propertyChange', [this.checked ? this.getAttribute("data-value-on") : this.getAttribute("data-value-off"), this]);
            }
        },

        events: [
            ["change", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("toggle", data);
        },
    }
);

var ValueTextInput = $.extend({}, TextInput, {

        events: [
            ["blur", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("textinput", data);
        },
    }
);

var GridLayoutInput = $.extend({}, TextInput, {

        events: [
            ["blur", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("textinput", data);
        },
    }
);

var ProductsInput = $.extend({}, TextInput, {

        events: [
            ["blur", "onChange", "input"],
        ],

        init: function (data) {
            return this.render("textinput", data);
        },
    }
);


var GridInput = $.extend({}, Input, {


        events: [
            ["change", "onChange", "select" /*'select'*/],
            ["click", "onChange", "button" /*'select'*/],
        ],


        setValue: function (value) {
            $('select', this.element).val(value);
        },

        init: function (data) {
            return this.render("grid", data);
        },

    }
);

var TextValueInput = $.extend({}, Input, {
        events: [
            ["blur", "onChange", "input"],
            ["click", "onChange", "button" /*'select'*/],
        ],

        init: function (data) {
            return this.render("textvalue", data);
        },
    }
);

var ButtonInput = $.extend({}, Input, {

        events: [
            ["click", "onChange", "button"],
        ],

        setValue: function (value) {
            $('button', this.element).val(value);
        },

        init: function (data) {
            return this.render("button", data);
        },

    }
);

var SectionInput = $.extend({}, Input, {
        events: [
            ["click", "onChange", "button" /*'select'*/],
        ],

        setValue: function (value) {
            return false;
        },

        init: function (data) {
            return this.render("sectioninput", data);
        },
    }
);

var ListInput = $.extend({}, Input, {
        events: [
            ["change", "onChange", "select"],
        ],

        setValue: function (value) {
            $('select', this.element).val(value);
        },

        init: function (data) {
            return this.render("listinput", data);
        },
    }
);


var AutocompleteInput = $.extend({}, Input, {

        events: [
            ["autocomplete.change", "onAutocompleteChange", "input"],
        ],

        onAutocompleteChange: function (event, value, text) {

            if (event.data && event.data.element) {
                event.data.element.trigger('propertyChange', [value, this]);
            }
        },

        init: function (data) {

            this.element = this.render("textinput", data);

            $('input', this.element).autocomplete(data.url);//using default parameters

            return this.element;
        }
    }
);

var AutocompleteList = $.extend({}, Input, {

        events: [
            ["autocompletelist.change", "onAutocompleteChange", "input"],
        ],

        onAutocompleteChange: function (event, value, text) {

            if (event.data && event.data.element) {
                event.data.element.trigger('propertyChange', [value, this]);
            }
        },

        setValue: function (value) {
            $('input', this.element).data("autocompleteList").setValue(value);
        },

        init: function (data) {

            this.element = this.render("textinput", data);

            $('input', this.element).autocompleteList(data);//using default parameters

            return this.element;
        }
    }
);
