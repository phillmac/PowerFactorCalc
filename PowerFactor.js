var pfCalc = (function(){
    var settings;
    var plane;
    var geom;
    var loads = [];
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
    var cartesianPlane = ( function (){
        var _canvas
        var _ctx
        var _ctxWidth
        var _ctxHeight
        var _centerX
        var _centerY
        var _settings
        var _origin = new (geom.point)(0,0)

        function _init(params) {
            _settings    = params
            _canvas      = document.getElementById(_settings.canvasID);
            _ctx         = _canvas.getContext('2d');
            _ctxWidth    = _canvas.getAttribute('width');
            _ctxHeight   = _canvas.getAttribute('height');
            _centerX     = _ctxWidth/2;
            _centerY     = _ctxHeight/2;
            unitPixels  = _settings.unitPixels;
            
            if (_settings.draw.xAxis){
                _drawXAxis(_ctxWidth, _ctxHeight);
            }
            if (_settings.draw.xScale){
                _drawXScale(_ctxWidth,_settings.unitPixels);
            }
            if (_settings.draw.yAxis) {
                _drawYAxis(_ctxWidth, _ctxHeight);
            }
            if (_settings.draw.yScale){
                _drawYScale(_ctxHeight, _settings.unitPixels);
            }
            if (_settings.draw.origin){
                _drawPoint(_origin)
            }
        }

        /*
        This function draws the x-axis to the context
        parameter height, and width can be used to set
        the draw distance for the axis lines.
        */

        function _drawXAxis(width, height) {
            _ctx.beginPath();
            _ctx.moveTo(0,height/2);
            _ctx.lineTo(width, height/2);
            _ctx.stroke();
        }

        function _drawXScale(width, scale) {
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
                _ctx.beginPath();
                _ctx.moveTo(unitScale,(width/2)+4);
                _ctx.lineTo(unitScale,(width/2)-4);
                _ctx.stroke();
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

        function _drawYAxis(width, height) {
            _ctx.beginPath();
            _ctx.moveTo(width/2,0);
            _ctx.lineTo(width/2,height);
            _ctx.stroke();
        }

        function _drawYScale(height, scale) {
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
                _ctx.beginPath();
                _ctx.moveTo((height/2)+4 , unitScale);
                _ctx.lineTo((height/2)-4, unitScale);
                _ctx.stroke();
            }
            // Condition to check scale size to prevent overdraw?
            if (unitScale >= height) {
                unitScale = 0;
            }
        }

        function _drawPoint(p){
            _drawPointXY(p.x, p.y)
        }
            
        function _drawPointXY(x,y){
            oldFill = _ctx.fillStyle
            _ctx.fillStyle = _settings.point.color;
            _ctx.fillRect(Math.round(x*_settings.unitPixels)+_centerX-4 , Math.round(y*_settings.unitPixels)+_centerY-4, _settings.point.size, _settings.point.size);
            _ctx.fillStyle = oldFill
        }

        function _joinPoints(p1, p2) {
            _ctx.beginPath();
            _ctx.moveTo(p1.x, p1.y);
            _ctx.lineTo(p2.x, p2.y);
            _ctx.stroke();
        }

        return {
            init: _init,
            ctxWidth: _ctxWidth,
            ctxHeight: _ctxHeight,
            centerX: _centerX,
            centerY: _centerY,
            drawPoint: _drawPoint,
            joinPoints: _joinPoints
        }
    
    })

    class load {
        constructor(){
            this.apparentPower = null;
            this.truePower = null;
            this.reactivePower = null;
            this.phaseAngle = null;
            this.endLocation = null;
        }
    }

    var _appendLoad = (function(loadParams){

        var hasApparentPower = !(typeof loadParams.apparentPower === "undefined");
        var hasTruePower = !(typeof loadParams.truePower === "undefined");
        var hasReactivePower = !(typeof loadParams.reactivePower === "undefined");
        var hasPhaseAngle = !(typeof loadParams.phaseAngle === "undefined");
        var hasPhaseAngle = !(typeof loadParams.phaseAngle === "undefined");
        var hasLocation = !(typeof loadParams.Endlocation === "undefined");

        var prevLoad = loads[loads.length -1];
        var prevLocation = prevLoad.Endlocation;

        if (!hasLocation){
            if(hasApparentPower && hasTruePower) {
                var prevX = prevLocation.x;
                var prevY = prevLocation.y;
                loadParams.Endlocation = new (geom.point)(prevX + loadParams.apparentPower, prevY + loadParams.truePower);
            }
        }

        
        var newLoad = new load(loadParams);
        var newLocation = newLoad.endLocation;
    
        plane.drawPoint(newLoad.endLocation);
        plane.joinPoints(prevLocation, newLocation);

        loads.push(newLoad);

    })

    function _init(params) {
        settings = params;
        geom = geometry();

        if (!(typeof settings.ctnp === "undefined")) {
            plane = cartesianPlane();
            plane.init(settings.ctnp);
        }

        loads.push(new load({
            apparentPower: 0.0,
            truePower: 0.0,
            reactivePower: 0.0,
            phaseAngle: 0.0,
            endLocation = new (geom.point)(0,0)
        }))

    }

    return {
        init: _init,
        load: load,
        appendLoad: _appendLoad
    }


})

