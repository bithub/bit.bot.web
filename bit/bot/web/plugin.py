import os
from zope.interface import implements
from zope.component import provideAdapter, queryUtility, getUtility, getAdapter

from bit.core.interfaces import IPlugin, IPluginExtender
from bit.bot.common.interfaces import IHTTPRoot,IHTTPResource,IHTMLResources,IWebImages,IWebCSS,IWebJS,IWebJPlates,IWebHTML,IJPlates,IWebRoot,IResourceRegistry,IWebResource
from bit.bot.base.plugin import BotPlugin

from bit.bot.web.root import WebRoot
from bit.bot.web.html import BotHTML, BotHTMLResources
from bit.bot.web.images import BotImages, BotFavicon
from bit.bot.web.css import BotCSS, CSSRegistry, WebCSS
from bit.bot.web.js import BotJS, JSRegistry, WebJS
from bit.bot.web.jplates import BotJPlates, JPlates
from bit.bot.web.extends import WebPlugin




    


