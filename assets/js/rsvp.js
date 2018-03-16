
$(document).ready(function() {

  $("#password-form").submit(function(event) {
    $(this).hide();
    event.preventDefault();
    $(".spinner").show();
    var data = $('#password-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    var password = data.password;
    $.ajax({
      url: "https://rocky-waters-77986.herokuapp.com/" + password,
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
      $(".spinner").hide();
      $(".rsvp-form").show();
    }).fail(function(err) {
      $(".rsvp-form").hide();
      $(".spinner").hide();
      $(".error").show();
    });
  });

  $("#rsvp-form").submit(function(event) {
    $(this).hide();
    event.preventDefault();
    var data = $('#rsvp-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});

    var showNext = false;
    for (i = 0; i < data.guests; i++) {
      showNext = true;
      if (data[`wedding-${i}`] === "on") {
        $('#dynamic-food-form').append(`
<div>
<div class="name">
${data[`name-${i}`]} will be having the:
</div>
<div class="label">
<label>
<input type="radio" name="meal-${i}" value="salmon" required>
<span class="label-body">Citrus Herb Grilled Salmon Fillet</span>
<small class="label-body">sauteed greens, crushed Yukon potato cake, roasted tomato sauce</small>
</label>
<label>
<input type="radio" name="meal-${i}" value="steak">
<span class="label-body">Churrascaria Flank Steak</span>
<small class="label-body">feijoada, sauteed vegetables, plantain chips</small>
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
      $(".spinner").show();
      $.ajax({
        type: "POST",
        url: "https://rocky-waters-77986.herokuapp.com/" + data.password,
        data: JSON.stringify(rsvp),
        contentType: 'application/json',
        dataType: 'json',
      }).done(function() {
        $(".rsvp-form").hide();
        $(".spinner").hide();
        $(".thank-you").show();
      })
      .fail(function(err) {
        $(".rsvp-form").hide();
        $(".spinner").hide();
        $(".error").show();
      });
    }
  });

  $("#food-form").submit(function(event) {
    let noFoodSelection = true;
    $(this).hide();
    event.preventDefault();
    var data = $('#rsvp-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    var foodData = $('#food-form').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    const rsvp = createRSVP(data, foodData);
    $(".spinner").show();
    $.ajax({
      type: "POST",
      url: "https://rocky-waters-77986.herokuapp.com/" + data.password,
      data: JSON.stringify(rsvp),
      contentType: 'application/json'
    }).done(function() {
      $(".food-form").hide();
      $(".spinner").hide();
      $(".thank-you").show();
    })
    .fail(function(err) {
      $(".food-form").hide();
      $(".spinner").hide();
      $(".error").show();
    });
  });

  function createRSVP(data, foodData) {
    var rsvp = {};
    let baseName = data[`name-0`];
    for (i = 0; i < data.guests; i++) {
      let name = data[`name-${i}`];
      if (name === 'Your plus one') {
        name = `${baseName}'s +1`;
      }
      rsvp[name] = {
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
