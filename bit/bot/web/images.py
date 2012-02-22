
from zope.interface import implements, implementer
from zope.component import getUtility, getAdapter

from bit.bot.common.interfaces import IWebImages, IHTTPRoot, IHTTPResource

from bit.bot.http.resource import BotResource

from twisted.web.resource import Resource



class BotImages(BotResource):
    implements(IWebImages,IHTTPResource)
    _ext = ['png','jpg','jpeg','gif','ico','svg']

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

@implementer(IHTTPRoot)
def botImages():
    root = getUtility(IHTTPRoot)
    return getAdapter(root,IHTTPResource,'images')

@implementer(IHTTPRoot)
def botFavicon():
    root = getUtility(IHTTPRoot)
    return getAdapter(root,IHTTPResource,'favicon.ico')




