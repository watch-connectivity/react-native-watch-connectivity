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
  @IBOutlet weak var pongs: WKInterfaceLabel!
  @IBOutlet weak var image: WKInterfaceImage!
  var numPongs: Int = 0
  
  var session: WCSession?
  
  ////////////////////////////////////////////////////////////////////////////////
  
  override func awake(withContext context: Any?) {
    super.awake(withContext: context)
    if WCSession.isSupported() {
      print("Activating watch session")
      self.session = WCSession.default
      self.session?.delegate = self
      self.session?.activate()
    }
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  override func willActivate() {
    super.willActivate()
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  override func didDeactivate() {
    super.didDeactivate()
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  

  
  func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
    print("watch received message", message);
    let text = message["text"] as! String
    let timestamp : Double = (message["timestamp"] as! NSNumber).doubleValue
    self.label.setText(text)
    let currentTimestamp: Double = Date().timeIntervalSince1970 * 1000
    let elapsed : Double = currentTimestamp - timestamp
    replyHandler(["elapsed":Int(elapsed), "timestamp": round(currentTimestamp)])
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
 
  
  func session(_ session: WCSession, didReceiveMessageData messageData: Data, replyHandler: @escaping (Data) -> Void) {
    let currentTimestamp: Double = Date().timeIntervalSince1970 * 1000
    let decodedData = Data(base64Encoded: messageData, options: NSData.Base64DecodingOptions(rawValue: 0))
    self.image.setImageData(decodedData)
    let json : String = JSONStringify(["currentTimestamp": currentTimestamp])
    let data : Data = json.data(using: String.Encoding.utf8)!
    replyHandler(data)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  
  
  func session(_ session: WCSession, didReceive file: WCSessionFile) {
    let data: Data? = try? Data(contentsOf: file.fileURL)
    self.image.setImageData(data)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
    print("did receive application context", applicationContext)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any]) {
    print("did receive user info", userInfo)
    // Send the bullshit user info back to the device just to demonstrate it works ;)
    session.transferUserInfo(userInfo)
    self.sendPing(session)
    
  }
  
  func sendPing(_ session: WCSession) {
    print("Sending ping")
    session.sendMessage(["message": "ping"], replyHandler: { (dict) in
      print("Received pong")
      self.numPongs += 1
      self.pongs.setText(String(format: "%i Pongs", self.numPongs))
      self.sendPing(session)
    }, errorHandler: nil)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(_ session: WCSession, didFinish fileTransfer: WCSessionFileTransfer, error: Error?) {
    // Unused
  }
  
  func session(_ session: WCSession, didFinish userInfoTransfer: WCSessionUserInfoTransfer, error: Error?) {
    // Unused
  }
  
  func sessionReachabilityDidChange(_ session: WCSession) {
    // Unused
  }
  
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    // Unused
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func JSONStringify(_ value: Dictionary<String, Any>, prettyPrinted:Bool = false) -> String{
    let options = prettyPrinted ? JSONSerialization.WritingOptions.prettyPrinted : JSONSerialization.WritingOptions(rawValue: 0)
    
    if JSONSerialization.isValidJSONObject(value) {
      
      do{
        let data = try JSONSerialization.data(withJSONObject: value, options: options)
        if let string = NSString(data: data, encoding: String.Encoding.utf8.rawValue) {
          return string as String
        }
      }
      catch {
        print("error")
      }
      
    }
    return ""
  }
  
}
