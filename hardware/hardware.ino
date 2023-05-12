#include <Keyboard.h>

#define CLK 19
#define DT 18


unsigned long lastbutton = 0;

int counter = 0;
int currentStateCLK;
int lastStateCLK;
String currentDir ="";

int buttonState;            // the current reading from the input pin
int lastButtonState = LOW;

unsigned long lastDebounceTime = 0;  // the last time the output pin was toggled
unsigned long debounceDelay = 50; 

const int button = 9;
void setup() {
  // put your setup code here, to run once:
  pinMode(CLK,INPUT);
	pinMode(DT,INPUT);
  pinMode(button, INPUT);
  Serial.begin(115200);

  lastStateCLK = digitalRead(CLK);

  // attnachInterrupt(digitalPinToInterrupt(20), shaft_moved, FALLING);
  // pinMode(19,INPUT);
}


void loop() {
  ///////////////////////////////////////////
  //Rotary Encoder
  ///////////////////////////////////////////
  	currentStateCLK = digitalRead(CLK);

	// If last and current state of CLK are different, then pulse occurred
	// React to only 1 state change to avoid double count
	if (currentStateCLK != lastStateCLK  && currentStateCLK == 1){

		// If the DT state is different than the CLK state then
		// the encoder is rotating CCW so decrement
		if (digitalRead(DT) != currentStateCLK) {
			counter --;
			currentDir ="CCW";
		} else {
			// Encoder is rotating CW so increment
			counter ++;
			currentDir ="CW";
		}

		//Serial.print("Direction: ");
		//Serial.print(currentDir);
		//Serial.print(" | Counter: ");
    if (currentDir == "CCW") {
      Keyboard.write(KEY_RIGHT_ARROW);
    }
		Serial.println(counter);
	}

	// Remember last CLK state
	lastStateCLK = currentStateCLK;



  ///////////////////////////////////////////
  //Pushbutton
  ///////////////////////////////////////////
  
  int reading = digitalRead(button);

  // check to see if you just pressed the button
  // (i.e. the input went from LOW to HIGH), and you've waited long enough
  // since the last press to ignore any noise:

  // If the switch changed, due to noise or pressing:
  if (reading != lastButtonState) {
    // reset the debouncing timer
    lastDebounceTime = millis();
  }


  if ((millis() - lastDebounceTime) > debounceDelay) {
    // whatever the reading is at, it's been there for longer than the debounce
    // delay, so take it as the actual current state:

    // if the button state has changed:
  if (reading != buttonState) {
      buttonState = reading;

      // only toggle the LED if the new button state is HIGH
    if (buttonState == HIGH) {

      Serial.println("pressed");
      Keyboard.write("");
      }
    }
  }



    lastButtonState = reading;
}

