//
//  InterfaceController.swift
//  watch Extension
//
//  Created by Michael Ford on 30/04/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

import WatchKit
import Foundation

class InterfaceController: WKInterfaceController {

  var bridge: WatchBridge = WatchBridge.sharedInstance
  
    override func awakeWithContext(context: AnyObject?) {
        super.awakeWithContext(context)
      print("Hi there...")
    }

    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
      super.willActivate()
//      let message: [String:AnyObject] = ["message": "yo"]
//      bridge.sendMessage(message) { (message: Dictionary<String, AnyObject>) in
//        print("reply received")
//      }
    }

    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
    }

}
