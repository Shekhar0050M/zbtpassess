sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter) {
        "use strict";

        return Controller.extend("com.btptraining.zbtpassess.controller.Home", {
            formatter: formatter,
            onInit: function () {
                window.that = this;
                this._userData();
                this._readData();
            },
            _userData: function () {
                var oJSONModel = new JSONModel(), that = this;
                var fnSuccess = function (oData, response) {
                    // This function will be called when the read operation is successful
                    oJSONModel.setData({ "UserDetails": oData });
                    that.getView().setModel(oJSONModel, "UserModel");
                };

                var fnError = function (oError) {
                    // This function will be called when there is an error during the read operation
                    console.error("Error occurred during read operation!");
                    console.error(oError);
                };
                var oModel = this.getOwnerComponent().getModel();
                // Make a read call to the OData service
                oModel.read("/SessionUserSet('')", {
                    success: fnSuccess,
                    error: fnError
                });
            },
            _readData: function () {
                var oJSONModel = new JSONModel(), that = this;
                var fnSuccess = function (oData, response) {
                    // This function will be called when the read operation is successful
                    oJSONModel.setData({ "QuestionsSet": oData.results, "Completion": 0 });
                    that.getView().setModel(oJSONModel, "QuestionModel");
                };

                var fnError = function (oError) {
                    // This function will be called when there is an error during the read operation
                    console.error("Error occurred during read operation!");
                    console.error(oError);
                };
                var oModel = this.getOwnerComponent().getModel();
                // Make a read call to the OData service
                oModel.read("/AssessQuestionsSet", {
                    urlParameters: {
                        "$expand": "QuestionToOptions"
                    },
                    success: fnSuccess,
                    error: fnError
                });
            },
            onOptionSelect: function (oEvent) {
                var oButtonGroup = oEvent.getSource(),
                    oContext = oButtonGroup.getBindingContext("QuestionModel"),
                    sPath = oContext.getPath(),
                    sSelectedOption,
                    iSelectedIndex = oEvent.getParameter("selectedIndex");
                sSelectedOption = this.fnGetSelectedOption(iSelectedIndex);
                if (sSelectedOption) {
                    oContext.getModel().setProperty(sPath + "/SELTDOPTION", sSelectedOption);
                    this._calculateTheCompletionPercent();
                }

            },
            fnGetSelectedOption: function (iSelectedIndex) {
                var options = { 0: "A", 1: "B", 2: "C", 3: "D", 4: "E" };
                return options[iSelectedIndex];
            },
            _calculateTheCompletionPercent: function () {
                var oModel = this.getView().getModel("QuestionModel"),
                    iTotal, iCompleted, oAttempted, iAttempted,
                    aQuestionsData = oModel.getProperty("/QuestionsSet");
                iTotal = aQuestionsData.length;

                oAttempted = aQuestionsData.filter(function (e) {
                    return e.SELTDOPTION !== ""
                });
                iAttempted = oAttempted.length;
                iCompleted = (iAttempted / iTotal) * 100;
                oModel.setProperty("/Completion", parseInt(iCompleted, [10]));
            },
            _submitAnswers: function () {
                var oModel = this.getOwnerComponent().getModel();
                var batchChanges = [];
                // var dataToInsert = [{"UserID":"","QNO":"0001","OPTKEY":"A"}];
                var oUserModel = this.getView().getModel("UserModel");
                var oQuestionsModel = this.getView().getModel("QuestionModel");

                var aQuestionsData = oQuestionsModel.getProperty("/QuestionsSet");
                var aDataToInsert = [];
                aQuestionsData.forEach(function (oQuestion) {
                    var oInsert = { "UserID": "", "QNO": oQuestion.SLNO, "OPTKEY": oQuestion.SELTDOPTION , "TYPE": oUserModel.getProperty("/UserDetails/TYPE") };
                    aDataToInsert.push(oInsert);
                });
                
                var batchModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZBTP_ASSESS_SRV/", true);
                aDataToInsert.forEach(function (data) {
                    var request = batchModel.createBatchOperation("/AssessSubmitsSet", "POST", data);
                    batchChanges.push(request);
                });

                batchModel.addBatchChangeOperations(batchChanges);
                batchModel.setUseBatch(true);
                batchModel.submitBatch(function (success, response) {
                    if (success) {
                        console.log("Bulk insert successful!");
                        console.log(response);
                    } else {
                        console.error("Bulk insert failed!");
                        console.error(response);
                    }
                });
            },
            _submitAnswers1: function () {
                var oUserModel = this.getView().getModel("UserModel");

                var oNewEntry = { "UserID": "", "QNO": "0001", "OPTKEY": "A", "TYPE": oUserModel.getProperty("/UserDetails/type") };
                var oModel = this.getOwnerComponent().getModel();
                oModel.create("/AssessSubmitsSet", oNewEntry, {
                    success: function () {
                        // Entity created successfully
                        console.log("New entity created successfully!");
                    },
                    error: function (oError) {
                        // Error handling
                        console.error("Error creating entity: " + oError);
                    }
                });
            }

        });
    });
