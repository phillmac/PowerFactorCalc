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
            var oldFill = _ctx.fillStyle
            _ctx.fillStyle = _settings.point.color;
            _ctx.fillRect(_centerX + Math.round(x*_settings.unitPixels) -4 , _centerY - Math.round(y*_settings.unitPixels)-4, _settings.point.size, _settings.point.size);
            _ctx.fillStyle = oldFill
        }

        function _joinPoints(p1, p2) {
            var p1x = _centerX + Math.round(p1.x*_settings.unitPixels)
            var p1y = _centerY - Math.round(p1.y*_settings.unitPixels)
            var p2x = _centerX + Math.round(p2.x*_settings.unitPixels)
            var p2y = _centerY - Math.round(p2.y*_settings.unitPixels)

            var prevStyle = _ctx.strokeStyle
            _ctx.beginPath();

            _ctx.strokeStyle = _settings.line.color
            _ctx.lineWidth = _settings.line.size
            
            _ctx.moveTo(p1x, p1y);
            _ctx.lineTo(p2x, p2y);
            _ctx.stroke();
            
            _ctx.strokeStyle = prevStyle
        }

        return {
            init: _init,
            ctx: _ctx,
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

    class _params {
        constructor(values, prevLoad) {
            this.values = values;
            this.prevLoad = prevLoad;
            this.prevLocation = this.prevLoad.endLocation;
            this.prevX = this.prevLocation.x;
            this.prevY = this.prevLocation.y;

        }

        hasApparentPower() {
            return !(typeof this.values.apparentPower === "undefined");
        }

        hasReactivePower() {
            return !(typeof this.values.reactivePower === "undefined");
        }

        hasTruePower() {
            return !(typeof this.values.truePower === "undefined");
        }

        hasPhaseAngle() {
            return !(typeof this.values.phaseAngle === "undefined");
        }

        hasEndLocation() {
            return !(typeof this.values.endLocation === "undefined");
        }
    }

    class _calculation {
        constructor(params, trigger, conditions, method) {
            this.params = params;
            this.trigger = trigger;
            this.conditions = conditions;
            this.method = method;
        }

        check() {
            return this.trigger(this.params) && this.conditions(this.params)
        }

        execute() {
            this.method(this.params)
        }

    }

    function getCalcList(params) {
        return [
            new _calculation(    //Add values to get end location
                params,
                function() {
                    return !this.params.hasEndLocation();
                },
                function() {
                    return this.params.hasReactivePower() && this.params.hasTruePower()  //Require reactive power & true power
                },
                function() {
                    this.params.values.endLocation = new (_geom.point)(this.prevX + values.reactivePower, this.prevY + values.truePower);
                }
            ),
        ]
    }

    var _appendLoad = (function(values){

        var params = new _params(values, _loads[_loads.length -1]);
        var calcList = getCalcList(params);
        var calcItem;
        
        do {
            calcItem = calcList.find(function(clc){
                return clc.check()
            })

            if(calcItem){
                calcItem.method()
            }
        }
        while (calcItem);

        

        

        /* if (!hasLocation) {
            if(hasReactivePower && hasTruePower) {
                var prevX = prevLocation.x;
                var prevY = prevLocation.y;
                values.endLocation = new (_geom.point)(prevX + values.reactivePower, prevY + values.truePower);
                hasLocation = true;
            } else if (hasApparentPower && hasPhaseAngle) {

            }
        }

        line = new geom.line(prevLocation, endLocation)
        
        if (!hasApparentPower) {
            if (hasLocation) {
                values.apparentPower = line.length();
        }
        } else if(hasReactivePower && hasTruePower) {

            }
        } */

        console.log({
            'hasApparentPower': params.hasApparentPower(),
            'hasReactivePower': params.hasReactivePower(),
            'hasTruePower': params.hasTruePower(),
            'hasPhaseAngle': params.hasPhaseAngle(),
            'hasEndLocation': params.hasEndLocation()
        })

        
        var newLoad = new _load(
            params.values.apparentPower,
            params.values.truePower,
            params.values.reactivePower,
            params.values.phaseAngle,
            params.values.endLocation
        );
        var newLocation = newLoad.endLocation;
    
        _plane.drawPoint(newLoad.endLocation);
        _plane.joinPoints(params.prevLocation, newLocation);

        _loads.push(newLoad);

    })

    function _init(params) {
        _settings = params;

        if (!(typeof settings.plane === "undefined")) {
            _plane.init(settings.plane);
        }

        _loads.push(new _load(0.0, 0.0, 0.0, 0.0, new (_geom.point)(0,0)))

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

