
from zope.component import getUtility, queryAdapter

from twisted.web import server
from twisted.web.resource import Resource

from bit.bot.common.interfaces import IWebImages, IWebCSS, IWebJS, IWebHTML, IWebJPlates, ISessions, IHTTPResource, IHTTPRoot, IResourceRegistry

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
        request.write('<html>\n<head>\n')
        for css in getUtility(IResourceRegistry,'css').resources:
            request.write(css.render())
        for js in getUtility(IResourceRegistry,'js').resources:
            request.write(js.render())
        request.write("""
    <script>
      (function( $ ) {  	
      $(document).ready(function() {	
      $('#bot').bot({wss:'wss://b0b.3ca.org.uk:8383'});
      });
      })( jQuery );
    </script>\n""")
        request.write('</head>\n<body>\n')
        request.write("""
    <div class="page">
      <div class="wrapper">
	<div id="bot">
	</div>
      </div>
    </div>\n""")
        request.write('</body>\n</html>\n')
        request.finish()
        return server.NOT_DONE_YET

    def getChild(self,name,request):
        if name == '':
            return self
        
        return getUtility(IHTTPRoot,name)
