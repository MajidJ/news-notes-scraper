
$(document).on('click', '#getArticles', function(event) {
    event.preventDefault;

    $('#listedArticles').empty();
    $.ajax({
        method: 'GET',
        url: '/scrape'
    }).then(function(dbArticles) {
        console.log("scraped")
        $.getJSON('/articles', function(data) {
            data.forEach(function(article) {
                $('#listedArticles').append(
                    `<div class="card">
                        <div class="card-body">
                            <a href="${article.link}" target="_blank">${article.title}</a>
                        </div>
                    </div>
                    <p>{{summary}}</p>
                    <button value="{{_id}}" type="button" class="delete">Delete</button>`
                );
            });
            console.log("Added to DOM")
        });
    }).catch(function(err) {
        if (err) console.log(err);
    });
});

$(document).on('click', '#eraseArticles', function(event) {
    event.preventDefault;
    $('#listedArticles').empty();
});

$(document).on('click', '.submit', function(event) {
    event.preventDefault;
    const id = $(this).val();
    $.ajax({
        method: 'POST',
        url: `/notes/${id}`,
        data: {body: $('#noteBody').val()},
        success: function(data) {
            console.log(data);
        },
        error: function(err) {
            console.log(err);
        }
    })
});

$(document).on('click', '.delete', function(event) {
    event.preventDefault;
    const id = $(this).val();
    const card = $(this.parentElement.parentElement);
    $.ajax({
        method: 'DELETE',
        url: `/delete/articles/${id}`,
        success: function(data) {
            console.log(data);
            card.remove();
        },
        error: function(err) {
            console.log(err);
        }
    });
})
