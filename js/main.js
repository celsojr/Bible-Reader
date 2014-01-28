//Global vars
var books = [];
var caps = [];
var vers = [];

var CurrentBook = '';
var CurrentCap = '';
var AllBooks = '';
var AllVers = '';

var versiculosLidos = 0;
var versiculosTotais = 0;

$(function() {
	$('.home').hide();
	$("#resetar").hide();
	
	$('.home').click(function() {
		location.reload();
	});
	$("#reset").click(function() {
		$("#resetar").fadeIn(500);
	});
	$("#nao").click(function() {
		$("#resetar").fadeOut(500);
	});
	$("#sim").click(function() {
		$.jStorage.flush(); //Apagar todos os dados armazenados
		location.reload();
	});
	
	if (!$.jStorage.storageAvailable())	{
		$("#app").html("Seu navegador não oferece suporte para este aplicativo.");
	}

	//Preenche o array de livros
	for (var b in biblia) {
		books.push(b);
	}
		
	//Armazena o total de versículos por livro
	versTotais = 0;
	for (var l in biblia) {
		for	(var c in biblia[l]) {
			for (var v in biblia[l][c]) {
				versTotais += 1;
			}
		}
		var key = l + '_vercount'
		$.jStorage.set(key, versTotais);
		versiculosTotais += versTotais; //soma todos os vercículos da bíblia
		versTotais = 0;
	}
	
	//Soma os vercículos lidos
	for (book in books) {
		versiculosLidos += $.jStorage.get(books[book]+"_status", 0)
	}
	
	//Se tiver pelo menos um vercículo lido, então calcula a percentagem
	if (versiculosLidos > 0) {
		$("#leituraGeral").html(((versiculosLidos / versiculosTotais) * 100).toFixed(2) + '%');
	}
});

$("#books").click(function() {
	$('.home').show();
	$('body').css('background-image', 'none');
	$('#botoes').css('text-align', 'left');
	$('body').css('color', '#000');
	
	$("#logo").hide();
	$("#creditos").hide();
	$("#statusGerais").hide();
	$("#reset").hide();
	$("#resetar").hide();
	
	 if( $("#books").text() == "Livros / " + CurrentBook ) {
		 //Não faz nada
	 } else if (CurrentBook != null && $("#books").text() != "Livros") {
		 getVers(); //Definir o capitulo inteiro como lido se necessário
		 capitulos(CurrentBook);
		 $("#books").text("Livros / " + CurrentBook); 
		 return false;
	 }
	 
	$("#app").html(""); AllBooks = ""; $("#books").text("Livros"); 
	for (book in books) {
			AllBooks +=
			'<li><div class="dynBookList"><span>'
			+ books[book]
			+ '</span> <span style="float:right">'
			+ (($.jStorage.get(books[book]+"_status", 0) / $.jStorage.get(books[book]+"_vercount", 1)) * 100).toFixed(2)
			+ '%</span></div></li>'
		}
	$("#app").html('<ul>' + AllBooks + '</ul>');
	
	$('.dynBookList').click(function() {
		var bkTitle = $(this).find("span:first").html();
		if ($("#books").text() != "Livros") {
			$("#books").text("Livros");
		} else {
			$("#books").text("Livros");
			$("#books").text($("#books").text() + " / " + bkTitle);
		}
		CurrentBook = bkTitle;
		capitulos(bkTitle);
	});
});

function read() {
	$('.versiculos').click(function() {
		var key = CurrentBook + CurrentCap + '_' + $(this).find("sup").html();
		var somar = $.jStorage.get(CurrentBook + "_status") + 1;
		var subtrair = $.jStorage.get(CurrentBook + "_status") - 1;

		if($(this).is('.versiculoLido')) {
			$.jStorage.set(key, false);
			$.jStorage.set(CurrentBook + "_status", subtrair);
			$(this).toggleClass('versiculoLido');
		} else {
			$.jStorage.set(key, true);
			$.jStorage.set(CurrentBook + "_status", somar);
			$(this).toggleClass('versiculoLido');
		}
	});
}

//Verifica se o versículo foi lido
function getVers(){
	var input_name = '';
	var isCapituloLido = true;

	$.each($('.versiculos'), function() {
		input_name = CurrentBook + CurrentCap + '_' + $(this).find("sup").html();
			
		if ($.jStorage.get(input_name)) {
			$(this).toggleClass('versiculoLido');
		} else {
			isCapituloLido = false;
		}
	});
	
	//Define o capitulo todo como lido ou não
	var key = CurrentBook + CurrentCap;
	if (isCapituloLido) {
		$.jStorage.set(key, true);
	} else {
		$.jStorage.set(key, false);
	}
}

function capitulos(nome){
	caps = []; //zerar variável
	for (var c in biblia[nome]) {
		caps.push('<div class="caps">' + c + '</div>');
	}
	$("#app").html(caps);
	
	//Verifica se o capítulo inteiro foi lido
	$.each($('.caps'), function() {
		cap_status = nome + $(this).html();
		
		if ($.jStorage.get(cap_status)) {
			$(this).toggleClass('highlight');
		}
	});

	$('.caps').click(function(){
		CurrentCap = $(this).html();
		$("#books").text($("#books").text() + " / Cap. " + CurrentCap);
		
		vers = [];
		AllVers = '';
		for (var v in biblia[nome][CurrentCap]) {
			AllVers += '<li class=versiculos><sup>' + v + '</sup>' + ' ' + biblia[nome][CurrentCap][v] + '</li>';
		}
		$("#app").html('<ul>' + AllVers + '</ul>');
		getVers();
		read();
	});
}
