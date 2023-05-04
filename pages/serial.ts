import { SerialPort } from "serialport";

// let arduinoData;
//   const sp = new SerialPort({path: 'COM6', baudRate: 9600});
//   sp.open(function(err) {
//     if (err) {
//       return console.log(err.message);
//     }
//   })
//   let k = 0;
//   sp.on('open', function() {
//     k = 1;
//     console.log("Serial Port Opened");
//   })

//   sp.on('data', function(data) {
//     console.log(data)
//     arduinoData = data;
//   })