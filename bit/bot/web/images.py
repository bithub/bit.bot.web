
from zope.interface import implements
from bit.bot.common.interfaces import IWebImages

from bit.bot.web.resource import BotResource

class BotImages(BotResource):
    implements(IWebImages)
