document.addEventListener('init', function(event) {

  var page = event.target;
  if (page.matches('#page1')) {
    page.querySelector('ons-button').onclick = function() {
      ons.notification.alert('Hello world!');
    };
    page.querySelector('#btn').onclick = function() {
      ons.notification.alert('world!');
    };
    page.querySelector('#btn1').onclick = function() {
      ons.notification.alert('world3!');
    };
  }
});