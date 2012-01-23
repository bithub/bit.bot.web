
from zope.interface import implements
from bit.bot.common.interfaces import IWebJS

from bit.bot.web.resource import BotResource

class BotJS(BotResource):
    implements(IWebJS)
