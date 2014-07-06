
function WebCam( opts )
{
	this.opts = opts || { video:true };
	this.video = this.opts.id ? document.getElementById(this.opts.id) : null;

	var me = this;

	this.createVideo = function(id)
	{
		var video = null;
		if( typeof(id) == 'string' )
			video = document.getElementById(id);

		if( !video || video.nodeName != "VIDEO" )
			video = document.createElement('video');

		video.width = me.opts.width || 320;
		video.height = me.opts.height || 240;
		video.loop = me.opts.loop || true;
		video.volume = me.opts.volume || 0;
		video.controls = me.opts.controls || false;
		video.autostart = me.opts.autostart || false;
		
		if( id )
			video.id = id;

		if( me.opts.hidden == true )
			video.style.display = 'none';

		var container = null;
		if( me.opts.container )
		{
			if( typeof(me.opts.container) == 'string' )
				container = document.getElementById(me.opts.container);
			else
				container = me.opts.container;
		}
		
		(container || document.body).appendChild(video);
		return video;
	}

	this.start = function()
	{
		if( me.video && me.video.paused && me.url )
		{
			try{ me.video.play(); } catch(e) {}
			return;
		}

		me.stop();

		if( !me.video )
			me.video = me.createVideo( me.opts.id );

		
		html5.getUserMedia( {video: true}, function (stream)
		{
			me.url = html5.createObjectURL(stream);
			me.video.src = me.url;
			try{ me.video.play(); } catch(e) {}
		},
		function (error)
		{
			alert("Couldn't access webcam.");
		});
	};

	this.stop = function()
	{
		if( me.video )
		{
			try{ me.video.pause(); } catch(e) {}
			me.video.src = "";
		}
		
		if( me.url )
		{
			html5.revokeObjectURL( me.url );
			me.url = null;
		}
	};

	this.pause = function()
	{
		if( me.video )
			try{ me.video.pause(); } catch(e) {}
	};
}

