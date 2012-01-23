from zope.component import getUtility
from twisted.web import server
from twisted.web.resource import Resource

from bit.bot.common.interfaces import IWebImages, IWebCSS, IWebJS, IWebHTML, IWebJPlates, ISessions

class WebSession(Resource):

    def render_GET(self, request):
        sessionid = request.path.strip('/').strip()
        def _gotSession(resp):
            html = getUtility(IWebHTML)
            if resp:                
                request.args['sessionid'] = [sessionid,]
                request.write(html.children['bot.html'].render_GET(request))
            else:
                request.write(html.children['missing.html'].render_GET(request))                                
            request.finish()
        if sessionid:
            getUtility(ISessions).session(sessionid).addCallback(_gotSession)

        return server.NOT_DONE_YET
    

class WebRoot(Resource):

    def render_GET(self, request):
        html = getUtility(IWebHTML)
        return html.children['bot.html'].render_GET(request)

    def getChild(self,name,request):
        if name == '':
            return self

        if name == 'images':
            return getUtility(IWebImages)

        if name == 'js':
            return getUtility(IWebJS)

        if name == 'css':
            return getUtility(IWebCSS)

        if name == 'jplates':
            return getUtility(IWebJPlates)

        if name == '_html':
            return getUtility(IWebHTML)
            
        return WebSession()
