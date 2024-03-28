/**
 * Do not edit
 */

$(document).ready((e) => {
  getMessage();
  $('#message-button').on('click', () => {
    sendMessage();
  });
});

function getMessage() {
  $('#message-box').empty();
  $.ajax({
    type: 'GET',
    url: './messages',
    headers: {
      'Authorization': 'Basic secret_key'
    }
  })
    .done((data) => {
      renderMessages(data);
      setTimeout(getMessage, 2000);
    });
}

function renderMessages(messages) {
  const $messages = $('<ol></ol>');
  for (let i = 0; i < messages.length; i++) {
    $messages.append('<li>' + messages[i].message + '<br>' + messages[i].created_by + '</li>');
  }
  $('#message-box').append($messages);
}

function sendMessage() {
  const message = $('#message').val();
  const created_by = $('#created_by').val();
  const obj = {};
  if (message) {
    obj.message = message;
  }
  if (created_by) {
    obj.created_by = created_by;
  }
  $.ajax({
    type: 'POST',
    data: JSON.stringify(obj),
    contentType: 'application/json; charset=UTF-8',
    url: './messages',
    headers: {
      'Authorization': 'Basic secret_key'
    }}).then((data) => {
    console.log(data);
  });

}
