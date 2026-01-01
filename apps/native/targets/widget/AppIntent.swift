import WidgetKit
import AppIntents
import Network
import Foundation

// MARK: - Configuration & Models

struct PCConfig: Codable {
    let id: String?
    let name: String?
    let ip: String
    let port: String
    let mac: String
}

struct NetworkManager {
    static let shared = NetworkManager()
    
    // Must match the App Group ID in your entitlements
    private let appGroupId = "group.gabs.pcremotecontrol"
    private let storageKey = "pc_remote_selected_pc" // Key used to store the JSON in UserDefaults
    
    func getSelectedPC() -> PCConfig? {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId),
              let jsonString = sharedDefaults.string(forKey: storageKey),
              let data = jsonString.data(using: .utf8) else {
            return nil
        }
        
        return try? JSONDecoder().decode(PCConfig.self, from: data)
    }
    
    func performAction(_ endpoint: String) async throws {
        guard let pc = getSelectedPC() else {
            throw Error.noPCSelected
        }
        
        guard let url = URL(string: "http://\(pc.ip):\(pc.port)/\(endpoint)") else {
            throw Error.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 5
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw Error.requestFailed
        }
    }
    
    func wakeOnLan() async throws {
        guard let pc = getSelectedPC() else {
            throw Error.noPCSelected
        }
        
        // Basic WOL Magic Packet sender
        try await WakeOnLan.send(mac: pc.mac)
    }
    
    enum Error: Swift.Error, CustomStringConvertible {
        case noPCSelected
        case invalidURL
        case requestFailed
        
        var description: String {
            switch self {
            case .noPCSelected: return "No PC selected in app"
            case .invalidURL: return "Invalid PC configuration"
            case .requestFailed: return "Connection failed"
            }
        }
    }
}

// MARK: - Wake On Lan Implementation

struct WakeOnLan {
    static func send(mac: String) async throws {
        // Clean MAC address
        let cleanMac = mac.filter { $0.isHexDigit }
        guard cleanMac.count == 12,
              let macData = Data(hexString: cleanMac) else {
            print("Invalid MAC address")
            return
        }
        
        // Create Magic Packet: 6x 0xFF followed by 16x MAC Address
        var packet = Data(count: 6 + 16 * 6)
        for i in 0..<6 { packet[i] = 0xFF }
        for i in 0..<16 {
            let offset = 6 + i * 6
            packet.replaceSubrange(offset..<(offset + 6), with: macData)
        }
        
        // Broadcast to port 9 (standard WOL port)
        let host = NWEndpoint.Host("255.255.255.255")
        let port = NWEndpoint.Port(integerLiteral: 9)
        
        let connection = NWConnection(host: host, port: port, using: .udp)
        
        return try await withCheckedThrowingContinuation { continuation in
            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    connection.send(content: packet, completion: .contentProcessed { error in
                        if let error = error {
                            continuation.resume(throwing: error)
                        } else {
                            connection.cancel()
                            continuation.resume(returning: ())
                        }
                    })
                case .failed(let error):
                    continuation.resume(throwing: error)
                default:
                    break
                }
            }
            connection.start(queue: .global())
        }
    }
}

extension Data {
    init?(hexString: String) {
        var data = Data(capacity: hexString.count / 2)
        let regex = try! NSRegularExpression(pattern: "[0-9a-f]{1,2}", options: .caseInsensitive)
        
        regex.enumerateMatches(in: hexString, range: NSRange(hexString.startIndex..., in: hexString)) { match, _, _ in
            let byteString = (hexString as NSString).substring(with: match!.range)
            if let num = UInt8(byteString, radix: 16) {
                data.append(num)
            }
        }
        
        if data.isEmpty { return nil }
        self = data
    }
}

extension Character {
    var isHexDigit: Bool {
        return self.isNumber || (self >= "a" && self <= "f") || (self >= "A" && self <= "F")
    }
}

// MARK: - Intents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Configuration" }
    static var description: IntentDescription { "Select computer to control." }
}

struct ShutdownIntent: AppIntent {
    static var title: LocalizedStringResource = "Shutdown"
    static var description: IntentDescription = "Shutdown the computer"

    init() {}

    func perform() async throws -> some IntentResult {
        try await NetworkManager.shared.performAction("shutdown")
        return .result()
    }
}

struct RebootIntent: AppIntent {
    static var title: LocalizedStringResource = "Reboot"
    static var description: IntentDescription = "Reboot the computer"

    init() {}

    func perform() async throws -> some IntentResult {
        try await NetworkManager.shared.performAction("reboot")
        return .result()
    }
}

struct SleepIntent: AppIntent {
    static var title: LocalizedStringResource = "Sleep"
    static var description: IntentDescription = "Put the computer to sleep"

    init() {}

    func perform() async throws -> some IntentResult {
        try await NetworkManager.shared.performAction("sleep")
        return .result()
    }
}

struct LockIntent: AppIntent {
    static var title: LocalizedStringResource = "Lock"
    static var description: IntentDescription = "Lock the computer"

    init() {}

    func perform() async throws -> some IntentResult {
        try await NetworkManager.shared.performAction("lock")
        return .result()
    }
}

struct WakeUpIntent: AppIntent {
    static var title: LocalizedStringResource = "Wake Up"
    static var description: IntentDescription = "Wake up the computer"

    init() {}

    func perform() async throws -> some IntentResult {
        try await NetworkManager.shared.wakeOnLan()
        return .result()
    }
}

