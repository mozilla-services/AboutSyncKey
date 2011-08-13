/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Show Sync Key.
 *
 * The Initial Developer of the Original Code is
 * Philipp von Weitershausen <philipp@weitershausen.de>
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

const RESOURCE_HOST = "showsynckey";

XPCOMUtils.defineLazyGetter(this, "gResProtocolHandler", function () {
  return Services.io.getProtocolHandler("resource")
                 .QueryInterface(Ci.nsIResProtocolHandler);
});

function startup(data, reason) {
  // Register the resource:// alias.
  gResProtocolHandler.setSubstitution(RESOURCE_HOST, data.resourceURI);
  Components.manager.addBootstrappedManifestLocation(data.installPath);
  AboutShowSyncKey.register();
}

function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN) {
    return;
  }

  AboutShowSyncKey.unload();
  Components.manager.removeBootstrappedManifestLocation(data.installPath);
  gResProtocolHandler.setSubstitution(RESOURCE_HOST, null);
}


const AboutShowSyncKey = {
  classID: Components.ID("bf435e1c-b535-4606-87b8-21dfe133988a"),

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule,
                                         Ci.nsISupportsWeakReference]),

  getURIFlags: function getURIFlags(aURI) {
    return 0;
  },

  newChannel: function newChannel(aURI) {
    let uri = Services.io.newURI("chrome://showsynckey/content/synckey.xhtml",
                                 null, null);
    let channel = Services.io.newChannelFromURI(uri);
    channel.originalURI = aURI;
    return channel;
  },

  // XPCOM crap

  // nsIFactory
  createInstance: function createInstance(outer, iid) {
    if (outer != null) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return this.QueryInterface(iid);
  },

  register: function register() {
    let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
    registrar.registerFactory(
      this.classID, "AboutShowSyncKey",
      "@mozilla.org/network/protocol/about;1?what=synckey", this);
  },

  unload: function unload() {
    let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
    registrar.unregisterFactory(this.classID, this);
  },
};
