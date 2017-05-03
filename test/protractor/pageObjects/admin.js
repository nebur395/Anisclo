'use strict';

var AdminPageOject = function() {

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

    this.banClick = function(emailUser) {
        element.all(by.repeater("user in userList")).filter(function (elm) {
            return elm.evaluate("user.email").then(function (email) {
                return email === emailUser;
            });
        }).then(function (elms) {
            var button = elms[0].element(by.buttonText('Inhabilitar'));
            button.click();
        });
    };

    this.unBanClick = function(emailUser) {
        element.all(by.repeater("user in userList")).filter(function (elm) {
            return elm.evaluate("user.email").then(function (email) {
                return email === emailUser;
            });
        }).then(function (elms) {
            var button = elms[0].element(by.buttonText('Habilitar'));
            button.click();
        });
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

    this.editClick = function(emailUser) {
        element.all(by.repeater("user in userList")).filter(function (elm) {
            return elm.evaluate("user.email").then(function (email) {
                return email === emailUser;
            });
        }).then(function (elms) {
            var button = elms[0].element(by.buttonText('Editar'));
            button.click();
        });
    };

    this.saveClick = function(emailUser) {
        element.all(by.repeater("user in userList")).filter(function (elm) {
            return elm.evaluate("user.email").then(function (email) {
                return email === emailUser;
            });
        }).then(function (elms) {
            var button = elms[0].element(by.buttonText('Guardar'));
            button.click();
        });
    };

    this.getMessage = function() {
        return feedbackMessage.getText();
    };
};

module.exports = AdminPageOject;
