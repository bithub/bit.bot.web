
import zope
import bit

from zope.i18nmessageid import MessageFactory
_ = MessageFactory('bit.core')

class ICSSDirective(zope.interface.Interface):
    """
    Define a css
    """
    name = zope.schema.TextLine(
        title=_("CSS file name"),
        description=_("The name of this CSS resource"),       
        required=True,
        )
    rel = zope.schema.TextLine(
        title=_("Relationship"), 
        description=_("The css path"),       
        required=False,
        )

def css(_context, name, rel=None):
    _context.action(
        discriminator = None,
        callable = zope.component.getUtility(bit.bot.common.interfaces.IResourceRegistry,'css').add,
        args = (name,{'rel': rel or 'link'})
        )
        

class IJSDirective(zope.interface.Interface):
    """
    Define a js
    """
    name = zope.schema.TextLine(
        title=_("JS file name"),
        description=_("The name of this JS resource"),       
        required=True,
        )
    rel = zope.schema.TextLine(
        title=_("Relationship"), 
        description=_("The js path"),       
        required=False,
        )

def js(_context, name, rel=None):
    _context.action(
        discriminator = None,
        callable = zope.component.getUtility(bit.bot.common.interfaces.IResourceRegistry,'js').add,
        args = (name,{'rel': rel or 'link'})
        )
        
