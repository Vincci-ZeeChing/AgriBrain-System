#include <DHT.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWebSrv.h>
#include <ArduinoJson.h>

// Replace with your network credentials
const char* ssid = "hansheng";
const char* password = "hansheng0512";

// Initialize DHT sensor
#define DHTPIN 5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
const int sensor_pin = A0;

// Threshold values for detecting moisture levels
const int dry_threshold = 1020;   // Adjust this value based on your sensor readings
const int wet_threshold = 400; // Adjust this value based on your sensor readings

// Initialize web server
AsyncWebServer server(80);

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Configure web server routes
  server.on("/sensorData", HTTP_GET, [](AsyncWebServerRequest* request) {
    // Create JSON document
    StaticJsonDocument<200> jsonDoc;

    // Read temperature and humidity
    float temperature = readTemperature();
    float humidity = readHumidity();
    int analog_reading = analogRead(sensor_pin);
    float moisture_percentage;

    moisture_percentage = map(analog_reading, dry_threshold, wet_threshold, 0, 100);

    // Set values in JSON document
    jsonDoc["temperature"] = temperature;
    jsonDoc["humidity"] = humidity;
    jsonDoc["moisture"] = moisture_percentage;

    // Create JSON string
    String jsonString;
    serializeJson(jsonDoc, jsonString);

    // Send response
    request->send(200, "application/json", jsonString);
  });

  // Start web server
  server.begin();
  Serial.println("Web server started");

  // Print local IP address
  Serial.print("Local IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read temperature and humidity
  float temperature = readTemperature();
  float humidity = readHumidity();
  int analog_reading = analogRead(sensor_pin);
  float moisture_percentage;

  moisture_percentage = map(analog_reading, dry_threshold, wet_threshold, 0, 100);


  // Display values on serial monitor
  Serial.print("Temperature: ");
  Serial.print(formatFloat(temperature, 1));
  Serial.print(" °C\t");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Soil Moisture (in Percentage) = ");
  Serial.print(moisture_percentage);
  Serial.println("%");


  delay(2000);
}

float readTemperature() {
  return dht.readTemperature();
}

float readHumidity() {
  return dht.readHumidity();
}

String formatFloat(float value, int decimalPlaces) {
  char buffer[10];
  dtostrf(value, 6, decimalPlaces, buffer);
  return String(buffer);
}
