(function ($) {
    "use strict";
    var bit_methods, connected;

    bit_methods = {
        init: function (options) {
            var active;
            console.log('bot: init');
            if (!this.data().bit) {
                this.data('bit', {});
            }
            if (!this.data().active) {
                this.data('active', {'content': {}});
            }
            active = this.data('active');
            active.activity = 'bot';
            active.plugin = 'base';
            active.content = {'right': 'trading.account.exchanges'};
            active.widgets = {'trading.account.funds': 'mtgox:phlax2',
                              'trading.account.exchanges': 'mtgox:phlax2'};
            return this.bot('load', options.wss);
        },
        plugins: function () {
            return $.bit('plugins').plugins();
        },
        load: function (wss) {
            var $this, active, pathname, uid;
            //this.bot('loadTimer');
            console.log('bot: load');
            $this = this;
            this.signal();
            this.signal('listen', 'update-data', function (resp) {
                var active;
                active = $this.data('active');
                $this.bot('updateFrame', active.activity, active.plugin);
            });
            connected = false;
            this.signal('listen', 'socket-connected', function () {
                $this.signal('emit', 'send-helo', '');
                $this.signal('listen', 'helo', function (resp) {
                    if (connected) {
                        $this.bot('updatePlugins');
                        return;
                    }
                    connected = true;
                    $this.bot('loadTemplates', function () {
                        $this.bot('renderFrame', function () {
                            var plugins, plugin, i;
                            plugins = $.bit('plugins').plugins();
                            //nsole.log(plugins)
                            for (plugin in plugins) {
                                if (plugins.hasOwnProperty(plugin)) {
                                    if (plugins[plugin].load) {
                                        plugins[plugin].load($this);
                                    }
                                }
                            }
                            $this.bot('updatePlugins', function () {
                                //$this.bot('loadFrame', 'coin', 'trading');
                            });
                        });
                    });
                });
            });
            pathname = window.location.pathname.replace('/', '');
            if (pathname) {
                uid = pathname;
            } else {
                uid = $this.bot('generate_uid');
            }
            $this.data('session', uid);
            $this.bot('loadWebSocket', wss);
            return this;
        },

        generate_uid: function () {
            var S4;
            console.log('bot: generate_uid');
            S4 = function () {
                return (((1 + Math.random()) * 0x10000) || 0).toString(16).substring(1);
            };
            return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
        },

        loadTimer: function () {
            var $this, tid;
            tid = this.data('timer');
            console.log('bot: loadTimer');
            $this = this;
            if (!tid) {
                tid = setInterval(function () {
                }, 5000);
            }
            return this;
        },

        renderFrame: function (cb) {
            var $this, active, plugin, _cb;
            console.log('bot: renderFrame');
            active = this.data('active');
            plugin = $.bit('plugins').plugins()['bit.' + active.activity + '.' + active.plugin];
            $this = this;
            if (plugin) {
                _cb = function () {
                    $this.signal('emit', 'frame-loaded');
                    cb();
                };
                plugin.renderFrame(this, _cb);
            }
            return this;
        },

        loadTemplates: function (cb) {
            var plugins, plugin_templates, plugin, plugin_template_url, load_plugin_templates;
            plugins = $.bit('plugins').plugins();
            plugin_templates = {};
            console.log('bot: loadTemplates ', plugins);
            for (plugin in plugins) {
                if (plugins.hasOwnProperty(plugin)) {
                    plugin_template_url = plugins[plugin].template_url;
                    plugin_templates = plugins[plugin].templates;
                    if (plugin_template_url && !plugin_templates[plugin_template_url]) {
                        plugin_templates[plugin_template_url] = [];
                    }
                }
            }

            load_plugin_templates = function () {
                if (cb) {
                    cb();
                }
            };
            $.jtk('load', load_plugin_templates);
        },

        updatePlugin: function (activity, pluginid, cb) {
            var $this, plugin, plugincb;
            plugin = $.bit('plugins').plugins()['bit.' + activity + '.' + pluginid];
            console.log('bot: updatePlugin ', plugin);
            $this = this;
            if (plugin) {
                plugincb = function () {
                    cb();
                };
                plugin.updatePlugin(this, plugincb);
            }
            return this;
        },


        /* 
           reload the active plugin 
        */
        updateFrame: function (activity, pluginid) {
            var plugin;
            plugin = $.bit('plugins').plugins()['bit.' + activity + '.' + pluginid];
            console.log('bot: updateFrame ', plugin);
            if (plugin) {
                plugin.updateFrame(this);
            }
            return this;
        },

        loadWebSocket: function (wss, cb) {
            var $this, active, wsserver, connected, connect, reconnect, ws;
            console.log('bot: loadWebSocket ');
            $this = this;
            this.signal();
            active = $this.data('active');
            active.socket = {};
            wsserver = wss;
            active.status = {};
            connected = false;
            reconnect = function () {
                console.log('bot: loadWebSocket:reconnect ', wss);
                if (active.socket.status === 'connected') {
                    return;
                }
                if (active.socket.status === 'connecting') {
                    return;
                }
                try {
                    ws = connect();
                } catch (e) {
                    $this.signal('emit', 'status-message', 'connection failed to ' + wsserver);
                    $this.signal('emit', 'socket-disconnected', e);
                    active.socket.status = 'disconnected';
                }
                setTimeout(reconnect, 5000);
            };

            connect = function () {
                var status;
                console.log('bot: loadWebSocket:connect ', wsserver);
                active.socket.status = 'connecting';
                $this.signal('emit', 'socket-connecting', '');
                $this.signal('emit', 'status-message', 'connecting to ' + wsserver);
                ws = new WebSocket(wsserver);
                status = 0;
                ws.onmessage = function (evt) {
                    var resp, emmissions, emit, i;
                    resp = JSON.parse(evt.data.trim());

                    if (resp.__bit_ac) {
                        document.cookie = "__bit_ac=" + resp.__bit_ac + "; path=/";
                    }

                    if (resp.bit) {
                        $.extend($this.data('bit'), resp.bit);
                    }

                    if (resp.emit) {
                        emmissions = resp.emit;
                        for (emit in emmissions) {
                            if (emmissions.hasOwnProperty(emit)) {
                                $this.signal('emit', emit, emmissions[emit]);
                            }
                        }
                    }
                };

                ws.onclose = function (evt) {
                    var session;
                    console.log('bot: loadWebSocket:onclose');
                    session = '';
                    active.socket = {};
                    active.socket.status = 'disconnected';
                    $this.signal('emit', 'socket-disconnected', '');
                    $this.signal('emit', 'status message', 'connection lost to ' + wsserver);
                    setTimeout(reconnect, 5000);
                };

                ws.onopen = function (evt) {
                    var session;
                    console.log('bot: loadWebSocket:onopen');
                    session = '';
                    $this.signal('emit', 'status-message', 'connected to ' + wsserver);
                    active.socket.status = 'connected';
                    if (!connected) {
                        connected = true;
                        $this.signal('emit', 'socket-connected', '');
                    } else {
                        console.log('socket re-connected');
                        $this.signal('emit', 'socket-connected', '');
                    }
                };
                return ws;
            };
            ws = connect();

            $this.signal('listen', 'status-message', function (msg) {
                active.status.message = msg;
            });

            $this.signal('listen', 'auth-successful', function (resp) {
                active.person = {};
                active.person.jid = resp;
                $this.data('session', resp.split('/')[1]);
            });

            $this.signal('listen', 'transmit', function (resp) {
                var signal, args, _msg;
                signal = resp[0];
                args = resp[1];
                _msg  = {};
                _msg.session = $this.data('session');
                _msg.__bit_ac = document.cookie;
                _msg.command = signal;
                _msg.args = args;
                _msg.request = 'command';
                console.log("sending message: ", _msg);
                ws.send(JSON.stringify(_msg));
            });

            $this.signal('listen', 'auth-goodbye', function (resp) {
                active.person = null;
                $this.signal('emit', 'close-sessions', '');
            });

            $this.signal('listen', 'subscribe', function (resp) {
                var msg, cb, _msg, session;
                msg = resp[0];
                cb  = resp[1];

                $this.signal('listen', msg, function (res) {
                    cb(res);
                });

                _msg  = {};
                session = $this.data('frame').guid();
                _msg.subscribe = msg;
                _msg.session = session;
                _msg.__bit_ac = document.cookie;
                _msg.request = 'subscribe';
                ws.send(JSON.stringify(_msg));
                console.log("subscribing: ", _msg);
            });
            //console.log(window.location.href)

            $this.signal('listen', 'send-helo', function (resp) {
                var _msg;
                _msg = {};
                _msg.session = $this.data('session');
                _msg.__bit_ac = document.cookie;
                _msg.request = 'helo';
                ws.send(JSON.stringify(_msg));
            });

            $this.signal('listen', 'frame-loaded', function (msg) {
                var _msg, session;
                _msg = {};
                session = $this.data('session');
                _msg.__bit_ac = document.cookie;
                _msg.session = session;
                _msg.request = 'message';
                _msg.message = msg;
                //ws.send(JSON.stringify(_msg));
            });

            $this.signal('listen', 'speak', function (msg) {
                var _msg, session;
                _msg = {};
                session = $this.data('session');
                _msg.__bit_ac = document.cookie;
                //console.log(document.cookie)
                //console.log(session)
                _msg.session = session;
                _msg.message = msg;
                _msg.request = 'message';
                ws.send(JSON.stringify(_msg));
            });

            $this.signal('listen', 'speak-password', function (msg) {
                var _msg, session;
                _msg = {};
                session = $this.data('session');
                _msg.__bit_ac = document.cookie;
                _msg.session = session;
                _msg.password = msg;
                _msg.request = 'auth';
                console.log(JSON.stringify(_msg));
                ws.send(JSON.stringify(_msg));
            });

            return this;
        },

        updatePlugins: function (cb) {
            var $this, counter, complete, bit, activity, plugin, i, i2;
            console.log('bot: updatePlugins');
            counter = 0;
            $this = this;

            complete = function () {
                counter -= 1;
                if (counter === 0) {
                    $this.signal('emit', 'update-data', 'foo');
                    if (cb) {
                        cb();
                    }
                }
            };

            bit = this.data('bit');
            for (activity in bit) {
                if (bit.hasOwnProperty(activity)) {
                    for (plugin in bit[activity]) {
                        if (bit[activity].hasOwnProperty(plugin)) {
                            counter  += 1;
                            this.bot('updatePlugin', activity, plugin, complete);
                            complete();
                        }
                    }
                }
            }
            return this;
        }
    };

    $.fn.bot = function (method) {
        var result;
        if (bit_methods[method]) {
            result = bit_methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            result = bit_methods.init.apply(this, arguments);
        } else {
            result = $.error('Method ' +  method + ' does not exist on jQuery.bot');
        }
        return result;
    };
}(jQuery));
