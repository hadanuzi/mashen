
$(document).ready(function() {

  $("#password-form").submit(function(event) {
    event.preventDefault();
    var data = $('#password-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    var password = data.password;
    $.ajax({
      url: "http://localhost:3000/" + password,
      method: "GET"
    })
    .done(function(data) {
      var guests = Object.keys(data);
      $('#dynamic-form').append(`
        <input type="hidden" name="guests" value=${guests.length}>
        <input type="hidden" name="password" value=${password}>
      `);
      guests.forEach(function(guest, i) {
        var name = guest;
        if (guest === '+1') {
          name = 'Your plus one';
        }
        $('#dynamic-form').append(`
          <div class="attendance">
            <div class="name">
              ${name} will be attending the:
            </div>
            <div class="attendance-boxes">
              <input type="hidden" name="name-${i}" value="${name}">
              <label>
                <input type="checkbox" name="preparty-${i}">
                <span class="label-body">Pre-party</span>
              </label>
              <label>
                <input type="checkbox" name="wedding-${i}">
                <span class="label-body">Wedding</span>
              </label>
              <label>
                <input type="checkbox" name="afterparty-${i}">
                <span class="label-body">After Party</span>
              </label>
              <label>
                <input type="checkbox" name="brunch-${i}">
                <span class="label-body">Brunch</span>
              </label>
            </div>
          </div>
        `);
      });
      $(".password-form").hide();
      $(".rsvp-form").show();
    }).fail(function(err) {
      $(".rsvp-form").hide();
      $(".error").show();
    });
  });

  $("#rsvp-form").submit(function(event) {
    event.preventDefault();
    var data = $('#rsvp-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    console.log(data)

    var showNext = false;
    for (i = 0; i < data.guests; i++) {
      showNext = true;
      if (data[`wedding-${i}`] === "on") {
        $('#dynamic-food-form').append(`
          <div>
            <div class="name">
              ${data[`name-${i}`]} will be having the:
            </div>
            <div class="label" required>
              <label>
                <input type="radio" name="meal-${i}" value="chicken">
                <span class="label-body">Pomegranate Glazed Frenched Chicken Breast</span>
                <small class="label-body">vegetable risotto cake, spring vegetables, rosemary pan sauce</small>
              </label>
              <label>
                <input type="radio" name="meal-${i}" value="salmon">
                <span class="label-body">Salmon topped with Roasted Tomato Olive Crumbs</span>
                <small class="label-body">sauteed greens, saffron orzo risotto, roasted tomato sauce</small>
              </label>
              <label>
                <input type="radio" name="meal-${i}" value="tofu">
                <span class="label-body">Panko Tofu "Scallops"</span>
                <small class="label-body">bok choy ponzu</small>
              </label>
            </div>
          </div>
        `);
      }
    }
    if (showNext) {
      $('#dynamic-food-form').append(`
        <textarea class="u-full-width" placeholder="Please include any dietary restrictions here." name="diet"></textarea>
      `);
      $(".rsvp-form").hide();
      $(".food-form").show();
    } else {
      const rsvp = createRSVP(data, foodData);
      $.ajax({
        type: "POST",
        url: "http://localhost:3000/" + data.password,
        data: JSON.stringify(rsvp),
        contentType: 'application/json',
        dataType: 'json',
      }).done(function() {
        $(".rsvp-form").hide();
        $(".thank-you").show();
      })
      .fail(function(err) {
        $(".rsvp-form").hide();
        $(".error").show();
      });
    }
  });

  
  $("#food-form").submit(function(event) {
    event.preventDefault();
    var data = $('#rsvp-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    
    var foodData = $('#food-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    console.log(data, foodData)
    const rsvp = createRSVP(data, foodData);
    console.log('rsvp', rsvp)
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/" + data.password,
      data: JSON.stringify(rsvp),
      contentType: 'application/json'
    }).done(function() {
      $(".food-form").hide();
      $(".thank-you").show();
    })
    .fail(function(err) {
      $(".food-form").hide();
      $(".error").show();
    });
  });

  function createRSVP(data, foodData) {
    var rsvp = {};
    for (i = 0; i < data.guests; i++) {
      rsvp[data[`name-${i}`]] = {
        preparty: data[`preparty-${i}`] === 'on' ? 'yes' : 'no',
        wedding: data[`wedding-${i}`] === 'on' ? 'yes' : 'no',
        afterParty: data[`afterparty-${i}`] === 'on' ? 'yes' : 'no',
        brunch: data[`brunch-${i}`] === 'on' ? 'yes' : 'no',
        meal: foodData[`meal-${i}`] || '',
        diet: foodData.diet || ''
      };
    }
    return rsvp;
  }
});
