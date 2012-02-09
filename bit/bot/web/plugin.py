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

class BotWeb(BotPlugin):
    implements(IPlugin)
    name = 'bit.bot.web'
    _http = {'root': 'resources'}

    def load_CSS(self):
        css = getUtility(IResourceRegistry,'css')
        css.add('base.css',{'rel':'link'})
        css.add('bit-bot.css',{'rel':'link'})
        css.add('bitonomy.css',{'rel':'link'})
        css.add('bitonomy.ui.theme.css',{'rel':'link'})

    def load_JS(self):
        js = getUtility(IResourceRegistry,'js')
        js.add('jquery-min.js',{'rel':'link'})
        js.add('jquery.tmpl.min.js',{'rel':'link'})
        js.add('jquery.ui.min.js',{'rel':'link'})
        js.add('jquery.ui.layout.js',{'rel':'link'})
        js.add('jquery.signal.js',{'rel':'link'})
        js.add('jplates/jquery.jplates.js',{'rel':'link'})
        js.add('jtk/jquery.jtk.js',{'rel':'link'})
        js.add('date.js',{'rel':'link'})
        js.add('base64.js',{'rel':'link'})
        js.add('websock.js',{'rel':'link'})
        js.add('bit/jquery.bit.js',{'rel':'link'})
        js.add('bot.js',{'rel':'link'})
        js.add('bit-bot.js',{'rel':'link'})
        js.add('bit-agents.js',{'rel':'link'})
        js.add('bit-repo.js',{'rel':'link'})
        
    def load_adapters(self):
        provideAdapter(WebPlugin,[IPlugin,],IPluginExtender,'web')        
        provideAdapter(WebCSS,[IWebCSS,],IWebResource)        
        provideAdapter(WebJS,[IWebJS,],IWebResource)        
        provideAdapter(BotImages,[IHTTPRoot,],IHTTPResource,name='images')
        provideAdapter(BotCSS,[IHTTPRoot,],IHTTPResource,name='css')
        provideAdapter(BotJS,[IHTTPRoot,],IHTTPResource,name='js')
        provideAdapter(BotHTML,[IHTTPRoot,],IHTTPResource,name='html')
        provideAdapter(BotJPlates,[IHTTPRoot,],IHTTPResource,name='jplates')
        provideAdapter(BotFavicon,[IHTTPRoot,],IHTTPResource,name='favicon.ico')

    @property
    def utils(self):
        root = getUtility(IHTTPRoot)
        return [(BotHTMLResources(os.path.join(os.path.dirname(__file__),'html'))
                 ,IHTMLResources)
                ,(JPlates(os.path.join(os.path.dirname(__file__),'jplates'))
                  ,IJPlates)
                ,(WebRoot(),IWebRoot)
                ,(JSRegistry(),['js',IResourceRegistry])
                ,(CSSRegistry(),['css',IResourceRegistry])
                ,(getAdapter(root,IHTTPResource,'images'),['images',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'js'),['js',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'css'),['css',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'jplates'),['jplates',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'html'),['html',IHTTPRoot])
                ,(getAdapter(root,IHTTPResource,'favicon.ico'),['favicon.ico',IHTTPRoot])
                ]
    


