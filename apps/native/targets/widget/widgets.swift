import WidgetKit
import SwiftUI
import AppIntents

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent(), pcName: "Home PC", hasPC: true)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let pc = NetworkManager.shared.getSelectedPC()
        return SimpleEntry(date: Date(), configuration: configuration, pcName: pc?.name ?? "No PC", hasPC: pc != nil)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let pc = NetworkManager.shared.getSelectedPC()
        let entry = SimpleEntry(date: Date(), configuration: configuration, pcName: pc?.name ?? "No PC", hasPC: pc != nil)
        return Timeline(entries: [entry], policy: .atEnd)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let pcName: String
    let hasPC: Bool
}

struct ControlButton: View {
    let title: String
    let icon: String
    let intent: any AppIntent
    
    var body: some View {
        Button(intent: intent) {
            VStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .padding(.bottom, 2)
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(UIColor.secondarySystemFill))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }
}

struct StatusButton: View {
    let pcName: String
    
    var body: some View {
        Link(destination: URL(string: "pc-remote-control://")!) {
            VStack(alignment: .leading) {
                HStack {
                     Image(systemName: "desktopcomputer")
                        .font(.system(size: 20))
                     Spacer()
                     Circle()
                        .fill(pcName == "No PC Selected" ? Color.gray : Color.green)
                        .frame(width: 8, height: 8)
                }
                Spacer()
                Text(pcName)
                     .font(.caption)
                     .fontWeight(.semibold)
                     .lineLimit(1)
            }
            .padding(10)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(UIColor.secondarySystemFill))
            .cornerRadius(12)
        }
    }
}

struct PCWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        Group {
            if !entry.hasPC {
                NoPCView()
            } else if family == .systemMedium {
                MediumView()
            } else if family == .systemSmall {
                SmallView()
            } else {
                MediumView()
            }
        }
        .padding(0)
        .containerBackground(for: .widget) {
            Color(UIColor.systemBackground)
        }
    }
    
    @ViewBuilder
    func NoPCView() -> some View {
        Link(destination: URL(string: "pc-remote-control://")!) {
            VStack(spacing: 6) {
                 Image(systemName: "desktopcomputer.trianglebadge.exclamationmark")
                    .font(.system(size: 24))
                    .foregroundColor(.orange)
                 Text("No PC Selected")
                    .font(.headline)
                 Text("Tap to add a PC")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(UIColor.secondarySystemFill))
            .cornerRadius(12) // Ensure consistent look
            .padding() // Add some padding inside the widget container
        }
    }
    
    @ViewBuilder
    func MediumView() -> some View {
        Grid(horizontalSpacing: 10, verticalSpacing: 10) {
            GridRow {
                StatusButton(pcName: entry.pcName)
                ControlButton(title: "Shutdown", icon: "powerplug.fill", intent: ShutdownIntent())
                ControlButton(title: "Reboot", icon: "arrow.clockwise", intent: RebootIntent())
            }
            GridRow {
                ControlButton(title: "Wake Up", icon: "power", intent: WakeUpIntent())
                ControlButton(title: "Sleep", icon: "moon.fill", intent: SleepIntent())
                ControlButton(title: "Lock", icon: "lock.fill", intent: LockIntent())
            }
        }
    }
    
    @ViewBuilder
    func SmallView() -> some View {
        Grid(horizontalSpacing: 8, verticalSpacing: 8) {
            GridRow {
                StatusButton(pcName: entry.pcName)
                ControlButton(title: "Wake Up", icon: "power", intent: WakeUpIntent())
            }
            GridRow {
                ControlButton(title: "Sleep", icon: "moon.fill", intent: SleepIntent())
                ControlButton(title: "Lock", icon: "lock.fill", intent: LockIntent())
            }
        }
    }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            PCWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("PC Control")
        .description("Control your PC from your Home Screen.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled() 
    }
}

extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        return intent
    }
}

#Preview(as: .systemMedium) {
    widget()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley, pcName: "My Gaming PC", hasPC: true)
    SimpleEntry(date: .now, configuration: .smiley, pcName: "No PC", hasPC: false)
}

