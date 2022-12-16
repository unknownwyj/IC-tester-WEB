#include <Arduino.h>

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define BAUDRATE 115200

#define SERVICE_UUID "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLEServer *pServer;
BLEService *pService;
BLECharacteristic *pTxCharacteristic;
BLECharacteristic *pRxCharacteristic;

bool deviceConnected = false;
std::string rxValue = "";


void ble_send(std::string msg) {
  Serial.print("sending: ");
  Serial.println(msg.c_str());
  pTxCharacteristic->setValue((byte*)msg.c_str(), msg.size());
  pTxCharacteristic->notify();
}

void on_ble_receive(std::string msg) {
  // do nothing
}


class MyServerCallbacks : public BLEServerCallbacks
{
    void onConnect(BLEServer *pServer)
    {
        Serial.println("= Connected =");
        deviceConnected = true;
    }
    void onDisconnect(BLEServer *pServer)
    {
        Serial.println("= Disonnected =");
        deviceConnected = false;
    }
};

class MyCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *pCharacteristic)
    {
        Serial.print("received: ");
        rxValue = pCharacteristic->getValue();
        Serial.println(rxValue.c_str());
        on_ble_receive(rxValue);
    }
};

void setup()
{
    Serial.begin(BAUDRATE);

    BLEDevice::init("ESP32");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    pService = pServer->createService(SERVICE_UUID);

    // TX
    pTxCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_TX,
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pTxCharacteristic->addDescriptor(new BLE2902());

    // RX
    pRxCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_RX,
        BLECharacteristic::PROPERTY_WRITE
    );
    pRxCharacteristic->setCallbacks(new MyCallbacks());

    pService->start();
    pServer->getAdvertising()->start();
    
    Serial.println("Waiting for client connection ...");
}

void loop() {
    static unsigned long millis_last = 0;

    if (millis() - millis_last >= 1000) {
        millis_last = millis();

        if (deviceConnected) {
            char msg[] = "Hello world!\n";
            ble_send(msg);
        }
    }
}
