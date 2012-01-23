
from zope.interface import implements
from bit.bot.common.interfaces import IWebCSS

from bit.bot.web.resource import BotResource

class BotCSS(BotResource):
    implements(IWebCSS)
