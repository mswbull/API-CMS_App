'use strict';

var safetyController;
var apiController;

function ApiController () {
	var apiList = ["Contentful", "Prismic", "Osmek"];
	var curApi = 0;
	
	this.setApi = function(index){
		$("#ApiList").empty();
		$("#CurApi").html(apiList[index]);
		for(var api in apiList){
			$("#ApiList").append('<li><a href="#" onClick="apiController.setApi(' + api +')">' + apiList[api] + '</a>');
		}
		
		switch(index){
			case 0: 
				var contentfulInstance = new ContentfulController();
				contentfulInstance.getSafetyInfo();
				curApi = 0;
			break;
			case 1:
				var prismicInstance = new PrismicController();
				curApi = 1;
			break;
			case 2:
				var osmekController = new OsmekController();
				curApi = 2;
			break;
			default:
		}
	}
	
	this.refreshApi = function(){
		this.setApi(curApi);
	}
}

function ContentfulController() {
	var client = contentful.createClient({
	  accessToken: '90f5e56de26a852953d1e4e04cb0d45e040346ac17b51e732d50d2271ad6fd70',
	  space: 'lqlag554sozd'
	});
	
	this.getSafetyInfo = function(){
		var safetyInfos = [];
		client.entries({'content_type': '1yN3yV20s4kAuQ0Geo2c4S'}).then(
			function(response){
				for(var info in response){
					var newSafetyInfo = new SafetyInfo(
						JSON.stringify(response[info], undefined, 2),
						response[info].fields['productName'],
						marked(response[info].fields['indication']),
						response[info].fields['blackBoxRequired'],
						marked(response[info].fields['blackBoxInformation']),
						marked(response[info].fields['longInformation']),
						marked(response[info].fields['shortInformation']),
						response[info].fields['signoffCode'],
						response[info].fields['safetyImage'].fields.file['url']
					);
					
					safetyInfos.push(newSafetyInfo);
				}
				safetyController.safetyInfos = safetyInfos;
				safetyController.curInfo = safetyInfos[0];
				safetyController.writeInfosList();
				safetyController.writeSingleInfo();
				
			}
		);
	}
}

function OsmekController() {
	
	var requestData = {
		"api_key":"Selh0PcTnA9kC8fvNGjEYW6ywKtzHOZp",
		"bin_id":"10878"
	}

	$.ajax({
		type:"POST",
		url: "https://api.osmek.com/feed/jsonp",
		async: false,
		jsonpCallback: 'jsonCallback',
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			api_key: "Selh0PcTnA9kC8fvNGjEYW6ywKtzHOZp",
			bin_id: "10878"
		}
	}).done(function( response ) {
		var infos = response.items;
		var safetyInfos = [];
		
		for(var info in infos){
			var newSafetyInfo = new SafetyInfo(
				JSON.stringify(infos[info], undefined, 2),
				infos[info].productname,
				infos[info].indication,
				infos[info].blacknoxrequired,
				infos[info].blackboxinformation,
				infos[info].longinformation,
				infos[info].shortinformation,
				infos[info].signoffcode,
				infos[info].safetyimage
			);
			
			safetyInfos.push(newSafetyInfo);
		}
		safetyController.safetyInfos = safetyInfos;
		safetyController.curInfo = safetyInfos[0];
		safetyController.writeInfosList();
		safetyController.writeSingleInfo();
	});
}

function PrismicController(){
	
	Prismic.Api('https://knoppteamtest.prismic.io/api', function (err, Api) {
		Api.form('everything')
			.ref(Api.master())
			.query(Prismic.Predicates.at("document.type", "safetyInformation")).submit(function (err, response) {
				if (err) {
					console.log(err);
					done();
				}
				var infos = response.results;
				var safetyInfos = [];
				
				for(var info in infos){
					var newSafetyInfo = new SafetyInfo(
						JSON.stringify(infos[info], undefined, 2),
						infos[info].getText("safetyInformation.productName"),
						infos[info].getStructuredText("safetyInformation.indication").asHtml(),
						infos[info].getText("safetyInformation.blackBoxRequired"),
						infos[info].getStructuredText("safetyInformation.blackBoxInformation").asHtml(),
						infos[info].getStructuredText("safetyInformation.longInformation").asHtml(),
						infos[info].getStructuredText("safetyInformation.shortInformation").asHtml(),
						infos[info].getText("safetyInformation.signoffCode"),
						infos[info].getImage("safetyInformation.safetyImage").main.url
					);
					
					safetyInfos.push(newSafetyInfo);
				}
				safetyController.safetyInfos = safetyInfos;
				safetyController.curInfo = safetyInfos[0];
				safetyController.writeInfosList();
				safetyController.writeSingleInfo();
;
        });
	}, "MC5WT3VaQ0NZQUFFcHdiWWFT.77-9Wu-_ve-_ve-_ve-_ve-_vVrvv70_ax4He3Tvv73vv70L77-9AO-_vXEQL--_ve-_ve-_vVbvv71P77-977-9");
}


function SafetyInfo(rawJSON, productName, indication, blackBoxRequired, blackBoxInformation, longInformation, shortInformation, signoffCode, safetyImage) {
    this.rawJSON = rawJSON;  
    this.productName = productName;
    this.indication = indication;
    this.blackBoxRequired = blackBoxRequired;
    this.blackBoxInformation = blackBoxInformation;
    this.longInformation = longInformation;
    this.shortInformation = shortInformation;
    this.signoffCode = signoffCode;
    this.safetyImage = safetyImage;

}

var SafetyInfoController = (function() {
	
	var cls = function(){
		var safetyInfos;
		var curInfo;
		
		this.getSafetyInfos = function(){
			return safetyInfos;
		}
		this.setSafetyInfos = function(newInfos){
			safetyInfos = newInfos;
		}
		
		this.getCurInfo = function(){
			return curInfo;
		}
		this.setCurInfo = function(newInfo){
			curInfo = newInfo;
		}
		
		this.writeSingleInfo = function(){
			$("#SafetyContainer").hide();
			$("#JSONContainer").hide();

			//Set Raw Response
			$("#rawJSON").val(JSON.stringify(this.curInfo.rawJSON, undefined, 2));
			
			// Set Blackbox
			if(this.curInfo.blackBoxRequired){
				$("#BlackBox").html('<div class="black-box">' + marked(this.curInfo.blackBoxInformation) + '</div>');
			}
			else{
				$("#BlackBox").html("");
			}
			
			// Set Remaining Fields
			$("#Title").html("Important Safety Information for " + this.curInfo.productName);
			$("#Image").html('<img src="' + this.curInfo.safetyImage + '" class="img-responsive" />');
			$("#Indication").html('<h2>Indication</h2>' + this.curInfo.indication);
			$("#LongInfo").html(this.curInfo.longInformation);
			$("#SignOff").html('<strong>' + this.curInfo.signoffCode + '</strong>');
			
			$("#SafetyContainer").fadeIn("slow");
			$("#JSONContainer").fadeIn("slow");
		}
		
		this.writeInfosList = function(){
			$("#AllInfos div").empty();
			for(var info in this.safetyInfos){
				if(this.safetyInfos[info] == this.curInfo){
					$("#AllInfos div").append('<a href="#" class="list-group-item active" onclick="safetyController.setCurrentInfo(' + info +');">' + this.safetyInfos[info].productName + '</a>');
				}
				else{
					$("#AllInfos div").append('<a href="#" class="list-group-item" onclick="safetyController.setCurrentInfo(' + info +');">' + this.safetyInfos[info].productName + '</a>');
				}
				
			}
		}
		
		this.setCurrentInfo = function(newInfo){
			this.curInfo = this.safetyInfos[newInfo];
			this.writeSingleInfo();
			this.writeInfosList();
		}
	}
	return cls;
})();

function newInit() {
	
	safetyController = new SafetyInfoController();
	apiController = new ApiController();
	apiController.setApi(1);

}
