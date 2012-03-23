(function ($) {
    "use strict";
    var bit_url, bit_bit, Plugin, PluginRegistry, plugin_cache, bit_registry, bit_methods;
    bit_url = function () {
        try {
            var active = this.ctx.data('active');
        } catch (err) {
            console.log(this);
        }
        return $.bit('plugins').plugins()['bit.' + active.activity + '.' + active.plugin].template_url;
    };

    bit_bit = function () {
        return this.data('bit');
    };

    plugin_cache = {};

    PluginRegistry = function () {
        var plugin, i;

        this.register_plugins = function (plugins) {
            for (i = 0; i === plugins.length; i += 1) {
                plugin = plugins[i];
                plugin_cache[plugin] = plugins[plugin];
            }
        };

        this.plugins = function () {
            return plugin_cache;
        };
        return this;
    };

    Plugin = function () {

        this.init = function (option) {
            return this;
        };

        this.load_activity = function (option) {
            return this;
        };

        this.load_activity_menus = function (option) {
            return this;
        };

        this.load_activity_button = function (option) {
            var button = {
                icon: '/images/activity.png',
                title: 'Activity'
            };
            return button;
        };
        return this;
    };

    bit_methods = {
        plugins: function () {
            return new PluginRegistry;
        },
        plugin: function () {
            return new Plugin;
        }
    };

    $.extend({
        bit: function (method) {
            var result, jtk;
            if (bit_methods[method]) {
                result = bit_methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                try {
                    jtk = $.jtk(method);
                    jtk.getURL = bit_url;
                    jtk.bit = bit_bit;
                    result = jtk;
                } catch (err) {
                }
            }
            if (!result) {
                if (typeof method === 'object' || !method) {
                    result = bit_methods.init.apply(this, arguments);
                } else {
                    result = $.error('Method ' +  method + ' does not exist on jQuery.bit');
                }
            }
            return result;
        }
    });
}(jQuery));
