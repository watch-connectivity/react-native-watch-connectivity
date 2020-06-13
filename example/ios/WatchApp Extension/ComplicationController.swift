//
//  ComplicationController.swift
//  WatchApp Extension
//
//  Created by Michael Ford on 05/10/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

import ClockKit
import WatchKit

class ComplicationController: NSObject, CLKComplicationDataSource {

  // MARK: - Timeline Configuration

  func getSupportedTimeTravelDirections(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimeTravelDirections) -> Void) {
//        handler([.forward, .backward])
    handler([])
  }

  func getTimelineStartDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
    handler(nil)
  }

  func getTimelineEndDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
    handler(nil)
  }

  func getPrivacyBehavior(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void) {
    handler(.showOnLockScreen)
  }

  // MARK: - Timeline Population

  func getCurrentTimelineEntry(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void) {
    // Call the handler with the current timeline entry

    let entry = CLKComplicationTimelineEntry()

    let pings = ComplicationState.shared.pings;
    let message = ComplicationState.shared.message;

    let tmpl = createPingPongTemplate(pings: pings, message: message)

    entry.complicationTemplate = tmpl
    entry.date = Date()

    handler(entry)
  }

  private func createPingPongTemplate(pings: Int, message: String) -> CLKComplicationTemplateModularLargeTable {
    let tmpl = CLKComplicationTemplateModularLargeTable()

    tmpl.headerTextProvider = CLKSimpleTextProvider(text: "RNWatchExample")
    tmpl.row1Column1TextProvider = CLKSimpleTextProvider(text: "Pings")
    tmpl.row1Column2TextProvider = CLKSimpleTextProvider(text: String(pings))
    tmpl.row2Column1TextProvider = CLKSimpleTextProvider(text: "Message")
    tmpl.row2Column2TextProvider = CLKSimpleTextProvider(text: String(message))

    return tmpl
  }

  func getTimelineEntries(for complication: CLKComplication, before date: Date, limit: Int, withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void) {
    // Call the handler with the timeline entries prior to the given date
    handler(nil)
  }

  func getTimelineEntries(for complication: CLKComplication, after date: Date, limit: Int, withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void) {
    // Call the handler with the timeline entries after to the given date
    handler(nil)
  }

  // MARK: - Placeholder Templates

  func getLocalizableSampleTemplate(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTemplate?) -> Void) {
    // This method will be called once per supported complication, and the results will be cached
    handler(createPingPongTemplate(pings: 0, message: ""))
  }
}
