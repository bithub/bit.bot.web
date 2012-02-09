
from zope.interface import implements
from zope.component import getUtility
from bit.bot.common.interfaces import IWebJS, IResourceRegistry, IHTTPRoot, IWebResource

from bit.bot.http.resource import BotResource

from bit.bot.web.registry import ResourceRegistry

class WebJS(object):
    _meta = {}
    def __init__(self,resource):
        self.resource = resource

    def update(self,upd):
        self._meta.update(upd)

    def render(self):
        return '<script type="%s" src="/js/%s"></script>\n'%("text/javascript"
                                                            ,self._meta['path'])

class JSRegistry(ResourceRegistry):
    implements(IResourceRegistry)

    _resources = []
    _res_meta = {}
    def add(self, resid, options):
        self._resources.append(resid)
        if options:
            self._res_meta[resid] = options

    @property
    def resources(self):
        js = getUtility(IHTTPRoot,'js')
        for _resid in self._resources:
            parts = _resid.split('/')                
            resid = parts.pop()
            folder = js            
            if len(parts):
                for part in parts:
                    folder = folder.children[part]                
            if resid in folder.children:
                resource = IWebResource(js)
                resource.update(dict(path=_resid
                                     ,resource=folder.children[resid]))
                if resid in self._res_meta:
                    resource.update(self._res_meta[resid])
                yield resource


class BotJS(BotResource):
    implements(IWebJS)
    _ext = ['js','swf']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)

