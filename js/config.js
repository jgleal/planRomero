const apikey = "pl4n06";
/************************************** SERVICIOS ****************************************/
const entorno = "https://ws199.juntadeandalucia.es/prom/rest/";
const getHermandades = entorno + "hermandades/";
const getDias = entorno + "fechas/";
const getRutas = entorno + "ruta/";
const getFechas = entorno + "fechas/";
const getCamino = entorno + "camino/";
const getPasos = entorno + "pasos/";
const getFechasPaso = entorno + "fechas/paso/";
const getHoras = entorno + "horario/";
const getGPS = entorno + "gps/";
const getColor = entorno + "color/"; //NO USADO
const getAvisos = entorno + "avisos/"
/**/
const bboxContext = {x:{min:96388,max:621889},y:{min:3959795,max:4299792}};
const zoomToPoint = 12;
const updateGPS = 150; //en segundos.
var intervalAvisos = 15; //en segundos
const timeout = 30; //en segundos. Se usa para detectar si hay algún problema con los servicios no controlado
const attrNotShow = ["the_geom", "geom", "geometry", "color", "sentido"];
/*********************** MENSAJES DE ERROR NO CONTROLADO EN LOS SERVICIOS **********************/
const noGPS = "Actualmente no existen posiciones GPS. Inténtelo más tarde";
/*const noPosicion = "No existe posición para la hermandad seleccionada";*/
const errInesperado = "Ha ocurrido un error inesperado. Vuelva a ejecutar la aplicación";
const errCode = [999];
const errMsg = ["No hay posiciones GPS"];
const urlCJI = 'https://juntadeandalucia.es/organismos/presidenciaadministracionpublicaeinterior.html';
const versionApp = "Versión 5.0.0";
const docsPDF = [
	{
		nombre: "Tríptico",
		url: "https://ws199.juntadeandalucia.es/imgplan/InformaPlanRomero.pdf"
	},
	{
		nombre: "Plano de la Aldea",
		url: "https://ws199.juntadeandalucia.es/imgplan/PlanoAldeaRomero.pdf"
	},
	{
		nombre: "Normas del parque",
		url: "https://ws199.juntadeandalucia.es/imgplan/NormasParqueRomero.pdf"
	},
	{
		nombre: "Consorcio transportes de Huelva",
		url: "http://www.cthu.es/"
	},
	{
		nombre: "Consorcio transportes de Sevilla",
		url: "http://www.consorciotransportes-sevilla.com/"
	}
];
const htmlAcercade = `<img style="max-width:100%" src="img/logoJunta.png"/><br>Plan Romero<br>${versionApp}<br><br>Junta de Andalucía<br>
						<a href="#" onclick="javascript:openUrlExternal('${urlCJI}');">Consejería de la Presidencia, Administración Pública e Interior</a>`;

const horaCambioJornada = 15;
const urlWMSCaminosOcupados = 'https://ws199.juntadeandalucia.es/PlanRomero/wms';
const capaCaminosOcupados = 'PlanRomero:PR_125_CAM_OCUPADOS';
const legendURL = "https://ws199.juntadeandalucia.es/imgplan/LeyendaPRomero.png";
window.isApp = /^(?!HTTP)/.test(document.URL.toUpperCase()); //
window.iOS = /IPAD|IPHONE|IPOD/.test(navigator.userAgent.toUpperCase());
var formatDate = function (date, format) {
	//console.log(date);
	switch (format) {
		case "gps":
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " +
				('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2);
		
		case "combo":
		default:
			//JGL: añado un 0 al mes ya que el servicio lo devuelve con 2 dígitos
			return date.getDate() + "/0" + (date.getMonth()+1) + "/" + date.getFullYear();
	}
};
M.proxy(false);
