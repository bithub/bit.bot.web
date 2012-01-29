
from zope.interface import implements
from bit.bot.common.interfaces import IWebCSS

from bit.bot.web.resource import BotResource

class BotCSS(BotResource):
    implements(IWebCSS)
    _ext = ['css']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)
