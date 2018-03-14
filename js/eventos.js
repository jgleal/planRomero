function bindEvents() {
	$(document).on("pagechange", function (e, data) {
		if ($.type(data.toPage) == "object") {
			switch (data.toPage[0].id) {
				case "ruta":
					filtroGPS = M.filter.EQUAL("order",0);
					establecerMapaGPSlayer(mapajsRuta);
					pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val()).done(
						() => {
							//mapajsRuta.refresh();
							mapajsRuta.getMapImpl().updateSize();
						}
					);
					if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "toponimo":
					//mapajsTopo.refresh();
					filtroGPS = M.filter.EQUAL("order",0);
					establecerMapaGPSlayer(mapajsTopo);
					let coordsGeo = transformar([data.options.topoX,data.options.topoY]);
					let geolink = getGeoLink(coordsGeo,data.options.topoNombre);
					$("#iralli a").attr("onclick",`javascript:openUrlExternal('${geolink}');`);
					pintarToponimo(data.options);
					mapajsTopo.getMapImpl().updateSize();
					if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "mapaDiario":
					filtroGPS = M.filter.EQUAL("order",0);
					mapajsDiario.setBbox(lyRutaDiario.getFeaturesExtent());
					establecerMapaGPSlayer(mapajsDiario);
					//mapajsDiario.refresh();
					mapajsDiario.getMapImpl().updateSize();
					if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "gps":
					establecerMapaGPSlayer(mapajsGPS);
					updateLastPos().done(function () {
						centerGPS($("#dropHermandadGps").val());
						//mapajsGPS.refresh();
						mapajsGPS.getMapImpl().updateSize();
						if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					break;
				case "mapaOcupados":
					addCaminosOcupados(mapajsOcupados);
					establecerMapaGPSlayer(mapajsOcupados);
					//mapajsOcupados.refresh();
					mapajsOcupados.getMapImpl().updateSize();
					mapajsOcupados.getControls({name:'location'})[0].activate();
					if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');					
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
		centerGPS($(this).val());
	});

	$("#tablaHermandad th").click(function () { //funcionalidad a toda la cabecera
		$(".star.fa").toggleClass("fa-star fa-star-o");
		let hSel = $("#dropHermandad").val();
		let h = hermandades.getByField("codigo_hermandad", hSel);
		let hFav = localStorage.getItem("hermandadFavorita");
		if ($(".star.fa").hasClass("fa-star")) {
			guardarFavorita(hSel);
			$("#dropHermandadCamino").val(hSel).change();
			
			$("#dropHermandadRuta").val(hSel).change();			
			if (h.gps)
				$("#dropHermandadGps").val(hSel).change();
			else
				$("#dropHermandadGps").val($("#dropHermandadGps option:first").val()).change();
		} else if (hSel == hFav) { //desmarcando favorita
			$("#dropHermandadCamino").val($("#dropHermandadCamino option:first").val()).change();
			$("#dropHermandadRuta").val($("#dropHermandadRuta option:first").val()).change();
			$("#dropHermandadGps").val($("#dropHermandadGps option:first").val()).change();
			guardarFavorita(null);
		}
		$("#dropDiaRuta").val($("#dropDiaRuta option:first").val()).change();
	});
	$("#descargaDoc").click(function () {
		openUrlExternal(urlPDF);
	});	

	lyRuta.on(M.evt.LOAD, () => mapajsRuta.setBbox(lyRuta.getFeaturesExtent()));
	lyGPS.on(M.evt.LOAD, () => lyGPS.setFilter(filtroGPS));
	mapajsGPS.on(M.evt.COMPLETED, () => mapajsGPS.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsRuta.on(M.evt.COMPLETED, () => mapajsRuta.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsDiario.on(M.evt.COMPLETED, () => mapajsDiario.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsOcupados.on(M.evt.COMPLETED, () => mapajsOcupados.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	mapajsTopo.on(M.evt.COMPLETED, () => mapajsTopo.getLayers({"name":"PlanRomero:PlanRomero"})[0].setLegendURL(legendURL));
	
}


