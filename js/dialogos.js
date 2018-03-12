M.dialog.show = function (message, title, severity, element) {
    return M.template.compile('dialog.html', {
        'jsonp': true,
        'vars': {
            'message': message,
            'title': title,
            'severity': severity
        }
    }).then(function (html) {
        M.dialog.remove();

        var okButton = html.querySelector('div.m-button > button');
        $(okButton).on("click", function () {
            if (!window.iOS && title.toUpperCase().indexOf("INESPERADO") > -1) {
                navigator.app.exitApp();
            } else {
                M.dialog.remove();
            }
        });
        if (!(element instanceof HTMLElement)) element = document.querySelector("#" + element);
        if (element === undefined) element = document.querySelector('div.m-mapea-container');
        element.appendChild(html);
    });
};

function showDialog(message, title, severity) {
    if (message && message != null && message != "") {
        M.dialog.show(message, title, severity, document.body);
    }
}

function showInfo() {
    showDialog(htmlAcercade, "Acerca de", "info");
}

function showError(e) {
    errTxt = errMsg[errCode.indexOf(e.codigo)] || e.mensaje;
    showDialog(errTxt, "ERROR", "error");
}

function openUrlExternal(url){
    //_system abre siempre en la misma pestaña del navegador 
    // para evitar que se abra multiples veces lo mismo.
    // Cambiar a _blank si se quiere abrir multiples pestañas.
    cordova.InAppBrowser.open(url, '_system');
}
