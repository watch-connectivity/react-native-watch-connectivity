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
  @IBOutlet weak var image: WKInterfaceImage!

  var session: WCSession?
  
  ////////////////////////////////////////////////////////////////////////////////
  
  override func awakeWithContext(context: AnyObject?) {
    super.awakeWithContext(context)
    if WCSession.isSupported() {
      print("Activating watch session")
      self.session = WCSession.defaultSession()
      self.session?.delegate = self
      self.session?.activateSession()
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

  func session(session: WCSession, didReceiveMessage message: [String : AnyObject], replyHandler: ([String : AnyObject]) -> Void) {
    print("watch received message", message);
    let text = message["text"] as! String
    let timestamp : Double = (message["timestamp"] as! NSNumber).doubleValue
    self.label.setText(text)
    let currentTimestamp: Double = NSDate().timeIntervalSince1970 * 1000
    let elapsed : Double = currentTimestamp - timestamp
    replyHandler(["elapsed":Int(elapsed), "timestamp": round(currentTimestamp)])
  }
  
  ////////////////////////////////////////////////////////////////////////////////

  func session(session: WCSession, didReceiveMessageData messageData: NSData, replyHandler: (NSData) -> Void) {
    let currentTimestamp: Double = NSDate().timeIntervalSince1970 * 1000
    let decodedData = NSData(base64EncodedData: messageData, options: NSDataBase64DecodingOptions(rawValue: 0))
    self.image.setImageData(decodedData)
    let json : String = JSONStringify(["currentTimestamp": currentTimestamp])
    let data : NSData = json.dataUsingEncoding(NSUTF8StringEncoding)!
    replyHandler(data)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(session: WCSession, didReceiveFile file: WCSessionFile) {
    let data: NSData? = NSData(contentsOfURL: file.fileURL)
    self.image.setImageData(data)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(session: WCSession, didReceiveApplicationContext applicationContext: [String : AnyObject]) {
    print("did receive application context", applicationContext)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func session(session: WCSession, didReceiveUserInfo userInfo: [String : AnyObject]) {
    print("did receive user info", userInfo)
    // Send the bullshit user info back to the device just to demonstrate it works ;)
    session.transferUserInfo(userInfo)
    print("sending ping")
    session.sendMessage(["message": "ping"], replyHandler: { (dict) in
      print("pong received", dict)
      }, errorHandler: nil)
  }
  
  ////////////////////////////////////////////////////////////////////////////////
  
  func JSONStringify(value: AnyObject,prettyPrinted:Bool = false) -> String{
    let options = prettyPrinted ? NSJSONWritingOptions.PrettyPrinted : NSJSONWritingOptions(rawValue: 0)
    
    if NSJSONSerialization.isValidJSONObject(value) {
      
      do{
        let data = try NSJSONSerialization.dataWithJSONObject(value, options: options)
        if let string = NSString(data: data, encoding: NSUTF8StringEncoding) {
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
