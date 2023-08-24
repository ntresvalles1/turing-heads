//
//  ContentView.swift
//  SwiftSample
//
//  Created by Kimthanh P. Nguyen (Intern) on 7/17/23.
//

import SwiftUI

struct ContentView: View {
    private let url = URL(string: "https://playground.turingheads.com")
    var body: some View {
        ZStack {
            WebView(url: url)
            .ignoresSafeArea()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
