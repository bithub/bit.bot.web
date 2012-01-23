

from twisted.web.resource import Resource


class BotResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    def render_GET(self, request):
        return "<dl>%s</dl>" %''.join(["<dt>%s</dt><dd>%s</dd>"%(k,v) for k,v in self.children.items()])

