(function () {

  var donationURL = 'http://example.org/';

  // Element cache :

  var btnAmounts = document.querySelectorAll('.donation-amounts .button');
  var btnSelected = document.querySelector('.donation-amounts .button-selected');
  var btnDonate = document.querySelector('#donate-button');
  var elHighlighted = document.querySelector('#snippet em');

  // View functions

  function selectAmount(element) {
    element.classList.add('button-selected');
    btnSelected.classList.remove('button-selected');
    btnSelected = element;
    btnDonate.attributes['href'].value = donationURL + '#amount-' + element.attributes['data-amount'].value;
  }

  // Event binding :

  for(var i=0; i<btnAmounts.length; i++) {
    btnAmounts[i].addEventListener('click', function (event) {
      selectAmount(event.target);
    });
  }

  // Fade in highlight on text
  setTimeout(function() {
    elHighlighted.classList.add('active');
  }, 1000);

})();
