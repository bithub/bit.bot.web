import os
from zope.interface import implements

from bit.core.interfaces import IPlugin
from bit.bot.common.interfaces import IHTMLResources,IWebImages,IWebCSS,IWebJS,IWebJPlates,IWebHTML,IJPlates,IWebRoot
from bit.bot.base.plugin import BotPlugin

from bit.bot.web.root import WebRoot
from bit.bot.web.html import BotHTML, BotHTMLResources
from bit.bot.web.images import BotImages
from bit.bot.web.css import BotCSS
from bit.bot.web.js import BotJS
from bit.bot.web.jplates import BotJPlates, JPlates

class BotWeb(BotPlugin):
    implements(IPlugin)
    name = 'bit.bot.web'
    _http = {'root': 'resources'}
    @property
    def utils(self):
        return [(BotHTMLResources(os.path.join(os.path.dirname(__file__),'html'))
                 ,IHTMLResources)
                ,(WebRoot(),IWebRoot)
                ,(BotImages(),IWebImages)
                ,(BotCSS(),IWebCSS)
                ,(BotJS(),IWebJS)
                ,(BotHTML(),IWebHTML)
                ,(JPlates(os.path.join(os.path.dirname(__file__),'jplates'))
                  ,IJPlates)
                ,(BotJPlates(),IWebJPlates)]

