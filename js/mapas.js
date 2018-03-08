M.proxy(false);
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

function createMaps(){
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

	mapajsOcupados = M.map({
		controls: ["location"],
		container: "mapOcupados",
		layers: [lyGPS],
		wmcfiles: ["romero_mapa", "romero_satelite"]
	});
}