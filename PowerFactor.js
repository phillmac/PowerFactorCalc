var pfCalc = (function() {
    var _settings;

    var _loads = [];
    var _geometry = (function() {
        class _point {
            constructor(x,y) {
                this.x = x;
                this.y = y;
            }
    
        }
    
        class _line {
            constructor(p1,p2) {
                this.p1 = p1;
                this.p2 = p2;
            }

            length() {
                return Math.sqrt(Math.pow((this.p1.x - this.p1.y),2) + Math.pow((this.p2.x - this.p2.y),2))
            }
    
        }
        return {
            point: _point,
            line: _line
        }
    })
    var cartesianPlane = ( function () {
        var _canvas
        var _ctx
        var _ctxWidth
        var _ctxHeight
        var _centerX
        var _centerY
        var _settings
        var _origin = new (_geom.point)(0,0)
        var _points = [];
        var _lines = [];

        
        function _init(params) {
            _settings    = params

            _canvas = d3.select("canvas").call(d3.zoom().scaleExtent([1, 8]).on("zoom", _zoom));
            _ctx = _canvas.node().getContext("2d");
            _ctxWidth    = _canvas.property('width');
            _ctxHeight   = _canvas.property('height');
            _centerX     = _ctxWidth/2;
            _centerY     = _ctxHeight/2;
            unitPixels  = _settings.unitPixels;
            
            _drawScalesAxies()

            if (_settings.draw.origin) {
                _addPoint(_origin);
            }

        }

        function _drawScalesAxies() {
            if (_settings.draw.xAxis) {
                _drawXAxis(_ctxWidth, _ctxHeight);
            }
            if (_settings.draw.xScale) {
                _drawXScale(_ctxWidth,_settings.unitPixels);
            }
            if (_settings.draw.yAxis) {
                _drawYAxis(_ctxWidth, _ctxHeight);
            }
            if (_settings.draw.yScale) {
                _drawYScale(_ctxHeight, _settings.unitPixels);
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

        function _addPoint(p){
            _drawPoint(p);
            _points.push(p);
        }

        function _addLine(l) {
            console.log(l);
            _drawLine(l);
            _lines.push(l);
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

        function _drawLine(l) {
            var p1 = l.p1
            var p2 = l.p2
            var p1x = _centerX + Math.round(p1.x*_settings.unitPixels)
            var p1y = _centerY - Math.round(p1.y*_settings.unitPixels)
            var p2x = _centerX + Math.round(p2.x*_settings.unitPixels)
            var p2y = _centerY - Math.round(p2.y*_settings.unitPixels)

            var prevStyle = _ctx.strokeStyle;
            var prevLinewidth =  _ctx.lineWidth;
            _ctx.beginPath();

            _ctx.strokeStyle = _settings.line.color;
            _ctx.lineWidth = _settings.line.size;
            
            _ctx.moveTo(p1x, p1y);
            _ctx.lineTo(p2x, p2y);
            _ctx.stroke();
            
            _ctx.strokeStyle = prevStyle;
            _ctx.lineWidth = prevLinewidth;
        }

        function _draw() {
            _drawScalesAxies()
            _points.forEach(function(p){
                _drawPoint(p);
            });
            _lines.forEach(function(l){
                _drawLine(l);
            });
        }

        function _zoom() {
            var transform = d3.event.transform;
            _ctx.save();
            _ctx.clearRect(0, 0, _ctxWidth, _ctxHeight);
            _ctx.translate(transform.x, transform.y);
            _ctx.scale(transform.k, transform.k);
            _draw();
            _ctx.restore();
          }

        return {
            init: _init,
            getCTX: function() { return _ctx },
            getCTXWidth: function() { return _ctxWidth },
            getCTXHeight: function() { return _ctxHeight },
            getCenterX: function() { return _centerX },
            getCenterY: function() { return _centerY },
            addPoint: _addPoint,
            drawPoint: _drawPoint,
            addLine: _addLine,
            drawLine: _drawLine,
            draw: _draw
        }
    
    })

    var _geom = _geometry();
    var _plane = cartesianPlane();

    class _load {
        constructor(apparentPower, truePower, reactivePower, powerFactor, phaseAngle, endLocation){
            this.apparentPower = apparentPower;
            this.truePower = truePower;
            this.reactivePower = reactivePower;
            this.powerFactor = powerFactor
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

        hasPowerFactor() {
            return !(typeof this.values.powerFactor === "undefined");
        }

        hasEndLocation() {
            return !(typeof this.values.endLocation === "undefined");
        }
    }

    class _calculation {
        constructor(desc, params, trigger, conditions, method) {
            this.desc = desc;
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
            new _calculation(    'Coord geometry with true and reactive power values to get end location',
                params,
                function() {
                    return !this.params.hasEndLocation(); //End coords missing
                },
                function() {
                    return this.params.hasReactivePower() && this.params.hasTruePower()  //Require reactive & true power
                },
                function() {
                    this.params.values.endLocation = new (_geom.point)(this.params.prevX + this.params.values.truePower, this.params.prevY + this.params.values.reactivePower);
                }
            ), new _calculation(    'Divide true and reactive power to get power factor ratio', 
                params,
                function() {
                    return !this.params.hasPowerFactor(); //Power factor missing
                },
                function() {
                    return this.params.hasReactivePower() && this.params.hasTruePower()  //Require reactive & true power
                },
                function() {
                    this.params.values.powerFactor = this.params.values.reactivePower/this.params.values.truePower;
                }
            ), new _calculation(    'ArcCos to get phase angle from power factor',
                params,
                function() {
                    return !this.params.hasPhaseAngle(); //Phase angle missing
                },
                function() {
                    return this.params.hasPowerFactor()  //Require power factor
                },
                function() {
                    this.params.values.phaseAngle = Math.acos(this.params.values.powerFactor) * (180/Math.PI); //Stupid radians math
                }
            ),  new _calculation(    'Cos to get power factor from phase angle',
                params,
                function() {
                    return !this.params.hasPowerFactor();  //Power factor missing
                },
                function() {
                    return this.params.hasPhaseAngle()  //Require phase angle
                },
                function() {
                   this.params.values.powerFactor = Math.cos(this.params.values.phaseAngle * (Math.PI/180)); //Stupid radians math  
                }
            ), new _calculation(    'Pythagoras to get apparent power from true & reactive',
                params,
                function() {
                    return !this.params.hasApparentPower(); //Apparent power missing
                },
                function() {
                    return this.params.hasReactivePower() && this.params.hasTruePower();  //Require reactive & true power
                },
                function() { //Pythagoras
                    this.params.values.apparentPower = Math.sqrt(Math.pow(this.params.values.reactivePower, 2) + Math.pow(this.params.values.truePower, 2));
                }
            ), new _calculation(    'Tan phase angle with true to get reactive power',
                params,
                function() {
                    return !this.params.hasReactivePower(); //Reactive power missing
                },
                function() {
                    return this.params.hasPhaseAngle() && this.params.hasTruePower();  //Require phase angle & true power
                },
                function() { //Tan
                    this.params.values.reactivePower = this.params.values.truePower * betterTan(this.params.values.phaseAngle); //Stupid javascript behavior
                }
            ), new _calculation(    'Sin phase angle with apparent to get reactive power',
                params,
                function() {
                    return !this.params.hasReactivePower(); //Reactive power missing
                },
                function() {
                    return this.params.hasPhaseAngle() && this.params.hasApparentPower();  //Require phase angle & true power
                },
                function() { //Sin
                    this.params.values.reactivePower = Math.sin(this.params.values.phaseAngle * (Math.PI/180)) / this.params.values.apparentPower; //Stupid radians math
                }
            ), new _calculation(    'Cos phase angle with apparent to get true power',
                params,
                function() {
                    return !this.params.hasTruePower(); //Reactive power missing
                },
                function() {
                    return this.params.hasPhaseAngle() && this.params.hasApparentPower();  //Require phase angle & true power
                },
                function() { //Sin
                    this.params.values.reactivePower = Math.cos(this.params.values.phaseAngle * (Math.PI/180)) / this.params.values.apparentPower; //Stupid radians math
                }
            ),
        ]
    }


    function betterTan(angle) { //Override stupid javascript behaviors
        switch (true) { 
            case ([45,225, -315, -135].includes(angle)):   //Stupid javascript precision
                return  1;   //tan(45) & tan(225) = 0.9999999999999999
            case ([-45,-225, 315, 135].includes(angle)):   //Stupid javascript precision
                return  -1;   //tan(-45) & tan(-225) = -0.9999999999999999
            case ([0,360].includes(angle)):   //360 gives weird results, override 0 as well to be sure
                return  0;
            default:
                return Math.tan(angle * (Math.PI/180)); //Stupid radians math
        }
    }

    

    var _appendLoad = (function(values){

        var params = new _params(values, _loads[_loads.length -1]);
        var calcList = getCalcList(params);
        var satisfiableCalcs;
        
        do {
            satisfiableCalcs = calcList.filter(function(calc){
                //console.log('Checking "' + calc.desc + '"');
                return calc.check();
            })

            calcsAvailable = (satisfiableCalcs.length > 0);

            if(calcsAvailable){
                satisfiableCalcs.forEach(function(calc){
                    console.log('Running "' + calc.desc + '"');
                    calc.method();

                })
            }
        }
        while (calcsAvailable);

        

        

        /* 

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
            'hasPowerFactor': params.hasPowerFactor(),
            'hasEndLocation': params.hasEndLocation()
        })

        
        var newLoad = new _load(
            params.values.apparentPower,
            params.values.truePower,
            params.values.reactivePower,
            params.values.powerFactor,
            params.values.phaseAngle,
            params.values.endLocation
        );
    
        _plane.addPoint(newLoad.endLocation);
        _plane.addLine(new (_geom.line)(params.prevLocation, newLoad.endLocation));

        _loads.push(newLoad);

    })

    function _init(params) {
        _settings = params;

        if (!(typeof _settings.plane === "undefined")) {
            _plane.init(_settings.plane);
        }

        _loads.push(new _load(0.0, 0.0, 0.0, 0.0, 0.0, new (_geom.point)(0,0)))

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

