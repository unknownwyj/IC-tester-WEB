// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');
const textout = document.getElementById('sstatus');
const startautotest = document.getElementById('Start-AutoTest');
const Terminaldiv = document.getElementById('Terminal');
// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = '') => {
  terminalContainer.insertAdjacentHTML('beforeend',
      `<div${type && ` class="${type}"`}>${message}</div>`);
  readfromterminal(message, type);
  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
  
};
const readfromterminal = (message, type = '') => {
  const firstChar = message.toString().charAt(0);
  if(firstChar == '!'){
    const prints = message.toString().slice(1);
    console.log(prints);
  }
};
/*
  	UUID: Serial Port               (00001101-0000-1000-8000-00805f9b34fb)
	UUID: Generic Access Profile    (00001800-0000-1000-8000-00805f9b34fb)
	UUID: Generic Attribute Profile (00001801-0000-1000-8000-00805f9b34fb)
*/

// Obtain configured instance.

var serviveUuid = 0xFFE0
var characteristicUuid = 0xFFE1
let isConnected = false;
const terminal = new BluetoothTerminal(serviveUuid,characteristicUuid,

'\n','\n');


//const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function(data) {
  logToTerminal(data, 'in');
};



// Override default log method to output messages to the terminal and console.
terminal._log = function(...messages) {
  // We can't use `super._log()` here.
  messages.forEach((message) => {
    logToTerminal(message);
    if(message == "TypeError: characteristic.startNotifications is not a function")
    terminal.connect();
    if(message == "Connecting to GATT server...")
    textout.innerHTML = 'Connecting to '+terminal.getDeviceName()+'...';
    if(message == "Notifications started"){
    textout.innerHTML = 'Connected to '+terminal.getDeviceName();
    isConnected = true;
    }
    if(message == "Disconnecting from \""+terminal.getDeviceName()+"\" bluetooth device..."){
    textout.innerHTML = 'Disconnecting...';
    }
    if(message == "\""+terminal.getDeviceName()+"\" bluetooth device disconnected"){
    textout.innerHTML = 'Disconnected';
    isConnected = false;
    }
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {7
 
  terminal.send(data).
      then(() => logToTerminal(data, 'out')).
      catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  terminal.connect().
      then(() => {
        deviceNameLabel.textContent = terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName;
      });
});
startautotest.addEventListener('click', () => {
  if(isConnected){
  send('AutoTest');
  }
  else{
    alert("Please connect to a device first");
  }
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
});

sendForm.addEventListener('submit', (event) => {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});
