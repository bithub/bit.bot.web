
from zope.interface import implements
from bit.bot.common.interfaces import IWebImages

from bit.bot.web.resource import BotResource

class BotImages(BotResource):
    implements(IWebImages)
    _ext = ['png','jpg','jpeg','gif']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)

