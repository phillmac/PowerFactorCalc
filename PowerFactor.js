var pfCalc = (function(){
    var _settings;

    var _loads = [];
    var _geometry = (function(){
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
        var _origin = new (_geom.point)(0,0)

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

    var _geom = _geometry();
    var _plane = cartesianPlane();

    class _load {
        constructor(apparentPower, truePower, reactivePower, phaseAngle, endLocation){
            this.apparentPower = apparentPower;
            this.truePower = truePower;
            this.reactivePower = reactivePower;
            this.phaseAngle = phaseAngle;
            this.endLocation = endLocation;
        }
    }

    var _appendLoad = (function(apparentPower, truePower, reactivePower, phaseAngle, endLocation){

        var hasApparentPower = !(typeof apparentPower === "undefined");
        var hasTruePower = !(typeof truePower === "undefined");
        var hasReactivePower = !(typeof reactivePower === "undefined");
        var hasPhaseAngle = !(typeof phaseAngle === "undefined");
        var hasPhaseAngle = !(typeof phaseAngle === "undefined");
        var hasLocation = !(typeof endLocation === "undefined");

        var prevLoad = _loads[_loads.length -1];
        var prevLocation = prevLoad.endLocation;

        if (!hasLocation){
            if(hasApparentPower && hasTruePower) {
                var prevX = prevLocation.x;
                var prevY = prevLocation.y;
                loadParams.endLocation = new (_geom.point)(prevX + apparentPower, prevY + reactivePower);
            }
        }

        
        var newLoad = new _load(apparentPower, truePower, reactivePower, phaseAngle, endLocation);
        var newLocation = newLoad.endLocation;
    
        _plane.drawPoint(newLoad.endLocation);
        _plane.joinPoints(prevLocation, newLocation);

        _loads.push(newLoad);

    })

    function _init(params) {
        _settings = params;

        if (!(typeof settings.ctnp === "undefined")) {
            _plane.init(settings.ctnp);
        }

        _loads.push(new _load(
            apparentPower =  0.0,
            truePower =  0.0,
            reactivePower = 0.0,
            phaseAngle = 0.0,
            endLocation = new (_geom.point)(0,0)
        ))

    }

    return {
        init: _init,
        geom: _geom,
        plane: _plane,
        load: _load,
        loads: _loads,
        appendLoad: _appendLoad
    }


})

