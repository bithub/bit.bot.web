(function ($) {
    "use strict";
    var signal_methods = {
        init: function (options) {
            if (!this.data('__signal_handler')) {
                this.data('__signal_handler', {});
            }
            return this;
        },
        listen: function (event, cb) {
            var listener;
            listener = this.data('__signal_handler');
            if (listener[event]) {
                listener[event].push(cb);
            } else {
                listener[event] = [];
                listener[event].push(cb);
            }
            this.data('__signal_handler', listener);
            return this;
        },
        emit: function (event, resp) {
            var listener, cb;
            listener = this.data('__signal_handler');
            if (listener[event]) {
                console.log('signal: ', event, resp);
                for (cb in listener[event]) {
                    if (listener[event].hasOwnProperty(cb)) {
                        listener[event][cb](resp);
                    }
                }
            }
            return this;
        },
        transmit: function (event, resp) {
            var listener;
            listener = this.data('__signal_handler');
            this.emit('tramsmit', resp[0]);
            return this;
        }
    };

    $.fn.signal = function (method) {
        var result;
        if (signal_methods[method]) {
            result = signal_methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            result = signal_methods.init.apply(this, arguments);
        } else {
            result = $.error('Method ' +  method + ' does not exist on jQuery.bitonomy');
        }
        return result;
    };
}(jQuery));


