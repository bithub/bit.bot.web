import os
from zope.interface import implements
from zope.component import provideAdapter, queryUtility, getUtility, getAdapter

from bit.core.interfaces import IPlugin
from bit.bot.common.interfaces import IHTTPRoot,IHTTPResource,IHTMLResources,IWebImages,IWebCSS,IWebJS,IWebJPlates,IWebHTML,IJPlates,IWebRoot
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

    def load_adapters(self):
        provideAdapter(BotImages,[IHTTPRoot,],IHTTPResource,name='images')
        provideAdapter(BotCSS,[IHTTPRoot,],IHTTPResource,name='css')
        provideAdapter(BotJS,[IHTTPRoot,],IHTTPResource,name='js')
        provideAdapter(BotHTML,[IHTTPRoot,],IHTTPResource,name='html')
        provideAdapter(BotJPlates,[IHTTPRoot,],IHTTPResource,name='jplates')

    @property
    def utils(self):
        root = getUtility(IHTTPRoot)
        return [(BotHTMLResources(os.path.join(os.path.dirname(__file__),'html'))
                 ,IHTMLResources)
                ,(JPlates(os.path.join(os.path.dirname(__file__),'jplates'))
                  ,IJPlates)
                ,(WebRoot(),IWebRoot)
                ,(getAdapter(root,IHTTPResource,'images'),['images',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'js'),['js',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'css'),['css',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'jplates'),['jplates',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'html'),['html',IHTTPRoot])
                ]
    
