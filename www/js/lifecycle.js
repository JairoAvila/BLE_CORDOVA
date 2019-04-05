ons.ready(function(){
  ons.disableDeviceBackButtonHandler();
  document.addEventListener('backbutton', function () {}, false);
});
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    "use strict";
    window.localStorage.clear();
    //cordova.plugins.BluetoothStatus.initPlugin();
    //cordova.plugins.BluetoothStatus.promptForBT();
}

document.addEventListener('show', function(event) {

  var page = event.target;
  if (page.id === 'page1') {
    activity1.onCreate();
    activity1.callbacksButton(page);
  } else if(page.id === 'page2'){
    scanDevices.onScan();
  } else if(page.id === 'page3'){
    //notificationDevices.onConnect();
  }
});

var activity1 = {
  onCreate: function(){

    if(localStorage.getItem("deviceName") != undefined || localStorage.getItem("deviceName") != null){
      document.getElementById("title-device").innerHTML = "Disconnect Device";
      document.getElementById("row-device").innerHTML = localStorage.getItem("deviceName");
      document.getElementById("row-device").style.color = "green";
      document.getElementById("btn_escanear").style.display = "none";
      document.getElementById("btn_desconectar").style.display = "block";
      document.getElementById("btn_red").disabled = false;
      document.getElementById("btn_mediciones").disabled = false;
    } else {
      document.getElementById("title-device").innerHTML = "Scan Device";
      document.getElementById("row-device").innerHTML = "Any device paired";
      document.getElementById("row-device").style.color = "red";
      document.getElementById("btn_escanear").style.display = "block";
      document.getElementById("btn_desconectar").style.display = "none";
      document.getElementById("btn_red").disabled = true;
      document.getElementById("btn_mediciones").disabled = true;
    }

    if(localStorage.getItem("sendWIFI") != undefined || localStorage.getItem("sendWIFI") != null){
      document.getElementById("row-wifi").innerHTML = localStorage.getItem("sendWIFI");
      document.getElementById("row-wifi").style.color = "green";
    } else {
      document.getElementById("row-wifi").innerHTML = "No parameters have been sent";
      document.getElementById("row-wifi").style.color = "red";
    }

  },
  callbacksButton: function(page){
    page.querySelector('#btn_escanear').onclick = function() {
      myNavigator.pushPage('page2.html', {data: {title: 'Page 2'}});
    };
    page.querySelector('#btn_red').onclick = function() {
      var dialog = document.getElementById('my-alert-network');

          if (dialog) {
              dialog.show();
          } else {
              ons.createElement('alert-network.html', { append: true })
                .then(function(dialog) {
                  dialog.show();
                });
          }
    };
    page.querySelector('#btn_mediciones').onclick = function() {
      notificationDevices.onConnect();
    };
    page.querySelector('#btn_desconectar').onclick = function() {
      connectDevices.onDisconnect();
    };
  }
};
