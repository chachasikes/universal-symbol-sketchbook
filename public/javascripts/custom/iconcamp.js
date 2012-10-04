window.onload = function() { init() };

function init() {
  Tabletop.init( { 
    url: "https://docs.google.com/spreadsheet/pub?key=0AnUUGMHge9o_dFVnMXJyZlY3Z2RBMGdId3d1dGZ2dVE&single=true&gid=1&output=html",
    key: "0AnUUGMHge9o_dFVnMXJyZlY3Z2RBMGdId3d1dGZ2dVE",
    callback: showInfo,
    simpleSheet: true
  });
}


function showInfo(data) {

  // Preprocess data
  for(var i=0; i < data.length; i++) {

      console.log(data[i].status);
    switch(data[i].status) {
      case 'Has sketches':
        data[i].status_display = 'badge-important';
        break;
      case 'Finished':
        data[i].status_display = 'badge-success';
        break;        
      case 'Sketches missing':
        data[i].status_display = 'badge-warning';
        break;             
      default:
        data[i].status_display = '';
        break;
    }

  
  }
console.log(data);

  var template = $("#symbolsTemplate").html();  
  $("#symbols-list").html(_.template(template,{symbols: data}));  
  loadOembed('#symbols-list .media');
}


loadOembed = function(container) {
  var container = container;
  // https://github.com/starfishmod/jquery-oembed-all
    $(container).each(function(){
      var url = $(this).find('.image').attr('href');
      if(url !== undefined) {

        var flickr = url.match(/flickr.com/g);
        var youtube = url.match(/youtube.com/g);
        var vimeo = url.match(/vimeo.com/g);
        var twitpic = url.match(/twitpic.com/g);
        var photobucket = url.match(/photobucket.com/g);
        var instagram = url.match(/instagram.com/g);
        var twitter = url.match(/twitter.com/g);
        
        var jpeg = url.match(/.jpeg$/g);
        var jpg = url.match(/.jpg$/g);
        var png = url.match(/.png$/g);
        var gif = url.match(/.gif$/g);
        
      if(flickr !== null || youtube !== null || vimeo !== null || twitpic !== null || photobucket !== null || instagram !== null || twitter !== null) {

        $(this).find('.image').oembed(url,{
            embedMethod: "replace", 
                maxWidth: 300,
                maxHeight: 300,
                vimeo: { autoplay: false, maxWidth: 300, maxHeight: 260},
                youtube: { autoplay: false, maxWidth: 300, maxHeight: 260},
        });

        /*     $(this).find('.embed').embedly({key: "b17f593c1c734ce5af968cebe29474ec"}); */
      }
      else if(jpeg !== null || jpg !== null || png !== null || gif !== null) {
        var link = '<a href="' + url + '" target="_blank" class="image"><img src="' + url + '" /></a>';
        $(this).find('.media').html(link);
        
      }
      else {
        var link = "";
        $(this).find('.media').css("height","auto");
      }
  }    
  });
};
