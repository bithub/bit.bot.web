from zope.component import getUtility, queryAdapter
from twisted.web import server
from twisted.web.resource import Resource

from bit.bot.common.interfaces import IWebImages, IWebCSS, IWebJS, IWebHTML, IWebJPlates, ISessions, IHTTPResource, IHTTPRoot

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
        html = getUtility(IHTTPRoot,'html')
        return html.children['bot.html'].render_GET(request)

    def getChild(self,name,request):
        if name == '':
            return self
        
        return getUtility(IHTTPRoot,name)
