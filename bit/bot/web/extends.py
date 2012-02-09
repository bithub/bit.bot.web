
import os, inspect

from zope.interface import implements
from zope.component import getUtility, provideAdapter, queryUtility
from bit.core.interfaces import IConfiguration, IPlugin, ISockets, IPluginExtender
from bit.bot.common.interfaces import IHTTPRoot

class WebPlugin(object):
   implements(IPluginExtender)
   def __init__(self,plugin):
      self.plugin = plugin

   def extend(self):
      if hasattr(self.plugin,'load_CSS'):
         getattr(self.plugin,'load_CSS')()      

      if hasattr(self.plugin,'load_JS'):
         getattr(self.plugin,'load_JS')()      

