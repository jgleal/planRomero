function bindEvents() {
	$(document).on("pagechange", function (e, data) {
		if ($.type(data.toPage) == "object") {
			switch (data.toPage[0].id) {
				case "ruta":
					establecerMapaGPSlayer(mapajsRuta);
					pintarRuta($("#dropHermandadRuta").val(), $("#dropDiaRuta").val()).done(
						() => {
							//mapajsRuta.refresh();
							mapajsRuta.getMapImpl().updateSize();
						}
					);
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "toponimo":
					//mapajsTopo.refresh();
					establecerMapaGPSlayer(mapajsTopo);
					mapajsTopo.getMapImpl().updateSize();
					let geolink = "geo:0,0?q="+transformar([data.options.topoX,data.options.topoY]);
					//geolink += "("+data.options.topoNombre+")"; //añadir etiqueta al mapa
					$("#iralli a").attr("href",geolink);
					pintarToponimo(data.options);
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "mapaDiario":
					mapajsDiario.setBbox(lyRutaDiario.getFeaturesExtent());
					establecerMapaGPSlayer(mapajsDiario);
					//mapajsDiario.refresh();
					mapajsDiario.getMapImpl().updateSize();
					//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					break;
				case "gps":
					establecerMapaGPSlayer(mapajsGPS);
					updateLastPos().done(function () {
						pintarGPS();
						//JGL: si sólo se quiere pintar la hermandad seleccionada
						//pintarGPS($("#dropHermandadGps").val());
						//mapajsGPS.refresh();
						mapajsGPS.getMapImpl().updateSize();
						//if (lyGPS.getFeatures().length <= 0) showDialog(noGPS, 'ERROR', 'error');
					});
					break;
				case "mapaOcupados":
					//mapajsOcupados.refresh();
					addCaminosOcupados(mapajsOcupados);
					establecerMapaGPSlayer(mapajsOcupados);
					mapajsOcupados.getMapImpl().updateSize();
					if (!($("#mapaOcupados .m-location-container").hasClass("activated"))) {
						$("#mapaOcupados button#m-location-button").click();
					}
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
		centerGPS($(this).val().toString());
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
	});

	lyRuta.on(M.evt.LOAD, () => mapajsRuta.setBbox(lyRuta.getFeaturesExtent()));
}


