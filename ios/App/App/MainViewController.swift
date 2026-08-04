import Capacitor
import UIKit

public final class MainViewController: CAPBridgeViewController {
    public override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 14 / 255, green: 15 / 255, blue: 18 / 255, alpha: 1)
        bridge?.webView?.isOpaque = false
        bridge?.webView?.backgroundColor = view.backgroundColor
    }

    public override func capacitorDidLoad() {
        bridge?.registerPluginInstance(DeviceMediaControlsPlugin())
    }
}
