// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');
const textout = document.getElementById('sstatus');
const startautotest = document.getElementById('Start-AutoTest');
const startmanualtest = document.getElementById('Manual-Test');
const Terminaldiv = document.getElementById('Terminal');
const testingbox = document.getElementById('testing');
const resultbox = document.getElementById('result');
const resultlabel = document.getElementById('resultlabel');
const resultGate = document.getElementById('resultGate');
const ICselected = document.getElementById('ICselected');
var ICsvg = document.getElementById("ICsvg")
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
var oldchild;
function addTextToImage(imagePath, text) {
  //set the image
  if(oldchild != null)
  ICsvg.removeChild(oldchild);
  var myTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  var element = document.createElementNS("http://www.w3.org/2000/svg","svg");
  var image = document.createElementNS("http://www.w3.org/2000/svg","image");
  image.setAttributeNS("http://www.w3.org/1999/xlink","href",imagePath);
  image.setAttribute("style","transform-origin: 50% 50%;width:200px;height:220px;transform: rotate(-90deg);")
  image.setAttribute("width", "350");
  image.setAttribute("height", "160");
  image.setAttribute("x", "60");
  image.setAttribute("y", "-40");
  element.appendChild(image);
  //set the text
  var myText = document.createTextNode(text);
  myTextElement.setAttribute("x", "105");
  myTextElement.setAttribute("y", "75");
  myTextElement.setAttribute("fill", "black");
  myTextElement.setAttribute("font-family", "Roboto Mono");
  myTextElement.setAttribute("font-size", "30");
  myTextElement.appendChild(myText);
  element.appendChild(myTextElement); 
  oldchild = element;
  ICsvg.appendChild(element);  
}
const readfromterminal = (message, type = '') => {
  const firstChar = message.toString().charAt(0);
  if(firstChar == '*'){
    const data = message.toString().slice(1);
    if(data == "Autotest" || data == "ManualTest"){
      resultbox.style.display = "none";
      testingbox.style.display = "block";
    }
    if(data == "Endoftest"){
      testingbox.style.display = "none";
    }
    if(data == "No IC Detected"){
      console.log("No IC Detected");
      resultlabel.innerHTML = "Result: No IC Detected";
      resultGate.innerHTML = "";
      resultbox.style.display = "block";
    }
    if(data.startsWith("IC Detected:")){
      resultGate.innerHTML = "";
      let icname = data.slice(13);
      console.log("IC Detected: "+icname);
      resultlabel.innerHTML = "IC Detected: "+icname;
      resultbox.style.display = "block";
    }
    if(data.startsWith("Gate")){
      resultGate.innerHTML = resultGate.innerHTML.concat(data+"\r\n");
    }
  }
  if(firstChar == '!'){
    const prints = message.toString().slice(1);
    if(prints.startsWith("Test For ")){
      let icname = prints.slice(9);
      addTextToImage("icons/16pinIC.svg",icname);
    }
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
    if(message == "DOMException: Connection failed for unknown reason.")
    alert("Connection failed for unknown reason. Please reconnect");
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
startmanualtest.addEventListener('click', () => {
  if(isConnected){
    var value = ICselected.value.toString();
    send('M'+value);
  resultbox.style.display = "none";
  }
  else{
    alert("Please connect to a device first");
  }
});
startautotest.addEventListener('click', () => {
  if(isConnected){
  send('AutoTest');
  resultbox.style.display = "none";
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
