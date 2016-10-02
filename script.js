var lastMousePos = { x: -1, y: -1 };
var currentMousePos = { x: -1, y: -1 };

/*
	recherche sur wikipédia du texte sur lequel on a cliqué
*/
function rechercheText(text) {
	// recherche sur wikipédia du texte sur lequel on a cliqué
    $.ajax({
        type: "GET",
        url:  "https://fr.wikipedia.org/w/api.php?action=query&list=search&utf8&format=json&srlimit=50&srsearch=métro%20Paris%20" + text,
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp"
	}).done(function (data, textStatus, jqXHR) {
		var page = data.query.search[0].title;

        for (i = 0; i < data.query.search.length; i++) { 
		    var titleResultSearch = data.query.search[i].title;

			substring = "(métro de Paris)";
			if (titleResultSearch.indexOf(substring) > -1) {
				page = data.query.search[i].title;
				break;
			}
		}
		recuperationPageResultats(page);
	});
}

/*
	récupération de la page des résultats de recherche correspondant à la station de métro
*/
function recuperationPageResultats(page) {
	// récupération de la page des résultats de recherche correspondant à la station de métro
    $.ajax({
        type: "GET",
        url:  "https://fr.wikipedia.org/w/api.php?action=query&prop=images|extracts&imlimit=100&format=json&titles=" + page,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "jsonp"
	}).done(function (data, textStatus, jqXHR) {
        for (var key in data.query.pages) {
			var contentHTML = data.query.pages[key].extract;
			var titleHTML	= data.query.pages[key].title;
			titleHTML = titleHTML.replace(" (métro de Paris)", "");
		}

		// récupération des images de la page
		var tableauImages = data.query.pages[key].images;
		var imageTitle = data.query.pages[key].images[0].title;
		var tableauImagesTitle = "";
		for (i = 0; i < tableauImages.length; i++) { 
		    tableauImagesTitle = tableauImages[i].title;
			substring1 = "Fichier:Metro";
			substring2 = "Station";
			substring3 = "Quais";
			substring4 = "Fichier:Métro";
			
			if ( (  (  tableauImagesTitle.indexOf(substring1) > -1 || 
					tableauImagesTitle.indexOf(substring2) > -1 || 
					tableauImagesTitle.indexOf(substring3) > -1 || 
					tableauImagesTitle.indexOf(substring4) > -1) &&
					tableauImagesTitle.length > 20 ) ||
					tableauImagesTitle.indexOf(titleHTML) > -1 ) {
				imageTitle = tableauImagesTitle;
				break;
			}
		}

		recuperationImage(imageTitle, titleHTML, contentHTML);
    });
}

function recuperationImage(imageTitle, titleHTML, contentHTML) {
	$.ajax({
        type: "GET",
        url: "https://fr.wikipedia.org/w/api.php?action=query&titles=" + imageTitle + "&prop=imageinfo&iiprop=url&meta=siteinfo&siprop=rightsinfo&format=json&callback=?",
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "jsonp",
    }).done(function (data, textStatus, jqXHR) {

		$('#modal1').openModal();

    	var imageUrl	= data.query.pages[-1].imageinfo[0].url;
    	var $img = $('#imgMetro');
    	$img.attr("src", imageUrl);

		$img.on('load', function(){
			var height = $(this).height() - 300;
			$('.modal-content').css('margin-top', - height + "px");
			$( "#imgMetro" ).show();
			$('#metroTitle').html(titleHTML);

			$('#metroDescription').html(contentHTML);

			//nettoyage des sections inutiles	
			$('#Correspondances').nextAll().remove();
			$('#Correspondances').remove();
			$('#Notes_et_r\\.C3\\.A9f\\.C3\\.A9rences').nextAll().remove();
			$('#Notes_et_r\\.C3\\.A9f\\.C3\\.A9rences').remove();
			$('#Galerie_de_photos').nextAll().remove();
			$('#Galerie_de_photos').remove();
			$('#Galerie_de_photographies').nextAll().remove();
			$('#Galerie_de_photographies').remove();
			$('#Galeries_photographiques').nextAll().remove();
			$('#Galeries_photographiques').remove();
			$('#Voir_aussi').nextAll().remove();
			$('#Voir_aussi').remove();
			$('#Articles_connexes').nextAll().remove();
			$('#Articles_connexes').remove();
			$('#Article_connexe').nextAll().remove();
			$('#Article_connexe').remove();
			$('#Bibliographie').nextAll().remove();
			$('#Bibliographie').remove();
			$('#bandeau-portail').nextAll().remove();
			$('#bandeau-portail').remove();
			$('#\\.C3\\.80_proximit\\.C3\\.A9').nextAll().remove();
			$('#\\.C3\\.80_proximit\\.C3\\.A9').remove();
			$('#Galerie_photographique').nextAll().remove();
			$('#Galerie_photographique').remove();
			$("li:contains('Liste des stations du métro de Paris')").nextAll().remove();
			$("li:contains('Liste des stations du métro de Paris')").remove();

			$(".progress").addClass("visibility");
			$( "#modal1" ).scrollTop( 0 );
		});
	});
}

$(document).ready(function(){
	// controle le zoom et le déplacement de la carte
	var panZoomTiger = svgPanZoom('svg', {
		zoomScaleSensitivity: 0.5, 
		minZoom: 1, 
		maxZoom: 5,
		fit: true,
		center: true
	});
	// Set zoom level to 2
	panZoomTiger.zoom(2);

	$("text").mousedown(function(event){
		lastMousePos.x = event.pageX;
		lastMousePos.y = event.pageY;
	});

    $("text").mouseup(function(event){
		currentMousePos.x = event.pageX;
		currentMousePos.y = event.pageY;

		var diffxy = (currentMousePos.x - lastMousePos.x)*(currentMousePos.x - lastMousePos.x) + (currentMousePos.y - lastMousePos.y)*(currentMousePos.y - lastMousePos.y);

		if ( diffxy < 1000 ) {
	    	$(".progress").removeClass("visibility");

	    	$("#imgMetro" ).hide();
			$('#metroTitle').html("");
			$('#metroDescription').html("");

			var titleText = this.children[0].innerHTML.trim();
		    for (i = 1; i < this.children.length; i++) { 
			    titleText = titleText + " " + this.children[i].innerHTML;
			}

			rechercheText(titleText);
		}

    });
});