'use strict';

var StarterPageOject = function() {
    var showHidePOIsList = element(by.name('showHidePOIsList'));
    var showHideRoutesSection = element(by.name('showHideRoutesSection'));
    var map = element(by.tagName('ui-gmap-google-map'));
    var feedbackMessage = element(by.className('message'));

    //modal section
    var poiModalName = element(by.model('poiModal.name'));
    var poiModalTags = element(by.model('poiModal.tags'));
    var poiModalLat = element(by.model('poiModal.lat'));
    var poiModalLng = element(by.model('poiModal.lng'));
    var poiModalDescription = element(by.model('poiModal.description'));
    var poiModalUrl = element(by.model('poiModal.url'));
    var shortUrl = element(by.name('shortURL'));
    var poiModalImage = element(by.name('inputImagePOI'));
    var savePOI = element(by.buttonText('Guardar'));
    var duplicatePOI = element(by.buttonText('Duplicar'));
    var deletePOI = element(by.buttonText('Borrar'));
    var cancelModal = element(by.buttonText('Cancelar'));

    this.getUrl = function() {
        return "http://localhost:8080/#/starter";
    };

    this.mapClick = function() {
        map.click()
    };

    this.setPoiName = function(name) {
        poiModalName.sendKeys(name)
    };

    this.setPoiTags = function(tags) {
        poiModalTags.sendKeys(tags)
    };

    this.setPoiLat = function(lat) {
        poiModalLat.sendKeys(lat)
    };

    this.setPoiLng = function(lng) {
        poiModalLng.sendKeys(lng)
    };

    this.setPoiDescription = function(description) {
        poiModalDescription.sendKeys(description)
    };

    this.setPoiUrl = function(tags) {
        poiModalUrl.sendKeys(tags)
    };

    this.shortUrlClick = function() {
        shortUrl.click()
    };

    this.submitImageClick = function() {
        poiModalImage.click()
    };

    this.savePOIClick = function() {
        savePOI.click()
    };

    this.duplicatePOIClick = function() {
        duplicatePOI.click()
    };

    this.deletePOIClick = function() {
        deletePOI.click()
    };

    this.cancelModalClick = function() {
        cancelModal.click()
    };

    this.getMessage = function() {
        return feedbackMessage.getText();
    };

};

module.exports = StarterPageOject;
