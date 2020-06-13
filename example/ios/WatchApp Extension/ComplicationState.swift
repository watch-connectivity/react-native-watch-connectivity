//
// Created by Michael Ford on 13/06/2020.
// Copyright (c) 2020 Facebook. All rights reserved.
//

import Foundation

class ComplicationState {
  static let shared = ComplicationState()

  var pings: Int;
  var message: String;

  private init() {
    self.pings = 0;
    self.message = "Use the app to change this message";
  }

  func incPings() {
    self.pings = self.pings + 1
  }
}