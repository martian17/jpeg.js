var finput = BODY.add("input","type:file").e;
BODY.add("br");
var canvas = BODY.add("canvas").e;


var drawGrayscale = function(ctx,gray,imgdata){
    var width = imgdata.width;
    var height = imgdata.height;
    var data = imgdata.data;
    for(var i = 0; i < height; i++){
        for(var j = 0; j < width; j++){
            var idx = (i*width+j);
            data[idx*4+0] = gray[idx];
            data[idx*4+1] = gray[idx];
            data[idx*4+2] = gray[idx];
            data[idx*4+3] = 255;
        }
    }
    ctx.putImageData(imgdata,0,0);
};

//async setup function
var pause = function(t){
    return new Promise((res,rej)=>{
        setTimeout(res,t);
    });
};

finput.addEventListener("input",async function(){
    var file = this.files[0];
    if(!file)return false;
    var imgdata = await getImageDataFromFile(file);
    var width = imgdata.width;
    var height = imgdata.height;
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.putImageData(imgdata,0,0);
    await pause(500);
    
    //converting to gray scale
    var gray = toGrayscale(imgdata);
    console.log(gray);
    drawGrayscale(ctx,gray,imgdata);
    await pause(500);
    
    //applying gaussian blur
    var gkernel = generateGaussianKernel(2);
    applyKernel(gray,width,height,gkernel,2);
    drawGrayscale(ctx,gray,imgdata);
    await pause(500);    
    
    //gradient calculation y applying kernel
    gradientAndAngle(gray,width,height);
    drawGrayscale(ctx,gray,imgdata);
    //calculateGradientMagnitude(gray,width,height);
    //ctx.putImageData(imgdata,0,0);
    
    //gradientAngleDisplay(gray,width,height,imgdata.data);
    //ctx.putImageData(imgdata,0,0);
    
    console.log(imgdata);
});

