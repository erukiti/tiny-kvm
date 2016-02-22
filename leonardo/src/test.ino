#include <keyboard.h>

void setup(void) {
  Serial.begin(9600);
  Serial1.begin(9600);
  Keyboard.begin();
}

void keyWait() {
  while (Serial1.available() <= 0)
    delay(1);
}

void loop(void) {
  char buf[1024];
  byte ch;

  keyWait();
  byte tp = Serial1.read();
  switch (tp) {
  case 1:
    keyWait();
    ch = Serial1.read();
    Keyboard.press(ch);
    sprintf(buf, "%02x", ch);
    Serial.println(buf);
    break;

  case 2:
    keyWait();
    ch = Serial1.read();
    Keyboard.release(ch);
    sprintf(buf, "%02x", ch);
    Serial.println(buf);
    break;
  }
}

