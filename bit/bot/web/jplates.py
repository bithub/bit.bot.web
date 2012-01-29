
from zope.interface import implements
from bit.bot.common.interfaces import IWebJPlates, IJPlates

from bit.bot.web.html import BotHTMLResources
from bit.bot.http.resource import BotResource

class BotJPlates(BotResource):
    implements(IWebJPlates)
    _ext = ['html']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)



class JPlates(BotHTMLResources):
    implements(IJPlates)
