import os

from zope.interface import implements, implementer
from zope.component import getAdapter, getUtility

from bit.bot.common.interfaces import IWebJPlates, IJPlates
from bit.bot.http.interfaces import IHTTPResource, IHTTPRoot
from bit.bot.web.html import BotHTMLResources
from bit.bot.http.resource import BotResource


class BotJPlates(BotResource):
    implements(IWebJPlates, IHTTPResource)
    _ext = ['html']

    def __init__(self,root):
        self.root = root
        BotResource.__init__(self)


class JPlates(BotHTMLResources):
    implements(IJPlates)


@implementer(IHTTPRoot)
def botJPlates():
    root = getUtility(IHTTPRoot)
    return getAdapter(root, IHTTPResource,'jplates')


@implementer(IJPlates)
def botJPlatesResources():
    return JPlates(os.path.join(os.path.dirname(__file__)))
