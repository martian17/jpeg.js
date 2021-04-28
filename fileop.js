//defined functions:
// getImageDataFromFile

var getImageDataFromFile = function(file){
    return new Promise((resolve,reject)=>{
        var img = document.createElement("img");
        var reader  = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener("load", ()=>{
            img.src = reader.result;
            img.addEventListener("load",function(){
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img,0,0);
                resolve(ctx.getImageData(0,0,img.width,img.height));
                //everything else, including the temp elements here and there, will be garbage collected
            });
        }, false);
    });
};