//
//  DataSource.swift
//  app
//
//  Created by Michael Ford on 28/11/2015.
//  Copyright © 2015 Facebook. All rights reserved.
//

import WatchKit
import WatchConnectivity

class WatchBridge: NSObject, WCSessionDelegate {
  static let sharedInstance = WatchBridge()

  override init() {
    super.init()
    if WCSession.isSupported() {
      print("Activating watch session")
      let session: WCSession = WCSession.defaultSession()
      session.delegate = self
      session.activateSession()
    }
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  // Messages
  ////////////////////////////////////////////////////////////////////////////////

  func sendMessage(message: [String:AnyObject], replyHandler: ([String:AnyObject]) -> Void) {
    let session: WCSession = WCSession.defaultSession()
    print("sending message", message)
    session.sendMessage(message, replyHandler: replyHandler, errorHandler: {(err) in print("Error", err)})
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(session: WCSession, didReceiveMessage message: [String:AnyObject], replyHandler: ([String:AnyObject]) -> Void) {
    print("watch received message", message);
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  // Reachability
  ////////////////////////////////////////////////////////////////////////////////

  func sessionReachabilityDidChange(session: WCSession) {
    print(session.reachable ? "Session is now reachable." : "Session is no longer reachable.");
  }
  
  ////////////////////////////////////////////////////////////////////////////////

}