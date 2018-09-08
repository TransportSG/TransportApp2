let typingTimer = 0;

$('#input').on('input', () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    let search = $('#input').value;
    $.ajax({
      url: '/search',
      method: 'POST',
      data: {search}
    }, response => {
      $('#results').innerHTML = response.error || response;
    });
  }, 1500);
});
