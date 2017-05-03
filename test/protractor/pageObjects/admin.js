'use strict';

var AdminPageOject = function() {

    var user = element(by.binding('currentEmail'));
    var banButton = element(by.buttonText('Inhabilitar'));
    var unBanButton = element(by.buttonText('Habilitar'));
    var activeButton = element(by.buttonText('Activar'));
    var editButton = element(by.buttonText('Editar'));
    var saveButton = element(by.buttonText('Guardar'));
    var feedbackMessage = element(by.className('message'));

    this.getUrl = function() {
        return "http://localhost:8080/#/adminManagement";
    };

    this.userClick = function(emailUser) {
        element.all(by.repeater("user in userList")).filter(function (elm) {
            return elm.evaluate("user.email").then(function (email) {
                return email === emailUser;
            });
        }).then(function (elms) {
            var button = elms[0].element(by.binding('currentEmail'));
            button.click();
        });
    };

    this.banClick = function() {
        banButton.click()
    };

    this.unBanClick = function() {
        unBanButton.click()
    };

    this.activeClick = function(emailUser) {
        element.all(by.repeater("user in userList")).filter(function (elm) {
            return elm.evaluate("user.email").then(function (email) {
                return email === emailUser;
            });
        }).then(function (elms) {
            var button = elms[0].element(by.buttonText('Activar'));
            button.click();
        });
    };

    this.editClick = function() {
        editButton.click()
    };

    this.saveClick = function() {
        saveButton.click()
    };

    this.getMessage = function() {
        return feedbackMessage.getText();
    };
};

module.exports = AdminPageOject;
