/** global: File, GLSR, XMLHttpRequest */

const Ajax = () => {};

Ajax.prototype = {
    /** @return void */
    get: function (url, callback, headers) {
        this.prepareRequest_(callback);
        this.xhr.open('GET', url, true);
        this.xhr.responseType = 'text';
        this.setHeaders_(headers);
        this.xhr.send();
    },

    /** @return void */
    handleError_: function (callback) {
        if (this.xhr.responseType === 'json' || this.xhr.json === true /* @IE11 */) {
            return callback({ message: this.xhr.statusText }, false);
        }
        else if (this.xhr.responseType === 'text') {
            return callback(this.xhr.statusText);
        }
        console.log(this.xhr.responseText);
        console.log(this.xhr.response);
    },

    /** @return void */
    handleSuccess_: function (callback) {
        if (this.xhr.status === 0 || this.xhr.status >= 200 && this.xhr.status < 300 || this.xhr.status === 304) {
            if (this.xhr.responseType === 'json') {
                return callback(this.xhr.response.data, this.xhr.response.success);
            }
            if (this.xhr.responseType === 'text') {
                return callback(this.xhr.responseText);
            }
            if (this.xhr.json === true) { //@IE11
                var response = JSON.parse(this.xhr.response);
                return callback(response.data, response.success);
            }
            console.log(this.xhr.responseText);
            console.log(this.xhr.response);
        }
        else {
            this.handleError_(callback);
        }
    },

    /** @return bool */
    isFileSupported: function () {
        var input = document.createElement('INPUT');
        input.type = 'file';
        return 'files' in input;
    },

    /** @return bool */
    isFormDataSupported: function () {
        return !!window.FormData;
    },

    /** @return bool */
    isUploadSupported: function () {
        var xhr = new XMLHttpRequest();
        return !!(xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
    },

    /** @return void */
    post: function (formOrData, callback, headers) {
        this.prepareRequest_(callback);
        this.xhr.open('POST', GLSR.ajaxurl, true);
        this.xhr.responseType = 'json';
        this.xhr.json = true; // @IE11
        this.setHeaders_(headers);
        this.xhr.send(this.normalizeData_(formOrData));
    },

    /** @return void */
    prepareRequest_: function (callback) {
        this.xhr = new XMLHttpRequest();
        this.xhr.onload = this.handleSuccess_.bind(this, callback);
        this.xhr.onerror = this.handleError_.bind(this, callback);
    },

    /** @return FormData */
    buildFormData_: function (formData, data, parentKey) {
        if (typeof data !== 'object' || data instanceof Date || data instanceof File) {
            formData.append(parentKey, data || '');
        }
        else {
            Object.keys(data).forEach(function (key) {
                if (!data.hasOwnProperty(key))return;
                formData = this.buildFormData_(formData, data[key], parentKey ? parentKey[key] : key);
            }.bind(this));
        }
        return formData;
    },

    /** @return FormData */
    normalizeData_: function (data) { // object
        var formData = new FormData();
        var objectType = Object.prototype.toString.call(data);
        if ('[object FormData]' === objectType) {
            formData = data;
        }
        if ('[object HTMLFormElement]' === objectType) {
            formData = new FormData(data);
        }
        if ('[object Object]' === objectType) {
            Object.keys(data).forEach(function (key) {
                formData.append(key, data[key]);
            });
        }
        formData.append('action', GLSR.action);
        formData.append('_ajax_request', true);
        return formData;
    },

    /** @return void */
    setHeaders_: function (headers) {
        headers = headers || {};
        headers['X-Requested-With'] = 'XMLHttpRequest';
        for(var key in headers) {
            if (!headers.hasOwnProperty(key)) continue;
            this.xhr.setRequestHeader(key, headers[key]);
        }
    },
};

export default Ajax;
