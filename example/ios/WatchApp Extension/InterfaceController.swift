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
import ClockKit

class InterfaceController: WKInterfaceController, WCSessionDelegate {
  @IBOutlet weak var label: WKInterfaceLabel!
  @IBOutlet weak var pings: WKInterfaceLabel!
  @IBOutlet weak var image: WKInterfaceImage!

  var session: WCSession?

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    print("Did activate")
  }

  override func awake(withContext context: Any?) {
    super.awake(withContext: context)
    if WCSession.isSupported() {
      print("Activating watch session")
      self.session = WCSession.default
      self.session?.delegate = self
      self.session?.activate()
    }
  }

  override func willActivate() {
    super.willActivate()
  }

  override func didDeactivate() {
    super.didDeactivate()
  }

  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    print("watch received message", message);

    let isTest: Bool = message["test"] as? Bool ?? false

    if (isTest) {
      let text = message["text"] as? String

      if (text == "Reply to this message") {
        let response = ["text": "Here is your reply"]
        print("replying with", response)
        replyHandler(["text": "Here is your reply"])
      } else if (text == "Send me a message, please") {
        let session: WCSession = self.session!

        session.sendMessage(["text": "Here's your message"], replyHandler: { (response) in
          print("Reply: %@", response);
          if (response["text"] as! String == "And here's a response") {
            session.sendMessage(["text": "Received your reply!"], replyHandler: { response in
              print("Response: %@", response);
            })
          }
        }, errorHandler: { (error) in
          print("Error sending message: %@", error)
        })
      } else if (text == "send me some user info") {
        session.transferUserInfo(["uid": "xyz", "name": "bob", "email": "bob@example.com"])
        replyHandler(["text": "sent you some user info!"])
      } else if (text == "send me some more user info") {
        session.transferUserInfo(["uid": "abc", "name": "mike", "email": "mike@example.com"])
        replyHandler(["text": "sent you some more user info!"])
      } else if (text == "send me some application context") {
        do {
          try session.updateApplicationContext(message["context"] as! [String: Any])
          print("updated the application context")
        } catch {
          print("Unexpected error when updating application context: \(error).")
        }
      }
    } else {
      if (message["ping"] != nil) {
        ComplicationState.shared.incPings();
        self.pings.setText("\(ComplicationState.shared.pings) pings")
        print("sending pong")
        replyHandler(["pong": true])
      } else {
        let text = message["text"] as! String
        if (text == "update complications") {
          self.updateComplications()
        } else {
          let timestamp: Double = (message["timestamp"] as! NSNumber).doubleValue
          ComplicationState.shared.message = text;
          self.label.setText(text)
          let currentTimestamp: Double = Date().timeIntervalSince1970 * 1000
          let elapsed: Double = currentTimestamp - timestamp
          replyHandler(["elapsed": Int(elapsed), "timestamp": round(currentTimestamp)])
          self.updateComplications()
        }
      }
    }
  }

  func session(
    _ session: WCSession,
    didReceiveMessageData messageData: Data,
    replyHandler: @escaping (Data) -> Void
  ) {
    let currentTimestamp: Double = Date().timeIntervalSince1970 * 1000

    let str = String(data: messageData, encoding: .utf8)

    print("recevied message data %@", str as Any)

    if (str == "hello") {
      let utf8str = "hi there".data(using: .utf8)
      print("sending message data %@", utf8str as Any)
      replyHandler(utf8str!)
    } else {
      let decodedData = Data(base64Encoded: messageData, options: NSData.Base64DecodingOptions(rawValue: 0))
      self.image.setImageData(decodedData)
      let json: String = JSONStringify(["currentTimestamp": currentTimestamp])
      let data: Data = json.data(using: String.Encoding.utf8)!
      replyHandler(data)
    }
  }

  func session(_ session: WCSession, didReceive file: WCSessionFile) {
    let data: Data? = try? Data(contentsOf: file.fileURL)
    self.image.setImageData(data)
    self.session?.sendMessage(["message": "received your file"], replyHandler: { (response) in
      print("received reply")
    })
  }

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    print("did receive application context", applicationContext)
    self.session?.sendMessage(["application-context": applicationContext, "text": "application context received by the watch"], replyHandler: { (response) in
    })
  }

  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any]) {
    print("did receive user info", userInfo)
    self.session?.sendMessage(["user-info": userInfo, "text": "user info received by the watch"], replyHandler: { (response) in
    })
  }

  func session(_ session: WCSession, didFinish fileTransfer: WCSessionFileTransfer, error: Error?) {
    print("did finish file transfer")
  }

  func session(_ session: WCSession, didFinish userInfoTransfer: WCSessionUserInfoTransfer, error: Error?) {
    print("did finish user info transfer")
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    print("sessionReachabilityDidChange")
  }

  func JSONStringify(_ value: Dictionary<String, Any>, prettyPrinted: Bool = false) -> String {
    let options = prettyPrinted ? JSONSerialization.WritingOptions.prettyPrinted : JSONSerialization.WritingOptions(rawValue: 0)

    if JSONSerialization.isValidJSONObject(value) {

      do {
        let data = try JSONSerialization.data(withJSONObject: value, options: options)
        if let string = NSString(data: data, encoding: String.Encoding.utf8.rawValue) {
          return string as String
        }
      } catch {
        print("error")
      }

    }
    return ""
  }

  private func updateComplications() {
    let server = CLKComplicationServer.sharedInstance()

    let complications = server.activeComplications ?? []

    for complication in complications {
      server.reloadTimeline(for: complication)
    }
  }
}
