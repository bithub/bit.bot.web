

import os

from zope.interface import implements
from twisted.web import static

from bit.bot.common.interfaces import IHTMLResources, IWebHTML
from bit.bot.web.resource import BotResource

class BotHTMLResources(object):
    implements(IHTMLResources)
    def __init__(self,dir):
        self.dir = dir
        self._root = static.File(self.dir)

    @property
    def root(self):
        return self._root

    def resource(self,*la):
        resource = self._root
        if len(la)>1:
            for child in la[:-1]:
                resource = resource.children[child]
        return os.path.join(resource.path,la[-1])



class BotHTML(BotResource):
    implements(IWebHTML)

    _ext = ['html']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)


