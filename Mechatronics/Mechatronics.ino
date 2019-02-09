#include <Wire.h>  // Comes with Arduino IDE

#include <LiquidCrystal_I2C.h>

//                    addr, en,rw,rs,d4,d5,d6,d7,bl,blpol
LiquidCrystal_I2C lcd(0x27, 2, 1, 0, 4, 5, 6, 7, 3, POSITIVE);
int count = 0, emmitter = 7;
const byte interruptPin = 8;

void setup()
{
  pinMode(emmitter, OUTPUT);
  pinMode(interruptPin, INPUT_PULLUP);
  digitalWrite(emmitter, HIGH);
  
  lcd.begin(16,2);

  lcd.setCursor(0,0);
  lcd.print("Loading...");
  
  for(int i = 0; i< 3; i++)
  {
    lcd.backlight();
    delay(250);
    lcd.noBacklight();
    delay(250);
  }
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("Hello, FAISAL!");
  delay(1000);
  lcd.setCursor(0,1);
  lcd.print("Length: 0");
  
  attachInterrupt(digitalPinToInterrupt(interruptPin), update_length, RISING);
  
}
 
 
void loop()
{
}

void update_length()
{
  count++;
  lcd.setCursor(0,1);
  lcd.print("Length: ");
  lcd.print(count);
}


