$j(function () {
    var etapasHandler = {
        env: 'ano',
        module: 0,
        selectors: {
            'ano': {
                'stepsRows': 'tr[id^="tr_modulos_ano_letivo["]',
                'year': '#ref_ano_'
            },
            'turma': {
                'stepsRows': 'tr[id^="tr_turma_modulo["]',
                'year': '#ano_letivo'
            }
        },
        init: function () {
            this.setupEnv();
            this.removeTableCellsAndRows();
            this.setCurrentModule();
            this.setupModule();
            this.selectModule();
        },
        getSelector: function (key) {
            return this.selectors[this.env][key] || undefined;
        },
        setCurrentModule: function () {
            var val = $j('#ref_cod_modulo').val();

            if (val === '') {
                val = 0;
            }

            this.module = parseInt(val, 10);

            return this.module;
        },
        setupEnv: function () {
            if ($j('tr[id^="tr_turma_modulo["]').length > 0) {
                this.env = 'turma';
            }
        },
        submit: function () {
            var that = this;

            $j('#btn_enviar').click(function (e) {
                if (validationUtils.validatesFields(true)) {
                    if (parseInt($j('#padrao_ano_escolar').val(), 10) === 1) {
                        window.acao();

                        return;
                    }

                    e.preventDefault();

                    that.resetErrors();

                    if (!that.validateDates()) {
                        alert('Ocorreram erros na validação dos campos. Verifique as mensagens e tente novamente.');

                        return false;
                    }

                    var validations = [
                        'validateStartDates',
                        'validateEndDates'
                    ];

                    var valid = true;

                    $j.each(validations, function (i, validation) {
                        if (!that[validation]()) {
                            valid = false;
                        }
                    });

                    if (valid) {
                        if (typeof window.valida !== "undefined") {
                            // reproduzindo função encontrada em modules/Cadastro/Assets/Javascripts/Turma.js:332
                            if (validationUtils.validatesFields(true)) {
                                window.valida();
                            }
                        } else {
                            window.acao();
                        }
                    } else {
                        alert('Ocorreram erros na validação dos campos. Verifique as mensagens e tente novamente.');
                    }
                }
                return false;
            });
        },
        addError: function (elm, msg) {
            messageUtils.error(msg, elm);
        },
        resetErrors: function () {
            $j('input.error').removeClass('error');
        },
        validateDates: function () {
            var that = this,
                fields = $j('[id^=data_inicio], [id^=data_fim]'),
                valid = true;

            fields.each(function (i, elm) {
                if (!validationUtils.validatesDateFieldAlt(elm)) {
                    valid = false;
                }
            });

            return valid;
        },
        validateEndDates: function () {
            var that = this,
                currentYear = this.getYear(),
                nextYear = currentYear + 1,
                fields = $j('[id^="data_fim["]'),
                valid = true;

            fields.each(function (i, elm) {
                var $elm = $j(elm),
                    val = $elm.val(),
                    dateParts = that.getDateParts(val),
                    ts = that.makeTimestamp(dateParts),
                    parentLine = $elm.closest('tr'),
                    nextLine = parentLine.next(that.getSelector('stepsRows')),
                    startDateElm = parentLine.find('[id^="data_inicio["]'),
                    startDateTs = that.makeTimestamp(that.getDateParts(startDateElm.val()));

                if (nextLine.length < 1) {
                    var validYears = [currentYear, nextYear];

                    if (validYears.indexOf(dateParts.year) === -1) {
                        valid = false;
                        that.addError(elm, 'O ano "' + dateParts.year + '" não é válido. Utilize o ano especificado ou próximo.');

                        return;
                    }
                } else {
                    if (dateParts.year !== currentYear) {
                        valid = false;
                        that.addError(elm, 'O ano "' + dateParts.year + '" não é válido. Utilize o ano especificado.');

                        return;
                    }
                }

                if (ts <= startDateTs) {
                    valid = false;
                    that.addError(elm, 'A data final precisa ser maior que a data inicial desta etapa.');

                    return;
                }
            });

            return valid;
        },
        validateStartDates: function () {
            var that = this,
                currentYear = this.getYear(),
                previousYear = currentYear - 1,
                fields = $j('[id^="data_inicio["]'),
                valid = true;

            fields.each(function (i, elm) {
                var $elm = $j(elm),
                    val = $elm.val(),
                    dateParts = that.getDateParts(val),
                    ts = that.makeTimestamp(dateParts),
                    parentLine = $elm.closest('tr'),
                    previousLine = parentLine.prev(that.getSelector('stepsRows'));

                if (previousLine.length < 1) {
                    var validYears = [currentYear, previousYear];

                    if (validYears.indexOf(dateParts.year) === -1) {
                        valid = false;
                        that.addError(elm, 'O ano "' + dateParts.year + '" não é válido. Utilize o ano especificado ou anterior.');

                        return;
                    }
                } else {
                    if (dateParts.year !== currentYear) {
                        valid = false;
                        that.addError(elm, 'O ano "' + dateParts.year + '" não é válido. Utilize o ano especificado.');

                        return;
                    }

                    var previousDate = previousLine.find('[id^="data_fim["]'),
                        previousTs = that.makeTimestamp(that.getDateParts(previousDate.val()));

                    if (ts <= previousTs) {
                        valid = false;
                        that.addError(elm, 'A data inicial precisa ser maior que a data final da etapa anterior.');

                        return;
                    }
                }
            });

            return valid;
        },
        makeTimestamp: function (parts) {
            var date = new Date(parts.year, parts.month - 1, parts.day);

            return Math.floor(+date / 1000);
        },
        getDateParts: function (date) {
            var parts = date.split('/');

            return {
                day: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10),
                year: parseInt(parts[2], 10)
            }
        },
        removeTableCellsAndRows: function () {
            var removeLinks = $j('[id^=link_remove'),
                addLink = $j('[id^=btn_add]'),
                sendBtn = $j('#btn_enviar');

            $j('td#td_acao').hide();
            $j('[id^=link_remove').parent().hide();
            $j('#adicionar_linha').hide();

            removeLinks.removeAttr('onclick');
            addLink.removeAttr('onclick');
            sendBtn.removeAttr('onclick');
            sendBtn.unbind('click');
            this.submit();
        },
        setupModule: function () {
            var $select = $j('#ref_cod_modulo'),
                val = $select.val(),
                availableModules = window.modulosDisponiveis || [],
                moduleInfo = availableModules[val] || {},
                etapas = moduleInfo.etapas || undefined,
                rows = this.countRows();

            val = (val === '') ? 0 : parseInt(val, 10);

            if (val && Boolean(etapas) === false) {
                alert("Este módulo não possui o número de etapas definido.\nRealize esta alteração no seguinte caminho:\nCadastros > Tipos > Escolas > Tipos de etapas");

                $select.val((this.module === 0) ? '' : this.module);

                return;
            }

            this.setCurrentModule();

            if (etapas > rows) {
                var diff = etapas - rows;

                this.addRows(diff);
            }

            if (etapas < rows) {
                var diff = rows - etapas;

                this.removeRows(diff);
            }
        },
        addRows: function (qtt) {
            for (var i = 0; i < qtt; i++) {
                tab_add_1.addRow();
                this.removeTableCellsAndRows();
            }
        },
        removeRows: function (qtt) {
            var rows = $j(this.getSelector('stepsRows')).get().reverse(),
                count = 0;

            rows.each(function (elm) {
                if (count < qtt) {
                    tab_add_1.removeRow(elm);
                    count++;
                }
            });
        },
        selectModule: function () {
            var that = this,
                $select = $j('#ref_cod_modulo');

            $select.focus(function () {
                that.setCurrentModule();
            }).change(function () {
                that.setupModule();
            })
        },
        countRows: function () {
            var rows = $j(this.getSelector('stepsRows'));

            return rows.length;
        },
        getYear: function () {
            return parseInt($j(this.getSelector('year')).val(), 10);
        }
    };

    etapasHandler.init();
});
