//
//  WordpressView.swift
//  SwiftSample
//
//  Created by Kimthanh P. Nguyen (Intern) on 7/17/23.
//

import Foundation
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL?
    let navigationDelegate: NavDelegate = NavDelegate()


    func makeUIView(context: Context) -> WKWebView {
        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true

        let config = WKWebViewConfiguration()
        config.limitsNavigationsToAppBoundDomains = true

        config.defaultWebpagePreferences = prefs
        config.websiteDataStore = WKWebsiteDataStore.default()


        let view = WKWebView(
            frame: .zero,
            configuration: config)
        view.isInspectable = true
        view.navigationDelegate = navigationDelegate
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        guard let myURL = url else {
            return
        }
        let request = URLRequest(url: myURL)
        uiView.load(request)
    }
}
class DownloadDelegate : NSObject {
    var downloadUrl : URL?

}

extension DownloadDelegate : WKDownloadDelegate {
    
    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        self.downloadUrl = FileManager.default.temporaryDirectory
            .appendingPathComponent(suggestedFilename)
        completionHandler(self.downloadUrl)
    }

    func downloadDidFinish(_ download: WKDownload) {
        //upload here
        let session = NMSSHSession.init(host: "ftp.turingheads.com", port: "21", andUsername: "hackathonuser@static.turingheads.com")
           session.connect()
           if session.isConnected{
               session.authenticate(byPassword: "hackathonpassword")
               if session.isAuthorized == true {
                   let sftpsession = NMSFTP(session: session)
                   sftpsession.connect()
                   if sftpsession.isConnected {
                       sftpsession.writeFile(atPath: self.downloadUrl.path, toFileAtPath: ".")
                   }
               }
           }
        print("Uploaded")

    }
}

class NavDelegate : NSObject {
    var wkDownloadDelegate: WKDownloadDelegate = DownloadDelegate()

}

extension NavDelegate : WKNavigationDelegate {

    
    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
        download.delegate = wkDownloadDelegate
    }
        
    func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) {
        download.delegate = wkDownloadDelegate
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, preferences: WKWebpagePreferences, decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void) {
        if navigationAction.shouldPerformDownload {
            decisionHandler(.download, preferences)
        } else {
            decisionHandler(.allow, preferences)
        }
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if navigationResponse.canShowMIMEType {
            decisionHandler(.allow)
        } else {
            decisionHandler(.download)
        }
    }
}


