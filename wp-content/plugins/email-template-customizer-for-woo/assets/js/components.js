jQuery(document).ready(function ($) {
    'use strict';

    let viWecSampleId, viWecSampleStyle = 'basic';

    if (typeof viWecCacheProducts === 'undefined') var viWecCacheProducts = [];

    if (typeof viWecCachePosts === 'undefined') var viWecCachePosts = [];

    const i18n = viWecParams.i18n;

    ViWec.Components.init();

//Functions

    window.viWecFunctions = {
        propertyOnChange: function (element, value) {
            if (value) {
                element.closest('span').show();
            } else {
                element.closest('span').hide();
            }
        },

        changeSampleTemplate: function () {
            if (!(viWecSampleId && viWecSampleStyle)) return;
            if (!confirm(i18n.change_template_confirm)) return;

            if (!viWecParams.samples || !viWecParams.samples[viWecSampleId] || !viWecParams.samples[viWecSampleId][viWecSampleStyle] || !viWecParams.samples[viWecSampleId][viWecSampleStyle].data) {
                alert('This style is not exist');
                return;
            }
            this.doChangeSampleTemplate(viWecSampleId, viWecSampleStyle)
        },

        doChangeSampleTemplate(id, style) {
            ViWec.viWecDrawTemplate(JSON.parse(viWecParams.samples[id][style].data));

            let subject = viWecParams.subjects[id] ?? '';
            $('#title').val(subject);
            $('#title-prompt-text').addClass('screen-reader-text');
            $('select[name=viwec_settings_type]').val(id).trigger('change');
            viWecChange = true;
        }
    };

//Sample

    ViWec.Components.add({
        type: "sample_opt_1",
        category: 'sample',
        name: i18n.sample,
        setup: function () {
            let options = {};
            options.placeholder = {id: '', text: i18n.select_email_type};
            options.default = {id: 'default', text: 'Default template'};

            for (let i in viWecParams.emailTypes) {
                options[i] = [];
                for (let j in viWecParams.emailTypes[i]) {
                    if (j !== 'default') {
                        options[i].push({id: j, text: viWecParams.emailTypes[i][j]});
                    }
                }
            }

            let typeSelect = SelectGroupInput.init({key: 'viwec_samples', classes: 'viwec-samples-type', options: options});

            return $('<div class="viwec-sample-group"></div>').append(typeSelect);
        },

        onChange: function (element) {
            element.on('propertyChange', function (event, value, input) {
                if (!value) return;

                if ($(input).hasClass('viwec-samples-type')) {
                    viWecSampleId = value;

                    let options = [];

                    if (viWecParams.samples[value] !== undefined && Object.keys(viWecParams.samples[value]).length > 0) {
                        let samples = viWecParams.samples[value];
                        for (let id in samples) {
                            options.push({id: id, text: samples[id].name || ''})
                        }
                    }

                    let newStyleSelect = options.length > 1 ? SelectInput.init({key: 'viwec_samples', classes: 'viwec-samples-style', options: options}) : '';
                    let target = element.find('.viwec-samples-style');
                    if (target.length > 0) {
                        target.parent().replaceWith(newStyleSelect);
                    } else {
                        element.append(newStyleSelect);
                    }

                    if (typeof viWecParams.addNew !== 'undefined') {
                        return;
                    }

                    if (options.length > 0) {
                        viWecSampleStyle = options[0].id;
                        viWecFunctions.changeSampleTemplate();
                    }
                }

                if ($(input).hasClass('viwec-samples-style')) {
                    if (typeof viWecParams.addNew !== 'undefined') {
                        return;
                    }
                    viWecSampleStyle = value;
                    viWecFunctions.changeSampleTemplate();
                }

            });
        }
    });


//Layout

    ViWec.Components.add({
        type: "editColumn",
        category: 'hidden',
        inheritProp: ['padding', 'background', 'border']
    });

    ViWec.Components.add({
        type: "layout/grid1cols",
        category: 'layout',
        name: i18n['1_column'],
        icon: '1col',
        cols: 1,
        inheritProp: ['edit_cols', 'padding', 'background', 'border']
    });

    ViWec.Components.add({
        type: "layout/grid2cols",
        category: 'layout',
        name: i18n['2_columns'],
        icon: '2cols',
        cols: 2,
        inheritProp: ['edit_cols', 'padding', 'background', 'border']
    });

    ViWec.Components.add({
        type: "layout/grid3cols",
        category: 'layout',
        name: i18n['3_columns'],
        icon: '3cols',
        cols: 3,
        inheritProp: ['edit_cols', 'padding', 'background', 'border']
    });

    ViWec.Components.add({
        type: "layout/grid4cols",
        category: 'layout',
        name: i18n['4_columns'],
        icon: '4cols',
        cols: 4,
        inheritProp: ['edit_cols', 'padding', 'background', 'border']
    });

//Content

    ViWec.Components.add({
        type: "background",
        category: 'hidden',
        icon: '',
        html: ``,
        inheritProp: ['background']
    });

    ViWec.Components.add({
        type: "html/text",
        name: i18n['text'],
        icon: 'text',
        html: `<div class="viwec-text-content" contenteditable="true">Text</div>`,
        properties: [
            {
                key: "text_editor_header",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: "Text Editor"},
            },
            {
                key: "text",
                htmlAttr: 'innerHTML',
                target: '.viwec-text-content',
                section: contentSection,
                inputType: TextEditor,
                renderShortcode: true
            },
        ],
        inheritProp: ['line_height', 'background', 'padding', 'border']
    });

    ViWec.Components.add({
        type: "html/image",
        name: i18n['image'],
        icon: 'image',
        html: `<img src="${viWecParams.placeholder}" class="viwec-image" style="max-width: 100%; ">`,
        properties: [{
            key: "image_header",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: i18n['image']},
        }, {
            // name: "Select Image",
            key: "src",
            htmlAttr: "src",
            target: 'img',
            section: contentSection,
            col: 16,
            inputType: ImgInput,
            data: {text: i18n['select'], classes: 'viwec-open-bg-img'}
        }, {
            key: "image_header",
            inputType: SectionInput,
            name: false,
            section: styleSection,
            data: {header: "Size"},
        }, {
            name: "Width (px)",
            key: "width",
            htmlAttr: "childStyle",
            target: 'img',
            section: styleSection,
            col: 16,
            inputType: NumberInput,
            unit: 'px',
            data: {min: 0, max: 600, step: 1}
        }],
        inheritProp: ['alignment', 'padding', 'background']//, 'border']
    });

    ViWec.Components.add({
        type: "html/button",
        name: i18n['button'],
        icon: 'button',
        html: `<a href="#" class="viwec-button viwec-background viwec-padding" 
                style="border-style:solid;display:inline-block;padding: 10px 20px;text-decoration: none;text-align: center;max-width: 100%;background-color: #dddddd">
                    <span class="viwec-text-content">Button</span>
                </a>`,

        properties: [{
            key: "text_header",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Text"},
        }, {
            key: "text",
            htmlAttr: 'innerHTML',
            target: '.viwec-text-content',
            section: contentSection,
            col: 16,
            inputType: TextInput,
            renderShortcode: true,
            data: {shortcodeTool: true}
        }, {
            key: "link_button",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Link"},
        }, {
            key: "href",
            htmlAttr: "href",
            target: 'a',
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true}
        },
            {
                key: "button_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Button"},
            },
            {
                name: "Border width",
                key: "border-width",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 8,
                inputType: NumberInput,
                unit: 'px',
                data: {min: 0, max: 10, step: 1}
            }, {
                name: "Border radius",
                key: "border-radius",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 8,
                inputType: NumberInput,
                unit: 'px',
                data: {min: 0, max: 50, step: 1}
            }, {
                name: "Border color",
                key: "border-color",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Border style",
                key: "border-style",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 8,
                data: {
                    options: [
                        {id: 'solid', text: 'Solid'},
                        {id: 'dotted', text: 'Dotted'},
                        {id: 'dashed', text: 'Dashed'},
                    ]
                },
                inputType: SelectInput
            },
            {
                name: "Button color",
                key: "background-color",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Width (px)",
                key: "width",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 8,
                inputType: NumberInput,
                unit: 'px',
                data: {min: 0, max: 600}
            },
            {
                key: "padding_el_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Padding (px)"}
            },
            {
                name: "Left",
                key: "padding-left",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 4,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 20, max: 250},
            },
            {
                name: "Top",
                key: "padding-top",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 4,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 20},
            },
            {
                name: "Right",
                key: "padding-right",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 4,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 20, max: 250},
            }, {
                name: "Bottom",
                key: "padding-bottom",
                htmlAttr: "childStyle",
                target: 'a',
                section: styleSection,
                col: 4,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 20},
            }],
        inheritProp: ['text', 'alignment', 'margin']//, 'background']
    });

    ViWec.Components.add({
        type: "html/order_detail",
        name: i18n['order_detail'],
        icon: 'order-detail', html: viWecTmpl('order-detail-template-1', {}),
        properties: [
            {
                key: "select_template",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: i18n['template']}
            },
            {
                key: "data-template",
                htmlAttr: "data-template",
                section: contentSection,
                col: 16,
                inputType: SelectInput,
                data: {
                    options: [
                        {id: '1', text: i18n['default']},
                        {id: '2', text: i18n['vertical_text']},
                        {id: '3', text: i18n['horizontal_text']},
                    ]
                },
                onChange: (element, value, input, component, property) => {
                    if (value) {
                        let newEl = viWecTmpl(`order-detail-template-${value}`, {});
                        element.find('.viwec-order-detail').remove();
                        element.append(newEl);
                        element.click();
                    }
                    return element;
                }
            },
            {
                key: "translate_text",
                inputType: SectionInput,
                name: false,
                target: '.viwec-text-quantity',
                section: contentSection,
                data: {header: i18n['translate_text']}
            },
            {
                name: i18n['product'],
                key: "product",
                target: '.viwec-text-product',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                name: i18n['quantity'],
                key: "quantity",
                target: '.viwec-text-quantity',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                name: i18n['price'],
                key: "price",
                target: '.viwec-text-price',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                key: "table_style",
                inputType: SectionInput,
                name: false,
                target: '.viwec-item-row',
                section: styleSection,
                data: {header: i18n['order_items']}
            },
            {
                name: "Background",
                key: "background-color",
                target: '.viwec-item-row',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Image size",
                key: "width",
                target: '.viwec-product-img',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                name: "Border width",
                key: "border-width",
                target: '.viwec-item-row',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 20},
            },
            {
                name: "Border color",
                key: "border-color",
                target: '.viwec-item-row',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput,
                data: {id: 20},
            },
            {
                name: "Items distance",
                key: "padding-top",
                target: '.viwec-product-distance',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
            },
            {
                key: "product_name",
                inputType: SectionInput,
                name: false,
                target: '.viwec-product-name',
                section: styleSection,
                data: {header: i18n['product_name']}
            },
            {
                name: "Font size (px)",
                key: "font-size",
                target: '.viwec-product-name',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                name: "Font weight",
                key: "font-weight",
                target: '.viwec-product-name',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: SelectInput,
                data: {
                    options: viWecFontWeightOptions
                }
            },
            {
                name: "Color",
                key: "color",
                target: '.viwec-product-name',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Line height (px)",
                key: "line-height",
                target: '.viwec-product-name',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                key: "col_header",
                inputType: SectionInput,
                name: "Column ratio",
                target: '.viwec-text-price',
                section: styleSection,
                // data: {header: "Column ratio"},
            },
            {
                name: i18n['last_column_width'] + ' (%)',
                key: "width",
                htmlAttr: "childStyle",
                target: '.viwec-text-price',
                section: styleSection,
                col: 16,
                unit: '%',
                inputType: NumberInput,
            },
            {
                key: "product_name_1",
                inputType: SectionInput,
                name: false,
                target: '.viwec-item-style-1',
                section: styleSection,
                data: {header: i18n['text']}
            },
            {
                name: "Font size (px)",
                key: "font-size",
                target: '.viwec-item-style-1',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                name: "Color",
                key: "color",
                target: '.viwec-item-style-1',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Line height (px)",
                key: "line-height",
                target: '.viwec-item-style-1',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                key: "product_price",
                inputType: SectionInput,
                name: false,
                target: '.viwec-product-price',
                section: styleSection,
                data: {header: i18n['product_price']}
            },
            {
                name: "Font size (px)",
                key: "font-size",
                target: '.viwec-product-price',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                name: "Font weight",
                key: "font-weight",
                target: '.viwec-product-price',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: SelectInput,
                data: {
                    options: viWecFontWeightOptions
                }
            },
            {
                name: "Color",
                key: "color",
                target: '.viwec-product-price',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Line height (px)",
                key: "line-height",
                target: '.viwec-product-price',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                key: "product_quantity",
                inputType: SectionInput,
                name: false,
                target: '.viwec-product-quantity',
                section: styleSection,
                data: {header: i18n['product_quantity']}
            },
            {
                name: "Font size (px)",
                key: "font-size",
                target: '.viwec-product-quantity',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            },
            {
                name: "Font weight",
                key: "font-weight",
                target: '.viwec-product-quantity',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: SelectInput,
                data: {options: viWecFontWeightOptions}
            },
            {
                name: "Color",
                key: "color",
                target: '.viwec-product-quantity',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput
            },
            {
                name: "Line height (px)",
                key: "line-height",
                target: '.viwec-product-quantity',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput
            }
        ],
        inheritProp: ['padding', 'background']//, 'border'] //'text',
    });

    ViWec.Components.add({
        type: "html/order_subtotal",
        name: i18n['order_subtotal'],
        icon: 'order-subtotal',
        html: viWecTmpl('order-subtotal-template', {}),
        properties: [
            {
                key: "translate_text",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: i18n['translate_text']}
            }, {
                name: i18n['subtotal'],
                key: "subtotal",
                target: '.viwec-text-subtotal',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            }, {
                name: i18n['discount'],
                key: "discount",
                target: '.viwec-text-discount',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            }, {
                name: i18n['shipping'],
                key: "shipping",
                target: '.viwec-text-shipping',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            }, {
                name: i18n['refund_fully'],
                key: "refund-full",
                target: '.viwec-text-refund-full',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            }, {
                name: i18n['refund_partial'],
                key: "refund-part",
                target: '.viwec-text-refund-part',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                key: "col_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Column ratio"},
            },
            {
                name: i18n['last_column_width'] + " (%)",
                key: "width",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                section: styleSection,
                col: 16,
                unit: '%',
                inputType: NumberInput,

            },
            {
                key: "alignment_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Alignment"},
            },
            {
                name: "Left",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-left',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {
                    extraClass: "left",
                    options: viWecAlignmentOptions,
                },
            },
            {
                name: "Right",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {
                    extraClass: "right",
                    options: viWecAlignmentOptions,
                },
            },
            {
                key: "border_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Border"},
            },
            {
                name: "Border width",
                key: "border-width",
                target: '.viwec-order-subtotal-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 0},
            },
            {
                name: "Border color",
                key: "border-color",
                target: '.viwec-order-subtotal-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput,
            },
            {
                key: "padding_el_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Padding (px)"}
            }, {
                // name: "Padding",
                key: "padding",
                target: '.viwec-order-subtotal-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 16,
                unit: 'px',
                inputType: NumberInput,
            }
        ],
        inheritProp: ['text', 'margin', 'background']//, 'border']
    });

    ViWec.Components.add({
        type: "html/order_total",
        name: i18n['order_total'],
        icon: 'order-total',
        html: viWecTmpl('order-total-template', {}),

        properties: [
            {
                key: "translate_text",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: i18n['translate_text']}
            },
            {
                name: i18n['total'],
                key: "order_total",
                target: '.viwec-text-total',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                key: "col_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: i18n['column_ratio']},
            },
            {
                name: i18n['last_column_width'] + " (%)",
                key: "width",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                section: styleSection,
                col: 16,
                unit: '%',
                inputType: NumberInput,

            },
            {
                key: "alignment_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Alignment"},
            },
            {
                name: "Left",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-left',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "left", options: viWecAlignmentOptions},
            },
            {
                name: "Right",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "right", options: viWecAlignmentOptions},
            },
            {
                key: "border_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Border"},
            },
            {
                name: "Border width",
                key: "border-width",
                target: '.viwec-order-total-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 0},
            },
            {
                name: "Border color",
                key: "border-color",
                target: '.viwec-order-total-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput,
            },
            {
                key: "padding_el_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Padding (px)"}
            }, {
                // name: "Padding",
                key: "padding",
                target: '.viwec-order-total-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 16,
                unit: 'px',
                inputType: NumberInput,
            }
        ],
        inheritProp: ['text', 'background', 'margin']//, 'border']
    });

    ViWec.Components.add({
        type: "html/shipping_method",
        name: i18n['shipping_method'],
        icon: 'shipping-address',
        html: viWecTmpl('order-shipping-method', {}),

        properties: [
            {
                key: "translate_text",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: i18n['translate_text']}
            },
            {
                name: i18n['shipping_method'],
                key: "shipping_method",
                target: '.viwec-text-shipping',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                key: "col_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: i18n['column_ratio']},
            },
            {
                name: i18n['last_column_width'] + " (%)",
                key: "width",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                section: styleSection,
                col: 16,
                unit: '%',
                inputType: NumberInput,

            },
            {
                key: "alignment_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Alignment"},
            },
            {
                name: "Left",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-left',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "left", options: viWecAlignmentOptions},
            },
            {
                name: "Right",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "right", options: viWecAlignmentOptions},
            },
            {
                key: "border_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Border"},
            },
            {
                name: "Border width",
                key: "border-width",
                target: '.viwec-shipping-method-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 0},
            },
            {
                name: "Border color",
                key: "border-color",
                target: '.viwec-shipping-method-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput,
            },
            {
                key: "padding_el_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Padding (px)"}
            }, {
                // name: "Padding",
                key: "padding",
                target: '.viwec-shipping-method-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 16,
                unit: 'px',
                inputType: NumberInput,
            }
        ],
        inheritProp: ['text', 'background', 'margin']//, 'border']
    });

    ViWec.Components.add({
        type: "html/payment_method",
        name: i18n['payment_method'],
        icon: 'payment-method',
        html: viWecTmpl('order-payment-method', {}),

        properties: [
            {
                key: "translate_text",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: i18n['translate_text']}
            },
            {
                name: i18n['payment_method'],
                key: "payment_method",
                target: '.viwec-text-payment',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                key: "col_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: i18n['column_ratio']},
            },
            {
                name: i18n['last_column_width'] + " (%)",
                key: "width",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                section: styleSection,
                col: 16,
                unit: '%',
                inputType: NumberInput,

            },
            {
                key: "alignment_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Alignment"},
            },
            {
                name: "Left",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-left',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "left", options: viWecAlignmentOptions},
            },
            {
                name: "Right",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "right", options: viWecAlignmentOptions},
            },
            {
                key: "border_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Border"},
            },
            {
                name: "Border width",
                key: "border-width",
                target: '.viwec-payment-method-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 0},
            },
            {
                name: "Border color",
                key: "border-color",
                target: '.viwec-payment-method-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput,
            },
            {
                key: "padding_el_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Padding (px)"}
            }, {
                // name: "Padding",
                key: "padding",
                target: '.viwec-payment-method-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 16,
                unit: 'px',
                inputType: NumberInput,
            }
        ],
        inheritProp: ['text', 'background', 'margin']//, 'border']
    });

    ViWec.Components.add({
        type: "html/order_note",
        name: i18n['order_note'],
        icon: 'order-note',
        html: viWecTmpl('order-note', {}),

        properties: [
            {
                key: "translate_text",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: i18n['translate_text']}
            },
            {
                name: i18n['order_note'],
                key: "order_note",
                target: '.viwec-text-note',
                htmlAttr: "innerHTML",
                section: contentSection,
                col: 16,
                inputType: TextInput
            },
            {
                key: "col_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: i18n['column_ratio']},
            },
            {
                name: i18n['last_column_width'] + " (%)",
                key: "width",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                section: styleSection,
                col: 16,
                unit: '%',
                inputType: NumberInput,

            },
            {
                key: "alignment_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Alignment"},
            },
            {
                name: "Left",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-left',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "left", options: viWecAlignmentOptions},
            },
            {
                name: "Right",
                key: "text-align",
                htmlAttr: "childStyle",
                target: '.viwec-td-right',
                validValues: ["", "text-left", "text-center", "text-right"],
                section: styleSection,
                col: 8,
                inputType: RadioButtonInput,
                data: {extraClass: "right", options: viWecAlignmentOptions},
            },
            {
                key: "border_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Border"},
            },
            {
                name: "Border width",
                key: "border-width",
                target: '.viwec-note-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 0},
            },
            {
                name: "Border color",
                key: "border-color",
                target: '.viwec-note-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 8,
                inputType: ColorInput,
            },
            {
                key: "padding_el_header",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Padding (px)"}
            }, {
                // name: "Padding",
                key: "padding",
                target: '.viwec-note-style',
                htmlAttr: "childStyle",
                section: styleSection,
                col: 16,
                unit: 'px',
                inputType: NumberInput,
            }
        ],
        inheritProp: ['text', 'background', 'margin']//, 'border']
    });

    ViWec.Components.add({
        type: "html/billing_address",
        name: i18n['billing_address'],
        icon: 'billing-address',
        html: `<div>
            John Doe</br>
            Ap #867-859 Sit Rd.</br>
            Azusa, NY 10001</br>
            United States (US)</br>
            0123456789</br>
            johndoe@domain.com
            </div>`,
        inheritProp: ['text', 'alignment', 'padding', 'background']//, 'border']
    });

    ViWec.Components.add({
        type: "html/shipping_address",
        name: i18n['shipping_address'],
        icon: 'shipping-address',
        html: `<div>
            John Doe</br>
            Ap #867-859 Sit Rd.</br>
            Azusa, NY 10001</br>
            United States (US)</br>
            </div>`,
        inheritProp: ['text', 'alignment', 'padding', 'background']//, 'alignment', 'border']
    });

    ViWec.Components.add({
        type: "html/contact",
        name: i18n['contact'],
        icon: 'address-book',
        html: `<table class="viwec-contact" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr><td><a href="${viWecParams.homeUrl}" class="viwec-home-link" ><img class="viwec-home-icon" src="${viWecParams.infor_icons.home[0].id}" style='padding-right: 5px;'><span class="viwec-home-text">${viWecParams.homeUrl}</span></a></td></tr>
                <tr><td><a href="${viWecParams.adminEmail}" class="viwec-email-link" ><img class="viwec-email-icon" src="${viWecParams.infor_icons.email[0].id}" style='padding-right: 5px;'><span class="viwec-email-text">${viWecParams.adminEmail}</span></a></td></tr>
                <tr><td><a href="#" class="viwec-phone-link" ><img class="viwec-phone-icon" src="${viWecParams.infor_icons.phone[0].id}" style='padding-right: 5px;'><span class="viwec-phone-text">${viWecParams.adminPhone}</span></a></td></tr>
            </table>`,
        properties: [{
            key: "home",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Home"},
        }, {
            name: "Icon",
            key: "home",
            target: '.viwec-home-icon',
            htmlAttr: "src",
            section: contentSection,
            col: 16,
            inputType: SelectInput,
            data: {options: viWecParams.infor_icons.home}
        }, {
            name: "Text",
            key: "home_text",
            target: '.viwec-home-text',
            htmlAttr: "innerHTML",
            section: contentSection,
            renderShortcode: true,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            name: "URL",
            key: "home_link",
            target: '.viwec-home-link',
            htmlAttr: "href",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
        }, {
            key: "email",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Email"},
        }, {
            name: "Icon",
            key: "email",
            target: '.viwec-email-icon',
            htmlAttr: "src",
            section: contentSection,
            col: 16,
            inputType: SelectInput,
            data: {options: viWecParams.infor_icons.email}
        }, {
            name: "Email",
            key: "email_link",
            target: '.viwec-email-link',
            htmlAttr: "href",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
            onChange: function (element, value, viewValue, input, component, property) {
                element.find('.viwec-email-text').html(viewValue);
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            key: "phone",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Phone"},
        }, {
            name: "Icon",
            key: "phone",
            target: '.viwec-phone-icon',
            htmlAttr: "src",
            section: contentSection,
            col: 16,
            inputType: SelectInput,
            data: {options: viWecParams.infor_icons.phone}
        }, {
            name: "Number",
            key: "phone_text",
            target: '.viwec-phone-text',
            htmlAttr: "innerHTML",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            // data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }],

        inheritProp: ['text', 'alignment', 'padding', 'background']//, 'border']
    });

    ViWec.Components.add({
        type: "html/menu",
        name: i18n['menu_bar'],
        icon: 'menu',
        html: `<div class="viwec-menu-bar" width="100%"  border="0" cellpadding="0" cellspacing="0" style="display: flex">
                    <div style="flex-grow: 1"><a href="#" class="viwec-menu-link-1">Item 1</a></div>
                    <div style="flex-grow: 1"><a href="#" class="viwec-menu-link-2">Item 2</a></div>
                    <div style="flex-grow: 1"><a href="#" class="viwec-menu-link-3">Item 3</a></div>
                    <div style="flex-grow: 1"><a href="#" class="viwec-menu-link-4">Item 4</a></div>
            </div>`,
        properties: [{
            key: "menu_bar_1",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Link 1"},
        }, {
            name: "Text",
            key: "link1",
            target: '.viwec-menu-link-1',
            htmlAttr: "innerHTML",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            name: "Link",
            key: "link1",
            target: '.viwec-menu-link-1',
            htmlAttr: "href",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            key: "menu_bar_2",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Link 2"},
        }, {
            name: "Text",
            key: "link2",
            target: '.viwec-menu-link-2',
            htmlAttr: "innerHTML",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            // data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            name: "Link",
            key: "link2",
            target: '.viwec-menu-link-2',
            htmlAttr: "href",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            key: "menu_bar_3",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Link 3"},
        }, {
            name: "Text",
            key: "link3",
            target: '.viwec-menu-link-3',
            htmlAttr: "innerHTML",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            // data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            name: "Link",
            key: "link3",
            target: '.viwec-menu-link-3',
            htmlAttr: "href",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            key: "menu_bar_4",
            inputType: SectionInput,
            name: false,
            section: contentSection,
            data: {header: "Link 4"},
        }, {
            name: "Text",
            key: "link4",
            target: '.viwec-menu-link-4',
            htmlAttr: "innerHTML",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            // data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            name: "Link",
            key: "link4",
            target: '.viwec-menu-link-4',
            htmlAttr: "href",
            section: contentSection,
            col: 16,
            inputType: TextInput,
            data: {shortcodeTool: true},
            onChange: function (element, value, input, component, property) {
                viWecFunctions.propertyOnChange(element, value);
                return element;
            }
        }, {
            key: "Direction",
            inputType: SectionInput,
            name: false,
            section: styleSection,
            data: {header: "Direction"},
        }, {
            // name: "Direction",
            key: "direction",
            target: '.viwec-menu-bar',
            htmlAttr: "data-direction",
            section: styleSection,
            col: 16,
            inputType: SelectInput,
            data: {options: [{id: 'horizontal', text: 'Horizontal'}, {id: 'vertical', text: 'Vertical'}]},
            onChange(element, value, input, component, property) {
                if (value === 'vertical') element.css('display', 'block');
                if (value === 'horizontal') element.css('display', 'flex');
                return element;
            }
        }],
        inheritProp: ['text', 'alignment', 'padding', 'background']//, 'border']
    });

    ViWec.Components.add({
        type: "html/social",
        name: i18n['socials'],
        icon: 'social',
        html: `<div class="viwec-social" border="0" cellpadding="0" cellspacing="0">
                    <span class="viwec-social-direction"><a href="#" class="viwec-facebook-link" ><img class="viwec-facebook-icon" src="${viWecParams.social_icons.facebook[0].id}"></a></span>
                    <span class="viwec-social-direction"><a href="#" class="viwec-twitter-link"><img class="viwec-twitter-icon" src="${viWecParams.social_icons.twitter[0].id}"></a></span>
                    <span class="viwec-social-direction"><a href="#" class="viwec-instagram-link"><img class="viwec-instagram-icon" src="${viWecParams.social_icons.instagram[0].id}"></a></span>
            </div>`,

        properties: [
            {
                key: "facebook",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: "Facebook"},
            },
            {
                name: "Icon",
                key: "facebook",
                target: '.viwec-facebook-icon',
                htmlAttr: "src",
                section: contentSection,
                col: 16,
                inputType: SelectInput,
                data: {options: viWecParams.social_icons.facebook},
            },
            {
                name: "Facebook URL",
                key: "facebook_url",
                target: '.viwec-facebook-link',
                htmlAttr: "href",
                section: contentSection,
                col: 16,
                inputType: TextInput,
                data: {title: 'https://your_facebook_url'},
                onChange: function (element, value, input, component, property) {
                    viWecFunctions.propertyOnChange(element, value);
                    return element;
                }
            },
            {
                key: "twitter",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: "Twitter"},
            },
            {
                name: "Icon",
                key: "twitter",
                target: '.viwec-twitter-icon',
                htmlAttr: "src",
                section: contentSection,
                col: 16,
                inputType: SelectInput,
                data: {options: viWecParams.social_icons.twitter}
            },
            {
                name: "Twitter URL",
                key: "twitter_url",
                target: '.viwec-twitter-link',
                htmlAttr: "href",
                section: contentSection,
                col: 16,
                inputType: TextInput,
                data: {title: 'https://your_twitter_url'},
                onChange: function (element, value, input, component, property) {
                    viWecFunctions.propertyOnChange(element, value);
                    return element;
                }
            },
            {
                key: "instagram",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: "Instagram"},
            },
            {
                name: "Icon",
                key: "instagram",
                target: '.viwec-instagram-icon',
                htmlAttr: "src",
                section: contentSection,
                col: 16,
                inputType: SelectInput,
                data: {options: viWecParams.social_icons.instagram}
            },
            {
                name: "Instagram URL",
                key: "instagram_url",
                target: '.viwec-instagram-link',
                htmlAttr: "href",
                section: contentSection,
                col: 16,
                inputType: TextInput,
                data: {title: 'https://your_instagram_url'},
                onChange: function (element, value, input, component, property) {
                    viWecFunctions.propertyOnChange(element, value);
                    return element;
                }
            },
            {
                key: "Direction",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Direction"},
            },
            {
                // name: "Direction",
                key: "direction",
                target: '.viwec-social-direction',
                htmlAttr: "data-direction",
                section: styleSection,
                col: 16,
                inputType: SelectInput,
                data: {options: [{id: 'horizontal', text: 'Horizontal'}, {id: 'vertical', text: 'Vertical'}]},
                onChange(element, value, input, component, property) {
                    if (value === 'vertical') element.css('display', 'block');
                    if (value === 'horizontal') element.css('display', 'inline-block');
                    return element;
                }
            }
        ],

        inheritProp: ['alignment', 'padding', 'background']//, 'border'] //'text',
    });

    ViWec.Components.add({
        type: "html/divider",
        name: i18n['divider'],
        icon: 'divider',
        html: `<hr style="border-top: 1px solid; border-bottom:none; margin: 10px 0;">`,
        properties: [{
            key: "text_header",
            inputType: SectionInput,
            name: false,
            section: styleSection,
            data: {header: "Border"},
        }, {
            name: 'Color',
            key: "border-top-color",
            htmlAttr: "childStyle",
            target: 'hr',
            section: styleSection,
            col: 8,
            inputType: ColorInput,
        }, {
            name: 'Width',
            key: "border-top-width",
            htmlAttr: "childStyle",
            target: 'hr',
            section: styleSection,
            col: 8,
            unit: 'px',
            inputType: NumberInput,
            data: {min: 1, step: 1}
        }],
        inheritProp: ['padding', 'background']
    });

    ViWec.Components.add({
        type: "html/spacer",
        name: i18n['spacer'],
        icon: 'spacer',
        html: `<div class="viwec-spacer" style="padding-top: 18px" title="Spacer"></div>`,
        properties: [
            {
                key: "spacer",
                inputType: SectionInput,
                name: false,
                section: styleSection,
                data: {header: "Height"},
            },
            {
                key: "padding-top",
                htmlAttr: "childStyle",
                target: '.viwec-spacer',
                section: styleSection,
                col: 16,
                unit: 'px',
                inputType: NumberInput,
                data: {id: 20},
            }
        ],
        // inheritProp: ['background']//
    });

    ViWec.Components.add({
        type: "html/wc_hook",
        name: 'WC Hook',//i18n['spacer'],
        icon: 'hook',
        html: `<div class="viwec-hook-interface">Hook: woocommerce_email_before_order_table</div>`,
        properties: [
            {
                key: "wc_hook",
                inputType: SectionInput,
                name: false,
                section: contentSection,
                data: {header: "Select hook"},
            },
            {
                key: "data-wc-hook",
                htmlAttr: "data-wc-hook",
                section: contentSection,
                col: 16,
                inputType: SelectInput,
                data: {
                    options: [
                        {id: 'woocommerce_email_before_order_table', text: 'woocommerce_email_before_order_table'},
                        {id: 'woocommerce_email_after_order_table', text: 'woocommerce_email_after_order_table'},
                        {id: 'woocommerce_email_order_meta', text: 'woocommerce_email_order_meta'}
                    ]
                },
                onChange(element, value) {
                    element.find('.viwec-hook-interface').text('Hook: ' + value);
                    return element;
                }
            },
        ],
    });

    ViWec.Components.add({
        type: "html/recover_heading",
        name: 'Heading',//i18n['spacer'],
        icon: 'header',
        category: 'recover',
        html: `<div>The heading of original email will be transferred here</div>`,
        inheritProp: ['text', 'alignment', 'padding', 'background']
    });

    ViWec.Components.add({
        type: "html/recover_content",
        name: 'Content',//i18n['spacer'],
        icon: 'transfer',
        category: 'recover',
        html: `<div>The content of original email will be transferred here</div>`,
    });

    ViWec.Components.add({
        type: "html/suggest_product_lock",
        name: 'Products',
        icon: 'product',
        classes: 'viwec-pro-version',
        html: '',
    });

    ViWec.Components.add({
        type: "html/coupon_lock",
        name: 'Coupon',
        icon: 'coupon',
        classes: 'viwec-pro-version',
        html: '',
    });

    ViWec.Components.add({
        type: "html/post_lock",
        name: 'Post',
        icon: 'post',
        classes: 'viwec-pro-version',
        html: '',
    });
});





