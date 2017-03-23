'use strict';

var ProfilePageOject = function() {
    var currentPasswordInput = element(by.model('currentPass'));
    var newPasswordInput = element(by.model('newPass'));
    var changePasswordButton = element(by.buttonText('Cambiar contraseña'));
    var deleteAccountButton = element(by.buttonText('Borrar cuenta'));
    var successMsg = element(by.binding('successMsg'));
    var errorMsg = element(by.binding('errorMsg'));

    this.getUrl = function() {
        return "http://localhost:8080/#/profile";
    };

    this.setCurrentPassword = function(password) {
        currentPasswordInput.sendKeys(password)
    };

    this.setNewPassword = function(password) {
        newPasswordInput.sendKeys(password)
    };

    this.changePasswordClick = function() {
        changePasswordButton.click()
    };

    this.deleteAccountClick = function() {
        deleteAccountButton.click()
    };

    this.getSuccess = function() {
        return successMsg.getText();
    };

    this.getError = function() {
        return errorMsg.getText();
    };
};

module.exports = ProfilePageOject;
