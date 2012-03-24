(function ($) {
    "use strict";
    var BotIcon, BotSpeakButton, BotConnectStatusButton, BotStatusMessage, BotStatus, BotContentButton, BotContentButtons, BotAuthStatusButton, BotListenButton, BotSpeakInput, BotSpeakForm, BotSpeak, BotButton, BotContent, Bot, BotFeet, BotBrain, BotChatSpeaker, BotChatResponseLine, BotChatResponseSpeech, BotChatResponse, BotChatResponseSpeechTail, BotThought, EventMessage, BotEvents, BotChat, BotEarLeft, BotEarRight, PanelBotFeet, PanelBotBrain, PanelBotEarRight, PanelBotEarLeft, BitBot, PanelBot;

    BotIcon = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.params.src = "/images/curate-icon-small.png";
    };
    BotIcon.prototype = $.bit('image');

    BotSpeakButton = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            image: {
                child: function () {
                    return new BotIcon(ctx);
                }
            }
        };
        this.after_add = function () {
            $this.$.click(function (evt) {
                evt.preventDefault();
                ctx.signal('emit', 'toggle-panel', 'west');
            });
        };
    };
    BotSpeakButton.prototype = $.bit('button');

    BotConnectStatusButton = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.model = {};
        this.model.image = {
            child: function () {
                var icon;
                icon = new BotIcon(ctx);
                icon.params.src = '/images/' + active.socket.status + '.png';
                return icon;
            }
        };

        this.after_add = function () {
            var connected, connecting, disconnected;
            //pre-load connection images;
            connected = new Image();
            connected.src = '/images/connected.png';
            connecting = new Image();
            connecting.src = '/images/connecting.png';
            disconnected = new Image();
            disconnected.src = '/images/disconnected.png';

            ctx.signal('listen', 'socket-disconnected', function () {
                $this.kids.image.element.attr('src', '/images/' + active.socket.status + '.png');
            });

            ctx.signal('listen', 'socket-connected', function () {
                $this.kids.image.element.attr('src', '/images/' + active.socket.status + '.png');
            });
        };
    };
    BotConnectStatusButton.prototype = $.bit('button');

    BotStatusMessage = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.params.content_ = active.status.message;
        this.after_add = function () {
            ctx.signal('listen', 'status-message', function (msg) {
                $this.$.html(msg);
            });
        };
    };
    BotStatusMessage.prototype = $.bit('button');

    BotStatus = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.model = {};
        this.model['bot-status-button'] = {
            child:  function () {
                return new BotConnectStatusButton(ctx);
            }
        };
        //this.model['bot-status-message'] = {child:  function (){return new BotStatusMessage(ctx)}}
    };
    BotStatus.prototype = $.bit('widget');

    BotContentButton = function (ctx, contentid) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.params.content_ = contentid;
        this.after_add = function () {
            $this.$.click(function (evt) {
                evt.preventDefault();
                ctx.signal('emit', 'toggle-content', contentid.split('-')[1]);
            });

            $this.$.bind('contextmenu', function (evt) {
                evt.preventDefault();
            });
        };
    };
    BotContentButton.prototype = $.bit('button');

    BotContentButtons = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.after_add = function () {
            ctx.signal('listen', 'close-sessions', function (resp) {
                var kid, i;
                for (i = 0; i === $this.kids.length; i += 1) {
                    kid = $this.kids[i];
                    $this.destroy(kid);
                }
            });
            ctx.signal('listen', 'close-session', function (resp) {
                if ($this.kids[resp]) {
                    $this.destroy(resp);
                }
            });

            ctx.signal('listen', 'show-content', function (resp) {
                var parts, rtype, button, session, cbutton;
                parts = resp.split('-');
                rtype = parts.shift();
                button = $.bit('plugins').plugins()['bit.bot.' + rtype].load_activity_button();
                session = parts[0];
                cbutton = $.bit('button').init(ctx);
                cbutton.subtype = 'image';
                cbutton.src = button.icon;
                cbutton.after_add = function () {
                    cbutton.$.click(function (evt) {
                        evt.preventDefault();
                        ctx.signal('emit', 'toggle-content', session);
                    });

                    cbutton.$.bind('contextmenu', function (evt) {
                        evt.preventDefault();
                    });
                };
                if (!$this.has_child(session)) {
                    $this.add(session, cbutton);
                }
            });
        };
    };
    BotContentButtons.prototype = $.bit('widget');

    BotAuthStatusButton = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.model = {};
        this.model.image = {
            child: function () {
                var icon;
                icon = new BotIcon(ctx);
                icon.params.src = '/images/person.png';
                return icon;
            }
        };

        this.after_add = function () {
            ctx.signal('listen', 'auth-successful', function (resp) {
                $this.kids.image.$.attr('src', '/images/trinity-person.png');
            });

            ctx.signal('listen', 'auth-goodbye', function (resp) {
                $this.kids.image.$.attr('src', '/images/person.png');
            });
        };
    };
    BotAuthStatusButton.prototype = $.bit('button');

    BotListenButton = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.model = {
            image: {
                child:  function () {
                    var icon;
                    icon = new BotIcon(ctx);
                    icon.params.src = '/images/listen.png';
                    return icon;
                }
            }
        };

        this.after_add = function () {
            $this.$.hide();
            ctx.signal('listen', 'auth-successful', function () {
                $this.$.show();
            });

            $this.$.click(function (evt) {
                evt.preventDefault();
                ctx.signal('emit', 'toggle-panel', 'east');
            });
        };
    };
    BotListenButton.prototype = $.bit('button');

    BotSpeakInput = function (ctx, type) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        if (type === 'text') {
            this.params.title = 'speak here';
            this.params.content_ = 'speak here';
        } else if (type === 'password') {
            this.params.title = '';
            this.params.content = '';
        }
        this.params.type = type;
        this.after_add = function () {
            if (type === 'text') {
                //$this.hint($this.$);
            }

            $this.$.keypress(function (evt) {
                if (evt.keyCode === 13) {
                    evt.preventDefault();
                    if (type === 'text') {
                        ctx.signal('emit', 'speak', $this.$.val());
                    } else {
			ctx.signal('emit', 'speak-password', $this.$.val());
			$this.$.val('');
		    }
                }
            });
        };
    };
    BotSpeakInput.prototype = $.bit('input');

    BotSpeakForm = function (ctx) {
        var $this, active;
        $this = this;
        this.init(ctx);
        active = ctx.data('active');
        this.params.content_ = 'speak here';
        this.model = {
            'speak-input': {
                child: function () {
                    return new BotSpeakInput(ctx, 'text');
                }
            },
            'speak-password': {
                child: function () {
                    return new BotSpeakInput(ctx, 'password');
                }
            }
        };

        this.after_add = function () {
            //console.log($this.kids['speak-input']);
            $this.kids['speak-password'].hide();
        };

        ctx.signal('listen', 'ask-password', function () {
            $this.kids['speak-input'].hide();
            $this.kids['speak-password'].show();
            $this.kids['speak-password'].element.focus();
        });

        ctx.signal('listen', 'speak-password', function () {
            $this.kids['speak-input'].show();
            $this.kids['speak-password'].hide();
            $this.kids['speak-input'].element.focus();
        });
    };
    BotSpeakForm.prototype = $.bit('form');

    BotSpeak = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'speak-form': {
                child: function () {
                    return new BotSpeakForm(ctx);
                }
            }
        };
    };
    BotSpeak.prototype = $.bit('widget');

    BotButton = function (ctx) {
        this.params.class_ = 'bot-button';
    };
    BotButton.prototype = $.bit('button');

    BotContent = function (ctx, contentid) {
        var $this;
        $this = this;
        this.init(ctx);
        this.params.content_ = contentid;
        this.params.class_ = 'bot-content';
        //this.ctx.data('active').widgets['bit.bot.shell'] = year + ':' + month        
    };
    BotContent.prototype = $.bit('widget');

    Bot = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot-button': {
                child: function () {
                    return new BotButton(ctx);
                }
            }
        };

        ctx.signal('listen', 'close-sessions', function (resp) {
            var kid, i;
            console.log('CLOSING SESSIONS');
            for (i = 0; i === $this.kids.length; i += 1) {
                kid = $this.kids[i];
                if (kid !== 'bot-button') {
                    $this.destroy(kid);
                }
            }
        });

        ctx.signal('listen', 'close-session', function (resp) {
            if ($this.kids[resp]) {
                $this.destroy(resp);
            }
        });

        ctx.signal('listen', 'show-content', function (resp) {
            var parts, rtype;
            $this.kids['bot-button'].hide();
            parts = resp.split('-');
            rtype = parts.shift();
            $this.add(parts[0],
                      $.bit('plugins').plugins()['bit.bot.' + rtype]
                      .load_activity(ctx, parts[0]));
            ctx.signal('emit', 'open-content', parts[0]);
        });

        ctx.signal('listen', 'toggle-content', function (resp) {
            var target, kid, i;
            target = $this.kids[resp];
            if (target.hidden()) {
                target.show();
                for (i = 0; i === $this.kids.length; i += 1) {
                    kid = $this.kids[i];
                    if (kid !== resp) {
                        $this.kids[kid].hide();
                    }
                }
                ctx.signal('emit', 'activity-changed', resp);
            } else {
                target.hide();
                ctx.signal('emit', 'activity-changed');
            }
        });

        ctx.signal('listen', 'open-content', function (resp) {
            var target, kid, i;
            target = $this.kids[resp];
            target.show();
            for (i = 0; i === $this.kids.length; i += 1) {
                kid = $this.kids[i];
                if (kid !== resp) {
                    $this.kids[kid].hide();
                }
            }
            ctx.signal('emit', 'activity-changed', resp);
        });

        ctx.signal('listen', 'hide-content', function (resp) {
            var target;
            target = $this.kids[resp];
            target.hide();
            ctx.signal('emit', 'activity-changed', null);
        });
    };
    Bot.prototype = $.bit('widget');

    BotFeet = function (ctx) {
        var $this;
        this.init(ctx);
        $this = this;
        this.model['bot-status'] = {
            child: function () {
                return new BotStatus(ctx);
            }
        };

        this.model['bot-content-buttons'] = {
            child: function () {
                return new BotContentButtons(ctx);
            }
        };
        //this.ctx.data('active').widgets['bit.bot.shell'] = year + ':' + month
    };
    BotFeet.prototype = $.bit('widget');

    BotBrain = function (ctx) {
        var $this, activity_menus, closer, fullscreen, menus, a_menu, a_menu_print, a_menu_quit;
        $this = this;
        this.init(ctx);
        activity_menus = $.bit('widget').init(ctx);
        closer = $.bit('button').init(ctx);
        closer.kontent = 'CLOSE!';
        closer.subtype = 'image';
        closer.src = '/images/close.png';
        closer.added = function () {
            closer.$.click(function (evt) {
                var session;
                evt.preventDefault();
                session = closer.$.attr('href').replace('#', '');
                ctx.signal('emit', 'transmit', ['close-session', [session]]);
                ctx.signal('emit', 'close-session', session);
            });
        };
        fullscreen = $.bit('button').init(ctx);
        fullscreen.kontent = 'CLOSE!';
        fullscreen.subtype = 'image';
        fullscreen.src = '/images/fullscreen.png';
        fullscreen.added = function () {
            fullscreen.$.click(function (evt) {
                var session;
                evt.preventDefault();
                session = fullscreen.$.attr('href').replace('#', '');
                //$this.$[0].mozRequestFullScreen()
                ctx.signal('emit', 'show-fullscreen', session);
            });
        };

        activity_menus.model.fullscreen = {
            child: function () {
                return fullscreen;
            }
        };

        activity_menus.model.closer = {
            child: function () {
                return closer;
            }
        };

        menus = $.bit('menus').init(ctx);
        a_menu =  $.bit('menu').init(ctx);
        a_menu.title = 'Activity';

        a_menu_print =  $.bit('menu_item').init(ctx);
        a_menu_print.title = 'Print';
        a_menu_quit =  $.bit('menu_item').init(ctx);
        a_menu_quit.title = 'Quit';
        a_menu.items.a_menu_print = {
            child: function () {
                return a_menu_print;
            }
        };
        a_menu.items.a_menu_quit = {
            child: function () {
                return a_menu_quit;
            }
        };

        menus.model.a_menu = {
            child: function () {
                return a_menu;
            }
        };

        activity_menus.added = function () {
            activity_menus.hide();
            ctx.signal('listen', 'close-session', function (resp) {
                if (resp) {
                    if (resp === fullscreen.$.attr('href').replace('#', '')) {
                        activity_menus.hide();
                    }
                    menus.hide();
                }
            });

            ctx.signal('listen', 'activity-changed', function (resp) {
                if (resp) {
                    closer.$.attr('href', '#' + resp);
                    fullscreen.$.attr('href', '#' + resp);
                    activity_menus.show();
                    menus.show();
                } else {
                    closer.$.attr('href', '#');
                    fullscreen.$.attr('href', '#');
                    activity_menus.hide();
                    menus.hide();
                }
            });

            ctx.signal('listen', 'show-content', function (resp) {
                var parts, rtype;
                parts = resp.split('-');
                rtype = parts.shift();
                $.bit('plugins').plugins()['bit.bot.' + rtype]
                    .load_activity_menus(ctx, parts.pop(), menus);
                $this.add('plugin-activity-menus', menus);
                activity_menus.show();
            });
        };

        this.model = {
            'bot-speak-button': {
                child: function () {
                    return new BotSpeakButton(ctx);
                }
            },
            'bot-speak': {
                child: function () {
                    return new BotSpeak(ctx);
                }
            },
            'person-status': {
                child: function () {
                    return new BotAuthStatusButton(ctx);
                }
            },
            'activity-menus': {
                child: function () {
                    return activity_menus;
                }
            },
            'bot-listen-button': {
                child: function () {
                    return new BotListenButton(ctx);
                }
            }
        };
        //this.ctx.data('active').widgets['bit.bot.shell'] = year + ':' + month
    };
    BotBrain.prototype = $.bit('widget');

    BotChatSpeaker = function (ctx, name) {
        var $this;
        $this = this;
        this.init(ctx);
        if (name === 'bot') {
            this.model = {
                'speaker-icon': {
                    child: function () {
                        var icon;
                        icon =  new BotIcon(ctx);
                        icon.params.src = '/images/curate-icon-small.png';
                        return icon;
                    }
                }
            };
        } else if (name === 'user') {
            this.model = {
                'speaker-icon': {
                    child: function () {
                        var icon, active;
                        icon = new BotIcon(ctx);
                        active = ctx.data('active');
                        if (active.person) {
                            icon.params.src = '/images/trinity-person.png';
                        } else {
                            icon.params.src = '/images/person.png';
                        }
                        return icon;
                    }
                }
            };
        }
        //this.ctx.data('active').widgets['bit.bot.shell'] = year + ':' + month
    };
    BotChatSpeaker.prototype = $.bit('widget');

    BotChatResponseLine = function (ctx, msg) {
        var $this;
        $this = this;
        this.init(ctx);
        function text_to_link(text) {
            var exp;
            exp = "/(\b(https?|ftp|file):\/\/[-A-Z0-9 + &@#\/%?=~_|!:, .;]*[-A-Z0-9 + &@#\/%=~_|])/ig";
            return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
        }
        this.params.content_ = text_to_link(msg);
    };
    BotChatResponseLine.prototype = $.bit('widget');

    BotChatResponseSpeech = function (ctx, speaker, msg) {
        var $this, lines, line, chat_response, i;
        $this = this;
        this.init(ctx);
        lines = msg.split('\n');
        this.params.class_ = 'speech-bubble';
        this.model = {};

        this.model.speaker = {
            child: function (_line) {
                return new BotChatSpeaker(ctx, speaker);
            },
            args: [lines[line]]
        };

        chat_response = function (_line) {
            return new BotChatResponseLine(ctx, _line);
        };

        for (i = 0; i === lines.length; i += 1) {
            line = lines[i];
            this.model['bot-line-' + line] = {
                child: chat_response,
                args: [lines[line]]
            };
        }
    };
    BotChatResponseSpeech.prototype = $.bit('widget');

    BotChatResponseSpeechTail = function (ctx) {
        var $this;
        this.init(ctx);
        $this = this;
    };
    BotChatResponseSpeechTail.prototype = $.bit('widget');

    BotChatResponse = function (ctx, speaker, msg) {
        var $this, lines;
        $this = this;
        this.init(ctx);
        lines = msg.split('\n');
        this.params.class_ = 'say-' + speaker;
        this.model = {};
        if (speaker === 'bot') {
            this.model['response-speech-tail-bot'] = {
                child: function () {
                    return new BotChatResponseSpeechTail(ctx);
                }
            };
        }

        this.model['response-speech'] = {
            child:  function () {
                return new BotChatResponseSpeech(ctx, speaker, msg);
            }
        };
        if (speaker === 'user') {
            this.model['response-speech-tail-person'] = {
                child:  function () {
                    return new BotChatResponseSpeechTail(ctx);
                }
            };
        }
    };
    BotChatResponse.prototype = $.bit('list_item');

    BotThought = function (ctx, speaker, msg) {
        var $this, lines, line, chat_response_line, i;
        $this = this;
        this.init(ctx);
        lines = msg.split('\n');
        this.params.class_ = 'thought-bubble hidden';

        chat_response_line = function (_line) {
            return new BotChatResponseLine(ctx, _line);
        };

        this.model = {};
        for (i = 0; i === lines.length; i += 1) {
            line = lines[i];
            this.model['bot-line-' + line] = {
                child: chat_response_line,
                args: [lines[line]]
            };
        }
    };
    BotThought.prototype = $.bit('widget');

    EventMessage = function (ctx, type, msg) {
        var $this, lines, line;
        $this = this;
        this.init(ctx);
        lines = msg.split('\n');
        this.params.class_ = 'event-' + type;
        this.model = {};
        this.model.short_thought = {
            args: [msg],
            child:  function (_m) {
                var title = $.bit('title').init(ctx);
                title.params.type = 'h3';
                title.model.title_link = {
                    args: [_m],
                    child:  function (_msg) {
                        var title_link;
                        title_link = $.bit('link').init(ctx);
                        title_link.after_add = function () {
                            this.$.click(function (evt) {
                                evt.preventDefault();
                                $this.kids.thought.toggle('hidden');
                            });
                        };
                        title_link.params.content_ = _msg.slice(0, 23) + '...';
                        return title_link;
                    }
                };
                return title;
            }
        };

        this.model.thought = {
            child: function () {
                return new BotThought(ctx, type, msg);
            }
        };
    };
    EventMessage.prototype = $.bit('list_item');

    BotEvents = function (ctx) {
        var $this, i, add_event;
        this.init(ctx);
        $this = this;
        i = 0;
        add_event = function (resp) {
            $this.add('event-' + i,
                      new EventMessage(ctx, 'admin', resp),
                      $this.$,
                      null,
                      0);
            i += 1;
        };

        ctx.signal('listen', 'bot-listen', function (msg) {
            add_event(msg);
        });
    };
    BotEvents.prototype = $.bit('list');

    BotChat = function (ctx) {
        var $this, i;
        this.init(ctx);
        $this = this;
        i = 0;
        ctx.signal('listen', 'close-sessions', function (resp) {
            var kid, i;
            for (i = 0; i === $this.kids.length; i += 1) {
                kid = $this.kids[i];
                $this.destroy(kid);
            }
        });

        ctx.signal('listen', 'speak', function (resp) {
            ctx.signal('emit', 'open-panel', 'west');
            $this.add('response-' + i,
                      new BotChatResponse(ctx, 'user', resp),
                      $this.$,
                      null,
                      0);
        });

        ctx.signal('listen', 'respond', function (resp) {
            if (resp) {
                if (resp === 'What is your password?') {
                    ctx.signal('emit', 'ask-password');
                }
                ctx.signal('emit', 'open-panel', 'west');
                $this.add('response-' + i,
                          new BotChatResponse(ctx, 'bot', resp),
                          $this.$,
                          null,
                          0);
            }
        });
    };
    BotChat.prototype = $.bit('list');

    BotEarLeft = function (ctx) {
        var $this;
        this.init(ctx);
        $this = this;
        this.model = {
            'bot-chat': {
                child: function () {
                    return new BotChat(ctx);
                }
            }
        };
        //this.ctx.data('active').widgets['bit.bot.shell'] = year + ':' + month
    };
    BotEarLeft.prototype = $.bit('widget');

    BotEarRight = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot-events': {
                child: function () {
                    return new BotEvents(ctx);
                }
            }
        };
    };
    BotEarRight.prototype = $.bit('widget');

    PanelBot = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot': {
                child: function () {
                    return new Bot(ctx);
                }
            }
        };
    };
    PanelBot.prototype = $.bit('panel');

    PanelBotBrain = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot-brain': {
                child: function () {
                    return new BotBrain(ctx);
                }
            }
        };
    };
    PanelBotBrain.prototype = $.bit('panel');

    PanelBotFeet = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot-feet': {
                child:  function () {
                    return new BotFeet(ctx);
                }
            }
        };
    };
    PanelBotFeet.prototype = $.bit('panel');

    PanelBotEarLeft = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot-mini': {
                child: function () {
                    return new BotEarLeft(ctx);
                }
            }
        };
    };
    PanelBotEarLeft.prototype = $.bit('panel');

    PanelBotEarRight = function (ctx) {
        var $this;
        $this = this;
        this.init(ctx);
        this.model = {
            'bot-right': {
                child: function () {
                    return new BotEarRight(ctx);
                }
            }
        };
    };
    PanelBotEarRight.prototype = $.bit('panel');

    BitBot = {
        init: function (option) {
            return this;
        },
        activity: 'bot',
        plugin: 'base',
        template_url: '/jplates/jtk-elements.html',
        templates: {},
//      templates: {'http://localhost:8080/bitonomy/jtk-elements.html':['jtk-panel', 'jtk-widget', 'jtk-title'
//                                                                      , 'jtk-list', 'jtk-list-item', 'jtk-link'
//                                                                      , 'jtk-button', 'jtk-image']},   
        renderCenter: function (ctx, element, cb) {
            var cbelement;
            if (!element.has_child('bot')) {
                //console.log('adding center panel')
                cbelement = function (res) {
                    //console.log('added center panel')
                    if (cb) {
                        cb();
                    }
                };
                element.add('bot-panel',
                            new PanelBot(ctx),
                            element.element, cbelement);
            } else {
                element.kids.bot.update();
            }
        },

        renderTop: function (ctx, element, cb) {
            var cbelement;
            if (!element.has_child('bot-brain')) {
                //console.log('adding top panel')
                cbelement = function (res) {
                    //console.log('added top panel')
                    if (cb) {
                        cb();
                    }
                };
                element.add('bot-brain',
                            new PanelBotBrain(ctx),
                            element.element, cbelement);
            } else {
                element.kids['bot-brain'].update();
            }
        },

        renderLeft: function (ctx, element, cb) {
            var cbelement;
            if (!element.has_child('bot-ear-left')) {
                //console.log('adding top panel')
                cbelement = function (res) {
                    //console.log('added top panel')
                    if (cb) {
                        cb();
                    }
                };
                element.add('bot-ear-left',
                            new PanelBotEarLeft(ctx),
                            element.element, cbelement);
            } else {
                element.kids['bot-ear-left'].update();
            }
        },

        renderBottom: function (ctx, element, cb) {
            var cbelement;
            if (!element.has_child('bot-feet')) {
                //console.log('adding top panel')
                cbelement = function (res) {
                    //console.log('added top panel')
                    if (cb) {
                        cb();
                    }
                };
                element.add('bot-feet',
                            new PanelBotFeet(ctx),
                            element.element, cbelement);
            } else {
                element.kids['bot-feet'].update();
            }
        },

        renderRight: function (ctx, element, cb) {
            var cbelement;
            if (!element.has_child('bot-ear-right')) {
                //console.log('adding top panel')
                cbelement = function (res) {
                    //console.log('added top panel')
                    if (cb) {
                        cb();
                    }
                };
                element.add('bot-ear-right',
                            new PanelBotEarRight(ctx),
                            element.element, cbelement);
            } else {
                element.kids['bot-ear-right'].update();
            }
        },

        updateFrame: function (ctx, cb) {
            var content, _cb, counter, sides, side, i;
            console.log('bit-bot: updateFrame ', this);
            content = ctx.data('frame').kids['content-panel'];
            //console.log(cb)
            _cb = function () {
                counter -= 1;
                if (counter === 0) {
                    //console.log('frame panels loaded')
                    if (cb) {
                        cb();
                    }
                }
            };
            counter = 4;
            sides = {
                north: this.renderTop,
                west: this.renderLeft,
                center: this.renderCenter,
                east: this.renderRight,
                south: this.renderBottom
            };
            for (side in sides) {
                if (sides.hasOwnProperty(side)) {
                    try {
                        sides[side](ctx, content.kids['ui-layout-' + side], _cb);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        },

        renderFrame: function (ctx, cb) {
            var $this, counter, panelsLoaded, loadPanels, loadContent;
            console.log('bit-bot: renderFrame ', this);
            $this = this;
            counter = 5;
            panelsLoaded = function (panel) {
                var layout;
                counter -= 1;
                if (counter === 0) {
                    layout = panel.parent.element.layout({ slidable: true,
                                                           closable: true,
                                                           west__resizable: false,
                                                           west__togglerLength_open: 0,
                                                           west__togglerLength_closed: 0,
                                                           west__spacing_open: 0,
                                                           west__spacing_closed: 0,
                                                           north__resizable: false,
                                                           north__closable: false,
                                                           north__initClosed: false,
                                                           north__togglerLength_open: 0,
                                                           north__spacing_open: 0,
                                                           north__spacing_closed: 0,
                                                           east__resizable: false,
                                                           east__initClosed: true,
                                                           east__togglerLength_open: 0,
                                                           east__spacing_open: 0,
                                                           east__spacing_closed: 0,
                                                           south__resizable: false,
                                                           south__closable: true,
                                                           south__initClosed: false,
                                                           south__togglerLength_open: 200,
                                                           south__togglerLength_closed: 200,
                                                           south__spacing_open: 2,
                                                           south__spacing_closed: 5,
                                                           initClosed: true});
                    layout.sizePane('north', 36);
                    layout.sizePane('south', 36);
                    layout.sizePane('west',  350);
                    layout.sizePane('east',  350);
                    if (cb) {
                        cb();
                    }

                    ctx.signal('listen', 'close-panel', function (resp) {
                        layout.close(resp);
                    });

                    ctx.signal('listen', 'open-panel', function (resp) {
                        layout.open(resp);
                    });

                    ctx.signal('listen', 'toggle-panel', function (resp) {
                        //console.log('toggle ' + resp)
                        layout.toggle(resp);
                    });
                }
            };

            loadPanels = function (panel) {
                var sides, side;
                sides = ['north', 'east', 'center', 'west', 'south'];
                for (side in sides) {
                    if (sides.hasOwnProperty(side)) {
                        panel.add('ui-layout-' + sides[side],
                                  $.bit('panel').init(ctx),
                                  panel.element,
                                  panelsLoaded);
                    }
                }
            };

            loadContent = function (frame) {
                frame.add('content-panel',
                          $.bit('panel').init(ctx),
                          frame.element,
                          loadPanels);
            };

            //console.log('attaching frame')
            $.bit('frame').attach(ctx, 'bitFrame', loadContent);
            return this;
        },

        updatePlugin: function (ctx, cb) {
            var bit, frame, active, pluginid, activity, counter, complete;
            console.log('bit-bot: updatePlugin ', this);
            bit = ctx.data('bit');
            frame = ctx.data('frame');
            active = ctx.data('active');
            pluginid = this.plugin;
            activity = this.activity;
            counter = 0;
            complete = function () {
                counter -= 1;
                if (counter === 0) {
                    //console.log('finished updating plugin ' + pluginid)
                    //console.log(counter)
                    if (cb) {
                        cb();
                    }
                }
            };
        }
    };
    $.bit('plugins').register_plugins({
        'bit.bot.base': BitBot.init()
    });
}(jQuery));
