Kojto.Module1DNesting = new Klass({
    Extends: Kojto.ModuleGenericProfile,
    id: '1DNesting',
    Binds: ['list', 'view', 'update', 'remove', 'create'],
    layoutSizeEast: '100%',
    grids: {},
    gridOptions: {},
    bars: {
        inputBars: {},
        desiredBars: {}
    },
    output: {
        calculated: false
    },
    actionsLabels: {
        'list': '1DNesting'
    },
    templates: {
        profile: 'Scripts/Sandbox/Content/html/1DNesting-profile.html',
        outputLayout: 'Scripts/Sandbox/Content/html/1DNesting-outputLayout.html'
    },
    initProfile: function () {

    },

    list: function () {

        this.parent();

        this.main.loadContentProvider(this);

        var gridOptions = new Kojto.gridOptions({
            deleting: false,
            paging: true,
            exporting: false,
            validation: true,
            source: '1DNestingMainGrig',
            editMode: "rowedittemplate",
           
            columns: [
				{ headerText: null, key: 'id', dataType: 'number', hidden: true, editorType: 'hidden' },
			    { headerText: $.i18n._('Number'), key: 'number', required: true, editorType: 'hidden' },
                {
                    headerText: $.i18n._('MainCode'),
                    key: "mainCodeId",
                    dateType: "string",
                    hidden: true,
                    required: true,
                    editorType: "combo",
                    editorOptions: {
                        id: "mainCodeId",
                        mode: "editable",
                        textKey: "name",
                        valueKey: "id",
                        autoComplete: true,
                        filteringType: "local",
                        filterCondition: "contains",
                        renderMatchItems: "contains",
                        source: "1DNestingMainCodes",
                    }
                },
                {
                    headerText: $.i18n._("Code"),
                    key: "codeId",
                    dataType: "string",
                    hidden: true,
                    required: true,
                    editorType: "combo",
                    validation: true,
                    editorOptions: {
                        id: "codeId",
                        mode: "editable",
                        textKey: "name",
                        valueKey: "id",
                        autoComplete: true,
                        filteringType: "local",
                        filterCondition: "contains",
                        renderMatchItems: "contains",
                        source: "1DNestingCodes",
                        parentCombo: "#mainCodeId",
                        parentComboKey: "mainCodeId",
                    }
                },
                {
                    headerText: $.i18n._('Subcode'),
                    key: "subcodeId",
                    dataType: "string",
                    hidden: true,
                    required: true,
                    editorType: "combo",
                    editorOptions: {
                        id: "subcodeId",
                        mode: "editable",
                        textKey: "name",
                        valueKey: "id",
                        autoComplete: true,
                        filteringType: "local",
                        filterCondition: "contains",
                        renderMatchItems: "contains",
                        source: "1DNestingSubcodes",
                        parentCombo: "#codeId",
                        parentComboKey: "codeId",
                    },
                },
				{ headerText: $.i18n._('Name'), key: 'name', dataType: 'string', hidden: true, editorType: 'text' },
                { headerText: $.i18n._('Description'), key: 'description', dataType: 'string', editorType: 'text' },
				{ headerText: $.i18n._('Created by'), key: 'createdBy', dataType: 'string', editorType: 'hidden'},
				{ headerText: $.i18n._('DateCreated'), key: 'dateCreated', dataType: 'string', editorType: 'hidden'},
                { headerText: $.i18n._('Active'), key: 'isActive', dataType: 'bool', hidden: false},
			    { headerText: null, key: "rowVersion", hidden: true, editorType: 'hidden', readOnly: true },
            ]
        },
		    {
		        cellClick: this.onMainGridCellClick.bind(this),
		        features: [
		        {
		            name: 'KojtoUpdating'
		        }]
		    }
		);

        // create grid wrapper
        this.gridMain = this.createGridWrapper()
			.appendTo(this.layout.center);

        // initialize
        gridOptions.init(this.gridMain, function () {
            this.attachMainGridEvents();
            // create profile actions

            this.showProfileActions();
        }.bind(this));

        this.main.Layout.sizePane("east", 960);
    },
    view: function (data) {
         this.parent();
         this.selectedDocumentId = data['id'];

         this.main.clearLayoutRight(true);

         this.data = this.gridMain.igGrid('findRecordByKey', parseInt(data['id']));

         if (!this.gridMain.igGrid("selectedRow")) {
             var allRows = this.gridMain.data().igGrid.dataSource._data;

             for (var i = 0; i < allRows.length; i++) {
                 if (this.data.id == allRows[i].id) {
                     this.gridMain.igGridSelection("selectRow", i);
                     break;
                 }
             }
         }

         delete this.inputBarsDsFlag;
         delete this.desiredBarsDsFlag;
         delete this.outputDsFlag;
         this.output.calculated = false;

         this.profileTemplate = Kojto.Utils.parseTemplate(this.templates.profile, this.data);
         this.profileTemplate.appendTo(this.layout.right).tabs();

         this._optimizationsTabsEvents();

         $(".button-deriveNew").click(function () {
             //Kojto.Env.get("Main").showProgress({ backgroundColor: "transparent" });

             //$.post(Kojto.Env.get("Main").currentCompany + "/Offer/DeriveNewOffer", { offerId: this.selectedDocumentId })
             //    .done(
             //        function (data) {
             //            this.gridMain.igGrid("renderNewRow", data.data.row);
             //            Kojto.Utils.createMessage("success", $.i18n._("msgDone"));
             //            Kojto.Env.get("Main").hideProgress();
             //        }.bind(this));
         }.bind(this));
    },

    _optimizationsTabsEvents: function () {
        this.tabsCallbacks = {
            2: $.proxy(this._renderInputBars, this),
            3: $.proxy(this._renderDesiredBars, this),
            4: $.proxy(this._renderOutput, this)
        };

        for (var i = 0; i < Object.keys(this.tabsCallbacks).length; i++) {
            $('a[tab=' + Object.keys(this.tabsCallbacks)[i] + ']').click(
                $.proxy(function (e) {
                    t = $(e.target);

                    if (t.is('span')) {
                        t = $(e.target).parent(); //w;
                    }

                    var idx = t.attr('tab');

                    this.tabsCallbacks[idx]();
                },
                    this
                )
            );
        }
    },

    _renderInputBars: function () {
        if (typeof (this.inputBarsDsFlag) !== 'undefined') {
            return;
        }

        $(function () {
            $("#comboBarEndsTrim").igNumericEditor({
                dataMode: "int",
                maxValue: 50,
                minValue: 0,
                button: "spin",
                width: 160
            });
            $("#comboCutThickness").igNumericEditor({
                dataMode: "int",
                maxValue: 40,
                minValue: 0,
                button: "spin",
                width: 160
            });
            $("#comboGripBarPartion").igNumericEditor({
                dataMode: "int",
                maxValue: 400,
                minValue: 10,
                button: "spin",
                width: 160
            });
        });

        this.gridOptions.inputBars = new Kojto.gridOptions({
            indicatorAnimation: true,
            autoGenerateColumns: false,
            deleting: true,
            exporting: false,
            filtering: false,
            source: "1DNestingInputBars",
           
            columns: [
                {
                    headerText: $.i18n._("Bar Id"), key: "barId", editorType: "text", dataType: "string", required: true
                },
                {
                    headerText: $.i18n._("Length"), key: "length", editorType: "numeric", dataType: "number", required: true
                },
                {
                    headerText: $.i18n._("Quantity"), key: "quantity", editorType: "numeric", dataType: "number", required: true
                }
            ],
        },
        {
            features: [
                {
                    name: "KojtoUpdating",
                }
            ]
        });
        //Grid init
        this.bars.inputBars = this.profileTemplate.find("div[tab-fragment=2] .grid-wrapper");

        this.inputBarsDsFlag = this.gridOptions.inputBars;

        var options = this.gridOptions.inputBars;

        var grid = this.bars.inputBars 

        options.init(grid, function () {
            this.grid
                .on("iggridkojtoupdatingroweditdialogopening", function () {
                    this.module.profileTemplate.hide();
                }.bind(this))
                .on("iggridkojtoupdatingroweditdialogclosed", function () {
                    this.module.profileTemplate.show.delay(500, this.module.profileTemplate);
                }.bind(this));
        }.bind({ module: this, grid: grid }));
    },

    _renderDesiredBars: function () {
        if (typeof (this.desiredBarsDsFlag) !== 'undefined') {
            return;
        }

        this.gridOptions.desiredBars = new Kojto.gridOptions({
            indicatorAnimation: true,
            autoGenerateColumns: false,
            deleting: true,
            exporting: false,
            filtering: false,
            source: "1DNestingDesiredBars",
           
            sourceOptions: {
                changesSuccessHandler: function () {
                }.bind(this),
            },
            columns: [
                { headerText: $.i18n._("Bar Id"), key: "barId", editorType: "text", dataType: "string", required: true },
                { headerText: $.i18n._("Length"), key: "length", editorType: "numeric", dataType: "number", required: true },
                { headerText: $.i18n._("Quantity"), key: "quantity", editorType: "numeric", dataType: "number", required: true },
            ],
        },
        {
            features: [
                {
                    name: "KojtoUpdating",
                }
            ]
        });
        //Grid init
        this.bars.desiredBars = this.profileTemplate.find("div[tab-fragment=3] .grid-wrapper");

        this.desiredBarsDsFlag = this.gridOptions.desiredBars;

        var options = this.gridOptions.desiredBars;

        var grid = this.bars.desiredBars;

        options.init(grid, function() {
            this.grid
                .on("iggridkojtoupdatingroweditdialogopening", function () {
                    this.module.profileTemplate.hide();
                }.bind(this))
                .on("iggridkojtoupdatingroweditdialogclosed", function () {
                    this.module.profileTemplate.show.delay(500, this.module.profileTemplate);
                }.bind(this));
        }.bind({ module: this, grid: grid }));

        $('#outputResult').click(function () {
            if (!this.bars.inputBars.length) {
                this._renderInputBars();
                this._renderDesiredBars();
            }

            var errorText = 'Output can not show calculated result whidout: <br/>';

            if ($('#comboBarEndsTrim').val() === '') {
                errorText += 'bar ends trim, ';
            }

            if ($('#comboCutThickness').val() === '') {
                errorText += 'cut thickness, '
            }

            if ($('#comboGripBarPartion').val() === '') {
                errorText += 'grip bar partion, '
            }

            if (this.bars.inputBars.igGrid('allRows').length === 0) {
                errorText += 'input bars added'
            }

            if (this.bars.desiredBars.igGrid('allRows').length === 0) {
                errorText += 'Desired bars added, '
            }

            if ($('#comboBarEndsTrim').val() != "" && $('#comboCutThickness').val() != "" && $('#comboGripBarPartion').val() != "" &&
                this.bars.inputBars.igGrid('allRows').length != 0 && this.bars.desiredBars.igGrid('allRows').length != 0) {

                if (this.output.calculated === true) {
                    $("#outputTrigger").trigger("click");
                    return;
                }

                $('div[tab-fragment=4]').empty();
                $('.ui-iggrid-addrow').hide();
                $('#outputResult').text('Calculated result');
                this.outputDsFlag = '';
                $("#outputTrigger").trigger("click");
            }
            else {
                Kojto.Utils.createMessage("error", $.i18n._(errorText));
                return;
            }
        }.bind(this));
    },

    _renderOutput: function () {
        if (this.output.calculated || typeof(this.outputDsFlag) == "undefined") {
            return;
        }

        $.getJSON('Scripts/Sandbox/db/3d-soft/1DNesting/1DNesting_Core.Output.json', function (data) {
            for (var index = 0; index < data.data.data.length; index++) {
                this.profileTemplate = Kojto.Utils.parseTemplate(this.templates.outputLayout, data.data.data[index]);
                this.profileTemplate.appendTo($('div[tab-fragment=4]'));
            }
        }.bind(this));

        this.output.calculated = true;
    },

    attachMainGridEvents: function () {

        this.parent();

        this.gridMain.on('iggridrowsrendered', function (e, args) {
            Kojto.Utils.applyBindings({}, args.tbody);
        }.bind(this)).on('iggridkojtoupdatingeditrowended', function (e, args) {
            Kojto.Utils.applyBindings({}, args.owner.element);
        }.bind(this)).on('iggridkojtoupdatingsyncrowdata', function (e, args) {
            Kojto.Utils.applyBindings({}, args.owner.element);
        }.bind(this));
    },
    
    getProfileActions: function () {
        return [];
    },
});

Kojto.Module.register(Kojto.Module1DNesting);