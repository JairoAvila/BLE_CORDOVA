var timer;
var timerSendData; 
var name_network;
var password_network;
var arrayMeasure = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
var contador = 0;

var parameters = {
    service: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
    characteristicRX: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
    characteristicTX: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
};

var loader = {
	
	visibleLoader: function(){
		document.getElementById("elementLoader").style.visibility = "visible";
	},

	hideLoader: function(){
		document.getElementById("elementLoader").style.visibility = "hidden";
	},

	timeoutScan: function(){
		ons.notification.alert("No devices found");
		connectDevices.showMainPage();
		loader.hideLoader();
	}
};

function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

var scanDevices = {

	onScan: function() {
		loader.visibleLoader();
		timer = setTimeout(function() { loader.timeoutScan(); }, 30000);
		ble.startScan([], scanDevices.onDiscoverDevice, scanDevices.onError);
	},

	onDiscoverDevice: function(device){
		var list = document.getElementById("scrollDevices");
        if(device.name != undefined || device.name !=null){
        	clearTimeout(timer);
        	loader.hideLoader();
            document.getElementById("imageNotFound").style.display = "none";
            var listItem = document.createElement('ons-card'), 
            html = '<b>' + device.name + '</b>';
            listItem.dataset.deviceid = device.id;
            listItem.dataset.deviceName = device.name;
            listItem.innerHTML = html;
            list.appendChild(listItem);
            listItem.addEventListener('click', scanDevices.onAlertDialog, false);
        }
	},

	onAlertDialog: function(e){
		ons.notification.confirm({
            message: 'Do you want to pair this device?',
            callback: function(idx) {
              switch (idx) {
                case 1:
                	localStorage.setItem('deviceID',e.target.dataset.deviceid);
                	localStorage.setItem('deviceName',e.target.dataset.deviceName);
                    connectDevices.onConnect();
                    break; 
                }
            }
        });
	},

	onError: function(e){
		ons.notification.alert(e);
	}

};

var connectDevices = {

	onConnect: function(){
		loader.visibleLoader();
		ble.connect(localStorage.getItem("deviceID"), connectDevices.onConnectSuccess, connectDevices.onError);
	},

	onConnectSuccess: function(){
		loader.hideLoader();
		ons.notification.alert('Successful Connection');
        connectDevices.showMainPage();
	},

	onDisconnectSuccess: function(){
		loader.hideLoader();
		localStorage.clear();
		ons.notification.alert('Successful Disconnection');
		activity1.onCreate();
	},

	onDisconnect: function() {
		loader.visibleLoader();
        ble.disconnect(localStorage.getItem("deviceID"), connectDevices.onDisconnectSuccess, connectDevices.onErrorDisconnect);
    },

	showMainPage: function(){
		document.querySelector('#myNavigator').resetToPage("page1.html", { animation: "slide" });
	},

	onError: function(e){
		loader.hideLoader();
		ons.notification.alert("Could not connect to the device");
		localStorage.clear();
	},

	onErrorDisconnect: function(e){
		loader.hideLoader();
		ons.notification.alert(e);
	}
};

var notificationDevices = {

	showMainPage: function(){
		document.querySelector('#myNavigator').pushPage('page3.html', {data: {title: 'Page 3'}});
	},

	onConnect: function(){
		var convertData = stringToBytes("##.");
		ble.write(localStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristicRX,
                  convertData,
                  notificationDevices.onStartNotification,
                  notificationDevices.onError);

	},

	onStartNotification: function(){
		notificationDevices.showMainPage();
		ble.startNotification(localStorage.getItem("deviceID"),
                 parameters.service,
                 parameters.characteristicTX, 
                 notificationDevices.onReadData, 
                 notificationDevices.onError);
		timerSendData = setInterval(function(){ notificationDevices.sendParameter(); }, 3000);
	},

	sendParameter: function(){
		var convertData = stringToBytes("#"+arrayMeasure[contador]+".");
		contador = contador + 1;
		if(contador>7){
			contador = 0;
		}
		ble.write(localStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristicRX,
                  convertData,
                  true,
                  notificationDevices.onError); 
	},

	onReadData: function(data){
		var info = bytesToString(data);
		info = info.trim();
		if(info.match(/^[A-H]{2}(.*)[0-9]$/)){
			var lon = info.length;
			switch(arrayMeasure[contador]){
				case 'A':
					document.getElementById("volt").innerHTML = info.substr(2, lon);
					break;
				case 'B':
					document.getElementById("current").innerHTML = info.substr(2, lon);
					break;
				case 'C':
					document.getElementById("temp1").innerHTML = info.substr(2, lon);
					break;
				case 'D':
					document.getElementById("temp2").innerHTML = info.substr(2, lon);
					break;
				case 'E':
					document.getElementById("pres1").innerHTML = info.substr(2, lon);
					break;
				case 'F':
					document.getElementById("pres2").innerHTML = info.substr(2, lon);
					break;
				case 'G':
					document.getElementById("hum1").innerHTML = info.substr(2, lon);
					break;
				case 'H':
					document.getElementById("hum2").innerHTML = info.substr(2, lon);
					break;
			}
		} 
	},

	onCancel: function(){
		var convertData = stringToBytes("%%.");
		ble.write(localStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristicRX,
                  convertData,
                  notificationDevices.onStopNotification,
                  notificationDevices.onError);
	},

	onStopNotification: function(){
		clearInterval(timerSendData);
		ble.stopNotification(localStorage.getItem("deviceID"),
                 parameters.service,
                 parameters.characteristicTX, 
                 connectDevices.showMainPage, 
                 notificationDevices.onError);
	},

	onError: function(e){
		ons.notification.alert(e);
	}
};

var sendDataDevices = {
	onWriteNetwork: function(){
		loader.visibleLoader();
		var net = "**"+name_network+".";
		var convertData = stringToBytes(net);
		ble.write(localStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristicRX,
                  convertData,
                  sendDataDevices.onWritePassword,
                  sendDataDevices.onFailure);
	},

	onWritePassword: function(){
		var pass = "$$"+password_network+".";
		var convertData = stringToBytes(pass);
		ble.write(localStorage.getItem("deviceID"),
                  parameters.service,
                  parameters.characteristicRX,
                  convertData,
                  sendDataDevices.onSuccess,
                  sendDataDevices.onFailure);
	},

	onSuccess:function(){
		loader.hideLoader();
		alertNetwork.onDismiss();
		localStorage.setItem("sendWIFI", name_network);
		ons.notification.alert("Network data received");
		activity1.onCreate();
	},

	onFailure: function(e){
		loader.hideLoader();
		alertNetwork.onDismiss();
		ons.notification.alert(e);
	}
};

var alertNetwork = {
	onReciveData: function(){
		name_network = $("#network").val();
	    password_network = $("#net-password").val();
	    if(name_network == "" || name_network == undefined || password_network == "" || password_network == undefined){
	        ons.notification.alert('The data is incomplete');
	    } else {
	        alertNetwork.onDismiss();
	        sendDataDevices.onWriteNetwork();
	    }
	},

	onDismiss:function(){
		document.getElementById('my-alert-network').hide();
	}
}