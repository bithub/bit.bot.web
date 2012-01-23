
(function( $ ) {
    var bit_methods =
	{
	    init: function(options) 
	    { 
		//console.log('starting bot');		
		if (!('bit' in this.data()))
		    this.data('bit',{});
		if (!('active' in this.data()))
		    this.data('active',{'content':{}});

		var plugins = $.bit('plugins').plugins()
		//nsole.log(plugins)
		for (var plugin in plugins)
		{
		    if ('load' in plugins[plugin])
		    {
			plugins[plugin].load(this);
		    }
		}

		var active = this.data('active');
		active.activity = 'bot';
		active.plugin = 'base';

		active.content = {'right': 'trading.account.exchanges'}
		active.widgets = {'trading.account.funds': 'mtgox:phlax2',
				 'trading.account.exchanges': 'mtgox:phlax2'}
		return this.bot('load');
	    },

	    plugins: function()
	    {
		return $.bit('plugins').plugins()
	    },

	    load: function() 
	    { 
		//console.log('loading bot');
		//this.bot('loadTimer');
		var $this = this;
		this.signal()
		this.signal('listen', 'update-data',function(resp)
			     {
				 var active = $this.data('active');
				 $this.bot('updateFrame', active.activity, active.plugin)
			     });						

		this.signal('listen', 'connection-made', function(){
		    $this.signal('emit', 'send-helo', '');
		    $this.signal('listen', 'helo', function(){			
			$this.bot('loadTemplates', function(){
			    //console.log('rendering frame')
			    $this.bot('renderFrame', function(){
				//console.log('updating plugins')
				$this.bot('updatePlugins',function(){
				    //$this.bot('loadFrame', 'coin', 'trading');
				})
			    })
			})
		    });
		});

		var pathname = window.location.pathname.replace('/','')
		var uid
		if(pathname) 
		    uid = pathname
		else
		    uid = $this.bot('generate_uid')
		$this.data('session',uid)
		$this.bot('loadWebSocket')
		return this;
	    },

	    generate_uid: function(){
		var S4 = function() {
		    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
	    },

	    loadTimer: function() 
	    { 	    
		var tid = this.data('timer');
		//console.log('loading timer');
		var $this = this;
		if (!tid)
		{
		    tid = setInterval(function()
				      {
					  //console.log('update!');
					  //$this.bot('updatePlugin','coin', 'trading');
					  //console.log('done!');
				      }, 5000)		    
		};
		return this;
	    },

	    fund: function(curr)
	    {
		return (curr/100000000).toFixed(8);
	    },



	    renderContentLeft: function()
	    {		
		var plugins = $.bit('plugins');
		var activity = this.data('active').activity;
		var plugin = this.data('active').plugin;
		plugins['bit.'+activity+'.'+plugin].renderLeft(this,this.find('.botContentLeft'));
		return this;
	    },

	    renderContentRight: function()
	    {		
		var plugins = $.bit('plugins').plugins();
		var activity = this.data('active').activity;
		var plugin = this.data('active').plugin;
		plugins['bit.'+activity+'.'+plugin].renderRight(this,this.find('.botContentRight'));
	    },


	    renderContentCenter: function()
	    {		
		var plugins = $.bit('plugins').plugins();
		var activity = this.data('active').activity;
		var plugin = this.data('active').plugin;
		var content = this.data('frame').kids['content-panel']
		plugins['bit.'+activity+'.'+plugin].renderCenter(this,content.kids['ui-layout-center'])
	    },


	    renderContentTop: function()
	    {		
		var plugins = $.bit('plugins').plugins();
		var activity = this.data('active').activity;
		var plugin = this.data('active').plugin;
		plugins['bit.'+activity+'.'+plugin].renderTop(this,this.find('.botContentTop'));
		return this;
	    },


	    updateLayout: function(area,layout)
	    {
		var active = this.data('active');
		var activity = active.activity;
		var plugin = active.plugin;
		this.data('active').content[area] = layout;
		this.bot('renderContentCenter')
		return this;
	    },

	    updateWidget: function(widget,v)
	    {
		var active = this.data('active');
		var activity = active.activity;
		var plugin = active.plugin;
		//console.log('updating widget: '+widget+' '+v)
		this.data('active').widgets[widget] = v;
		return this
	    },

	    renderFrame: function(cb) 
	    {
		var active = this.data('active')
		var plugin = $.bit('plugins').plugins()['bit.'+active.activity+'.'+active.plugin];
		var $this = this;
		if (plugin)
		{
		    //console.log('loading plugin '+plugin+' to frame')
		    var _cb = function()
		    {
			$this.signal('emit', 'frame-loaded');
			cb()
		    }
		    plugin.renderFrame(this,_cb);
		}
		return this
	    },

	    renderWidgets: function() { 
		//console.log('loading bot widgets');
		return this;
	    },


	    updateResource: function(activity,plugin,path,cb) { 		
		//console.log('updating plugin resource: bit.'+activity+'.'+plugin+'.'+path);
		var bit = this.data('bit');

		var $this = this;
		var req = $.ajax({
		    url: "http://curate.3ca.org.uk/calendar/json/"+activity+'/'+plugin+'/'+path,
		    dataType: "json",
		    type: "GET",
		    context: this,
		    success: function(msg){
			//console.log('receiving resource data'+activity+'.'+plugin+'.'+path);
			var plugin_data = bit[activity][plugin];
			var resource_data = plugin_data;
			//console.log(resource_data);					
			if (path.indexOf('/')!=-1)
			{
			    var parts = path.split('/');
			    for (var part in parts)
			    {
				if (!(parts[part] in resource_data))
				{
				    //console.log('adding node for plugin path '+parts[part])
				    resource_data[parts[part]] = {}
				}
				resource_data = resource_data[parts[part]];
			    }
			}
			else
			{
			    resource_data = plugin_data[path];
			}

			if (!('data' in resource_data))
			{
				resource_data['data'] = {};
			}
			for (var data in msg['data']) 
			{
			    if ('trades' == data)
			    {
				//console.log('adding resource:  bit.'+activity+'.'+plugin+'.'+path+'.'+data);
				//console.log(resource_data['data']);
				for (var t in resource_data['data']['trades'])
				{
				    //console.log(resource_data['data']['trades'][t])
				}

			    }


			    if (!(data in resource_data['data']))
			    {
				//console.log('adding node for plugin path data'+parts[part]+data)
				resource_data['data'][data] = {};
			    }
			    //if (data != 'trades')
			   // {
				//console.log('updating data: '+data)
				//console.log(resource_data['data']['trades'])
			//	console.log(msg['data']['trades'])
			 //   }
			    resource_data['data'][data] = msg['data'][data];
			}	
			var counter = 0;			    
			var complete = function()
			{
			    counter--;
			    //console.log('finished updating plugin resource: bit.'+activity+'.'+plugin+'.'+path);
			    if (counter == 0)
			    {
				if (cb) cb()					
			    }
			};

			for (var res in msg['resources']) 
			{			    
			    
			    if(!(res in resource_data))
			    {
				//console.log('adding node for plugin path data resource '+res)
				resource_data[res] = {};			    
			    }

			    resource_data = resource_data[res]
			    var resources = msg['resources'][res];
			    for (var resource in resources)
			    {				
				var resid = resources[resource]				
				if(!(resid in resource_data))
				{
				    //console.log('adding node for plugin path data resource '+resid)
				    resource_data[resid] = {};
				}
				counter++;
				this.bot('updateResource',activity,plugin,path+'/'+res+'/'+resid, complete)
			    };
			}
			if (counter == 0)
			    if (cb) cb()
		    },
		})
		return this;
	    },


	    loadPlugin: function(activity, pluginid,cb) { 
		var plugin = $.bit('plugins').plugins()['bit.'+activity+'.'+pluginid];
		if ('loadPlugin' in plugin)
		{
		    plugin.loadPlugin(this,cb);
		}
		return this
	    },

	    loadTemplates: function(cb)
	    {
		var plugins = $.bit('plugins').plugins()
		var plugin_templates = {};
		for (var plugin in plugins)
		{
		    var plugin_template_url = plugins[plugin].template_url		    
		    plugin_templates = plugins[plugin].templates
		    if (plugin_template_url && !(plugin_template_url in plugin_templates))
			plugin_templates[plugin_template_url] = []		    
		    //console.log(plugins[plugin])
		}		
		var load_plugin_templates = function()
		{
		    //console.log('base templates loaded')
//		    $.jplates(plugin_templates, function()
//			      {
		    //console.log('plugin templates loaded')
		    if (cb) cb();
//			      })/
		}
		$.jtk('load',load_plugin_templates)
	    },

	    updatePlugin: function(activity, pluginid,cb) { 		
		var plugin = $.bit('plugins').plugins()['bit.'+activity+'.'+pluginid];
		var $this = this;
		if (plugin)
		{
		    var plugincb = function(){
			cb()
		    }
		    plugin.updatePlugin(this,plugincb);
		}
		return this
	    },

	    /* load the active plugin */
	    loadFrame: function(activity, pluginid) { 		
		var plugin = $.bit('plugins').plugins()['bit.'+activity+'.'+pluginid];
		if (plugin)
		{
		    //console.log('loading plugin '+pluginid+' to frame')
		    //plugin.loadFrame(this);
		}
		return this
	    },


	    /* reload the active plugin */
	    updateFrame: function(activity, pluginid) { 		
		var plugin = $.bit('plugins').plugins()['bit.'+activity+'.'+pluginid];
		if (plugin)
		{
		    //console.log('loading plugin '+pluginid+' to frame')
		    plugin.updateFrame(this);
		}
		return this
	    },

	    
	    updateResourceData: function(activity,plugin,path) { 		
		var bit = this.data('bit');
		var plugin_data = bit[activity][plugin];
		var resource_data = plugin_data;

		$.ajax({
		    url: "http://curate.3ca.org.uk/calendar/json/"+activity+'/'+plugin+'/'+path,
		    dataType: "json",
		    type: "GET",
		    context: this,
		    success: function(msg){
									
			if (path.indexOf('/')!=-1)
			{
			    var parts = path.split('/');
			    for (var part in parts)
			    {
				
				if (part == parts.length -1 )
				{
				    if (!('data' in resource_data))
				    {
					//console.log('adding node '+parts[part]);
					resource_data['data'] = {};
				    }
				    resource_data = resource_data['data'];
				    resid = parts[part];
				}
				else
				{
				    if (!(parts[part] in resource_data))
				    {
					//console.log('adding node '+parts[part]);
					resource_data[parts[part]] = {}
				    }
				    resource_data = resource_data[parts[part]];				
				}	
			    }
			}
			else
			{
			    resource_data = plugin_data;
			    resid = path;
			}

			//resource_data[resid] = msg;
		    },
		})	
		return this;
	    },

	    loadWebSocket: function(cb) { 		
		var $this = this;
		this.signal();
		var active = $this.data('active');		
		active['socket'] = {}		
		var wsserver = 'wss://curate.3ca.org.uk:8383/';
		active['status'] = {}
		var connect = function()
		{
		    active['socket']['status'] = 'connecting'
		    $this.signal('emit','socket-connecting','')		
		    $this.signal('emit','status-message','connecting to '+wsserver)		
		    console.log('starting ws connection')
		    var ws = new WebSocket(wsserver);
		    var status = 0;
		    ws.onmessage = function(evt) 
		    {
			var resp = JSON.parse(evt.data.trim());
			//console.log(resp)
			if ('__bit_ac' in resp)
			{
			    //console.log(resp)
			    document.cookie = "__bit_ac="+resp['__bit_ac']+"; path=/";
			}
			if ('bit' in resp)
			{
			    $.extend($this.data('bit'),resp['bit'])
			}
			if ('emit' in resp)
			{
			    var emmissions = resp['emit'];
			    for (var emit in emmissions)
			    {
				console.log(emit)
				console.log(emmissions[emit])
				$this.signal('emit',emit,emmissions[emit]);
			    }
			}
		    }
		    ws.onclose = function(evt) 
		    {		    
			console.log('disconnected');
			var session = '';
			active['socket'] = {}
			active['socket']['status'] = 'disconnected'
			$this.signal('emit','socket-disconnected','')		
			$this.signal('emit','status message','connection lost to '+wsserver)		
			setTimeout(reconnect,5000)
		    }
		    ws.onopen = function(evt) 
		    {		    
			console.log('connected');
			var session = '';
			$this.signal('emit','status-message','connected to '+wsserver)		
			active['socket']['status'] = 'connected'
			$this.signal('emit','socket-connected','')		
		    }		
		    return ws
		}
		var reconnect = function()
		{
		    if (active.socket.status == 'connected') return
		    try {			
			ws = connect()
		    } catch(e) {			
			$this.signal('emit','status-message','connection failed to '+wsserver)		
			$this.signal('emit','socket-disconnected',e)		
			active.socket.status = 'disconnected'
		    }
		    setTimeout(reconnect,5000)
		}			
		var ws = connect()

		$this.signal('listen','status-message',function(msg)
			     {
				 active.status['message'] = msg;
			     })
		
		$this.signal('listen', 'auth-successful', function(resp)
			   {
			       console.log('auth successful: '+resp)
			       active.person = {}
			       active.person.jid = resp
			       $this.data('session',resp.split('/')[1])
			   })
		
		$this.signal('listen', 'transmit', function(resp)
			     {
				 var signal = resp[0]
				 var args = resp[1]
				 var _msg  = {};
				 _msg['session'] = $this.data('session');
				 _msg['__bit_ac'] = document.cookie
				 _msg['command'] = signal;
				 _msg['args'] = args;
				 _msg['request'] = 'command'
				 console.log('SENDING')
				 console.log(_msg)
				 ws.send(JSON.stringify(_msg));
			     })
		$this.signal('listen', 'auth-goodbye', function(resp)
			     {
				 active.person = null;
				 $this.signal('emit', 'close-sessions', '');
			     })
		$this.signal('listen','subscribe',function(resp){
		    var msg = resp[0]
		    var cb  = resp[1]
		    $this.signal('listen',msg,function(res){
			cb(res)
		    })
		    var _msg  = {};
		    var session = $this.data('frame').guid();
		    _msg['subscribe'] = msg;
		    _msg['session'] = session;
		    _msg['__bit_ac'] = document.cookie
		    _msg['request'] = 'subscribe'
		    console.log('SENDING')
		    console.log(_msg)
		    ws.send(JSON.stringify(_msg));				     
		})
		
		//console.log(window.location.href)

		$this.signal('listen', 'send-helo', function(resp){
		    var _msg  = {};
		    _msg['session'] = $this.data('session');
		    _msg['__bit_ac'] = document.cookie		    
		    _msg['request'] = 'helo';
		    console.log('SENDING')
		    console.log(_msg)		    
		    ws.send(JSON.stringify(_msg));				     
		})			

		$this.signal('listen','frame-loaded',function(msg)
			     {
				 var _msg  = {};
				 var session = $this.data('session');
				 _msg['__bit_ac'] = document.cookie
				 _msg['session'] = session;
				 _msg['request'] = 'message'
				 //ws.send(JSON.stringify(_msg));				     
			     })

		$this.signal('listen','speak',function(msg)
			     {
				 var _msg = {};
				 var session = $this.data('session');
				 _msg['__bit_ac'] = document.cookie
				 //console.log(document.cookie)
				 //console.log(session)
				 _msg['session'] = session;
				 _msg['message'] = msg;
				 _msg['request'] = 'message'
				 ws.send(JSON.stringify(_msg));
			     })
		$this.signal('listen','speak-password',function(msg)
			     {
				 var _msg = {};
				 var session = $this.data('session');
				 _msg['__bit_ac'] = document.cookie				
				 _msg['session'] = session;
				 _msg['password'] = msg;
				 _msg['request'] = 'auth'
				 ws.send(JSON.stringify(_msg));
			     })

		return this;
	    },

	    updatePlugins: function(cb) { 		
		var counter = 0;
		var $this = this
		var complete = function()
		{
		    counter--;
		    if (counter == 0)
		    {
			//console.log('finished updating plugins')
			$this.signal('emit','update-data', 'foo')
			if (cb) cb()
		    }
		};
		
		var bit = this.data('bit')
		for (var activity in bit)
		{		    
		    for (var plugin in bit[activity])
		    {
			counter++
			this.bot('updatePlugin',activity,plugin,complete);
			complete() 
		    }
		}
		return this;
	    }


	}

    $.fn.bot = function(method) {
	if ( bit_methods[method] ) {
	    return bit_methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if ( typeof method === 'object' || ! method ) {
	    return bit_methods.init.apply( this, arguments );
	} else {
	    $.error( 'Method ' +  method + ' does not exist on jQuery.bot' );
	}    	
    };
})( jQuery );






