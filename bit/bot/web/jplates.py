
from zope.interface import implements
from bit.bot.common.interfaces import IWebJPlates, IJPlates

from bit.bot.web.html import BotHTMLResources
from bit.bot.web.resource import BotResource

class BotJPlates(BotResource):
    implements(IWebJPlates)

class JPlates(BotHTMLResources):
    implements(IJPlates)
