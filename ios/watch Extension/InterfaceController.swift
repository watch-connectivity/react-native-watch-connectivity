//
//  InterfaceController.swift
//  watch Extension
//
//  Created by Michael Ford on 30/04/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import WatchKit
import WatchConnectivity
import Foundation

class InterfaceController: WKInterfaceController, WCSessionDelegate {
  @IBOutlet weak var label: WKInterfaceLabel!

  var session: WCSession?
  
  override func awakeWithContext(context: AnyObject?) {
    super.awakeWithContext(context)
    if WCSession.isSupported() {
      print("Activating watch session")
      self.session = WCSession.defaultSession()
      self.session?.delegate = self
      self.session?.activateSession()
    }
  }

  override func willActivate() {
    super.willActivate()
  }

  override func didDeactivate() {
    super.didDeactivate()
  }

  func session(session: WCSession, didReceiveMessage message: [String : AnyObject], replyHandler: ([String : AnyObject]) -> Void) {
    print("watch received message", message);
    let text = message["text"] as! String
    self.label.setText(text)
  }

}
