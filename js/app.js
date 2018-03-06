/***********variables globales********/
let dias = null;
let hermandades = [];
hermandades.getByField = function (field, value) {
	for (let i = 0; i < this.length; i++) { //forEach no interrumpe con return
		if (this[i][field] && this[i][field] != null &&
			this[i][field].toString().toUpperCase() ===
			value.toString().toUpperCase()) return this[i];
	}
	return null;
};
hermandades.add = function (h) {
	this.push.apply(this, h);
};

let lyGPS = new M.layer.GeoJSON({
	name: "GPS"
}, {
	style: new M.style.Point({
		radius: 5,
		fill: {
			color: function (feature) {
				let h = hermandades.getByField("etiqueta_gps", feature.getAttribute("name"));
				if (h != null) {
					h.lastPos = feature.getGeometry().coordinates;
					return h.color;
				} else {
					return "#000";
				}
			},
			opacity: 0.5
		},
		stroke: {
			color: "#FF0000"
		},
		label: {
			text: function (feature) {
				return feature.getAttribute("name") + "\n\r" +
					formatDate(new Date(feature.getAttribute("ts")), "gps");
			},
			font: "bold 9px arial",
			offsetY: -18,
			fill: {
				color: "#000"
			},
			stroke: {
				color: "#ffffff",
				width: 3
			}
		}
	})
});
let lyRuta = new M.layer.GeoJSON({
	name: "Ruta",
	extract: false
}, {
	style: new M.style.Line({
		stroke: {
			color: "{{color}}",
			width: 5
		}
	}),
	hide: attrNotShow
});
let lyRutaDiario = new M.layer.GeoJSON({
	name: "RutaDiario",
	extract: false
}, {
	style: new M.style.Line({
		stroke: {
			color: "{{color}}",
			width: 5
		}
	}),
	hide: attrNotShow
});
let lyPois = new M.layer.GeoJSON({
	name: "Información",
	crs: "25830"
}, {
	style: poiStyle,
	hide: attrNotShow
});
let mapajsRuta, mapajsTopo, mapajsGPS, mapajsDiario, mapajsOcupados;
/*************************************/

function getInfo(url, filtro = {}, showLoading = true) {
	showLoading && $.mobile.loading().show();
	filtro.apikey = apikey;
	return $.ajax({
		dataType: "jsonp",
		url: url,
		timeout: timeout * 1000,
		data: filtro
	}).then(function (data, textStatus, jqXHR) {
		if (data.error) {
			data.peticion = $(this)[0].url;
			return $.Deferred().reject(data);
		} else {
			return data;
		}
	}).fail(function (e) {
		//Captura de error genérica para todas las llamadas
		//console.error(e.peticion, e.error);
		if (e.statusText) { //ES UN ERROR NO CONTROLADO
			showDialog(errInesperado, "ERROR INESPERADO", "error");
		}
	}).always(function () {
		$.mobile.loading().hide();
	});
}

function cargarHermandades() {
	return getInfo(getHermandades).done(function (data) {
		hermandades.add(data.hermandades);
		$.each(hermandades, function (i, hermandad) {
			let option = $("<option value=" + hermandad.codigo_hermandad + ">" + hermandad.nombre + "</option>");
			let hFav = localStorage.getItem("hermandadFavorita");
			if (hFav == hermandad.codigo_hermandad) {
				option.attr("selected", "selected");
			}
			$("#dropHermandadCamino").append(option);
			$("#dropHermandad").append(option.clone());
			if (hermandad.gps) {
				$("#dropHermandadGps").append(option.clone());
			}
		});
		informacionHermandad($("#dropHermandad").val());
		cargarCamino($("#dropHermandadCamino").val());		
	}).fail(function (e) {
		showError(e.error);
	});
}

function cargarHermandadesRuta() {
	return getInfo(getHermandades, {
		"ruta": true
	}).done(function (data) {
		$.each(data.hermandades, function (i, hermandad) {
			let option = $("<option value=" + hermandad.codigo_hermandad + ">" + hermandad.nombre + "</option>");
			let hFav = localStorage.getItem("hermandadFavorita");
			if (hFav == hermandad.codigo_hermandad) {
				option.attr("selected", "selected");
			}
			$("#dropHermandadRuta").append(option);
		});
		cargarFechasHermandad($("#dropHermandadRuta").val());
	}).fail(function (e) {
		showError(e.error);
	});
}

function cargarPasos() {
	return getInfo(getPasos).done(function (data) {
		pasos = data.pasos;
		$.each(pasos, function (i, paso) {
			option = $("<option value=" + paso.codigo_toponimo + ">" + paso.nombre_toponimo + "</option>");
			$("#dropPasos").append(option);
		});
		cargarDiasPaso($("#dropPasos").val()).done(function (data) {
			cargarHoras($("#dropPasos").val(), $("#dropDiasPaso").val());
		});
	}).fail(function (e) {
		showError(e.error);
	});
}

function informacionHermandad(idHermandad) {
	let hFav = localStorage.getItem("hermandadFavorita");
	if (hFav == idHermandad)
		$(".star.fa").removeClass("fa-star-o").addClass("fa-star");
	else
		$(".star.fa").removeClass("fa-star").addClass("fa-star-o");

	let h = hermandades.getByField("codigo_hermandad", idHermandad);
	//TODO: borrar test
	h.inf_adicional = {
		"nombre" : h.nombre,
		"web": "<a href=''>http://web.com<a>",
		"descripción": "Lorem ipusum tururum",
		"teléfono": "955955955"
	};
	//
	let tbodyTabla = $("#tablaHermandad tbody");
	tbodyTabla.empty();
	$.each(h.inf_adicional, function (key, val) {
		let tr = $("<tr>").append($("<td>").html(key))
							.append($("<td>").html(val));
		tbodyTabla.append(tr);
	});
}

function cargarCamino(idHermandad) {
	let listCamino = $("#listCamino");
	return getInfo(getCamino + idHermandad).done(function (data) {
		listCamino.empty();
		$("#msjCamino").hide();
		$.each(data.pasos, function (i, paso) {
			let ul = listCamino.find("#" + paso.codigo_fecha);
			if (ul.length == 1) {
				ul = $(ul[0]);
			} else {
				var div = $("<div data-role='collapsible'><h1>" + paso.dia_semana + "</h1></div>");
				ul = $("<ul data-role='listview' id='" + paso.codigo_fecha + "'></ul>");
				div.append(ul);
			}
			let texto_fecha = paso.texto_fecha.match(/\d{1,2}:\d{1,2}/);
			let topoNombre = texto_fecha.input.substr(0, texto_fecha.index).trim();
			let toponimo = {
				"topoX": paso.x,
				"topoY": paso.y,
				"topoNombre": topoNombre + " (" + texto_fecha + ")",
				"topoHermandad": $("#dropHermandadCamino option:selected").text()
			};

			let li = $("<li><a href='javascript:$.mobile.changePage(\"#toponimo\"," + JSON.stringify(toponimo) + ")'>" + topoNombre + "</a><p class='ui-li-aside'><strong>" + texto_fecha[0] + "</strong></p></li>");
			ul.append(li);
			listCamino.append(div);
		});
	}).fail(function (e) {
		listCamino.empty();
		$("#msjCamino").html(e.error.mensaje).show();
	});
}

function cargarDiario(idDia) {
	//JGL: no puedo usar las hermandades ya consultadas poque la respuesta no tiene los días de paso.
	return getInfo(getHermandades, {
		"codigo_fecha": idDia
	}).done(function (data) {
		let listDiario = $("#listDiario");
		listDiario.empty();

		$.each(data.hermandades, function (i, hermandad) {
			let gps = hermandad.nombre_largo.indexOf("(GPS)");
			let li = $("<li>");
			if (gps > 0) {
				li.append($("<a href='javascript:pintarMovimientoDiario(" + JSON.stringify(hermandad) + "," + idDia + ")' class='ui-btn ui-btn-icon-right ui-icon-eye'>" + hermandad.nombre_largo.substr(0, gps).trim() + "</a>"));
				li.append("<p class='ui-li-aside'>GPS</p>");
			} else {
				li.append($("<a href='javascript:pintarMovimientoDiario(" + JSON.stringify(hermandad) + "," + idDia + ")' class='ui-btn ui-btn-icon-right ui-icon-eye'>" + hermandad.nombre_largo + "</a>"));
			}
			listDiario.append(li);
		});
	}).fail(function (e) {
		showError(e.error);
	});
}

function cargarHoras(idPaso, idDia) {
	return getInfo(getHoras, {
		"codigo_toponimo": idPaso,
		"codigo_fecha": idDia
	}).done(function (data) {
		let listHoras = $("#listHoras");
		listHoras.empty();
		$.each(data.hora_hermandad, function (i, horaPaso) {
			let li = $("<li>" + horaPaso.nombre + "</li>");
			li.append("<p class='ui-li-aside'>" + horaPaso.hora + "</p>");
			listHoras.append(li);
		});
	}).fail(function (e) {
		showError(e.error);
	});
}

function cargarDiasPaso(idPaso) {
	return getInfo(getFechasPaso + idPaso).done(function (data) {
		$("#dropDiasPaso").empty();
		$.each(data.dias_semana_paso, function (i, dia) {
			let option = $("<option value=" + dia.codigo_fecha + ">" + dia.dia_semana + "</option>");
			$("#dropDiasPaso").append(option);
		});
	}).fail(function (e) {
		showError(e.error);
	});
}

function cargarDias() {
	return getInfo(getDias).done(function (data) {
		dias = data.dias_semana;
		let cqlOcupados = "";
		$.each(dias, function (i, dia) {
			let option = $("<option value=" + dia.codigo_fecha + ">" + dia.dia_semana + "</option>");
			if (dia.fecha == formatDate(new Date())) {
				option.attr("selected", "selected");
				cqlOcupados = dia.codigo_fecha;
			}
			$("#dropDiaDiario").append(option);
		});
		cargarDiario($("#dropDiaDiario").val());
		//let lyCaminosOcupados = M.layer.WMS(); añadir cql = cqlOcupados
		mapajsOcupados = M.map({
			controls: ["location"],
			container: "mapOcupados",
			layers: [lyGPS], //lyCaminosOcupados
			wmcfiles: ["romero_mapa", "romero_satelite"]
		});
	}).fail(function (e) {
		showError(e.error);
	});
}

function cargarFechasHermandad(idHermandad) {
	return getInfo(getDias + idHermandad).done(function (data) {

		$("#dropDiaRuta").empty();
		let opCompleta = $("<option value='completa'>Completa</option>");
		let opIda = $("<option value='ida'>Ida</option>");
		let opVuelta = $("<option value='vuelta'>Vuelta</option>");
		$("#dropDiaRuta").append(opCompleta);

		dias = data.dias_semana;
		let ida = false;
		let vuelta = false;
		$.each(dias, function (i, dia) {
			if (dia.dia_semana.toUpperCase().indexOf("IDA") > 0) ida = true;
			if (dia.dia_semana.toUpperCase().indexOf("VUELTA") > 0) vuelta = true;
			let option = $("<option value=" + dia.codigo_fecha + ">" + dia.dia_semana + "</option>");
			if (dia.fecha == formatDate(new Date())) {
				option.attr("selected", "selected");
			}
			$("#dropDiaRuta").append(option);
		});

		if (vuelta) $("#dropDiaRuta option:first").after(opVuelta);
		if (ida) $("#dropDiaRuta option:first").after(opIda);
	}).fail(function (e) {
		showError(e.error);
	});
}

function pintarRuta(hermandad, dia) {
	
	let filtro = {};
	if ($.isNumeric(dia)) filtro.codigo_fecha = dia;

	
	return getInfo(getRutas + hermandad, filtro).done(function (data) {
		if (data.features.length > 0) {
			console.log(data);
			lyRuta.setSource(data);

			//lyRuta.source = data;
			//lyRuta.refresh();
			if (!$.isNumeric(dia) && dia != "completa") {
				lyRuta.setFilter(M.filter.EQUAL("sentido", dia));
				console.log("filtro", lyRuta.getFilter());
			}
			
			let kmsRuta = 0;
			$.each(lyRuta.getFeatures(), function (i,f){
				kmsRuta += f.getAttribute('kms');
			});		
			
			//TODO borrar test
			kmsRuta = lyRuta.getFeatures().length;
			//
			$("#kmruta").text(kmsRuta + "km");
		} else {
			//JGL: no debería ocurrir
			showDialog("El trayecto seleccionado no tiene elementos", "INFORMACIÓN", "warning");
		}
	}).fail(function (e) {
		showError(e.error);
	});
}

function pintarMovimientoDiario(hermandad, dia) {
	getInfo(getCamino + hermandad.codigo_hermandad, {
		"codigo_fecha": dia
	}).done(function (data) {
		lyPois.clear();
		$.each(data.pasos, function (i, paso) {
			let texto_fecha = paso.texto_fecha.match(/\d{1,2}:\d{1,2}/);
			let topoNombre = texto_fecha.input.substr(0, texto_fecha.index).trim();
			let fPoi = new M.Feature(paso.codigo_toponimo, {
				"type": "Feature",
				"id": paso.codigo_toponimo,
				"geometry": {
					"type": "Point",
					"coordinates": [paso.x, paso.y]
				},
				"properties": {
					"nombre": topoNombre,
					"hora de paso": texto_fecha[0]
				}
			});
			//console.log(JSON.stringify(fPoi.getGeoJSON()));
			lyPois.addFeatures(fPoi);
		});
				
	}).fail(function (e) {
		console.error(e);
	});
	
	//en este caso el dia siempre es numérico
	getInfo(getRutas + hermandad.codigo_hermandad, {
		"codigo_fecha": dia
	}).done(function (data) {
		//lyRutaDiario.clear();
		if (data.features.length > 0) {
			console.log("entro");
			lyRutaDiario.setSource(data);
			$("#mapaDiario .subheader").text(hermandad.nombre + " - " +
				$("#dropDiaDiario option:selected").text());
			$.mobile.changePage("#mapaDiario");
		} else {
			//JGL: no debería ocurrir
			showDialog("El trayecto seleccionado no tiene elementos", "INFORMACIÓN", "warning");
		}
	}).fail(function (e) {
		showError(e.error);
	});
}

function pintarToponimo(data) {
	$("#toponimo .ui-title").text(data.topoNombre);
	$("#toponimo .subheader").text(data.topoHermandad);
	mapajsTopo.setCenter(data.topoX + "," + data.topoY + "*true").setZoom(zoomToPoint);
}

function updateLastPos() {
	let filtro = {
		"emp": "grea"
	};
	return getInfo(getGPS, filtro, false).done(function (data) {
		if (data.features.length > 0) {
			lyGPS.setSource(data);
		}
	}).fail(function (e) {
		showError(e.error);
	});
}

function pintarGPS(hermandad) {
	if (hermandad != null) { //por si se quiere sólo pintar una hermandad
		lyGPS.setFilter(M.filter.EQUAL("codigo_hermandad", hermandad));
	}
	let bbox = lyGPS.getFeatures().length > 0 ? lyGPS.getFeaturesExtent() : bboxContext;
	mapajsGPS.setBbox(bbox[0] + "," + bbox[1] + "," + bbox[2] + "," + bbox[3]);
}

function bindEvents() {
	$(document).on("pagechange", function (e, data) {
		if ($.type(data.toPage) == "object") {
			switch (data.toPage[0].id) {
				case "ruta":
					pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val()).done(
						() => {
							mapajsRuta.refresh();
						}
					);
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "toponimo":
					mapajsTopo.refresh();
					pintarToponimo(data.options);
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "mapaDiario":
					mapajsDiario.setBbox(lyRutaDiario.getFeaturesExtent());
					mapajsDiario.refresh();
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "gps":
					updateLastPos().done(function () {
						pintarGPS();
						//JGL: si sólo se quiere pintar la hermandad seleccionada
						//pintarGPS($("#dropHermandadGps").val());
						mapajsGPS.refresh();
						//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					break;
				case "mapaOcupados":
					mapajsOcupados.refresh();
					$("button#m-location-button").click();
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');					
					break;
				default:
					break;
			}
		}
	});
	$("#dropHermandad").on("change", function () {
		informacionHermandad($(this).val());
	});
	$("#dropHermandadCamino").on("change", function () {
		cargarCamino($(this).val()).done(function () {
			$("#listCamino").collapsibleset().trigger("create");
		});
	});
	$("#dropDiaDiario").on("change", function () {
		cargarDiario($(this).val()).done(function () {
			$("#listDiario").listview("refresh");
		});
	});
	$("#dropPasos").on("change", function () {
		cargarDiasPaso($(this).val()).done(
			function () {
				$("#dropDiasPaso").selectmenu("refresh");
				cargarHoras($("#dropPasos").val(), $("#dropDiasPaso").val()).done(function () {
					$("#listHoras").listview("refresh");
				});
			});
	});
	$("#dropDiasPaso").on("change", function () {
		cargarHoras($("#dropPasos").val(), $("#dropDiasPaso").val()).done(
			function () {
				$("#listHoras").listview("refresh");
			});
	});
	$("#dropHermandadRuta").on("change", function () {
		cargarFechasHermandad($("#dropHermandadRuta").val()).done(function () {
			$("#dropDiaRuta").selectmenu("refresh");
			pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val());
		});
	});
	$("#dropDiaRuta").on("change", function () {
		pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val());
	});
	$("#dropHermandadGps").on("change", function () {
		//pintarGPS($(this).val()); //JGL: para sólo pintar la hermandad
		if ($(this).val() != 0) {
			let h = hermandades.getByField("codigo_hermandad", $(this).val());
			if (h != null && h.lastPos) {
				mapajsGPS.setCenter(h.lastPos[0] + "," + h.lastPos[1]).setZoom(zoomToPoint);
			} else {
				showDialog(noPosicion, "ERROR", "error");
			}
		} else {
			if (lyGPS.getFeatures().length > 0) {
				mapajsGPS.setBbox(lyGPS.getFeaturesExtent());
			} else {
				showDialog(noGPS, "ERROR", "error");
			}
		}
	});

	$("#tablaHermandad th").click(function () { //funcionalidad a toda la cabecera
		$(".star.fa").toggleClass("fa-star fa-star-o");
		let hSel = $("#dropHermandad").val();
		let h = hermandades.getByField("codigo_hermandad", hSel);
		let hFav = localStorage.getItem("hermandadFavorita");
		if ($(".star.fa").hasClass("fa-star")) {
			guardarFavorita(hSel);
			$("#dropHermandadCamino").val(hSel).change();
			if (h.gps) 
				$("#dropHermandadGps").val(hSel).change();
			else
				$("#dropHermandadGps").val($("#dropHermandadGps option:first").val()).change();
		} else if (hSel == hFav) { //desmarcando favorita
			$("#dropHermandadCamino").val($("#dropHermandadCamino option:first").val()).change();
			$("#dropHermandadGps").val($("#dropHermandadGps option:first").val()).change();
			guardarFavorita(null);
		}
	});

	lyRuta.on(M.evt.LOAD, () => mapajsRuta.setBbox(lyRuta.getFeaturesExtent()));
}

$(document).ready(function () {
	if (window.isApp) {
		document.addEventListener("deviceready", onDeviceReady, false);
	} else {
		onDeviceReady();
	}
});

function onDeviceReady() {
	//JGL: actualización dinámica
	updateLastPos().always(function () {
		window.setInterval(updateLastPos, updateGPS * 1000);
	});
	$.when.apply($, [cargarDias(),
		cargarHermandades(),
		cargarPasos(),
		cargarHermandadesRuta()
	]).always(function () {
		//JGL: oculto splash cuando se han cargado todos los datos básicos o ha dado error
		if (window.isApp) {
			setTimeout(function () {
				navigator.splashscreen.hide();
			}, 2000);
		}
	});
	bindEvents();

	mapajsRuta = M.map({
		controls: ["location"],
		container: "mapRuta",
		wmcfiles: ["romero_mapa", "romero_satelite"],
		layers: [lyRuta, lyGPS]
	});

	mapajsDiario = M.map({
		controls: ["location"],
		container: "mapDiario",
		wmcfiles: ["romero_mapa", "romero_satelite"],
		layers: [lyRutaDiario, lyGPS, lyPois]
	});

	mapajsGPS = M.map({
		controls: ["location"],
		container: "mapGPS",
		wmcfiles: ["romero_mapa", "romero_satelite"],
		layers: [lyGPS]
	});
	mapajsTopo = M.map({
		controls: ["location"],
		layers: [lyGPS],
		container: "mapToponimo",
		wmcfiles: ["romero_mapa", "romero_satelite"]
	});
	//TODO: ¿se podía ya cambiar estilo por defecto de la drawLayer?
	mapajsTopo.getLayers({
		name: "__draw__"
	})[0].setStyle(poiStyle);

	M.dialog.show = function (message, title, severity, element) {
		return M.template.compile('dialog.html', {
		  'jsonp': true,
		  'vars': {
			'message': message,
			'title': title,
			'severity': severity
		  }
		}).then(function (html) {
		  // removes previous dialogs
		  M.dialog.remove();
			
		  // adds listener to close the dialog
		  var okButton = html.querySelector('div.m-button > button');
		  $(okButton).on("click", function () {
				if (!window.iOS && title.toUpperCase().indexOf("INESPERADO") > -1) {
					navigator.app.exitApp();
				} else {
					M.dialog.remove();
				}
			});
		  if (!(element instanceof HTMLElement)) element = document.querySelector("#"+element);
		  if (element === undefined) element = document.querySelector('div.m-mapea-container');
		  element.appendChild(html);
		});
	  };
}

function showDialog(message, title, severity) {
	console.log(severity,message);
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

function guardarFavorita(idHermandad) {
	localStorage.setItem("hermandadFavorita", idHermandad);
}