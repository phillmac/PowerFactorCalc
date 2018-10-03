var pfCalc = (function(){
    var geometry = (function(){
        class point {
            constructor(x,y) {
                this.x = x;
                this.y = y;
            }
    
        }
    
        class line {
            constructor(p1,p2) {
                this.p1 = p1;
                this.p2 = p2;
            }

            length() {
                x1 = Math.round(p1.x);
                y1 = Math.round(p1.y);
                x2 = Math.round(p2.x);
                y2 = Math.round(p2.y);
                return Math.sqrt(Math.pow((this.x1 - this.x2),2) + Math.pow((this.y1 - this.y2),2))
            }
    
        }
        return {
            point: point,
            line: line
        }
    })
    var cartesianPlane = ( function (settings){
        var canvas
        var ctx
        var ctxWidth
        var ctxHeight
        var centerX
        var centerY
        var settings
        var origin = new geometry.point(0,0)

        function init(params) {
            settings    = params
            canvas      = document.getElementById(settings.canvasID);
            ctx         = canvas.getContext('2d');
            ctxWidth    = canvas.getAttribute('width');
            ctxHeight   = canvas.getAttribute('height');
            centerX     = ctxWidth/2;
            centerY     = ctxHeight/2;
            unitPixels  = settings.unitPixels;

            drawXaxis(ctxWidth, ctxHeight);
            drawXscale(ctxWidth,settings.unitPixels);
            drawYaxis(ctxWidth, ctxHeight);
            drawYscale(ctxHeight, settings.unitPixels);

            if (settings.drawOrigin)
                drawPoint(origin)
        }

        /*
        This function draws the x-axis to the context
        parameter height, and width can be used to set
        the draw distance for the axis lines.
        */

        function drawXaxis(width, height) {
            ctx.beginPath();
            ctx.moveTo(0,height/2);
            ctx.lineTo(width, height/2);
            ctx.stroke();
        }

        function drawXscale(width, scale) {
            // Accumulator
            var unitScale = 0;
            
            // Render loop
            for (var i = 0; i < (width/scale); i++) {
                unitScale += scale;
                // Condition to check if scale is out of bounds leave scope if true?
                if (unitScale == (width/2) || unitScale == width) {
                    continue;
                }
                // Render commands
                ctx.beginPath();
                ctx.moveTo(unitScale,(width/2)+4);
                ctx.lineTo(unitScale,(width/2)-4);
                ctx.stroke();
            }
            // Condition to check scale size to prevent overdraw?
            if (unitScale >= width) {
                unitScale = 0;
            }
        }

        /*
        This function draws the y-axis to the context
        parameter height, and width can be used to set
        the draw distance for the axis lines.
        */

        function drawYaxis(width, height) {
            ctx.beginPath();
            ctx.moveTo(width/2,0);
            ctx.lineTo(width/2,height);
            ctx.stroke();
        }

        function drawYscale(height, scale) {
            // Accumulator
            var unitScale = 0;
            
            // Render loop
            for (var i = 0; i < (height/scale); i++) {
                unitScale += scale;
                // Condition to check if scale is out of bounds leave scope if true?
                if (unitScale == (height/2) || unitScale == height) {
                    continue;
                }
                // Render commands
                ctx.beginPath();
                ctx.moveTo((height/2)+4 , unitScale);
                ctx.lineTo((height/2)-4, unitScale);
                ctx.stroke();
            }
            // Condition to check scale size to prevent overdraw?
            if (unitScale >= height) {
                unitScale = 0;
            }
        }

        function drawPoint(p){
            drawPointXY(p.x, p.y)
        }
            
        function drawPointXY(x,y){
            oldFill = ctx.fillStyle
            ctx.fillStyle = settings.point.color;
            ctx.fillRect(Math.round(x*settings.unitPixels)+centerX-4 , Math.round(y*settings.unitPixels)+centerY-4, settngs.point.size, settngs.point.size);
            ctx.fillStyle = oldFill
        }


        return {
            init: init,
            ctxWidth: ctxWidth,
            ctxHeight: ctxHeight,
            centerX: centerX,
            centerY: centerY,
            drawPoint: drawPoint
        }
    
    })


    class powerFactor {

    }

    return {
        csp: cartesianPlane,
        geom: geometry,
        pf: powerFactor
    }


})

