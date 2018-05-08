function bindEvents() {
	$(document).on("pagechange", function (e, data) {
		if ($.type(data.toPage) == "object") {
			seleccionarFavorita(localStorage.getItem("hermandadFavorita"));
			switch (data.toPage[0].id) {
				case "ruta":
					updateLastPos(false).done(function () {
						if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					establecerMapaGPSlayer(mapajsRuta);
					pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val()).done(
						() => {
							//mapajsRuta.refresh();
							mapajsRuta.getMapImpl().updateSize();
						}
					);
					break;
				case "toponimo":
					updateLastPos(false).done(function () {
						if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					establecerMapaGPSlayer(mapajsTopo);
					let coordsGeo = transformar([data.options.topoX,data.options.topoY]);
					let geolink = getGeoLink(coordsGeo,data.options.topoNombre);
					$("#iralli a").attr("onclick",`javascript:openUrlExternal('${geolink}');`);
					pintarToponimo(data.options);
					//mapajsTopo.refresh();
					mapajsTopo.getMapImpl().updateSize();
					break;
				case "mapaDiario":
					updateLastPos(false).done(function () {
						if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					mapajsDiario.setBbox(lyRutaDiario.getFeaturesExtent());
					establecerMapaGPSlayer(mapajsDiario);
					mapajsDiario.getMapImpl().updateSize();
					break;
				case "gps":
					establecerMapaGPSlayer(mapajsGPS);
					mapajsGPS.getMapImpl().updateSize();
					//JGL: no hace falta updateGPS porque al entrar en la ventana
					//el combo disparará su evento change y se actualizarán las posiciones
					break;
				case "mapaOcupados":
					updateLastPos(false).done(function () {
						if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					addCaminosOcupados(mapajsOcupados);
					establecerMapaGPSlayer(mapajsOcupados);
					//mapajsOcupados.refresh();
					mapajsOcupados.getMapImpl().updateSize();
					mapajsOcupados.getControls({name:'location'})[0].activate();
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
			if ($.mobile.activePage.attr('id') == 'ruta') $("#dropDiaRuta").selectmenu("refresh");
			pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val());
		});
	});
	$("#dropDiaRuta").on("change", function () {
		pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val());
	});
	$("#dropHermandadGps").on("change", function () {
		if ($.mobile.activePage.attr('id') == 'gps')
			updateLastPos(true).done(() => centerGPS());
	});
	
	$("#tablaHermandad th").click(function () { //funcionalidad a toda la cabecera
		$(".star.fa").toggleClass("fa-star fa-star-o");
		let hSel = $("#dropHermandad").val();
		let hFav = localStorage.getItem("hermandadFavorita");
		if ($(".star.fa").hasClass("fa-star")) {
			guardarFavorita(hSel);
			seleccionarFavorita(hSel);
		} else if (hSel == hFav) { //desmarcando favorita
			guardarFavorita(null);
			seleccionarFavorita(null);			
		}
		$("#dropDiaRuta").val($("#dropDiaRuta option:first").val()).change();
	});
	$("#descargaDoc").click(function () {
		openUrlExternal(urlPDF);
	});	

	lyRuta.on(M.evt.LOAD, () => mapajsRuta.setBbox(lyRuta.getFeaturesExtent()));
	//lyGPS.on(M.evt.LOAD, () => lyGPS.setFilter(filtroGPS));
	mapajsGPS.on(M.evt.ADDED_WMS, () => mapajsGPS.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsRuta.on(M.evt.ADDED_WMS, () => mapajsRuta.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsDiario.on(M.evt.ADDED_WMS, () => mapajsDiario.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsOcupados.on(M.evt.ADDED_WMS, () => mapajsOcupados.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsTopo.on(M.evt.ADDED_WMS, () => mapajsTopo.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	
}


