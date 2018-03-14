let mapajsRuta, mapajsTopo, mapajsGPS, mapajsDiario, mapajsOcupados;
let poiStyle = new M.style.Point({
	radius: 6,
	fill: {
		color: '#00cccc',
		opacity: 0.6
	},
	stroke: {
		color: '#0000cc',
		width: 1
	},
	label: {
		text: function (feature) {
			return (feature.getAttribute('nombre') || "") + "\n\r" +
				(feature.getAttribute('hora de paso') || "");
		},
		font: 'bold 9px arial',
		offset: [0, -25],
		fill: {
			color: "#000"
		},
		stroke: {
			color: "#ffffff",
			width: 3
		}
	}
});
let lyPois = new M.layer.GeoJSON({
	name: "Información",
	crs: "25830"
}, {
	style: poiStyle,
	hide: attrNotShow
});
let lyGPS = new M.layer.GeoJSON({
	name: "Posición GPS carretas",
	extract: false
}, {
	style: new M.style.Point({
		radius: 5,
		fill: {
			color: function (feature) {
				let h = hermandades.getByField("etiqueta_gps", feature.getAttribute("name"));
				if (h != null) {
				    return h.color;
				} else {
					return "#000";
				}
			},
			opacity: function (feature){
				if (feature.getAttribute("order")==0)//última posición
					return 0.7;
				else
					return 0.4; 
			}
		},
		stroke: {
			color: "#FF0000"
		},
		label: {
			text: function (feature) {
				if (feature.getAttribute("order")==0) //solo última posición
				return feature.getAttribute("name") + "\n\r" +
					formatDate(new Date(feature.getAttribute("ts")), "gps");
				else 
				return formatDate(new Date(feature.getAttribute("ts")), "gps");
			},
			font: "bold 9px arial",
			offset: [0,-25],
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
let filtroGPS = M.filter.EQUAL("order",0);
let lyRuta = new M.layer.GeoJSON({
	name: "Rutas",
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
	name: "Rutas",
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

function createMaps() {
	mapajsRuta = M.map({
		controls: ["location","scale","layerswitcher"],
		container: "mapRuta",
		wmcfiles: ["romero_mapa", "romero_satelite"],
		layers: [lyRuta]
	});

	mapajsDiario = M.map({
		controls: ["location","scale","layerswitcher"],
		container: "mapDiario",
		wmcfiles: ["romero_mapa", "romero_satelite"],
		layers: [lyRutaDiario, lyPois]
	});

	
	mapajsTopo = M.map({
		controls: ["location","scale","layerswitcher"],
		container: "mapToponimo",
		wmcfiles: ["romero_mapa", "romero_satelite"]
	});
	//TODO: ¿se podía ya cambiar estilo por defecto de la drawLayer?
	mapajsTopo.getLayers({
		name: "__draw__"
	})[0].setStyle(poiStyle);
	
	mapajsOcupados = M.map({
		controls: ["location","scale","layerswitcher"],
		container: "mapOcupados",
		wmcfiles: ["romero_mapa", "romero_satelite"]
	});

	mapajsGPS = M.map({
		controls: ["location","scale","layerswitcher"],
		container: "mapGPS",
		wmcfiles: ["romero_mapa", "romero_satelite"],
		layers: [lyGPS]
	});
}

function addCaminosOcupados(mapa) {
	let dateHoy = new Date();
	let codJornada = dateHoy.getHours() > horaCambioJornada? 2 : 1;
	let hoy = dias.find(d => d.fecha == formatDate(dateHoy));
	let codFecha = (hoy != undefined)? hoy.codigo_fecha : 0;
	let cqlOcupados = `CODIGO_JORNADA='${codJornada}' AND CODIGO_FECHA='${codFecha}'`;
	let lyCaminosOcupados = new M.layer.WMS({
		url: urlWMSCaminosOcupados + '?cql_filter=' + encodeURI(cqlOcupados),
		name: 'PlanRomero:JRFR_APP_TRAMOS',
		legend: 'Caminos Ocupados',
		transparent: true,
		tiled: false
	});
	
	mapa.removeLayers(lyCaminosOcupados).addLayers(lyCaminosOcupados);
}
//para controlar que sólo está añadida al mapa actual visualizado
//ya que mapea no permite una capa en varios mapas
function establecerMapaGPSlayer(mapa){
	lyGPS.getImpl().map.removeLayers([lyGPS]);
	mapa.addLayers(lyGPS);

	if (window.isIOS){
		//desactivo de todos los location ya que en iOS parece no poder
		//compartir la ubicación con múltiples controles. 
		mapajsOcupados.getControls({name:'location'})[0].deactivate();
		mapajsRuta.getControls({name:'location'})[0].deactivate();
		mapajsDiario.getControls({name:'location'})[0].deactivate();
		mapajsGPS.getControls({name:'location'})[0].deactivate();
		mapajsTopo.getControls({name:'location'})[0].deactivate();
	}

function transformar(arrCoords){
	var epsg4326 = proj4.defs('EPSG:4326');
	var epsg25830 = proj4.defs('EPSG:25830');
	coordTrans = proj4(epsg25830,epsg4326,arrCoords);
	return coordTrans[1]+","+coordTrans[0];
}

function getGeoLink(coords,label){
	if (window.isApp){
		if (window.isIOS)
			return `http://maps.apple.com?ll=${coords}&q=${label}`;
		else
			return `geo:${coords}?q=${coords}(${label})`;
	}else
		return `http://maps.google.com?q=${coords}`;

}