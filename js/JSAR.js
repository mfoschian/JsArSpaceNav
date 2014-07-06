
function merge( dst, src )
{
	if(!src || !dst) return;
	
	for( var k in src )
	{
		var v = src[k];
		dst[k] = v;
	}
}

var JSARutil =
{
	matrixMul: function( m1, m2 )
	{
		var r = new NyARDoubleMatrix33();
		r.m00 = m1.m00*m2.m00 + m1.m01*m2.m10 + m1.m02*m2.m20;
		r.m01 = m1.m00*m2.m01 + m1.m01*m2.m11 + m1.m02*m2.m21;
		r.m02 = m1.m00*m2.m02 + m1.m01*m2.m12 + m1.m02*m2.m22;

		r.m10 = m1.m10*m2.m00 + m1.m11*m2.m10 + m1.m12*m2.m20;
		r.m11 = m1.m10*m2.m01 + m1.m11*m2.m11 + m1.m12*m2.m21;
		r.m12 = m1.m10*m2.m02 + m1.m11*m2.m12 + m1.m12*m2.m22;

		r.m20 = m1.m20*m2.m00 + m1.m21*m2.m10 + m1.m22*m2.m20;
		r.m21 = m1.m20*m2.m01 + m1.m21*m2.m11 + m1.m22*m2.m21;
		r.m22 = m1.m20*m2.m02 + m1.m21*m2.m12 + m1.m22*m2.m22;
		
		return r;
	},
	inverseOf: function( m )
	{
		var R = new NyARDoubleMatrix33();
		R.inverse(m);
		return R;
	},
	vector: 
	{
		create: function( x, y, z )
		{
			return { x:x, y:y, z:z }
		},
		diff: function( v1, v2 )
		{
			return { x:v1.x-v2.x, y:v1.y-v2.y, z:v1.z-v2.z }
		}
	},
	transform: function( m, v )
	{
		var t = {};
		m.transformVertex_double( v.x, v.y, v.z, t);
		return t;
	},
	getZXYAngle: function( m )
	{
		var a = {};
		m.getZXYAngle(a);
		return a;
	},
	extractTransl: function( rm )
	{
		return this.vector.create( rm.m03, rm.m13, rm.m23 );
	}

};

function JSAR( canvas, opts )
{
	this.opts =
	{
		marker_size: 80, // mm
		continued_mode: true,
		canvas_width: 320,
		canvas_height: 240,
		threshold: 170
	};
	merge( this.opts, opts );

	this.canvas = canvas;
	
	// create reader for the video canvas
    this.raster = new NyARRgbRaster_Canvas2D(this.canvas);
	
	// create new Param for the canvas [~camera params]
	var w = this.canvas.width || this.opts.canvas_width;
	var h = this.canvas.height || this.opts.canvas_height;
    var param = new FLARParam(w,h);

	// marker size is 80 [transform matrix units]
    this.detector = new FLARMultiIdMarkerDetector(param, this.opts.marker_size);
    this.detector.setContinueMode( this.opts.continued_mode );

    // get the camera matrix from param and copy it to given 16-elem Float32Array
    // 100 is near plane, 10000 is far plane
    //param.copyCameraMatrix(display.camera.perspectiveMatrix, 100, 10000);
	

	var me = this;

	this.changed = function(flag)
	{
		if( this.canvas )
			this.canvas.changed = flag;
	};
	this.isChanged = function()
	{
		if( !this.canvas )
			return false;
		
		return !!(this.canvas.changed);
	};

	this.extractId = function( packed_id )
	{
		var currId;
		// read back id marker data byte by byte (welcome to javaism)
		if (packed_id.packetLength > 4)
		{
			currId = -1;
		}
		else
		{
			currId=0;
			for (var i = 0; i < packed_id.packetLength; i++ )
			{
				currId = (currId << 8) | packed_id.getPacketData(i);
				//console.log("id[", i, "]=", id.getPacketData(i));
			}
		}
		return currId;
	};

	this.detect = function()
	{
		this.detected = 0;

		try
		{
			// detect markers from the canvas (using the raster reader we created for it)
			this.detected = this.detector.detectMarkerLite(this.raster, this.opts.threshold);
		}
		catch(err)
		{
		}
		
		return this.detected;
	}

	this.marker = function( i )
	{
		if( i<0 || i >= this.detected )
			return null;

		var packedId = this.detector.getIdMarkerData(i);
		var id = this.extractId(packedId);
		
		var markerInfo =
		{
			id: id,
			index: i,
			packedId: packedId,
			resultMat: null,
			update: function()
			{
				if( !this.resultMat )
					this.resultMat = new NyARTransMatResult();

				me.detector.getTransformMatrix(this.index, this.resultMat);
			}
		};
		return markerInfo;
	}

	this.setThreshold = function(t)
	{
		this.opts.threshold = t;
	};
}

