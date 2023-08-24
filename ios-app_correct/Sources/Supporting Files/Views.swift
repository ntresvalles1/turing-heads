import SwiftUI

struct HeroView: View {
    private let tracking: CGFloat = -4

    var body: some View {
    #if os(iOS)
        Image("TuringHeadsLong")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(width: 250, height: 90, alignment: .center)
            .padding(.top, 8)
        Spacer()
              .frame(height: 20)
        VStack(alignment: .leading, spacing: -32) {
            Text("Make")
                .tracking(self.tracking)
            Text("Your")
                .tracking(self.tracking)
            Text("Static")
                .tracking(self.tracking)
                .foregroundStyle(
                    .linearGradient(
                      colors: [Color("Orange"), Color("Pink")],
                      startPoint: .topLeading,
                      endPoint: .bottomTrailing
                    ))
            Text("Portfolio")
                .tracking(self.tracking)
                .foregroundStyle(
                    .linearGradient(
                      colors: [Color("Orange"), Color("Pink")],
                      startPoint: .topLeading,
                      endPoint: .bottomTrailing
                    ))
            Text("WP Site")
                .tracking(self.tracking)
                .foregroundStyle(
                    .linearGradient(
                      colors: [Color("Orange"), Color("Pink")],
                      startPoint: .topLeading,
                      endPoint: .bottomTrailing
                    ))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .font(.custom("SpaceGrotesk-Medium", size: 80))
        VStack(alignment: .trailing) {
            Text("By Godaddy")
                .tracking(self.tracking)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .font(.custom("SpaceGrotesk-Medium", size: 40))
    #else
        Text("TuringHeads App")
            .font(.title)
    #endif
    }
}

struct ProfileHeader: View {
    @State var picture: String

    private let size: CGFloat = 100

    var body: some View {
    #if os(iOS)
        AsyncImage(url: URL(string: picture), content: { image in
            image.resizable()
        }, placeholder: {
            Color.clear
        })
        .frame(width: self.size, height: self.size)
        .clipShape(Circle())
        .padding(.bottom, 24)
    #else
        Text("Profile")
    #endif
    }
}

struct ProfileCell: View {
    @State var key: String
    @State var value: String

    private let size: CGFloat = 14

    var body: some View {
        HStack {
            Text(key)
                .font(.system(size: self.size, weight: .semibold))
            Spacer()
            Text(value)
                .font(.system(size: self.size, weight: .regular))
            #if os(iOS)
                .foregroundColor(Color("Grey"))
            #endif
        }
    #if os(iOS)
        .listRowBackground(Color.white)
    #endif
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    private let padding: CGFloat = 8

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 18, weight: .semibold))
            .padding(.init(top: self.padding,
                           leading: self.padding * 6,
                           bottom: self.padding,
                           trailing: self.padding * 6))
            .background(Color.black)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
