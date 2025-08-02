#define FIREBASE_DEBUG
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Replace with your own credentials
#define WIFI_SSID "Abdul's iPhone 13"
#define WIFI_PASSWORD "raop1234"
#define API_KEY "AIzaSyAOXnI9gfYm9VjNQtmIm_WwJT8L4Ado2dw"
#define DATABASE_URL "https://fyp2025-263a5-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Device ID whose sensor data you’re reading in auto mode
#define DEVICE_ID "device_6CC840567588"

// GPIO pins for pumps
#define PUMP1_PIN 2  // D2
#define PUMP2_PIN 15 // D15

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

void setup()
{
    Serial.begin(115200);

    // Configure pump pins (HIGH = ON)
    pinMode(PUMP1_PIN, OUTPUT);
    pinMode(PUMP2_PIN, OUTPUT);
    digitalWrite(PUMP1_PIN, LOW);
    digitalWrite(PUMP2_PIN, LOW);

    // Connect WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println("\nWiFi connected!");

#if defined(ESP32)
    fbdo.setBSSLBufferSize(8192, 2048); // Increase if you have a lot of data
#endif

    // Firebase setup
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // Anonymous sign‑up
    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("Firebase sign‑up OK");
        signupOK = true;
    }
    else
    {
        Serial.printf("Firebase sign‑up failed: %s\n", config.signer.signupError.message.c_str());
    }
}

void loop()
{
    if (!signupOK)
    {
        Serial.println("Skipping pumps: not authenticated");
        delay(5000);
        return;
    }

    handlePump("Pump1", PUMP1_PIN);
    handlePump("Pump2", PUMP2_PIN);

    delay(1000); // adjust as needed
}

void handlePump(const String &pumpName, int pin)
{
    // Build paths
    String base = "Pump/" + pumpName + "/";
    String modePath = base + "mode";
    String statusPath = base + "status";
    String devicePath = base + "device";
    String autoPath = base + "autoBasedOn";

    // Read mode/status/device
    String mode, status, targetDevice;
    if (Firebase.RTDB.getString(&fbdo, modePath))
        mode = fbdo.stringData();
    if (Firebase.RTDB.getString(&fbdo, statusPath))
        status = fbdo.stringData();
    if (Firebase.RTDB.getString(&fbdo, devicePath))
        targetDevice = fbdo.stringData();

    Serial.printf("%s → mode=%s status=%s device=%s\n",
                  pumpName.c_str(), mode.c_str(), status.c_str(), targetDevice.c_str());

    // MANUAL MODE: just use status
    if (mode == "manual")
    {
        digitalWrite(pin, status == "on" ? HIGH : LOW);
        return;
    }

    // AUTO MODE: skip if not for this device
    if (mode != "auto" || targetDevice != DEVICE_ID)
    {
        digitalWrite(pin, LOW);
        return;
    }

    // Load autoBasedOn array
    FirebaseJson autoArr;
    Serial.printf("DEBUG: Reading autoBasedOn from path: %s\n", autoPath.c_str());
    if (!Firebase.RTDB.getJSON(&fbdo, autoPath))
    {
        Serial.printf("Failed to read autoBasedOn: %s\n", fbdo.errorReason().c_str());
        return;
    }
    autoArr.setJsonData(fbdo.jsonString());
    Serial.printf("DEBUG: autoBasedOn JSON: %s\n", fbdo.jsonString().c_str());

    // Determine latest data key under /<DEVICE_ID>/data
    String dataRoot = String("/") + DEVICE_ID + "/data";
    String latestKey = getLatestKey(dataRoot);
    if (latestKey == "")
    {
        Serial.println("No data found");
        return;
    }
    String dataPath = dataRoot + "/" + latestKey + "/";
    Serial.printf("DEBUG: Using data path: %s\n", dataPath.c_str());

    // Extract and display latest temperature data
    int latestTemp = getInt(dataPath + "temperature");
    Serial.printf("DEBUG: Latest temperature: %d\n", latestTemp);

    // Read thresholds
    int soilMin = getInt("/settings/soilMoistureThreshold/min");
    int humMin = getInt("/settings/humidityThreshold/min");
    int tmpMax = getInt("/settings/temperatureThreshold/max");
    Serial.printf("DEBUG: Thresholds - soilMin=%d, humMin=%d, tmpMax=%d\n", soilMin, humMin, tmpMax);

    // Evaluate each requested sensor
    FirebaseJsonData elem;
    bool turnOn = false;
    Serial.printf("DEBUG: Starting sensor evaluation loop\n");

    // TEMPORARY: Hardcode sensors to test logic
    Serial.printf("DEBUG: Testing with hardcoded temperature sensor\n");
    int val = getInt(dataPath + "temperature");
    int th = tmpMax;
    turnOn = turnOn || (val > th);
    Serial.printf("  sensor[temperature]=%d threshold=%d → %s\n",
                  val, th, (val > th) ? "TRIGGER" : "ok");

    // Original loop (commented out for now)
    /*
    for (int i = 0; autoArr.get(elem, i); i++)
    {
        String sensor = elem.stringValue;
        Serial.printf("DEBUG: Processing sensor: %s\n", sensor.c_str());
        int val = 0, th = 0;
        if (sensor == "soilMoisture") {
            val = getInt(dataPath + "moisture");
            th = soilMin;
            turnOn = turnOn || (val < th);
            Serial.printf("  sensor[%s]=%d threshold=%d → %s\n",
                          sensor.c_str(), val, th, (val < th) ? "TRIGGER" : "ok");
        } else if (sensor == "humidity") {
            val = getInt(dataPath + "humidity");
            th = humMin;
            turnOn = turnOn || (val < th);
            Serial.printf("  sensor[%s]=%d threshold=%d → %s\n",
                          sensor.c_str(), val, th, (val < th) ? "TRIGGER" : "ok");
        } else if (sensor == "temperature") {
            val = getInt(dataPath + "temperature");
            th = tmpMax;
            turnOn = turnOn || (val > th);
            Serial.printf("  sensor[%s]=%d threshold=%d → %s\n",
                          sensor.c_str(), val, th, (val > th) ? "TRIGGER" : "ok");
        }
        // Remove the break - check ALL sensors, not just the first one
    }
    */

    Serial.printf("Final decision: turnOn = %s\n", turnOn ? "YES" : "NO");
    digitalWrite(pin, turnOn ? HIGH : LOW);
}

// Find latest child key in a Firebase JSON object by timestamp value
String getLatestKey(const String &path)
{
    // Set up query: order by key, limit to last 1
    QueryFilter query;
    query.orderBy("$key");
    query.limitToLast(1);

    Serial.printf("DEBUG: Fetching only the latest entry at %s\n", path.c_str());
    if (!Firebase.RTDB.getJSON(&fbdo, path, &query))
    {
        Serial.printf("DEBUG: getJSON failed: %s\n", fbdo.errorReason().c_str());
        return "";
    }
    FirebaseJson &j = fbdo.jsonObject();
    size_t n = j.iteratorBegin();
    Serial.printf("DEBUG: Found %d children\n", n);
    String bestKey;
    unsigned long bestTs = 0;

    for (size_t i = 0; i < n; i++)
    {
        String key, val;
        int type;
        j.iteratorGet(i, type, key, val);
        if (key.length() == 0)
            continue; // Skip empty keys!
        Serial.printf("DEBUG: Checking key: %s\n", key.c_str());
        String tsPath = path + "/" + key + "/timestamp";
        if (Firebase.RTDB.getInt(&fbdo, tsPath))
        {
            unsigned long ts = fbdo.intData();
            if (ts > bestTs)
            {
                bestTs = ts;
                bestKey = key;
            }
        }
        else
        {
            Serial.printf("DEBUG: Failed to read timestamp at %s: %s\n", tsPath.c_str(), fbdo.errorReason().c_str());
        }
    }
    j.iteratorEnd();
    Serial.printf("DEBUG: Latest key is %s\n", bestKey.c_str());
    return bestKey;
}

// Helper to read an int from RTDB
int getInt(const String &path)
{
    if (Firebase.RTDB.getInt(&fbdo, path))
    {
        return fbdo.intData();
    }
    else
    {
        Serial.printf("Failed to read %s\n", path.c_str());
        return 0;
    }
}
