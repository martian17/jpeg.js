var generateGaussianKernel = function(k){
    var n = k*2+1;
    var arr = [];
    var sigma2 = 1;
    for(var i  = 0; i < n; i++){
        for(var j  = 0; j < n; j++){
            //1/(σ√(2π))*e^(-1/2*((x-μ)/σ)^2)
            //0,1,2
            var ii = Math.abs(i-k);
            var jj = Math.abs(j-k);
            arr[i*n+j] = 1/(2*Math.PI*sigma2)*(Math.E**(((i-k)**2+(j-k)**2)/(-2*sigma2)));
        }
    }
    return arr;
};


//this one here is mutative function, so doesn't need to return
var applyKernel = function(data,width,height,kernel,k){//k is the kernel radius
    var n = k*2+1;
    var data0 = new Uint8ClampedArray(data.length);
    data0.set(data);
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var kernelSum = 0;
            var sum = 0;
            for(var i = 0; i < n; i++){
                for(var j = 0; j < n; j++){
                    var x1 = (x+i-k);
                    var y1 = (y+j-k);
                    if(x1 < 0 || y1 < 0 || x1 >= width || y1 >= height){
                        continue;//kernel out of range
                    }
                    var idx1 = (y1*width+x1);
                    var kval = kernel[i*n+j];
                    kernelSum += kval;
                    sum += kval*data0[idx1];
                }
            }
            var idx = (y*width+x);
            data[idx] = sum/kernelSum;
        }
    }
};

var calculateGradientMagnitude = function(data,width,height){//applying the kernel and calculatig the magnitude
    var xkernel = [
        -1,0,1,
        -2,0,2,
        -1,0,1
    ];
    
    var ykernel = [
        -1,-2,-1,
        0,0,0,
        1,2,1
    ];
    var n = 3;
    var k = 1;
    var data0 = new Uint8ClampedArray(data.length);
    data0.set(data);
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var xkernelSum = 0;
            var ykernelSum = 0;
            var xsum = 0;
            var ysum = 0;
            for(var i = 0; i < n; i++){
                for(var j = 0; j < n; j++){
                    var x1 = (x+i-k);
                    var y1 = (y+j-k);
                    if(x1 < 0 || y1 < 0 || x1 >= width || y1 >= height){
                        continue;//kernel out of range
                    }
                    var idx1 = (y1*width+x1);
                    var xkval = xkernel[i*n+j];
                    var ykval = ykernel[i*n+j];
                    xkernelSum += xkval;
                    ykernelSum += ykval;
                    xsum += xkval*data0[idx1];
                    ysum += ykval*data0[idx1];
                }
            }
            var idx = (y*width+x);
            var xmagn = xsum/(4*1.41421356);
            var ymagn = ysum/(4*1.41421356);
            if(x === 300 && y === 300){
                console.log(xmagn,ymagn,xkernelSum);
            }
            var magn = Math.sqrt(xmagn*xmagn+ymagn*ymagn);
            data[idx] = Math.floor(magn);
        }
    }
};

var colorScheme = [
    [1,0,0,0],
    [0,1,0,1/3],
    [0,0,1,2/3],
    [1,0,0,1]
];

var colorAngle = function(angle){
    angle = angle/Math.PI;//make it to 0 < angle < 1;
    for(var i = 1; i < colorScheme.length; i++){
        if(angle < colorScheme[i][3]){
            var col0 = colorScheme[i-1];
            var col1 = colorScheme[i];
            var r = (angle-col0[3])/(col1[3]-col0[3]);
            var col = [];
            for(var j = 0; j < 3; j++){
                col[j] = col0[j]*(1-r)+col1[j]*r;
            }
            return col;
        }
    }
    return colorScheme[0].slice(0,3);
};

var gradientAngleDisplay = function(data,width,height,img){
    var xkernel = [
        -1,0,1,
        -2,0,2,
        -1,0,1
    ];
    
    var ykernel = [
        -1,-2,-1,
        0,0,0,
        1,2,1
    ];
    var n = 3;
    var k = 1;
    var data1 = new Uint8ClampedArray((width+2)*(height+2));
    var angles = new Uint8ClampedArray(data.length);
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var xkernelSum = 0;
            var ykernelSum = 0;
            var xsum = 0;
            var ysum = 0;
            for(var i = 0; i < n; i++){
                for(var j = 0; j < n; j++){
                    var x1 = (x+j-k);
                    var y1 = (y+i-k);
                    if(x1 < 0 || y1 < 0 || x1 >= width || y1 >= height){
                        continue;//kernel out of range
                    }
                    var idx1 = (y1*width+x1);
                    var xkval = xkernel[i*n+j];
                    var ykval = ykernel[i*n+j];
                    xkernelSum += xkval;
                    ykernelSum += ykval;
                    xsum += xkval*data[idx1];
                    ysum += ykval*data[idx1];
                }
            }
            var idx = (y*width+x);
            var idx1 = (y*(width+2)+x+1);
            var xmagn = xsum/(4*1.41421356);
            var ymagn = ysum/(4*1.41421356);
            var magn = Math.sqrt(xmagn*xmagn+ymagn*ymagn);
            var intensity = Math.floor(magn);
            var angle = (Math.atan2(ymagn,xmagn)+Math.PI*2)%Math.PI;//now 0 to pi
            
            if(x === 49 && y === 300){
                console.log(angle,xmagn,ymagn);
                img[idx*4+0] = 255;
                img[idx*4+1] = 255;
                img[idx*4+2] = 255;
                img[idx*4+3] = 255;
                continue;
            }
            if(x === 50 && y === 276){
                console.log(angle,xmagn,ymagn);
                img[idx*4+0] = 255;
                img[idx*4+1] = 255;
                img[idx*4+2] = 255;
                img[idx*4+3] = 255;
                continue;
            }
            data1[idx1] = intensity;
            angles[idx] = Math.floor(angle/Math.PI*255);
            var [r,g,b] = colorAngle(angle);
            img[idx*4+0] = Math.floor(r*intensity);
            img[idx*4+1] = Math.floor(g*intensity);
            img[idx*4+2] = Math.floor(b*intensity);
            img[idx*4+3] = 255;
        }
    }
};

var gradientAndAngle = function(data,width,height){//applying the kernel and calculatig the magnitude
    var xkernel = [
        -1,0,1,
        -2,0,2,
        -1,0,1
    ];
    
    var ykernel = [
        -1,-2,-1,
        0,0,0,
        1,2,1
    ];
    var n = 3;
    var k = 1;
    var data1 = new Uint8ClampedArray((width+2)*(height+2));
    var angles = new Uint8ClampedArray(data.length);
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var xkernelSum = 0;
            var ykernelSum = 0;
            var xsum = 0;
            var ysum = 0;
            for(var i = 0; i < n; i++){
                for(var j = 0; j < n; j++){
                    var x1 = (x+j-k);
                    var y1 = (y+i-k);
                    if(x1 < 0 || y1 < 0 || x1 >= width || y1 >= height){
                        continue;//kernel out of range
                    }
                    var idx1 = (y1*width+x1);
                    var xkval = xkernel[i*n+j];
                    var ykval = ykernel[i*n+j];
                    xkernelSum += xkval;
                    ykernelSum += ykval;
                    xsum += xkval*data[idx1];
                    ysum += ykval*data[idx1];
                }
            }
            var idx = (y*width+x);
            var idx1 = (y*(width+2)+x+1);
            var xmagn = xsum/(4*1.41421356);
            var ymagn = ysum/(4*1.41421356);
            var magn = Math.sqrt(xmagn*xmagn+ymagn*ymagn);
            var intensity = Math.floor(magn);
            var angle = (Math.atan2(ymagn,xmagn)+Math.PI*2)%Math.PI;//now 0 to pi
            data1[idx1] = intensity;
            angles[idx] = Math.floor(angle/Math.PI*255);
        }
    }
    data.fill(0);
    
    //non max suppression
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var idx = (y*width+x);
            var angle = angles[idx]/255*Math.PI;
            var pi4 = Math.PI/4;
            var pi8 = Math.PI/8;
            var sqrt2 = Math.sqrt(2);
            var val = data1[(y)*(width+2)+(x)+1];
            var d1 = 0;
            var d2 = 0;
            /*if(angle < pi4 || angle > pi4*3){
                d1 = data1[(y  )*(width+2)+(x+1)+1];
                d2 = data1[(y  )*(width+2)+(x-1)+1];
            }else{
                d1 = data1[(y+1)*(width+2)+(x  )+1];
                d2 = data1[(y-1)*(width+2)+(x  )+1];
            }*/
            
            if(angle < pi4){
                var mask1 = Math.cos((angle)*2);
                var mask2 = Math.cos((angle-pi4)*2)/sqrt2;
                var masksum = mask1+mask2;
                mask1 /= masksum;
                mask2 /= masksum;
                d1 += mask1*data1[(y  )*(width+2)+(x+1)+1];
                d1 += mask2*data1[(y+1)*(width+2)+(x+1)+1];
                d2 += mask1*data1[(y  )*(width+2)+(x-1)+1];
                d2 += mask2*data1[(y-1)*(width+2)+(x-1)+1];
            }else if(angle < pi4*2){//mask1 mask2 always small to big
                var mask1 = Math.cos((angle-pi4)*2)/sqrt2;
                var mask2 = Math.cos((angle-pi4*2)*2);
                var masksum = mask1+mask2;
                mask1 /= masksum;
                mask2 /= masksum;
                d1 += mask1*data1[(y+1)*(width+2)+(x+1)+1];
                d1 += mask2*data1[(y+1)*(width+2)+(x  )+1];
                d2 += mask1*data1[(y-1)*(width+2)+(x-1)+1];
                d2 += mask2*data1[(y-1)*(width+2)+(x  )+1];
            }else if(angle < pi4*3){
                var mask1 = Math.cos((angle-pi4*2)*2);
                var mask2 = Math.cos((angle-pi4*3)*2)/sqrt2;
                var masksum = mask1+mask2;
                mask1 /= masksum;
                mask2 /= masksum;
                d1 += mask1*data1[(y+1)*(width+2)+(x  )+1];
                d1 += mask2*data1[(y+1)*(width+2)+(x-1)+1];
                d2 += mask1*data1[(y-1)*(width+2)+(x  )+1];
                d2 += mask2*data1[(y-1)*(width+2)+(x+1)+1];
            }else{
                var mask1 = Math.cos((angle-pi4*3)*2)/sqrt2;
                var mask2 = Math.cos((angle-pi4*4)*2);
                var masksum = mask1+mask2;
                mask1 /= masksum;
                mask2 /= masksum;
                d1 += mask1*data1[(y+1)*(width+2)+(x-1)+1];
                d1 += mask2*data1[(y  )*(width+2)+(x-1)+1];
                d2 += mask1*data1[(y-1)*(width+2)+(x+1)+1];
                d2 += mask2*data1[(y  )*(width+2)+(x+1)+1];
            }
            
            if((val > d1 && val > d2) || (val >= d1 && val > d2)){
            //if(val > d1 && val > d2){
                data[idx] = val;
            }
        }
    }
};


var applyKernelRGBA = function(imgdata,kernel,k){
    var data = imgdata.data;
    var width = imgdata.width;
    var height = imgdata.height;
    var n = k*2+1;
    var data0 = new Uint8ClampedArray(data.length);
    data0.set(data);
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var kernelSum = 0;
            var rsum = 0;
            var gsum = 0;
            var bsum = 0;
            var asum = 0;
            for(var i = 0; i < n; i++){
                for(var j = 0; j < n; j++){
                    var x1 = (x+i-k);
                    var y1 = (y+j-k);
                    if(x1 < 0 || y1 < 0 || x1 >= width || y1 >= height){
                        continue;//kernel out of range
                    }
                    var idx1 = (y1*width+x1)*4;
                    var kval = kernel[i*n+j];
                    kernelSum += kval;
                    rsum += kval*data0[idx1+0];
                    gsum += kval*data0[idx1+1];
                    bsum += kval*data0[idx1+2];
                    asum += kval*data0[idx1+3];
                    
                }
            }
            var idx = (y*width+x)*4;
            data[idx+0] = rsum/kernelSum;
            data[idx+1] = gsum/kernelSum;
            data[idx+2] = bsum/kernelSum;
            data[idx+3] = asum/kernelSum;
        }
    }
};

var toGrayscale = function(imgdata){
    var data0 = imgdata.data;
    var width = imgdata.width;
    var height = imgdata.height;
    var data = new Uint8ClampedArray(width*height);
    for(var i = 0; i < height; i++){
        for(var j = 0; j < width; j++){
            var sum = 0;
            var idx0 = (i*width+j)*4;
            var idx = (i*width+j);
            sum += data0[idx0+0];
            sum += data0[idx0+1];
            sum += data0[idx0+2];//averages out the rgb
            sum += data0[idx0+3];//averages out the rgb
            data[idx] = Math.floor(sum/4);
        }
    }
    return data;
};

