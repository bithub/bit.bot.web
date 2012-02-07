
from zope.interface import implements
from zope.component import getUtility

from bit.bot.common.interfaces import IWebImages, IHTTPRoot

from bit.bot.http.resource import BotResource

from twisted.web.resource import Resource



class BotImages(BotResource):
    implements(IWebImages)
    _ext = ['png','jpg','jpeg','gif','ico']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)

class BotFavicon(Resource):
    implements(IWebImages)
    def __init__(self,root):
        self.root = root
        Resource.__init__(self)

    def render_GET(self, request):
        images = getUtility(IHTTPRoot, 'images')
        return images.children['favicon.ico'].render_GET(request)





