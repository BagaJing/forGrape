$(function(){
    $(".bigger").click(function(){
        var value = $(this);
        imgShow(value); 
    });
});
function imgShow(value){
    /*
    if(document.getElementById("overlay")!=null){
        document.body.removeChild(document.getElementById("overlay"));
    }
    */

	var overlay = document.createElement("div");
	overlay.setAttribute("id","overlay");
	overlay.setAttribute("class","overlay");
	document.body.appendChild(overlay);
 
    var img = document.createElement("img");
	img.setAttribute("class","overlayimg");
	img.src = value.attr("src");
    document.getElementById("overlay").appendChild(img);
    img.onclick = restore;
}
function restore(){
	document.body.removeChild(document.getElementById("overlay"));
}