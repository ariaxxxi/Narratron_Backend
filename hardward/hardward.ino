#include <Keyboard.h>

#define setbit(data,b) (data|=(1<<b)) //set the b bit of data to 1
#define clrbit(data,b) (data&=~(1<<b)) //set the b bit of data to 0

const int buttonPinN = 8;
const int buttonPinG = 9;
int previousbuttonStateN = HIGH;
int previousbuttonStateG = HIGH;


uint8_t code8421 = 0;
const uint8_t code8Pin = 18;
const uint8_t code4Pin = 19;
const uint8_t code2Pin = 20;
const uint8_t code1Pin = 21;

int res = 20;

void setup() {
  // put your setup code here, to run once:
  pinMode(buttonPinN, INPUT_PULLUP);
  pinMode(buttonPinG, INPUT_PULLUP);
  Keyboard.begin();
  //Serial.begin(115200);
  Serial.println("8421 Encoder Starts up!");
  pinMode(code8Pin, INPUT);
  pinMode(code4Pin, INPUT);
  pinMode(code2Pin, INPUT);
  pinMode(code1Pin, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  int buttonStateN = digitalRead(buttonPinN);
  int buttonStateG = digitalRead(buttonPinG);

  if (buttonStateN == LOW && previousbuttonStateN == HIGH) {
    Serial.print("N is pressed.\n");
    //Keyboard.release('n');
    delay(50);
  }

  if (buttonStateN == HIGH && previousbuttonStateN == LOW) {
    Serial.print("N is released.\n");
    
    //Keyboard.press('n');
    delay(50);
  }

  if (buttonStateG == LOW && previousbuttonStateG == HIGH) {
    Serial.print("G is pressed.\n");
    
    //Keyboard.release('g');
    delay(50);
  }
  if (buttonStateG == HIGH && previousbuttonStateG == LOW) {
    Serial.print("G is released.\n");
    //Keyboard.press('g');
    delay(50);
  }
  previousbuttonStateN = buttonStateN;
  previousbuttonStateG = buttonStateG;


  if (digitalRead(code8Pin) == HIGH){
    setbit(code8421, 3);
  }else{
    clrbit(code8421, 3);
  }

  if (digitalRead(code4Pin) == HIGH){
    setbit(code8421, 2);
  }else{
    clrbit(code8421, 2);
  }

  if (digitalRead(code2Pin) == HIGH){
    setbit(code8421, 1);
  }else{
    clrbit(code8421, 1);
  }

  if (digitalRead(code1Pin) == HIGH){
    setbit(code8421, 0);
  }else{
    clrbit(code8421, 0);
  }

  //Output the code in hexadecimal 
  Serial.print("Now code8421 is:  ");

  Serial.println(code8421);
  //Serial.write(code8421);
  Serial.write("yes");
  delay(1000);
}
